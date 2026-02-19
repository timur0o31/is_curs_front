import { useEffect, useState } from 'react'

const createDefaultMedicationForm = () => ({
  name: '',
  description: '',
  intakeTime: [],
})

function normalizeInitialData(initialData) {
  if (!initialData) return createDefaultMedicationForm()

  return {
    name: initialData.name ?? '',
    description: initialData.description ?? '',
    intakeTime: initialData.intakeTime ?? [],
  }
}

function AdminMedicationForm({
  initialData,
  title,
  description: formDescription,
  submitLabel = 'Сохранить',
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() =>
    normalizeInitialData(initialData)
  )

  useEffect(() => {
    setForm(normalizeInitialData(initialData))
  }, [initialData])

  // ===== basic fields =====

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  // ===== intake time =====

  const handleTimeChange = (index) => (event) => {
    const value = event.target.value
    setForm((current) => {
      const updated = [...current.intakeTime]
      updated[index] = value
      return { ...current, intakeTime: updated }
    })
  }

  const handleAddTime = () => {
    setForm((current) => ({
      ...current,
      intakeTime: [...current.intakeTime, ''],
    }))
  }

  const handleRemoveTime = (index) => () => {
    setForm((current) => ({
      ...current,
      intakeTime: current.intakeTime.filter((_, i) => i !== index),
    }))
  }

  // ===== submit =====

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!onSubmit) return

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      intakeTime: form.intakeTime
        .map((t) => t.trim())
        .filter(Boolean), // убрать пустые
    })
  }

  return (
    <>
      <div>
        <h3>{title}</h3>
        {formDescription ? (
          <p className="muted">{formDescription}</p>
        ) : null}
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        {/* NAME */}
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

        {/* DESCRIPTION */}
        <div className="field">
          <label htmlFor="med-description">Описание</label>
          <textarea
            id="med-description"
            value={form.description}
            onChange={handleChange('description')}
            rows={3}
            placeholder="Описание или инструкция"
            required
          />
        </div>

        {/* INTAKE TIME */}
        <div className="field">
          <label>Время приёма</label>

          {form.intakeTime.length === 0 && (
            <div className="muted">Время не добавлено</div>
          )}

          {form.intakeTime.map((time, index) => (
            <div
              key={index}
              style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}
            >
              <input
                type="time"
                value={time}
                onChange={handleTimeChange(index)}
              />
              <button
                type="button"
                className="btn danger small"
                onClick={handleRemoveTime(index)}
              >
                Удалить
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn ghost small"
            onClick={handleAddTime}
          >
            + Добавить время
          </button>
        </div>

        {/* ACTIONS */}
        <div className="form-actions">
          {onCancel && (
            <button
              className="btn ghost"
              type="button"
              onClick={onCancel}
            >
              Отмена
            </button>
          )}

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