import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminRoomForm, { createDefaultRoomForm } from '../../components/forms/AdminRoomForm'

const initialRooms = []

const buildRoomId = (items) => {
  const maxIndex = items.reduce((max, item) => {
    const match = String(item.id).match(/(\d+)/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)
  return `ROOM-${String(maxIndex + 1).padStart(3, '0')}`
}

const getOccupiedMeta = (isOccupied) =>
  isOccupied ? { label: 'Занята', tone: 'warn' } : { label: 'Свободна', tone: 'success' }

function AdminRoomsPage({ onNavigate }) {
  const [rooms, setRooms] = useState(initialRooms)
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

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
      toast.warn('Сначала выберите комнату в таблице')
      return
    }
    setPendingDeleteId(null)
    setFormMode('edit')
  }

  const handleDeleteRequest = () => {
    if (!selectedRoom) {
      toast.warn('Сначала выберите комнату в таблице')
      return
    }
    setPendingDeleteId(selectedRoom.id)
  }

  const handleFormCancel = () => {
    setFormMode(null)
  }

  const handleCreateSubmit = (formData) => {
    if (!Number.isInteger(formData.roomNumber) || formData.roomNumber <= 0) {
      toast.warn('Укажите корректный номер комнаты')
      return
    }

    const alreadyExists = rooms.some((item) => Number(item.roomNumber) === Number(formData.roomNumber))
    if (alreadyExists) {
      toast.warn('Комната с таким номером уже есть')
      return
    }

    const createdItem = {
      ...createDefaultRoomForm(),
      ...formData,
      id: buildRoomId(rooms),
    }

    setRooms((prev) => [createdItem, ...prev])
    setSelectedRoomId(createdItem.id)
    setFormMode(null)
    toast.success('Комната добавлена')
  }

  const handleEditSubmit = (formData) => {
    if (!selectedRoom) {
      toast.warn('Выберите комнату для изменения')
      return
    }

    if (!Number.isInteger(formData.roomNumber) || formData.roomNumber <= 0) {
      toast.warn('Укажите корректный номер комнаты')
      return
    }

    const duplicate = rooms.some(
      (item) => item.id !== selectedRoom.id && Number(item.roomNumber) === Number(formData.roomNumber),
    )
    if (duplicate) {
      toast.warn('Комната с таким номером уже есть')
      return
    }

    setRooms((prev) =>
      prev.map((item) =>
        item.id === selectedRoom.id
          ? {
              ...item,
              ...formData,
            }
          : item,
      ),
    )
    setFormMode(null)
    toast.success('Комната обновлена')
  }

  const handleDeleteConfirm = () => {
    if (!pendingDeleteRoom) return

    setRooms((prev) => prev.filter((item) => item.id !== pendingDeleteRoom.id))
    if (String(selectedRoomId) === String(pendingDeleteRoom.id)) {
      setSelectedRoomId(null)
    }
    setPendingDeleteId(null)
    setFormMode(null)
    toast.success('Комната удалена')
  }

  return (
    <section className="section dashboard" id="admin-rooms">
      <SectionHeading
        eyebrow="Администрирование"
        title="Комнаты"
        description="Управление списком комнат: добавление, изменение и удаление."
      />
      <AdminNav current="admin-rooms" onNavigate={onNavigate} />

      {formMode == null ? (
        <article className="card table-card">
          <div className="table-toolbar">
            <div>
              <h3>Список комнат</h3>
            </div>
            <div className="action-row">
              <button className="btn primary small" type="button" onClick={handleCreate}>
                Создать
              </button>
              <button className="btn ghost small" type="button" onClick={handleEdit} disabled={!selectedRoom}>
                Изменить
              </button>
              <button
                className="btn danger small"
                type="button"
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
                          <span className={`status status--${occupied.tone}`}>{occupied.label}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {formMode === 'create' ? (
        <article className="card form-card">
          <AdminRoomForm
            key="create"
            title="Новая комната"
            description="Форма соответствует модели Room из backend."
            submitLabel="Сохранить комнату"
            onSubmit={handleCreateSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {formMode === 'edit' ? (
        <article className="card form-card">
          <AdminRoomForm
            initialData={selectedRoom}
            title="Изменить комнату"
            description={
              selectedRoom ? `Редактирование комнаты ${selectedRoom.roomNumber} (${selectedRoom.id})` : ''
            }
            submitLabel="Сохранить изменения"
            onSubmit={handleEditSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {pendingDeleteRoom ? (
        <article className="card form-card">
          <div>
            <h3>Удалить комнату</h3>
            <p className="muted">
              Вы уверены, что хотите удалить комнату <strong>{pendingDeleteRoom.roomNumber}</strong> (
              {pendingDeleteRoom.id})?
            </p>
          </div>
          <div className="form-actions">
            <button className="btn ghost" type="button" onClick={() => setPendingDeleteId(null)}>
              Отмена
            </button>
            <button className="btn danger" type="button" onClick={handleDeleteConfirm}>
              Удалить
            </button>
          </div>
        </article>
      ) : null}
    </section>
  )
}

export default AdminRoomsPage
