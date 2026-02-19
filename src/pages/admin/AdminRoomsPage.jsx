import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminRoomForm from '../../components/forms/AdminRoomForm'
import api from "../../config/Api.js";

const API_URL = '/rooms'

const getOccupiedMeta = (isOccupied) =>
    isOccupied ? { label: 'Занята', tone: 'warn' } : { label: 'Свободна', tone: 'success' }

function AdminRoomsPage({ onNavigate }) {
  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    fetch(api.BASE_URL + API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    })
        .then((res) => {
          if (!res.ok) throw new Error()
          return res.json()
        })
        .then(setRooms)
        .catch(() => toast.error('Ошибка загрузки комнат'))
  }, [])

  const selectedRoom = useMemo(
      () => rooms.find((item) => String(item.id) === String(selectedRoomId)) ?? null,
      [rooms, selectedRoomId],
  )

  const pendingDeleteRoom = useMemo(
      () => rooms.find((item) => String(item.id) === String(pendingDeleteId)) ?? null,
      [rooms, pendingDeleteId],
  )

  const handleSelectRoom = (item) => {
    setSelectedRoomId(item.id)
  }

  const handleCreate = () => {
    setFormMode('create')
    setPendingDeleteId(null)
  }

  const handleEdit = () => {
    if (!selectedRoom) {
      toast.warn('Сначала выберите комнату')
      return
    }
    setFormMode('edit')
    setPendingDeleteId(null)
  }

  const handleDeleteRequest = () => {
    if (!selectedRoom) {
      toast.warn('Сначала выберите комнату')
      return
    }
    setPendingDeleteId(selectedRoom.id)
  }

  const handleFormCancel = () => {
    setFormMode(null)
  }

  const handleCreateSubmit = async (formData) => {
    if (!Number.isInteger(formData.roomNumber) || formData.roomNumber <= 0) {
      toast.warn('Укажите корректный номер комнаты')
      return
    }

    try {
      const res = await fetch(api.BASE_URL + API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      const createdRoom = await res.json()

      setRooms((prev) => [createdRoom, ...prev])
      setSelectedRoomId(createdRoom.id)
      setFormMode(null)

      toast.success('Комната добавлена')
    } catch {
      toast.error('Ошибка при создании комнаты')
    }
  }

  /* =========================
     DELETE ROOM (DELETE)
     ========================= */
  const handleDeleteConfirm = async () => {
    if (!pendingDeleteRoom) return

    try {
      const res = await fetch(`${api.BASE_URL + API_URL}/${pendingDeleteRoom.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      })

      if (!res.ok) throw new Error()

      setRooms((prev) => prev.filter((item) => item.id !== pendingDeleteRoom.id))

      if (String(selectedRoomId) === String(pendingDeleteRoom.id)) {
        setSelectedRoomId(null)
      }

      setPendingDeleteId(null)
      setFormMode(null)

      toast.success('Комната удалена')
    } catch {
      toast.error('Невозможно удалить комнату. Она занята пациентом')
    }
  }

  return (
      <section className="section dashboard" id="admin-rooms">
        <SectionHeading
            eyebrow="Администрирование"
            title="Комнаты"
            description="Управление списком комнат: добавление, изменение и удаление."
        />

        <AdminNav current="admin-rooms" onNavigate={onNavigate} />

        {formMode == null && (
            <article className="card table-card">
              <div className="table-toolbar">
                <h3>Список комнат</h3>

                <div className="action-row">
                  <button className="btn primary small" onClick={handleCreate}>
                    Создать
                  </button>
                  <button
                      className="btn ghost small"
                      onClick={handleEdit}
                      disabled={!selectedRoom}
                  >
                    Изменить
                  </button>
                  <button
                      className="btn danger small"
                      onClick={handleDeleteRequest}
                      disabled={!selectedRoom}
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Номер комнаты</th>
                    <th>Занятость</th>
                  </tr>
                  </thead>
                  <tbody>
                  {rooms.length === 0 ? (
                      <tr>
                        <td colSpan={3}>Комнаты не найдены</td>
                      </tr>
                  ) : (
                      rooms.map((item) => {
                        const isSelected = String(item.id) === String(selectedRoomId)
                        const occupied = getOccupiedMeta(item.isOccupied)

                        return (
                            <tr
                                key={item.id}
                                className={isSelected ? 'medication-row medication-row--selected' : 'medication-row'}
                                onClick={() => handleSelectRoom(item)}
                            >
                              <td>{item.id}</td>
                              <td>{item.roomNumber}</td>
                              <td>
                          <span className={`status status--${occupied.tone}`}>
                            {occupied.label}
                          </span>
                              </td>
                            </tr>
                        )
                      })
                  )}
                  </tbody>
                </table>
              </div>
            </article>
        )}

        {formMode === 'create' && (
            <article className="card form-card">
              <AdminRoomForm
                  title="Новая комната"
                  submitLabel="Сохранить комнату"
                  onSubmit={handleCreateSubmit}
                  onCancel={handleFormCancel}
              />
            </article>
        )}

        {formMode === 'edit' && selectedRoom && (
            <article className="card form-card">
              <AdminRoomForm
                  initialData={selectedRoom}
                  title="Изменить комнату"
                  submitLabel="Сохранить изменения"
                  onSubmit={() => toast.info('PUT /rooms пока не реализован')}
                  onCancel={handleFormCancel}
              />
            </article>
        )}

        {pendingDeleteRoom && (
            <article className="card form-card">
              <h3>Удалить комнату</h3>
              <p className="muted">
                Удалить комнату <strong>{pendingDeleteRoom.roomNumber}</strong> ({pendingDeleteRoom.id})?
              </p>

              <div className="form-actions">
                <button className="btn ghost" onClick={() => setPendingDeleteId(null)}>
                  Отмена
                </button>
                <button className="btn danger" onClick={handleDeleteConfirm}>
                  Удалить
                </button>
              </div>
            </article>
        )}
      </section>
  )
}

export default AdminRoomsPage
