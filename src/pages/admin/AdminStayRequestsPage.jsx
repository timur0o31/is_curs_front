import { Fragment, useEffect, useState } from 'react'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import api from "../../config/Api.js";

const statusMap = {
  PENDING: { label: 'Ожидает', tone: 'warn' },
  APPROVED: { label: 'Подтверждена', tone: 'success' },
  REJECTED: { label: 'Отклонена', tone: 'danger' },
}

const typeMap = {
  EXPANSION: 'Продление',
  CHECK_IN: 'Заселение',
}

function AdminStayRequestsPage({ onNavigate }) {
  const getDefaultAssignment = () => ({
    requestId: null,
    room: '',
    doctor: '',
    start: '',
    end: '',
  })


  const [stayRequests, setStayRequests] = useState([])
  const [assignment, setAssignment] = useState(getDefaultAssignment())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [availableRooms, setAvailableRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)

  const [availableDoctors, setAvailableDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)

  useEffect(() => {
    fetch(api.BASE_URL + api.ENDPOINTS.STAY_REQUESTS, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
        .then((res) => {
          if (!res.ok) throw new Error('Не удалось загрузить заявки')
          return res.json()
        })
        .then(setStayRequests)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
  }, [])

  const fetchAvailableRooms = async () => {
    setRoomsLoading(true)

    try {
      const res = await fetch(
          `${api.BASE_URL}/rooms/available`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
      )

      if (!res.ok) {
        throw new Error('Не удалось загрузить свободные комнаты')
      }

      const data = await res.json()
      setAvailableRooms(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setRoomsLoading(false)
    }
  }

  const fetchAvailableDoctors = async () => {
    setDoctorsLoading(true)

    try {
      const res = await fetch(
          `${api.BASE_URL}/doctor`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
      )

      if (!res.ok) {
        throw new Error('Не удалось загрузить доступных врачей')
      }

      const data = await res.json()
      setAvailableDoctors(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setDoctorsLoading(false)
    }
  }

  const handleAssignClick = async (request) => {
    if (request.status !== 'PENDING') return

    await Promise.all([
      fetchAvailableRooms(),
      fetchAvailableDoctors(),
    ])

    setAssignment({
      requestId: request.id,
      room: '',
      doctor: '',
      start: request.admissionDate,
      end: request.dischargeDate,
    })
  }

  const handleReject = async (id) => {
    try {
      const res = await fetch(
          `${api.BASE_URL}${api.ENDPOINTS.STAY_REQUESTS}/${id}/reject`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
      )

      if (!res.ok) {
        throw new Error('Не удалось отклонить заявку')
      }

      setStayRequests((prev) =>
          prev.map((item) =>
              item.id === id
                  ? { ...item, status: 'REJECTED' }
                  : item
          )
      )

      setAssignment(getDefaultAssignment())
    } catch (e) {
      alert(e.message)
    }
  }

  const handleApprove = async () => {
    if (!assignment.requestId) return

    const request = stayRequests.find(
        (r) => r.id === assignment.requestId
    )

    if (!request) return

    try {
      let url = ''
      let options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }

      if (request.type === 'CHECK_IN') {
        if (!assignment.room) {
          alert('Выберите комнату')
          return
        }

        const params = new URLSearchParams({
          roomId: assignment.room,
        })

        if (assignment.doctor) {
          params.append('doctorId', assignment.doctor)
        }

        url = `${api.BASE_URL}${api.ENDPOINTS.STAY_REQUESTS}/${request.id}/approve?${params.toString()}`
      }

      if (request.type === 'EXPANSION') {
        url = `${api.BASE_URL}${api.ENDPOINTS.STAY_REQUESTS}/${request.id}/approve-expansion`
      }

      const res = await fetch(url, options)

      if (!res.ok) {
        throw new Error('Не удалось подтвердить заявку')
      }

      let selectedRoomNumber = null

      if (assignment.room) {
        const roomObj = availableRooms.find(
            (r) => String(r.id) === String(assignment.room)
        )
        selectedRoomNumber = roomObj?.roomNumber ?? roomObj?.id
      }

// Обновляем список локально
      setStayRequests((prev) =>
          prev.map((item) => {
            if (item.id !== request.id) return item

            // Для продления номер не меняется
            if (request.type === 'EXPANSION') {
              return {
                ...item,
                status: 'APPROVED',
              }
            }

            // Для заселения — обновляем комнату
            return {
              ...item,
              status: 'APPROVED',
              roomNumber: selectedRoomNumber,
            }
          })
      )

      setAssignment(getDefaultAssignment())
    } catch (e) {
      alert(e.message)
    }
  }


  const handleAssignmentChange = (field) => (event) => {
    setAssignment((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleAssignmentCancel = () => {
    setAssignment(getDefaultAssignment())
  }

  if (loading) {
    return (
        <section className="section dashboard">
          <p className="muted">Загрузка...</p>
        </section>
    )
  }

  if (error) {
    return (
        <section className="section dashboard">
          <p className="error">{error}</p>
        </section>
    )
  }

  return (
      <section className="section dashboard" id="admin-stay-requests">
        <SectionHeading
            eyebrow="Администрирование"
            title="Заявки по проживанию"
            description="Продления, переносы дат и запросы на выезд."
        />

        <AdminNav current="admin-stay-requests" onNavigate={onNavigate} />

        <article className="card table-card">
          <div className="table-toolbar">
            <div>
              <h3>Очередь заявок</h3>
              <p className="muted">
                Для подтверждения нужно назначить свободную комнату.
              </p>
            </div>
            <div className="action-row">
              <button className="btn ghost small" type="button">
                Фильтр
              </button>
              <button className="btn ghost small" type="button">
                Экспорт
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>ФИО</th>
                <th>Запрос</th>
                <th>Период</th>
                <th>Номер</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
              </thead>

              <tbody>
              {stayRequests.map((item) => {
                const status = statusMap[item.status] ?? {}
                const isPending = item.status === 'PENDING'

                return (
                    <Fragment key={item.id}>
                      <tr>
                        <td>{item.id}</td>
                        <td>{item.patientName}</td>
                        <td>{typeMap[item.type] ?? item.type}</td>
                        <td>
                          {item.admissionDate} – {item.dischargeDate}
                        </td>
                        <td>{item.roomNumber}</td>
                        <td>{item.createdAt?.slice(0, 10)}</td>
                        <td>
                        <span className={`status status--${status.tone}`}>
                          {status.label}
                        </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {isPending && (
                                <>
                                  <button
                                      className="btn success small"
                                      type="button"
                                      onClick={() => handleAssignClick(item)}
                                  >
                                    Назначить
                                  </button>

                                  <button
                                      className="btn danger small"
                                      type="button"
                                      onClick={() => handleReject(item.id)}
                                  >
                                    Отклонить
                                  </button>
                                </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {assignment.requestId === item.id && (
                          <tr className="assignment-row">
                            <td colSpan="8">
                              <div className="assignment-panel">
                                <div className="assignment-header">
                                  <div>
                                    <strong>Назначение комнаты</strong>
                                    <p className="muted">
                                      Выберите свободную комнату и период проживания.
                                    </p>
                                  </div>
                                  <span className="status status--warn">
                                Заявка {item.id}
                              </span>
                                </div>

                                <div className="assignment-grid">
                                  <div className="field">
                                    <label>Комната</label>
                                    <select
                                        value={assignment.room}
                                        onChange={handleAssignmentChange('room')}
                                        disabled={roomsLoading || availableRooms.length === 0}
                                    >
                                      <option value="">
                                        {roomsLoading
                                            ? 'Загрузка...'
                                            : availableRooms.length === 0
                                                ? 'Нет свободных комнат'
                                                : 'Выберите комнату'}
                                      </option>

                                      {availableRooms.map((room) => (
                                          <option key={room.id} value={room.id}>
                                            {room.roomNumber ?? room.id} {/*· {room.type}*/}
                                          </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="field">
                                    <label>Заезд</label>
                                    <input
                                        type="date"
                                        value={assignment.start}
                                        onChange={handleAssignmentChange('start')}
                                    />
                                  </div>

                                  <div className="field">
                                    <label>Выезд</label>
                                    <input
                                        type="date"
                                        value={assignment.end}
                                        onChange={handleAssignmentChange('end')}
                                    />
                                  </div>

                                  <div className="field">
                                    <label>Врач</label>
                                    <select
                                        value={assignment.doctor}
                                        onChange={handleAssignmentChange('doctor')}
                                        disabled={doctorsLoading || availableDoctors.length === 0}
                                    >
                                      <option value="">
                                        {doctorsLoading
                                            ? 'Загрузка...'
                                            : availableDoctors.length === 0
                                                ? 'Нет доступных врачей'
                                                : 'Выберите врача'}
                                      </option>

                                      {availableDoctors.map((doctor) => (
                                          <option key={doctor.id} value={doctor.id}>
                                            {doctor.name}
                                            {doctor.specialization
                                                ? ` · ${doctor.specialization}`
                                                : ''}
                                          </option>
                                      ))}
                                    </select>
                                  </div>


                                  <div className="assignment-rooms">
                                <span className="metric-label">
                                  Свободные комнаты
                                </span>
                                    <div className="room-tags">
                                      {availableRooms.length === 0 && !roomsLoading && (
                                          <span className="muted">Нет свободных комнат</span>
                                      )}

                                      {availableRooms.map((room) => (
                                          <span className="room-tag" key={room.id}>
      {room.roomNumber ?? room.id} {/*· {room.type}*/}
    </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="action-row">
                                  <button
                                      className="btn success small"
                                      type="button"
                                      onClick={handleApprove}
                                      disabled={
                                          !assignment.requestId ||
                                          (stayRequests.find(r => r.id === assignment.requestId)?.type === 'CHECK_IN' && !assignment.room)
                                      }
                                  >
                                    Подтвердить назначение
                                  </button>
                                  <button
                                      className="btn ghost small"
                                      type="button"
                                      onClick={handleAssignmentCancel}
                                  >
                                    Отменить
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                      )}
                    </Fragment>
                )
              })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
  )
}

export default AdminStayRequestsPage
