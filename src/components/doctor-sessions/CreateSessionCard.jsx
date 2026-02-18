function CreateSessionCard({
  sessionForm,
  onSessionFieldChange,
  onCreateSession,
  isCreatingSession,
  todayIsoDate,
  procedures,
  isProceduresLoading,
  proceduresError,
  createSessionError,
  createSessionSuccess,
}) {
  return (
    <article className="card">
      <h3>Создать сессию</h3>
      <form className="doctor-session-form" onSubmit={onCreateSession}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="sessionDate">Дата</label>
            <input
              id="sessionDate"
              name="date"
              type="date"
              min={todayIsoDate}
              value={sessionForm.date}
              onChange={onSessionFieldChange}
              disabled={isCreatingSession}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="sessionTime">Время</label>
            <input
              id="sessionTime"
              name="time"
              type="time"
              value={sessionForm.time}
              onChange={onSessionFieldChange}
              disabled={isCreatingSession}
              required
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="sessionProcedure">Процедура (опционально)</label>
          <select
            id="sessionProcedure"
            name="procedureId"
            value={sessionForm.procedureId}
            onChange={onSessionFieldChange}
            disabled={isCreatingSession || isProceduresLoading}
          >
            <option value="">Без процедуры (консультация)</option>
            {procedures.map((procedure) => (
              <option key={procedure.id} value={String(procedure.id)}>
                {procedure.name}
              </option>
            ))}
          </select>
          {isProceduresLoading ? <p className="muted">Загружаем список процедур...</p> : null}
          {proceduresError ? <p className="doctor-session-feedback error">{proceduresError}</p> : null}
        </div>
        {createSessionError ? <p className="doctor-session-feedback error">{createSessionError}</p> : null}
        {createSessionSuccess ? <p className="doctor-session-feedback success">{createSessionSuccess}</p> : null}
        <div className="form-actions">
          <button className="btn primary small" type="submit" disabled={isCreatingSession}>
            {isCreatingSession ? 'Создаём...' : 'Создать сессию'}
          </button>
        </div>
      </form>
    </article>
  )
}

export default CreateSessionCard
