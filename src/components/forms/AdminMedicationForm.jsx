import { useEffect, useState } from 'react'

const createDefaultMedicationForm = () => ({
  name: '',
  notes: '',
})

function normalizeInitialData(initialData) {
  if (!initialData) return createDefaultMedicationForm()

  return {
    name: initialData.name ?? '',
    notes: initialData.notes ?? '',
  }
}

function AdminMedicationForm({ initialData, title, description, submitLabel = 'Сохранить', onSubmit, onCancel }) {
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
      name: form.name.trim(),
      notes: form.notes.trim(),
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
          <label htmlFor="med-name">Название препарата</label>
          <input
            id="med-name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="Например, Панангин"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="med-notes">Описание</label>
          <textarea
            id="med-notes"
            value={form.notes}
            onChange={handleChange('notes')}
            rows={4}
            placeholder="Дополнительные инструкции для администраторов"
          />
        </div>

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

export { createDefaultMedicationForm }
export default AdminMedicationForm
