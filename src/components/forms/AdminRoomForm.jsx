import { useEffect, useState } from 'react'

const createDefaultRoomForm = () => ({
  roomNumber: '',
  isOccupied: false,
})

function normalizeInitialData(initialData) {
  if (!initialData) return createDefaultRoomForm()

  return {
    roomNumber:
      initialData.roomNumber === null || initialData.roomNumber === undefined
        ? ''
        : String(initialData.roomNumber),
    isOccupied: Boolean(initialData.isOccupied),
  }
}

function AdminRoomForm({ initialData, title, description, submitLabel = 'Сохранить', onSubmit, onCancel }) {
  const [form, setForm] = useState(() => normalizeInitialData(initialData))

  useEffect(() => {
    setForm(normalizeInitialData(initialData))
  }, [initialData])

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!onSubmit) return

    onSubmit({
      roomNumber: Number(form.roomNumber),
      isOccupied: Boolean(form.isOccupied),
    })
  }

  return (
    <>
      <div>
        <h3>{title}</h3>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="room-room-number">Номер комнаты</label>
          <input
            id="room-room-number"
            type="number"
            min="1"
            value={form.roomNumber}
            onChange={handleChange('roomNumber')}
            placeholder="Например, 312"
            required
          />
        </div>

        <label className="checkbox" htmlFor="room-is-occupied">
          <input
            id="room-is-occupied"
            type="checkbox"
            checked={form.isOccupied}
            onChange={handleChange('isOccupied')}
          />
          Комната занята (`isOccupied`)
        </label>

        <div className="form-actions">
          {onCancel ? (
            <button className="btn ghost" type="button" onClick={onCancel}>
              Отмена
            </button>
          ) : null}
          <button className="btn primary" type="submit">
            {submitLabel}
          </button>
        </div>
      </form>
    </>
  )
}

export { createDefaultRoomForm }
export default AdminRoomForm
