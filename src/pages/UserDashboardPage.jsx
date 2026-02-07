import SectionHeading from '../components/SectionHeading'

const todaySchedule = [
  {
    time: '09:00',
    title: 'Водолечение',
    location: 'Корпус А, кабинет 3',
    status: 'Подтверждено',
  },
  {
    time: '11:30',
    title: 'ЛФК с инструктором',
    location: 'Зал реабилитации 2',
    status: 'Подтверждено',
  },
  {
    time: '16:00',
    title: 'Соляная комната',
    location: 'Корпус B, кабинет 7',
    status: 'Ожидает',
  },
]

const notifications = [
  {
    title: 'Принять лекарство',
    details: 'Напоминание на 14:30, назначение врача.',
  },
  {
    title: 'Мероприятие в 19:30',
    details: 'Музыкальный вечер в зимнем саду.',
  },
]

const nextEvents = [
  {
    title: 'Йога у озера',
    details: 'Суббота, 11:00',
  },
  {
    title: 'Лекторий о сне',
    details: 'Вторник, 17:00',
  },
]

const currentRoom = '214'
const currentLocker = 18
const currentSeat = 'B4'

function UserDashboardPage({ onNavigate }) {
  const seatTable = currentSeat?.charAt(0)
  const seatNumber = currentSeat?.slice(1)
  const seatLabel = currentSeat ? `Стол ${seatTable}, место ${seatNumber}` : 'Место не выбрано'

  const handleDiaryClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('diary')
  }

  const handleStayRequestsClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('user-stay-requests')
  }

  const handleServicesClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('user-services')
  }

  return (
    <section className="section dashboard" id="user-dashboard">
      <SectionHeading
        eyebrow="Личный кабинет"
        title="Ваше восстановление под контролем"
        description="Здесь собраны расписание процедур, уведомления и персональные сервисы."
      />
      <div className="dashboard-grid dashboard-grid--three">
        <article className="card">
          <h3>Расписание на сегодня</h3>
          <ul className="list">
            {todaySchedule.map((item) => (
              <li className="list-item" key={`${item.time}-${item.title}`}>
                <div>
                  <strong>
                    {item.time} · {item.title}
                  </strong>
                  <p>{item.location}</p>
                </div>
                <span className="status">{item.status}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Питание и диета</h3>
          <p className="muted">{seatLabel}</p>
          <ul className="list">
            <li className="list-item">
              <div>
                <strong>Завтрак</strong>
                <p>08:00–09:00, {seatLabel}</p>
              </div>
              <span className="list-meta">Диета №5</span>
            </li>
            <li className="list-item">
              <div>
                <strong>Обед</strong>
                <p>13:00–14:00, {seatLabel}</p>
              </div>
              <span className="list-meta">Диета №5</span>
            </li>
            <li className="list-item">
              <div>
                <strong>Ужин</strong>
                <p>18:30–19:30, {seatLabel}</p>
              </div>
              <span className="list-meta">Диета №5</span>
            </li>
          </ul>
        </article>
        <article className="card">
          <h3>Срок проживания</h3>
          <div className="metric-grid">
            <div className="metric">
              <span className="metric-label">Заезд</span>
              <span className="metric-value">12 марта</span>
            </div>
            <div className="metric">
              <span className="metric-label">Выезд</span>
              <span className="metric-value">26 марта</span>
            </div>
            <div className="metric">
              <span className="metric-label">Осталось</span>
              <span className="metric-value">14 дней</span>
            </div>
          </div>
          <div className="action-row">
            <button className="btn primary small" type="button" onClick={handleStayRequestsClick}>
              Заявка и продление
            </button>
          </div>
        </article>
        <article className="card">
          <h3>Уведомления</h3>
          <ul className="list">
            {notifications.map((item) => (
              <li className="list-item" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.details}</p>
                </div>
                <span className="tag">Новое</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Сервисы проживания</h3>
          <p className="muted">
            Комната {currentRoom} · Шкафчик {currentLocker} · {seatLabel}
          </p>
          <ul className="list">
            <li className="list-item">
              <div>
                <strong>Цифровой ключ</strong>
                <p>Доступ активен, режим «Не беспокоить» с 21:00.</p>
              </div>
              <span className="status">Активен</span>
            </li>
            <li className="list-item">
              <div>
                <strong>Шкафчик</strong>
                <p>Номер {currentLocker}, доступ по браслету.</p>
              </div>
              <span className="status">Выбран</span>
            </li>
            <li className="list-item">
              <div>
                <strong>Столовая</strong>
                <p>{seatLabel}</p>
              </div>
              <span className="status">Закреплено</span>
            </li>
          </ul>
          <div className="action-row">
            <button className="btn primary small" type="button" onClick={handleServicesClick}>
              Открыть сервисы
            </button>
          </div>
        </article>
        <article className="card">
          <h3>Мероприятия рядом</h3>
          <ul className="list">
            {nextEvents.map((item) => (
              <li className="list-item" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.details}</p>
                </div>
                <span className="tag">Афиша</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Дневник состояния здоровья</h3>
          <p className="muted">Последняя запись: 03.02 · «Самочувствие стабильное».</p>
          <div className="action-row">
            <button className="btn primary small" type="button" onClick={handleDiaryClick}>
              Перейти в дневник
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default UserDashboardPage
