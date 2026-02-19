import { useEffect, useState } from 'react'

const createDefaultProcedureForm = () => ({
  name: '',
  description: '',
  defaultSeats: '',
  isOptional: false,
  duration: '',
})

function normalizeInitialData(initialData) {
  if (!initialData) return createDefaultProcedureForm()

  return {
    name: initialData.name ?? '',
    description: initialData.description ?? '',
    defaultSeats:
      initialData.defaultSeats === null || initialData.defaultSeats === undefined
        ? ''
        : String(initialData.defaultSeats),
    isOptional: Boolean(initialData.isOptional),
    duration: initialData.duration ?? '',
  }
}

function AdminProcedureForm({ initialData, title, description, submitLabel = 'Сохранить', onSubmit, onCancel }) {
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
      name: form.name.trim(),
      description: form.description.trim(),
      defaultSeats: form.defaultSeats === '' ? null : Number(form.defaultSeats),
      isOptional: Boolean(form.isOptional),
      duration: form.duration.trim(),
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
          <label htmlFor="procedure-name">Название процедуры</label>
          <input
            id="procedure-name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Например, Массаж"
            maxLength={15}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="procedure-description">Описание</label>
          <textarea
            id="procedure-description"
            value={form.description}
            onChange={handleChange('description')}
            rows={4}
            maxLength={100}
            placeholder="Краткое описание процедуры"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="procedure-default-seats">Базовые места</label>
            <input
              id="procedure-default-seats"
              type="number"
              min="0"
              value={form.defaultSeats}
              onChange={handleChange('defaultSeats')}
              placeholder="Например, 10"
            />
          </div>
          <div className="field">
            <label htmlFor="procedure-duration">Длительность</label>
            <input
              id="procedure-duration"
              type="text"
              value={form.duration}
              onChange={handleChange('duration')}
              placeholder="Например, PT30M"
              required
            />
          </div>
        </div>

        <label className="checkbox" htmlFor="procedure-is-optional">
          <input
            id="procedure-is-optional"
            type="checkbox"
            checked={form.isOptional}
            onChange={handleChange('isOptional')}
          />
          Процедура опциональная
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

export { createDefaultProcedureForm }
export default AdminProcedureForm
