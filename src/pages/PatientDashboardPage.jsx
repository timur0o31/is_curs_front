import { useEffect, useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import PatientStay from '../services/PatientStay'

const getTodayStart = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

const isOnOrAfterToday = (value) => {
  if (!value) return true

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  date.setHours(0, 0, 0, 0)
  return date.getTime() >= getTodayStart().getTime()
}

const formatDays = (value) => {
  if (value <= 0) return '0 дней'
  if (value % 10 === 1 && value % 100 !== 11) return `${value} день`
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return `${value} дня`
  return `${value} дней`
}

const formatDateLabel = (value) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}

const getRemainingDays = (dischargeDate) => {
  if (!dischargeDate) return '—'

  const end = new Date(dischargeDate)
  if (Number.isNaN(end.getTime())) return '—'

  end.setHours(0, 0, 0, 0)
  const diffMs = end.getTime() - getTodayStart().getTime()
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  return formatDays(days)
}

const parseRoomNumber = (payload) => {
  if (payload == null) return null

  if (typeof payload === 'number') {
    return String(payload)
  }

  if (typeof payload === 'string') {
    const match = payload.match(/\d+/)
    return match ? match[0] : null
  }

  if (typeof payload === 'object') {
    if (payload.roomNumber != null) return String(payload.roomNumber)
    if (payload.number != null) return String(payload.number)
    if (payload.room != null && typeof payload.room === 'object' && payload.room.roomNumber != null) {
      return String(payload.room.roomNumber)
    }
  }

  return null
}

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

const currentLocker = 18
const currentSeat = 'B4'

function PatientDashboardPage({ onNavigate }) {
  const [stayRequests, setStayRequests] = useState([])
  const [isStayLoading, setIsStayLoading] = useState(false)
  const [roomNumber, setRoomNumber] = useState(null)
  const [isRoomLoading, setIsRoomLoading] = useState(false)

  const seatTable = currentSeat?.charAt(0)
  const seatNumber = currentSeat?.slice(1)
  const seatLabel = currentSeat ? `Стол ${seatTable}, место ${seatNumber}` : 'Место не выбрано'

  useEffect(() => {
    let cancelled = false
    const loadStayRequests = async () => {
      setIsStayLoading(true)
      try {
        const response = await PatientStay.getMyStayRequests()
        if (!cancelled && Array.isArray(response.data)) {
          setStayRequests(response.data)
        }
      } catch {
        if (!cancelled) {
          setStayRequests([])
        }
      } finally {
        if (!cancelled) {
          setIsStayLoading(false)
        }
      }
    }
    loadStayRequests()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadRoom = async () => {
      if (!localStorage.getItem('accessToken')) {
        if (!cancelled) setRoomNumber(null)
        return
      }

      setIsRoomLoading(true)

      try {
        const response = await PatientStay.getMyRoom()
        if (cancelled) return

        setRoomNumber(parseRoomNumber(response.data))
      } catch {
        if (!cancelled) {
          setRoomNumber(null)
        }
      } finally {
        if (!cancelled) {
          setIsRoomLoading(false)
        }
      }
    }

    loadRoom()

    return () => {
      cancelled = true
    }
  }, [])

  const activeStay = useMemo(() => {
    const activeItems = stayRequests.filter(
      (item) =>
        item?.status === 'APPROVED' &&
        item?.type === 'CHECK_IN' &&
        isOnOrAfterToday(item?.dischargeDate),
    )

    if (activeItems.length === 0) return null

    return activeItems.sort((a, b) => {
      const first = new Date(a?.dischargeDate || 0).getTime()
      const second = new Date(b?.dischargeDate || 0).getTime()
      return second - first
    })[0]
  }, [stayRequests])

  const stayMetrics = useMemo(() => {
    if (isStayLoading) {
      return {
        checkIn: '...',
        checkOut: '...',
        left: '...',
      }
    }

    if (!activeStay) {
      return {
        checkIn: '—',
        checkOut: '—',
        left: 'Нет активной заявки',
      }
    }

    return {
      checkIn: formatDateLabel(activeStay.admissionDate),
      checkOut: formatDateLabel(activeStay.dischargeDate),
      left: getRemainingDays(activeStay.dischargeDate),
    }
  }, [activeStay, isStayLoading])

  const stayActionLabel = activeStay ? 'Продлить проживание' : 'Оформить заявку'
  const stayActionHint = activeStay
    ? 'У вас активное проживание. Можно отправить только продление.'
    : 'Активного проживания нет. Отправьте заявку на заселение.'

  const roomLabel = useMemo(() => {
    if (isRoomLoading) return '...'
    if (!roomNumber) return 'не назначена'
    return roomNumber
  }, [isRoomLoading, roomNumber])

  const handleDiaryClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('diary')
  }

  const handleStayRequestsClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient-stay-requests')
  }

  const handleServicesClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient-services')
  }

  return (
    <section className="section dashboard" id="patient-dashboard">
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
              <span className="metric-value">{stayMetrics.checkIn}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Выезд</span>
              <span className="metric-value">{stayMetrics.checkOut}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Осталось</span>
              <span className="metric-value">{stayMetrics.left}</span>
            </div>
          </div>
          <p className="muted">{stayActionHint}</p>
          <div className="action-row">
            <button className="btn primary small" type="button" onClick={handleStayRequestsClick}>
              {stayActionLabel}
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
            Комната {roomLabel} · Шкафчик {currentLocker} · {seatLabel}
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

export default PatientDashboardPage
