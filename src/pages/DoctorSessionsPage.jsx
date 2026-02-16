import { useEffect, useMemo, useState } from 'react'
import ScheduleCalendar from '../components/calendar/ScheduleCalendar'
import SectionHeading from '../components/SectionHeading'
import DoctorDiary from '../services/DoctorDiary'

const toIsoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayIsoDate = () => toIsoDate(new Date())

const getTomorrowIsoDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toIsoDate(date)
}

const getDefaultTimeValue = () => {
  const date = new Date()
  date.setMinutes(Math.ceil(date.getMinutes() / 10) * 10, 0, 0)

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

const getCurrentTimeValue = () => {
  const date = new Date()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const normalizeDateValue = (value) => {
  if (!value) return ''

  if (typeof value === 'string') {
    const directDate = value.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(directDate)) return directDate
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return toIsoDate(date)
}

const normalizeTimeValue = (value) => {
  if (!value) return ''

  if (typeof value === 'string') {
    const match = value.match(/^(\d{2}:\d{2})/)
    if (match) return match[1]
  }

  return ''
}

const formatDayLabel = (value) => {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
  })
}

const formatDateLabel = (value) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  })
}

const mapActivePatients = (items) =>
  items
    .filter((item) => item != null)
    .map((item, index) => {
      if (typeof item === 'string') {
        const name = item.trim() || `Пациент #${index + 1}`

        return {
          id: `name-${name}-${index}`,
          name,
          status: 'Активное проживание',
        }
      }

      const patientName = String(item?.patientName ?? item?.name ?? '').trim()
      const patientId = item?.patientId
      const name = patientName || (patientId != null ? `Пациент #${patientId}` : 'Пациент')
      const dischargeDate = item?.dischargeDate ?? item?.checkOutDate ?? item?.endDate
      const dischargeLabel = formatDateLabel(dischargeDate)

      return {
        id: item?.id ?? `${name}-${index}`,
        name,
        status: dischargeLabel === '—' ? 'Активное проживание' : `Активно до ${dischargeLabel}`,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name, 'ru'))

const mapSessions = (items) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const sessionDate = normalizeDateValue(item?.sessionDate)
      const timeStart = normalizeTimeValue(item?.timeStart)

      if (!sessionDate || !timeStart) return null

      const procedureName = String(
        item?.procedureName ?? item?.procedureTitle ?? item?.procedure?.name ?? '',
      ).trim()
      const procedureId = item?.procedureId ?? null

      return {
        id: item?.id ?? `session-${sessionDate}-${timeStart}-${index}`,
        sessionDate,
        timeStart,
        procedureId,
        title: procedureName || (procedureId != null ? `Процедура #${procedureId}` : 'Консультация'),
      }
    })
    .filter(Boolean)
    .sort((first, second) => {
      const firstDateTime = `${first.sessionDate}T${first.timeStart}`
      const secondDateTime = `${second.sessionDate}T${second.timeStart}`
      return firstDateTime.localeCompare(secondDateTime)
    })

const mergeSessions = (current, incoming) => {
  const byId = new Map(current.map((item) => [String(item.id), item]))
  incoming.forEach((item) => {
    byId.set(String(item.id), item)
  })

  return [...byId.values()].sort((first, second) => {
    const firstDateTime = `${first.sessionDate}T${first.timeStart}`
    const secondDateTime = `${second.sessionDate}T${second.timeStart}`
    return firstDateTime.localeCompare(secondDateTime)
  })
}

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для работы с расписанием.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint на бэкенде.'
  return fallback
}

function DoctorSessionsPage({ onNavigate }) {
  const role = String(localStorage.getItem('role') || '').toUpperCase()
  const accessToken = localStorage.getItem('accessToken')
  const shouldCheckDoctorStatus = role === 'DOCTOR' && Boolean(accessToken)

  const [isCheckingDoctorStatus, setIsCheckingDoctorStatus] = useState(shouldCheckDoctorStatus)
  const [isApprovedDoctor, setIsApprovedDoctor] = useState(true)
  const [observedPatients, setObservedPatients] = useState([])
  const [isObservedPatientsLoading, setIsObservedPatientsLoading] = useState(false)

  const [sessions, setSessions] = useState([])
  const [isSessionsLoading, setIsSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState('')

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarFocusDate, setCalendarFocusDate] = useState('')

  const [sessionForm, setSessionForm] = useState(() => ({
    date: getTomorrowIsoDate(),
    time: getDefaultTimeValue(),
    procedureId: '',
  }))
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [createSessionError, setCreateSessionError] = useState('')
  const [createSessionSuccess, setCreateSessionSuccess] = useState('')

  const todayIsoDate = getTodayIsoDate()
  const currentTimeValue = getCurrentTimeValue()

  const todaySessions = useMemo(
    () => sessions.filter((item) => item.sessionDate === todayIsoDate),
    [sessions, todayIsoDate],
  )

  const futureSessions = useMemo(
    () => sessions.filter((item) => item.sessionDate > todayIsoDate),
    [sessions, todayIsoDate],
  )

  const currentMonthKey = todayIsoDate.slice(0, 7)

  const monthlyFutureCount = useMemo(
    () => futureSessions.filter((item) => item.sessionDate.startsWith(currentMonthKey)).length,
    [currentMonthKey, futureSessions],
  )

  useEffect(() => {
    let cancelled = false

    if (!shouldCheckDoctorStatus) {
      setIsCheckingDoctorStatus(false)
      setIsApprovedDoctor(true)
      return () => {
        cancelled = true
      }
    }

    const loadDoctorStatus = async () => {
      setIsCheckingDoctorStatus(true)

      try {
        const response = await DoctorDiary.getDashboard()

        if (cancelled) return

        setIsApprovedDoctor(response?.data === true)
      } catch {
        if (cancelled) return

        setIsApprovedDoctor(false)
      } finally {
        if (!cancelled) {
          setIsCheckingDoctorStatus(false)
        }
      }
    }

    loadDoctorStatus()

    return () => {
      cancelled = true
    }
  }, [shouldCheckDoctorStatus])

  useEffect(() => {
    let cancelled = false

    const loadObservedPatients = async () => {
      if (!shouldCheckDoctorStatus || isCheckingDoctorStatus || !isApprovedDoctor) {
        if (!cancelled) {
          setObservedPatients([])
          setIsObservedPatientsLoading(false)
        }
        return
      }

      setIsObservedPatientsLoading(true)

      try {
        const response = await DoctorDiary.getActivePatients()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setObservedPatients(mapActivePatients(items))
      } catch {
        if (!cancelled) {
          setObservedPatients([])
        }
      } finally {
        if (!cancelled) {
          setIsObservedPatientsLoading(false)
        }
      }
    }

    loadObservedPatients()

    return () => {
      cancelled = true
    }
  }, [isApprovedDoctor, isCheckingDoctorStatus, shouldCheckDoctorStatus])

  useEffect(() => {
    let cancelled = false

    const loadSessions = async () => {
      if (!shouldCheckDoctorStatus || isCheckingDoctorStatus || !isApprovedDoctor) {
        if (!cancelled) {
          setSessions([])
          setSessionsError('')
          setIsSessionsLoading(false)
        }
        return
      }

      setIsSessionsLoading(true)
      setSessionsError('')

      try {
        const response = await DoctorDiary.getMySessions()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setSessions(mapSessions(items))
      } catch (error) {
        if (!cancelled) {
          setSessions([])
          setSessionsError(getErrorMessage(error, 'Не удалось загрузить расписание врача.'))
        }
      } finally {
        if (!cancelled) {
          setIsSessionsLoading(false)
        }
      }
    }

    loadSessions()

    return () => {
      cancelled = true
    }
  }, [isApprovedDoctor, isCheckingDoctorStatus, shouldCheckDoctorStatus])

  const showPendingApproval = shouldCheckDoctorStatus && !isCheckingDoctorStatus && !isApprovedDoctor

  const handleBackToDashboard = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('doctor')
  }

  const handleSessionFieldChange = (event) => {
    const { name, value } = event.target

    setSessionForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateSession = async (event) => {
    event.preventDefault()

    if (!sessionForm.date || !sessionForm.time) {
      setCreateSessionError('Укажите дату и время сессии.')
      setCreateSessionSuccess('')
      return
    }

    setCreateSessionError('')
    setCreateSessionSuccess('')
    setIsCreatingSession(true)

    try {
      const procedureIdValue = String(sessionForm.procedureId || '').trim()
      const payload = {
        sessionDate: sessionForm.date,
        timeStart: sessionForm.time,
        procedureId: procedureIdValue ? Number(procedureIdValue) : null,
      }

      const response = await DoctorDiary.createMySession(payload)
      const createdSessions = mapSessions([response?.data])

      if (createdSessions.length > 0) {
        setSessions((prev) => mergeSessions(prev, createdSessions))
      }

      setCreateSessionSuccess('Сессия добавлена в расписание.')
      setIsCalendarOpen(true)
      setCalendarFocusDate(sessionForm.date)
      setSessionForm((prev) => ({
        ...prev,
        procedureId: '',
      }))
    } catch (error) {
      setCreateSessionError(getErrorMessage(error, 'Не удалось создать сессию.'))
    } finally {
      setIsCreatingSession(false)
    }
  }

  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev)
  }

  if (isCheckingDoctorStatus) {
    return (
      <section className="section dashboard" id="doctor-sessions">
        <SectionHeading
          eyebrow="Расписание врача"
          title="Проверяем доступ к расписанию"
          description="Идет проверка статуса учетной записи врача."
        />
      </section>
    )
  }

  if (showPendingApproval) {
    return (
      <section className="section dashboard" id="doctor-sessions">
        <SectionHeading
          eyebrow="Расписание врача"
          title="Дождитесь одобрения администратора"
          description="Ваша учетная запись врача зарегистрирована, но пока не активирована."
        />
        <article className="card">
          <h3>Что дальше</h3>
          <p className="muted">
            После подтверждения администратора откроется доступ к рабочему кабинету врача.
          </p>
        </article>
      </section>
    )
  }

  return (
    <section className="section dashboard" id="doctor-sessions">
      <SectionHeading
        eyebrow="Расписание врача"
        title="Управляйте своими сессиями и приемами"
        description="Создавайте приемы, контролируйте сессии на сегодня и смотрите календарь будущего расписания."
      />
      <div className="action-row">
        <a className="btn ghost" href="?page=doctor" onClick={handleBackToDashboard}>
          К кабинету врача
        </a>
      </div>
      <div className="dashboard-grid dashboard-grid--three">
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
                  <span className={`status${item.timeStart < currentTimeValue ? ' status--warn' : ''}`}>
                    {item.timeStart < currentTimeValue ? 'Завершено' : 'Сегодня'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="action-row">
            <button className="btn ghost small" type="button" onClick={toggleCalendar}>
              {isCalendarOpen ? 'Скрыть календарь' : 'Показать будущие сессии'}
            </button>
          </div>
        </article>
        <article className="card">
          <h3>Пациенты под наблюдением</h3>
          {isObservedPatientsLoading ? (
            <p className="muted">Загружаем пациентов с активным проживанием...</p>
          ) : observedPatients.length === 0 ? (
            <p className="muted">Нет пациентов с активным проживанием под вашим наблюдением.</p>
          ) : (
            <ul className="list">
              {observedPatients.map((item) => (
                <li className="list-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.status}</p>
                  </div>
                  <span className="tag">В работе</span>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h3>Сводка по расписанию</h3>
          <div className="metric-grid">
            <div className="metric">
              <span className="metric-label">Сегодня</span>
              <span className="metric-value">{todaySessions.length}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Будущие</span>
              <span className="metric-value">{futureSessions.length}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Этот месяц</span>
              <span className="metric-value">{monthlyFutureCount}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Всего сессий</span>
              <span className="metric-value">{sessions.length}</span>
            </div>
          </div>
        </article>
        <article className="card">
          <h3>Создать сессию</h3>
          <form className="doctor-session-form" onSubmit={handleCreateSession}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="sessionDate">Дата</label>
                <input
                  id="sessionDate"
                  name="date"
                  type="date"
                  min={todayIsoDate}
                  value={sessionForm.date}
                  onChange={handleSessionFieldChange}
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
                  onChange={handleSessionFieldChange}
                  disabled={isCreatingSession}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="sessionProcedure">ID процедуры (опционально)</label>
              <input
                id="sessionProcedure"
                name="procedureId"
                type="number"
                min="1"
                placeholder="Например, 12"
                value={sessionForm.procedureId}
                onChange={handleSessionFieldChange}
                disabled={isCreatingSession}
              />
            </div>
            {createSessionError ? <p className="doctor-session-feedback error">{createSessionError}</p> : null}
            {createSessionSuccess ? (
              <p className="doctor-session-feedback success">{createSessionSuccess}</p>
            ) : null}
            <div className="form-actions">
              <button className="btn primary small" type="submit" disabled={isCreatingSession}>
                {isCreatingSession ? 'Создаём...' : 'Создать сессию'}
              </button>
            </div>
          </form>
        </article>
      </div>
      {isCalendarOpen ? (
        <ScheduleCalendar
          key={calendarFocusDate || 'schedule-calendar'}
          sessions={futureSessions}
          todayIsoDate={todayIsoDate}
          requestedDate={calendarFocusDate}
          title="Календарь будущих сессий"
          description="Выберите дату, чтобы увидеть заполненные приемы."
          emptySessionsText="На выбранную дату будущих сессий нет."
          formatDayLabel={formatDayLabel}
          getSessionMeta={(item) =>
            item.procedureId != null ? `Процедура #${item.procedureId}` : 'Консультация'
          }
        />
      ) : null}
    </section>
  )
}

export default DoctorSessionsPage
