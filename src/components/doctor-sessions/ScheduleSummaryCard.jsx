function ScheduleSummaryCard({ todayCount, futureCount, monthlyFutureCount, totalCount }) {
  return (
    <article className="card">
      <h3>Сводка по расписанию</h3>
      <div className="metric-grid">
        <div className="metric">
          <span className="metric-label">Сегодня</span>
          <span className="metric-value">{todayCount}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Будущие</span>
          <span className="metric-value">{futureCount}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Этот месяц</span>
          <span className="metric-value">{monthlyFutureCount}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Всего сессий</span>
          <span className="metric-value">{totalCount}</span>
        </div>
      </div>
    </article>
  )
}

export default ScheduleSummaryCard
