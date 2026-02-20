import { useEffect, useMemo, useState } from 'react'
import ScheduleCalendar from '../components/calendar/ScheduleCalendar'
import SectionHeading from '../components/SectionHeading'
import Home from '../services/Home'
import PatientSessions from '../services/PatientSessions'
import { getCurrentTimeValue, getTodayIsoDate } from '../utils/dateTime'
import {
  formatDayLabel,
  formatSessionTimeLabel,
  mergeSessions,
  mapSessions,
  normalizePositiveInt,
} from './doctorSessions/utils'

const getPatientSessionsErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для просмотра расписания пациента.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint расписания пациента.'
  return fallback
}

const getRegistrationActionErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 400) return 'Запись отклонена сервером. Проверьте данные сеанса.'
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для записи на выбранный сеанс.'
  if (status === 404) return 'Метод записи не найден на сервере.'
  if (status === 409) return 'На выбранный сеанс уже нет свободных мест.'
  return fallback
}

const mapPublicSessions = (items) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const id = normalizePositiveInt(item?.id)
      const sessionDate = String(item?.date ?? '').slice(0, 10)
      const timeStart = String(item?.timeStart ?? '').slice(0, 5)
      const title = String(item?.title ?? '').trim()
      const description = String(item?.description ?? '').trim()

      if (id == null || !sessionDate || !timeStart || !title) return null

      return {
        id,
        sessionDate,
        timeStart,
        title,
        description,
        isConsultation: /консультац/i.test(title),
        sortKey: `${sessionDate}T${timeStart}-${String(index).padStart(4, '0')}`,
      }
    })
    .filter(Boolean)
    .sort((first, second) => first.sortKey.localeCompare(second.sortKey))

function PatientSessionsPage({ onNavigate }) {
  const [sessions, setSessions] = useState([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [sessionsError, setSessionsError] = useState('')
  const [selectedProcedureName, setSelectedProcedureName] = useState('')
  const [publicSessions, setPublicSessions] = useState([])
  const [isLoadingPublicSessions, setIsLoadingPublicSessions] = useState(false)
  const [publicSessionsError, setPublicSessionsError] = useState('')
  const [optionalRegistrationSessionIds, setOptionalRegistrationSessionIds] = useState(() => new Set())
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false)
  const [activeRegistrationSessionId, setActiveRegistrationSessionId] = useState(null)
  const [registrationActionError, setRegistrationActionError] = useState('')
  const [registrationActionSuccess, setRegistrationActionSuccess] = useState('')

  const todayIsoDate = getTodayIsoDate()
  const currentTimeValue = getCurrentTimeValue()
  const nowDateTimeLabel = `${todayIsoDate}T${currentTimeValue}`

  useEffect(() => {
    let cancelled = false

    const loadSessionsData = async () => {
      if (!localStorage.getItem('accessToken')) {
        if (!cancelled) {
          setSessions([])
          setSessionsError('Для просмотра расписания нужно авторизоваться.')
          setOptionalRegistrationSessionIds(new Set())
          setIsLoadingSessions(false)
        }
        return
      }

      setIsLoadingSessions(true)
      setSessionsError('')

      try {
        const [scheduleResponse, registrationsResponse] = await Promise.all([
          PatientSessions.getMySchedule({
            from: todayIsoDate,
          }),
          PatientSessions.getMyRegistrations(false),
        ])

        const scheduleItems = Array.isArray(scheduleResponse?.data) ? scheduleResponse.data : []
        const registrationItems = Array.isArray(registrationsResponse?.data)
          ? registrationsResponse.data
          : []

        if (cancelled) return

        setSessions(mapSessions(scheduleItems))
        setOptionalRegistrationSessionIds(
          new Set(
            registrationItems
              .map((item) => normalizePositiveInt(item?.sessionId))
              .filter((sessionId) => sessionId != null),
          ),
        )
      } catch (error) {
        if (!cancelled) {
          setSessions([])
          setOptionalRegistrationSessionIds(new Set())
          setSessionsError(
            getPatientSessionsErrorMessage(error, 'Не удалось загрузить расписание пациента.'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSessions(false)
        }
      }
    }

    loadSessionsData()

    return () => {
      cancelled = true
    }
  }, [todayIsoDate])

  useEffect(() => {
    let cancelled = false

    const loadPublicSessions = async () => {
      setIsLoadingPublicSessions(true)
      setPublicSessionsError('')

      try {
        const response = await Home.getEvents()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setPublicSessions(mapPublicSessions(items))
      } catch (error) {
        if (!cancelled) {
          setPublicSessions([])
          setPublicSessionsError(
            getPatientSessionsErrorMessage(error, 'Не удалось загрузить доступные мероприятия.'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPublicSessions(false)
        }
      }
    }

    loadPublicSessions()

    return () => {
      cancelled = true
    }
  }, [])

  const upcomingSessions = useMemo(
    () => sessions.filter((item) => item.sessionDate >= todayIsoDate),
    [sessions, todayIsoDate],
  )

  const todaySessions = useMemo(
    () => upcomingSessions.filter((item) => item.sessionDate === todayIsoDate),
    [todayIsoDate, upcomingSessions],
  )

  const procedureOptions = useMemo(
    () =>
      [...new Set(upcomingSessions.map((item) => item.title).filter(Boolean))].sort((first, second) =>
        first.localeCompare(second, 'ru'),
      ),
    [upcomingSessions],
  )

  const filteredSessions = useMemo(() => {
    if (!selectedProcedureName) return upcomingSessions
    return upcomingSessions.filter((item) => item.title === selectedProcedureName)
  }, [selectedProcedureName, upcomingSessions])

  const upcomingPublicSessions = useMemo(
    () => publicSessions.filter((item) => `${item.sessionDate}T${item.timeStart}` >= nowDateTimeLabel),
    [nowDateTimeLabel, publicSessions],
  )

  const availableConsultations = useMemo(
    () => upcomingPublicSessions.filter((item) => item.isConsultation),
    [upcomingPublicSessions],
  )

  const availableEvents = useMemo(
    () => upcomingPublicSessions.filter((item) => !item.isConsultation),
    [upcomingPublicSessions],
  )

  const calendarFocusDate = filteredSessions[0]?.sessionDate || todayIsoDate

  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient')
  }

  const handleProcedureFilterChange = (event) => {
    setSelectedProcedureName(String(event.target.value || ''))
  }

  const handleRegisterToPublicSession = async (session) => {
    const sessionId = normalizePositiveInt(session?.id)
    if (sessionId == null || isSubmittingRegistration) return

    setIsSubmittingRegistration(true)
    setActiveRegistrationSessionId(sessionId)
    setRegistrationActionError('')
    setRegistrationActionSuccess('')

    try {
      await PatientSessions.createMyRegistration(sessionId)
      setOptionalRegistrationSessionIds((prev) => new Set([...prev, sessionId]))
      setSessions((prev) =>
        mergeSessions(prev, [
          {
            id: sessionId,
            sessionDate: session.sessionDate,
            timeStart: session.timeStart,
            procedureId: null,
            title: session.title,
          },
        ]),
      )
      setRegistrationActionSuccess(`Вы записаны: ${session.title}.`)
    } catch (error) {
      setRegistrationActionError(
        getRegistrationActionErrorMessage(error, 'Не удалось записаться на выбранный сеанс.'),
      )
    } finally {
      setIsSubmittingRegistration(false)
      setActiveRegistrationSessionId(null)
    }
  }

  const handleCancelPublicSessionRegistration = async (session) => {
    const sessionId = normalizePositiveInt(session?.id)
    if (sessionId == null || isSubmittingRegistration) return

    setIsSubmittingRegistration(true)
    setActiveRegistrationSessionId(sessionId)
    setRegistrationActionError('')
    setRegistrationActionSuccess('')

    try {
      await PatientSessions.cancelMyRegistration(sessionId)
      setOptionalRegistrationSessionIds((prev) => {
        const next = new Set(prev)
        next.delete(sessionId)
        return next
      })
      setSessions((prev) => prev.filter((item) => String(item.id) !== String(sessionId)))
      setRegistrationActionSuccess(`Запись отменена: ${session.title}.`)
    } catch (error) {
      setRegistrationActionError(
        getRegistrationActionErrorMessage(error, 'Не удалось отменить запись на выбранный сеанс.'),
      )
    } finally {
      setIsSubmittingRegistration(false)
      setActiveRegistrationSessionId(null)
    }
  }

  return (
    <section className="section dashboard" id="patient-sessions">
      <div className="diary-header">
        <SectionHeading
          title="Расписание пациента"
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=patient" onClick={handleBack}>
            В кабинет
          </a>
        </div>
      </div>
      <div className="dashboard-grid dashboard-grid--two">
        <article className="card">
          <h3>Доступные консультации</h3>
          {isLoadingPublicSessions ? (
            <p className="muted">Загружаем консультации...</p>
          ) : publicSessionsError ? (
            <p className="muted">{publicSessionsError}</p>
          ) : availableConsultations.length === 0 ? (
            <p className="muted">Свободных консультаций пока нет.</p>
          ) : (
            <ul className="list">
              {availableConsultations.map((item) => {
                const isRegistered = optionalRegistrationSessionIds.has(item.id)
                const isBusyAction =
                  isSubmittingRegistration && activeRegistrationSessionId === item.id

                return (
                  <li className="list-item" key={`patient-available-consultation-${item.id}`}>
                    <div>
                      <strong>
                        {formatDayLabel(item.sessionDate)} · {item.timeStart} · {item.title}
                      </strong>
                      <p>{item.description || 'Консультация'}</p>
                    </div>
                    {isRegistered ? (
                      <button
                        className="btn ghost small"
                        type="button"
                        disabled={isBusyAction}
                        onClick={() => handleCancelPublicSessionRegistration(item)}
                      >
                        {isBusyAction ? 'Отменяем...' : 'Отменить запись'}
                      </button>
                    ) : (
                      <button
                        className="btn primary small"
                        type="button"
                        disabled={isBusyAction}
                        onClick={() => handleRegisterToPublicSession(item)}
                      >
                        {isBusyAction ? 'Записываем...' : 'Записаться'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </article>
        <article className="card">
          <h3>Доступные мероприятия</h3>
          {isLoadingPublicSessions ? (
            <p className="muted">Загружаем мероприятия...</p>
          ) : publicSessionsError ? (
            <p className="muted">{publicSessionsError}</p>
          ) : availableEvents.length === 0 ? (
            <p className="muted">Свободных мероприятий пока нет.</p>
          ) : (
            <ul className="list">
              {availableEvents.map((item) => {
                const isRegistered = optionalRegistrationSessionIds.has(item.id)
                const isBusyAction =
                  isSubmittingRegistration && activeRegistrationSessionId === item.id

                return (
                  <li className="list-item" key={`patient-available-event-${item.id}`}>
                    <div>
                      <strong>
                        {formatDayLabel(item.sessionDate)} · {item.timeStart} · {item.title}
                      </strong>
                      <p>{item.description || 'Мероприятие санатория'}</p>
                    </div>
                    {isRegistered ? (
                      <button
                        className="btn ghost small"
                        type="button"
                        disabled={isBusyAction}
                        onClick={() => handleCancelPublicSessionRegistration(item)}
                      >
                        {isBusyAction ? 'Отменяем...' : 'Отменить запись'}
                      </button>
                    ) : (
                      <button
                        className="btn primary small"
                        type="button"
                        disabled={isBusyAction}
                        onClick={() => handleRegisterToPublicSession(item)}
                      >
                        {isBusyAction ? 'Записываем...' : 'Записаться'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          {registrationActionError ? (
            <p className="doctor-session-feedback error">{registrationActionError}</p>
          ) : null}
          {registrationActionSuccess ? (
            <p className="doctor-session-feedback success">{registrationActionSuccess}</p>
          ) : null}
        </article>
      </div>
      <div className="dashboard-grid dashboard-grid--two">
        <article className="card">
          <h3>Сегодня</h3>
          <p className="muted">{formatDayLabel(todayIsoDate)}</p>
          {isLoadingSessions ? (
            <p className="muted">Загружаем приемы...</p>
          ) : sessionsError ? (
            <p className="muted">{sessionsError}</p>
          ) : todaySessions.length === 0 ? (
            <p className="muted">На сегодня процедур нет.</p>
          ) : (
            <ul className="list">
              {todaySessions.map((item) => (
                <li className="list-item" key={`patient-today-session-${item.id}`}>
                  <div>
                    <strong>
                      {item.timeStart} · {item.title}
                    </strong>
                    <p>{formatSessionTimeLabel(item)}</p>
                  </div>
                  <span className="status">Сегодня</span>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h3>Фильтр календаря</h3>
          <div className="field">
            <label htmlFor="patient-session-procedure-filter">Процедура</label>
            <select
              id="patient-session-procedure-filter"
              value={selectedProcedureName}
              onChange={handleProcedureFilterChange}
              disabled={isLoadingSessions || procedureOptions.length === 0}
            >
              <option value="">Все процедуры</option>
              {procedureOptions.map((name) => (
                <option key={`patient-procedure-filter-${name}`} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <span className="metric-label">Всего впереди</span>
              <span className="metric-value">{String(upcomingSessions.length)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">После фильтра</span>
              <span className="metric-value">{String(filteredSessions.length)}</span>
            </div>
          </div>
        </article>
      </div>
      {isLoadingSessions ? null : (
        <ScheduleCalendar
          key={`patient-sessions-calendar-${selectedProcedureName || 'all'}`}
          sessions={filteredSessions}
          todayIsoDate={todayIsoDate}
          requestedDate={calendarFocusDate}
          title="Календарь будущих процедур"
          description="Выберите дату, чтобы увидеть записи на этот день."
          emptySessionsText="На выбранную дату записей нет."
          statusLabel="Запланировано"
          getSessionMeta={(item) =>
            item.procedureId != null
              ? `${formatSessionTimeLabel(item)} · Процедура #${item.procedureId}`
              : formatSessionTimeLabel(item)
          }
        />
      )}
    </section>
  )
}

export default PatientSessionsPage
