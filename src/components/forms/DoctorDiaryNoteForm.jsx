import { useEffect, useMemo, useState } from 'react'

const normalizePositiveInt = (value) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null
  return Math.trunc(numericValue)
}

function DoctorDiaryNoteForm({
  selectedPatient,
  onSubmitComment,
  isSubmitting = false,
  submitError = '',
  submitSuccess = '',
  disabled = false,
}) {
  const [comment, setComment] = useState('')

  const selectedPatientId = useMemo(
    () => normalizePositiveInt(selectedPatient?.patientId),
    [selectedPatient?.patientId],
  )

  useEffect(() => {
    setComment('')
  }, [selectedPatientId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (typeof onSubmitComment !== 'function') return

    const isSaved = await onSubmitComment(comment)
    if (isSaved) {
      setComment('')
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Комментарий врача</h3>
      <p className="muted">
        {selectedPatient
          ? `Пациент: ${selectedPatient.name}${selectedPatientId != null ? ` · ID ${selectedPatientId}` : ''}`
          : 'Выберите пациента в списке, чтобы оставить комментарий.'}
      </p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="doctorDiaryComment">Рекомендации</label>
          <textarea
            id="doctorDiaryComment"
            name="comment"
            rows="5"
            placeholder="Напишите рекомендации для пациента."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={disabled || isSubmitting}
          />
        </div>
        {submitError ? <p className="doctor-session-feedback error">{submitError}</p> : null}
        {submitSuccess ? <p className="doctor-session-feedback success">{submitSuccess}</p> : null}
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Сохраняем...' : 'Сохранить комментарий'}
        </button>
      </div>
    </form>
  )
}

export default DoctorDiaryNoteForm
