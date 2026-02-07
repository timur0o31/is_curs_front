import { useState } from 'react'

function DiaryEntryForm() {
  const [painLevel, setPainLevel] = useState(3)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Новая запись</h3>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="diaryDate">Дата</label>
          <input id="diaryDate" name="date" type="date" />
        </div>
        <div className="field">
          <label htmlFor="diaryMood">Самочувствие</label>
          <select id="diaryMood" name="mood" defaultValue="calm">
            <option value="calm">Спокойное</option>
            <option value="good">Отличное</option>
            <option value="tired">Усталость</option>
            <option value="alert">Нужна помощь</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="painLevel">Уровень боли</label>
          <div className="range-field">
            <input
              id="painLevel"
              className="range"
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(event) => setPainLevel(Number(event.target.value))}
            />
            <span className="range-value">{painLevel} / 10</span>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="sleepHours">Сон (часов)</label>
            <input id="sleepHours" name="sleep" type="number" min="0" step="0.5" />
          </div>
          <div className="field">
            <label htmlFor="pressure">Давление</label>
            <input id="pressure" name="pressure" type="text" placeholder="Например, 120/80" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="procedures">Процедуры</label>
          <input
            id="procedures"
            name="procedures"
            type="text"
            placeholder="Например, ЛФК, водолечение"
          />
        </div>
        <div className="field">
          <label htmlFor="meds">Препараты</label>
          <input id="meds" name="meds" type="text" placeholder="Например, Панангин" />
        </div>
        <div className="field">
          <label htmlFor="notes">Комментарий</label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            placeholder="Опишите самочувствие, что изменилось, что беспокоит."
          />
        </div>
        <label className="checkbox">
          <input type="checkbox" name="share" defaultChecked />
          <span>Показать запись лечащему врачу</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Сохранить запись
        </button>
        <button className="btn ghost" type="button">
          Сохранить черновик
        </button>
      </div>
    </form>
  )
}

export default DiaryEntryForm
