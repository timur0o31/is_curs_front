import SectionHeading from '../components/SectionHeading'

const todayAppointments = [
  {
    time: '09:20',
    name: 'Ирина Смирнова',
    reason: 'Контроль реабилитации',
  },
  {
    time: '12:00',
    name: 'Дмитрий Левин',
    reason: 'Корректировка диеты',
  },
  {
    time: '15:40',
    name: 'Ольга Орлова',
    reason: 'Назначение процедур',
  },
]

const patientUpdates = [
  {
    name: 'Сергей Блинов',
    status: 'Стабильно, требуется контроль давления.',
  },
  {
    name: 'Марина Егорова',
    status: 'Нужна корректировка плана ЛФК.',
  },
  {
    name: 'Алексей Поляков',
    status: 'Готов к выписке через 3 дня.',
  },
]

const requests = [
  {
    name: 'Екатерина Морозова',
    info: 'Запрос на дополнительный массаж, свободно в 18:00.',
  },
  {
    name: 'Антон Серов',
    info: 'Перенос процедуры на 10:30.',
  },
]

function DoctorDashboardPage({ onNavigate }) {
  const handleDiaryClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('doctor-diary')
  }

  return (
    <section className="section dashboard" id="doctor-dashboard">
      <SectionHeading
        eyebrow="Кабинет врача"
        title="Планируйте приемы и контролируйте состояние пациентов"
        description="Все пациенты, назначения и обращения собраны в одном месте."
      />
      <div className="dashboard-grid dashboard-grid--three">
        <article className="card">
          <h3>Приемы сегодня</h3>
          <ul className="list">
            {todayAppointments.map((item) => (
              <li className="list-item" key={`${item.time}-${item.name}`}>
                <div>
                  <strong>
                    {item.time} · {item.name}
                  </strong>
                  <p>{item.reason}</p>
                </div>
                <span className="status">Запланировано</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Пациенты под наблюдением</h3>
          <ul className="list">
            {patientUpdates.map((item) => (
              <li className="list-item" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.status}</p>
                </div>
                <span className="tag">В работе</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Назначения на неделю</h3>
          <div className="metric-grid">
            <div className="metric">
              <span className="metric-label">Процедуры</span>
              <span className="metric-value">48</span>
            </div>
            <div className="metric">
              <span className="metric-label">Диеты</span>
              <span className="metric-value">12</span>
            </div>
            <div className="metric">
              <span className="metric-label">Лекарства</span>
              <span className="metric-value">24</span>
            </div>
            <div className="metric">
              <span className="metric-label">Осмотры</span>
              <span className="metric-value">16</span>
            </div>
          </div>
        </article>
        <article className="card">
          <h3>Запросы пациентов</h3>
          <ul className="list">
            {requests.map((item) => (
              <li className="list-item" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.info}</p>
                </div>
                <div className="action-row">
                  <button className="btn primary small" type="button">
                    Принять
                  </button>
                  <button className="btn ghost small" type="button">
                    Другая дата
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Дневники на проверку</h3>
          <ul className="list">
            <li className="list-item">
              <div>
                <strong>Николай Шестаков</strong>
                <p>Новая запись от 03.02, требуется комментарий.</p>
              </div>
              <button className="btn ghost small" type="button" onClick={handleDiaryClick}>
                Открыть
              </button>
            </li>
            <li className="list-item">
              <div>
                <strong>Елена Романова</strong>
                <p>Нужна рекомендация по режиму сна.</p>
              </div>
              <button className="btn ghost small" type="button" onClick={handleDiaryClick}>
                Открыть
              </button>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default DoctorDashboardPage
