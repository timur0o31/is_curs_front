import { useEffect, useState } from 'react'

const createDefaultLockerForm = () => ({
  lockerNumber: '',
  patientId: '',
})

function normalizeInitialData(initialData) {
  if (!initialData) return createDefaultLockerForm()

  return {
    lockerNumber:
      initialData.lockerNumber === null || initialData.lockerNumber === undefined
        ? ''
        : String(initialData.lockerNumber),
    patientId:
      initialData.patientId === null || initialData.patientId === undefined
        ? ''
        : String(initialData.patientId),
  }
}

function AdminLockerForm({ initialData, title, description, submitLabel = 'Сохранить', onSubmit, onCancel }) {
  const [form, setForm] = useState(() => normalizeInitialData(initialData))

  useEffect(() => {
    setForm(normalizeInitialData(initialData))
  }, [initialData])

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!onSubmit) return

    onSubmit({
      lockerNumber: Number(form.lockerNumber),
      patientId: form.patientId === '' ? null : Number(form.patientId),
    })
  }

  return (
    <>
      <div>
        <h3>{title}</h3>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="locker-locker-number">Номер шкафчика</label>
            <input
              id="locker-locker-number"
              type="number"
              min="1"
              value={form.lockerNumber}
              onChange={handleChange('lockerNumber')}
              placeholder="Например, 205"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="locker-patient-id">ID пациента</label>
            <input
              id="locker-patient-id"
              type="number"
              min="1"
              value={form.patientId}
              onChange={handleChange('patientId')}
              placeholder="Опционально"
            />
          </div>
        </div>

        <p className="muted">`patientId` можно оставить пустым, если шкафчик не закреплен.</p>

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

export { createDefaultLockerForm }
export default AdminLockerForm
