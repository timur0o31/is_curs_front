import { useEffect, useMemo, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import PatientStay from '../services/PatientStay'
import PatientSessions from '../services/PatientSessions'
import { formatRuDate, getTodayIsoDate, getTodayStart, isOnOrAfterToday, parseDateValue } from '../utils/dateTime'
import { formatSessionTimeLabel, mapSessions } from './doctorSessions/utils'

const formatDays = (value) => {
  if (value <= 0) return '0 дней'
  if (value % 10 === 1 && value % 100 !== 11) return `${value} день`
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return `${value} дня`
  return `${value} дней`
}

const formatDateLabel = (value) =>
  formatRuDate(value, {
    day: 'numeric',
    month: 'long',
  })

const getRemainingDays = (dischargeDate) => {
  if (!dischargeDate) return '—'

  const end = parseDateValue(dischargeDate)
  if (!end) return '—'

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

const currentLocker = 18
const currentSeat = 'B4'

function PatientDashboardPage({ onNavigate }) {
  const [stayRequests, setStayRequests] = useState([])
  const [isStayLoading, setIsStayLoading] = useState(false)
  const [roomNumber, setRoomNumber] = useState(null)
  const [isRoomLoading, setIsRoomLoading] = useState(false)
  const [todaySessions, setTodaySessions] = useState([])
  const [isTodaySessionsLoading, setIsTodaySessionsLoading] = useState(false)
  const [todaySessionsError, setTodaySessionsError] = useState('')

  const todayIsoDate = getTodayIsoDate()

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

    const loadTodaySessions = async () => {
      if (!localStorage.getItem('accessToken')) {
        if (!cancelled) {
          setTodaySessions([])
          setTodaySessionsError('')
          setIsTodaySessionsLoading(false)
        }
        return
      }

      setIsTodaySessionsLoading(true)
      setTodaySessionsError('')

      try {
        const response = await PatientSessions.getMySchedule({ date: todayIsoDate })
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        const mapped = mapSessions(items).filter((item) => item.sessionDate === todayIsoDate)
        setTodaySessions(mapped)
      } catch (error) {
        if (cancelled) return

        setTodaySessions([])

        const status = error?.response?.status
        if (status === 401) {
          setTodaySessionsError('Сессия авторизации истекла. Войдите снова.')
        } else if (status === 403) {
          setTodaySessionsError('Недостаточно прав для просмотра расписания.')
        } else if (status === 404) {
          setTodaySessionsError('Метод расписания не найден на сервере.')
        } else {
          setTodaySessionsError('Не удалось загрузить расписание на сегодня.')
        }
      } finally {
        if (!cancelled) {
          setIsTodaySessionsLoading(false)
        }
      }
    }

    loadTodaySessions()

    return () => {
      cancelled = true
    }
  }, [todayIsoDate])

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

  const handleSessionsClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient-sessions')
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
          <h2>Расписание и запись</h2>
          <h3>Сегодня</h3>
          {isTodaySessionsLoading ? (
            <p className="muted">Загружаем приемы...</p>
          ) : todaySessionsError ? (
            <p className="muted">{todaySessionsError}</p>
          ) : todaySessions.length === 0 ? (
            <p className="muted">На сегодня процедур нет.</p>
          ) : (
            <ul className="list">
              {todaySessions.map((item) => (
                <li className="list-item" key={`patient-dashboard-today-session-${item.id}`}>
                  <div>
                    <strong>
                      {item.timeStart} · {item.title}
                    </strong>
                    <p>{formatSessionTimeLabel(item)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="action-row">
            <button className="btn primary small" type="button" onClick={handleSessionsClick}>
              Открыть календарь
            </button>
          </div>
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
