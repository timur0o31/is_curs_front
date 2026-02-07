function DoctorDiaryNoteForm() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Комментарий врача</h3>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="noteStatus">Статус пациента</label>
          <select id="noteStatus" name="status" defaultValue="stable">
            <option value="stable">Стабильно</option>
            <option value="attention">Нужен контроль</option>
            <option value="critical">Требуется реакция</option>
          </select>
        </div>
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
          <div className="field">
            <label htmlFor="priority">Приоритет</label>
            <select id="priority" name="priority" defaultValue="normal">
              <option value="normal">Обычный</option>
              <option value="high">Повышенный</option>
              <option value="urgent">Срочно</option>
            </select>
          </div>
        </div>
        <label className="checkbox">
          <input type="checkbox" name="notify" defaultChecked />
          <span>Отправить уведомление пациенту</span>
        </label>
        <label className="checkbox">
          <input type="checkbox" name="assign" />
          <span>Передать задачу медсестре</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Сохранить комментарий
        </button>
        <button className="btn ghost" type="button">
          Сохранить черновик
        </button>
      </div>
    </form>
  )
}

export default DoctorDiaryNoteForm
