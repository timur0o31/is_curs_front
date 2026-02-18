function TodaySessionsCard({
  todayIsoDate,
  formatDayLabel,
  isSessionsLoading,
  sessionsError,
  todaySessions,
  isCalendarOpen,
  onToggleCalendar,
}) {
  return (
    <article className="card">
      <h3>Приемы сегодня</h3>
      <p className="muted">Дата: {formatDayLabel(todayIsoDate)}</p>
      {isSessionsLoading ? (
        <p className="muted">Загружаем расписание...</p>
      ) : sessionsError ? (
        <p className="muted">{sessionsError}</p>
      ) : todaySessions.length === 0 ? (
        <p className="muted">На сегодня приемов нет.</p>
      ) : (
        <ul className="list">
          {todaySessions.map((item) => (
            <li className="list-item" key={item.id}>
              <div>
                <strong>
                  {item.timeStart} · {item.title}
                </strong>
                <p>{formatDayLabel(item.sessionDate)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="action-row">
        <button className="btn ghost small" type="button" onClick={onToggleCalendar}>
          {isCalendarOpen ? 'Скрыть календарь' : 'Показать будущие сессии'}
        </button>
      </div>
    </article>
  )
}

export default TodaySessionsCard
