import { useState } from 'react'
import { getDaysBetween } from '../../utils/dateTime'

const formatDays = (value) => {
  if (value <= 0) return ''
  if (value % 10 === 1 && value % 100 !== 11) return `${value} день`
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return `${value} дня`
  return `${value} дней`
}

function StayExtensionForm({ onSubmit, isSubmitting = false, initialCurrentCheckOut = '' }) {
  const [localError, setLocalError] = useState('')
  const [currentCheckOutValue, setCurrentCheckOutValue] = useState('')
  const [newCheckOutValue, setNewCheckOutValue] = useState('')

  const currentCheckOut = initialCurrentCheckOut || currentCheckOutValue
  const extensionDays = getDaysBetween(currentCheckOut, newCheckOutValue)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLocalError('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      currentCheckOut: String(formData.get('currentCheckOut') || ''),
      newCheckOut: String(formData.get('newCheckOut') || ''),
    }

    if (!payload.newCheckOut) {
      setLocalError('Укажите новую дату выезда')
      return
    }

    if (!payload.currentCheckOut) {
      setLocalError('Укажите текущую дату выезда')
      return
    }

    if (payload.newCheckOut <= payload.currentCheckOut) {
      setLocalError('Новая дата должна быть позже текущей даты выезда')
      return
    }

    const isSuccess = await onSubmit?.(payload)
    if (isSuccess) {
      form.reset()
      setCurrentCheckOutValue('')
      setNewCheckOutValue('')
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Продление проживания</h3>
      <div className="form-grid">
        <div className="field-row">
          <div className="field">
            <label htmlFor="currentCheckOut">Текущий выезд</label>
            <input
              id="currentCheckOut"
              name="currentCheckOut"
              type="date"
              required
              disabled={isSubmitting}
              value={currentCheckOut}
              onChange={(event) => setCurrentCheckOutValue(event.target.value)}
              readOnly={Boolean(initialCurrentCheckOut)}
            />
          </div>
          <div className="field">
            <label htmlFor="newCheckOut">Новая дата выезда</label>
            <input
              id="newCheckOut"
              name="newCheckOut"
              type="date"
              required
              disabled={isSubmitting}
              min={currentCheckOut || undefined}
              value={newCheckOutValue}
              onChange={(event) => setNewCheckOutValue(event.target.value)}
            />
          </div>
        </div>
        {extensionDays > 0 ? <p className="note">Продление: {formatDays(extensionDays)}</p> : null}
      </div>
      {localError ? <p className="note">{localError}</p> : null}
      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Отправить запрос'}
        </button>
      </div>
    </form>
  )
}

export default StayExtensionForm
