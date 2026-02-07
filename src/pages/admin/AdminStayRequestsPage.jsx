import { Fragment, useState } from 'react'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import { availableRooms, stayRequests } from '../../data/adminData'

function AdminStayRequestsPage({ onNavigate }) {
  const getDefaultAssignment = () => ({
    requestId: null,
    room: availableRooms[0]?.id ?? '',
    start: '',
    end: '',
  })

  const [assignment, setAssignment] = useState(getDefaultAssignment)

  const handleAssignClick = (request) => {
    setAssignment({
      requestId: request.id,
      room: availableRooms[0]?.id ?? '',
      start: request.from ?? '',
      end: request.to ?? '',
    })
  }

  const handleAssignmentChange = (field) => (event) => {
    setAssignment((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleAssignmentCancel = () => {
    setAssignment(getDefaultAssignment())
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
            <p className="muted">Для подтверждения нужно назначить свободную комнату.</p>
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
              {stayRequests.map((item) => (
                <Fragment key={item.id}>
                  <tr>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.request}</td>
                    <td>{item.period}</td>
                    <td>{item.room}</td>
                    <td>{item.submitted}</td>
                    <td>
                      <span
                        className={`status${item.statusTone ? ` status--${item.statusTone}` : ''}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn success small"
                          type="button"
                          onClick={() => handleAssignClick(item)}
                        >
                          Назначить
                        </button>
                        <button className="btn danger small" type="button">
                          Отклонить
                        </button>
                      </div>
                    </td>
                  </tr>
                  {assignment.requestId === item.id ? (
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
                            <span className="status status--warn">Заявка {item.id}</span>
                          </div>
                          <div className="assignment-grid">
                            <div className="field">
                              <label htmlFor={`assign-room-${item.id}`}>Комната</label>
                              <select
                                id={`assign-room-${item.id}`}
                                value={assignment.room}
                                onChange={handleAssignmentChange('room')}
                              >
                                {availableRooms.map((room) => (
                                  <option key={room.id} value={room.id}>
                                    {room.id} · {room.type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="field">
                              <label htmlFor={`assign-start-${item.id}`}>Заезд</label>
                              <input
                                id={`assign-start-${item.id}`}
                                type="date"
                                value={assignment.start}
                                onChange={handleAssignmentChange('start')}
                              />
                            </div>
                            <div className="field">
                              <label htmlFor={`assign-end-${item.id}`}>Выезд</label>
                              <input
                                id={`assign-end-${item.id}`}
                                type="date"
                                value={assignment.end}
                                onChange={handleAssignmentChange('end')}
                              />
                            </div>
                            <div className="assignment-rooms">
                              <span className="metric-label">Свободные комнаты</span>
                              <div className="room-tags">
                                {availableRooms.map((room) => (
                                  <span className="room-tag" key={room.id}>
                                    {room.id} · {room.type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="action-row">
                            <button className="btn success small" type="button">
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
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default AdminStayRequestsPage
