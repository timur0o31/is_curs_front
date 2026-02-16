function DoctorDiaryNoteForm() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Комментарий врача</h3>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="notePlan">Рекомендации</label>
          <textarea
            id="notePlan"
            name="plan"
            rows="4"
            placeholder="Напишите рекомендации для пациента и персонала."
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="nextCheck">Следующая проверка</label>
            <input id="nextCheck" name="nextCheck" type="date" />
          </div>
        </div>
        <label className="checkbox">
          <input type="checkbox" name="notify" defaultChecked />
          <span>Отправить уведомление пациенту</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Сохранить комментарий
        </button>
      </div>
    </form>
  )
}

export default DoctorDiaryNoteForm
