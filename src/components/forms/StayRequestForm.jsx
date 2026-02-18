import { useState } from 'react'
import { getDaysBetween, getTodayIsoDate } from '../../utils/dateTime'

const formatDays = (value) => {
  if (value <= 0) return ''
  if (value % 10 === 1 && value % 100 !== 11) return `${value} день`
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return `${value} дня`
  return `${value} дней`
}

function StayRequestForm({ onSubmit, isSubmitting = false }) {
  const [localError, setLocalError] = useState('')
  const [checkInValue, setCheckInValue] = useState('')
  const [checkOutValue, setCheckOutValue] = useState('')

  const todayIsoDate = getTodayIsoDate()
  const stayDays = getDaysBetween(checkInValue, checkOutValue)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLocalError('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      checkIn: String(formData.get('checkIn') || ''),
      checkOut: String(formData.get('checkOut') || ''),
    }

    if (!payload.checkIn || !payload.checkOut) {
      setLocalError('Укажите даты заезда и выезда')
      return
    }

    if (payload.checkOut <= payload.checkIn) {
      setLocalError('Дата выезда должна быть позже даты заезда')
      return
    }

    const isSuccess = await onSubmit?.(payload)
    if (isSuccess) {
      form.reset()
      setCheckInValue('')
      setCheckOutValue('')
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Новая заявка на проживание</h3>
      <div className="form-grid">
        <div className="field-row">
          <div className="field">
            <label htmlFor="stayCheckIn">Дата заезда</label>
            <input
              id="stayCheckIn"
              name="checkIn"
              type="date"
              required
              disabled={isSubmitting}
              min={todayIsoDate}
              value={checkInValue}
              onChange={(event) => setCheckInValue(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="stayCheckOut">Дата выезда</label>
            <input
              id="stayCheckOut"
              name="checkOut"
              type="date"
              required
              disabled={isSubmitting}
              min={checkInValue || todayIsoDate}
              value={checkOutValue}
              onChange={(event) => setCheckOutValue(event.target.value)}
            />
          </div>
        </div>
        {stayDays > 0 ? <p className="note">Срок проживания: {formatDays(stayDays)}</p> : null}
      </div>
      {localError ? <p className="note">{localError}</p> : null}
      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </div>
      <p className="note">Заявка появится в списке после отправки.</p>
    </form>
  )
}

export default StayRequestForm
