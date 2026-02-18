import { useState } from 'react'

const normalizeText = (value) => String(value ?? '').trim()

function DiaryEntryForm({
  onCreateEntry,
  isSubmitting = false,
  submitError = '',
  submitSuccess = '',
  disabled = false,
}) {
  const [comment, setComment] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    const normalizedComment = normalizeText(comment)
    if (!normalizedComment) {
      setLocalError('Комментарий не может быть пустым.')
      return
    }

    if (typeof onCreateEntry !== 'function') return

    const isCreated = await onCreateEntry({
      comment: normalizedComment,
    })

    if (isCreated) {
      setComment('')
      setLocalError('')
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Новая запись</h3>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="diaryComment">Комментарий</label>
          <textarea
            id="diaryComment"
            name="comment"
            rows="6"
            placeholder="Опишите самочувствие и важные изменения."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={disabled || isSubmitting}
          />
        </div>
        {localError ? <p className="doctor-session-feedback error">{localError}</p> : null}
        {submitError ? <p className="doctor-session-feedback error">{submitError}</p> : null}
        {submitSuccess ? <p className="doctor-session-feedback success">{submitSuccess}</p> : null}
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Сохраняем...' : 'Сохранить запись'}
        </button>
      </div>
    </form>
  )
}

export default DiaryEntryForm
