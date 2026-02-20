import { useEffect, useMemo, useRef, useState } from 'react'
import ScheduleCalendar from '../components/calendar/ScheduleCalendar'
import SectionHeading from '../components/SectionHeading'
import CreateSessionCard from '../components/doctor-sessions/CreateSessionCard'
import ObservedPatientsCard from '../components/doctor-sessions/ObservedPatientsCard'
import ScheduleSummaryCard from '../components/doctor-sessions/ScheduleSummaryCard'
import TodaySessionsCard from '../components/doctor-sessions/TodaySessionsCard'
import DoctorDiary from '../services/DoctorDiary'
import {
  formatDayLabel,
  formatSessionTimeLabel,
  getCurrentTimeValue,
  getDefaultTimeValue,
  getErrorMessage,
  getTodayIsoDate,
  getTomorrowIsoDate,
  mapActivePatients,
  mapProcedures,
  mapSessions,
  mergeSessions,
  normalizePositiveInt,
} from './doctorSessions/utils'

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
  const [procedures, setProcedures] = useState([])
  const [isProceduresLoading, setIsProceduresLoading] = useState(false)
  const [proceduresError, setProceduresError] = useState('')

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [calendarFocusDate, setCalendarFocusDate] = useState('')
  const [selectedRegistrationPatientId, setSelectedRegistrationPatientId] = useState('')
  const [selectedRegistrationProcedureId, setSelectedRegistrationProcedureId] = useState('')
  const [selectedRegistrationSessionId, setSelectedRegistrationSessionId] = useState('')
  const [registrationProcedureSessions, setRegistrationProcedureSessions] = useState([])
  const [isProcedureSessionsLoading, setIsProcedureSessionsLoading] = useState(false)
  const [procedureSessionsError, setProcedureSessionsError] = useState('')
  const procedureSessionsRequestIdRef = useRef(0)
  const [isRegisteringPatient, setIsRegisteringPatient] = useState(false)
  const [registerPatientError, setRegisterPatientError] = useState('')
  const [registerPatientSuccess, setRegisterPatientSuccess] = useState('')
  const [patientScheduleSessions, setPatientScheduleSessions] = useState([])
  const [isPatientScheduleLoading, setIsPatientScheduleLoading] = useState(false)
  const [patientScheduleError, setPatientScheduleError] = useState('')
  const patientScheduleRequestIdRef = useRef(0)

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

  const nowDateTimeLabel = `${todayIsoDate}T${currentTimeValue}`

  const availableRegistrationSessions = useMemo(
    () => {
      if (!selectedRegistrationProcedureId) return []
      return registrationProcedureSessions.filter(
        (item) => `${item.sessionDate}T${item.timeStart}` >= nowDateTimeLabel,
      )
    },
    [nowDateTimeLabel, registrationProcedureSessions, selectedRegistrationProcedureId],
  )

  const selectedRegistrationPatient = useMemo(
    () => observedPatients.find((item) => String(item.id) === String(selectedRegistrationPatientId)) || null,
    [observedPatients, selectedRegistrationPatientId],
  )

  const effectiveRegistrationSessionId = useMemo(() => {
    const isSelectedPresent = availableRegistrationSessions.some(
      (item) => String(item.id) === String(selectedRegistrationSessionId),
    )

    if (isSelectedPresent) return String(selectedRegistrationSessionId)

    return availableRegistrationSessions[0] ? String(availableRegistrationSessions[0].id) : ''
  }, [availableRegistrationSessions, selectedRegistrationSessionId])

  const selectedRegistrationSession = useMemo(
    () =>
      availableRegistrationSessions.find(
        (item) => String(item.id) === String(effectiveRegistrationSessionId),
      ) || null,
    [availableRegistrationSessions, effectiveRegistrationSessionId],
  )
  const selectedRegistrationSessionDate = selectedRegistrationSession?.sessionDate || ''

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

  useEffect(() => {
    let cancelled = false

    const loadProcedures = async () => {
      if (!shouldCheckDoctorStatus || isCheckingDoctorStatus || !isApprovedDoctor) {
        if (!cancelled) {
          setProcedures([])
          setProceduresError('')
          setIsProceduresLoading(false)
        }
        return
      }

      setIsProceduresLoading(true)
      setProceduresError('')

      try {
        const response = await DoctorDiary.getProcedures()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setProcedures(mapProcedures(items))
      } catch (error) {
        if (!cancelled) {
          setProcedures([])
          setProceduresError(getErrorMessage(error, 'Не удалось загрузить список процедур.'))
        }
      } finally {
        if (!cancelled) {
          setIsProceduresLoading(false)
        }
      }
    }

    loadProcedures()

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

  useEffect(() => {
    if (!selectedRegistrationPatient) {
      setPatientScheduleSessions([])
      setPatientScheduleError('')
      setIsPatientScheduleLoading(false)
      return
    }

    if (!selectedRegistrationSessionDate) {
      setPatientScheduleSessions([])
      setPatientScheduleError('')
      setIsPatientScheduleLoading(false)
      return
    }

    const normalizedPatientId = normalizePositiveInt(selectedRegistrationPatient?.patientId)

    if (normalizedPatientId == null) {
      setPatientScheduleSessions([])
      setPatientScheduleError(
        'Не удалось загрузить сессии на выбранный день: в /api/doctor/active-patients не хватает patientId.',
      )
      setIsPatientScheduleLoading(false)
      return
    }

    const requestId = patientScheduleRequestIdRef.current + 1
    patientScheduleRequestIdRef.current = requestId
    setIsPatientScheduleLoading(true)
    setPatientScheduleError('')

    const loadPatientDaySessions = async () => {
      try {
        const response = await DoctorDiary.getPatientSessions({
          patientId: normalizedPatientId,
          date: selectedRegistrationSessionDate,
        })
        const items = Array.isArray(response?.data) ? response.data : []

        if (requestId !== patientScheduleRequestIdRef.current) return

        const mapped = mapSessions(items).filter(
          (item) => item.sessionDate === selectedRegistrationSessionDate,
        )

        setPatientScheduleSessions(mapped)
      } catch (error) {
        if (requestId !== patientScheduleRequestIdRef.current) return

        setPatientScheduleSessions([])
        setPatientScheduleError(
          getErrorMessage(error, 'Не удалось загрузить сессии пациента на выбранный день.'),
        )
      } finally {
        if (requestId === patientScheduleRequestIdRef.current) {
          setIsPatientScheduleLoading(false)
        }
      }
    }

    loadPatientDaySessions()
  }, [selectedRegistrationPatient, selectedRegistrationSessionDate])

  const handleStartPatientRegistration = (patient) => {
    const normalizedStayId = normalizePositiveInt(patient?.stayId)
    const normalizedPatientId = normalizePositiveInt(patient?.patientId)

    procedureSessionsRequestIdRef.current += 1
    patientScheduleRequestIdRef.current += 1
    setSelectedRegistrationPatientId(String(patient.id))
    setSelectedRegistrationProcedureId('')
    setSelectedRegistrationSessionId('')
    setRegistrationProcedureSessions([])
    setIsProcedureSessionsLoading(false)
    setProcedureSessionsError('')
    setPatientScheduleSessions([])
    setPatientScheduleError('')
    setRegisterPatientError('')
    setRegisterPatientSuccess('')

    if (normalizedStayId == null && normalizedPatientId == null) {
      setPatientScheduleError(
        'Не удалось подготовить запись: в /api/doctor/active-patients не хватает stayId/patientId.',
      )
      setIsPatientScheduleLoading(false)
    }
  }

  const handleRegistrationSessionChange = (event) => {
    setSelectedRegistrationSessionId(event.target.value)
  }

  const handleRegistrationProcedureChange = async (event) => {
    const procedureIdValue = String(event.target.value || '').trim()
    setSelectedRegistrationProcedureId(procedureIdValue)
    setSelectedRegistrationSessionId('')
    setRegistrationProcedureSessions([])
    setProcedureSessionsError('')
    setPatientScheduleSessions([])
    setPatientScheduleError('')
    setIsPatientScheduleLoading(false)
    setRegisterPatientError('')
    setRegisterPatientSuccess('')
    if (!procedureIdValue) {
      setIsProcedureSessionsLoading(false)
      return
    }

    const normalizedProcedureId = normalizePositiveInt(procedureIdValue)
    if (normalizedProcedureId == null) {
      setProcedureSessionsError('Некорректный идентификатор процедуры.')
      setIsProcedureSessionsLoading(false)
      return
    }

    const requestId = procedureSessionsRequestIdRef.current + 1
    procedureSessionsRequestIdRef.current = requestId
    setIsProcedureSessionsLoading(true)

    try {
      const response = await DoctorDiary.getSessionsByProcedureId(normalizedProcedureId)
      const items = Array.isArray(response?.data) ? response.data : []

      if (requestId !== procedureSessionsRequestIdRef.current) return

      setRegistrationProcedureSessions(mapSessions(items))
    } catch (error) {
      if (requestId !== procedureSessionsRequestIdRef.current) return

      setRegistrationProcedureSessions([])
      setProcedureSessionsError(
        getErrorMessage(error, 'Не удалось загрузить сессии по выбранной процедуре.'),
      )
    } finally {
      if (requestId === procedureSessionsRequestIdRef.current) {
        setIsProcedureSessionsLoading(false)
      }
    }
  }

  const handleCloseRegistrationForm = () => {
    procedureSessionsRequestIdRef.current += 1
    patientScheduleRequestIdRef.current += 1
    setSelectedRegistrationPatientId('')
    setSelectedRegistrationProcedureId('')
    setSelectedRegistrationSessionId('')
    setRegistrationProcedureSessions([])
    setProcedureSessionsError('')
    setIsProcedureSessionsLoading(false)
    setRegisterPatientError('')
    setRegisterPatientSuccess('')
    setPatientScheduleSessions([])
    setPatientScheduleError('')
    setIsPatientScheduleLoading(false)
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

  const handleRegisterPatient = async (event) => {
    event.preventDefault()

    if (!selectedRegistrationPatient) {
      setRegisterPatientError('Выберите пациента для записи.')
      setRegisterPatientSuccess('')
      return
    }

    const stayId = normalizePositiveInt(selectedRegistrationPatient.stayId)

    if (stayId == null) {
      setRegisterPatientError('Не найден stayId пациента. Добавьте stayId в ответ /api/doctor/active-patients.',)
      setRegisterPatientSuccess('')
      return
    }

    if (!selectedRegistrationProcedureId) {
      setRegisterPatientError('Сначала выберите процедуру, затем сессию.')
      setRegisterPatientSuccess('')
      return
    }

    const sessionId = normalizePositiveInt(effectiveRegistrationSessionId)
    if (sessionId == null) {
      setRegisterPatientError('Выберите доступную сессию.')
      setRegisterPatientSuccess('')
      return
    }

    if (!selectedRegistrationSession) {
      setRegisterPatientError('Не удалось определить выбранную сессию.')
      setRegisterPatientSuccess('')
      return
    }

    setIsRegisteringPatient(true)
    setRegisterPatientError('')
    setRegisterPatientSuccess('')

    try {
      const payload = {
        sessionId,
        isNecessary: true,
        stayId,
      }

      await DoctorDiary.createMandatoryRegistration(payload)

      setPatientScheduleSessions((prev) => mergeSessions(prev, [selectedRegistrationSession]))

      setRegisterPatientSuccess(
        `Пациент ${selectedRegistrationPatient.name} записан на выбранную сессию.`,
      )
    } catch (error) {
      setRegisterPatientError(getErrorMessage(error, 'Не удалось записать пациента на сессию.'))
    } finally {
      setIsRegisteringPatient(false)
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
        title="Расписание врача"
      />
      <div className="action-row">
        <a className="btn ghost" href="?page=doctor" onClick={handleBackToDashboard}>
          К кабинету врача
        </a>
      </div>
      <div className="dashboard-grid dashboard-grid--three">
        <TodaySessionsCard
          todayIsoDate={todayIsoDate}
          formatDayLabel={formatDayLabel}
          isSessionsLoading={isSessionsLoading}
          sessionsError={sessionsError}
          todaySessions={todaySessions}
          isCalendarOpen={isCalendarOpen}
          onToggleCalendar={toggleCalendar}
        />
        <ObservedPatientsCard
          observedPatients={observedPatients}
          isObservedPatientsLoading={isObservedPatientsLoading}
          onStartPatientRegistration={handleStartPatientRegistration}
          selectedRegistrationPatient={selectedRegistrationPatient}
          onRegisterPatient={handleRegisterPatient}
          selectedRegistrationProcedureId={selectedRegistrationProcedureId}
          onRegistrationProcedureChange={handleRegistrationProcedureChange}
          effectiveRegistrationSessionId={effectiveRegistrationSessionId}
          onRegistrationSessionChange={handleRegistrationSessionChange}
          procedures={procedures}
          isProceduresLoading={isProceduresLoading}
          isRegisteringPatient={isRegisteringPatient}
          availableRegistrationSessions={availableRegistrationSessions}
          isProcedureSessionsLoading={isProcedureSessionsLoading}
          procedureSessionsError={procedureSessionsError}
          formatDayLabel={formatDayLabel}
          selectedRegistrationSession={selectedRegistrationSession}
          patientScheduleSessions={patientScheduleSessions}
          patientScheduleError={patientScheduleError}
          isPatientScheduleLoading={isPatientScheduleLoading}
          formatSessionTimeLabel={formatSessionTimeLabel}
          registerPatientError={registerPatientError}
          registerPatientSuccess={registerPatientSuccess}
          onCloseRegistrationForm={handleCloseRegistrationForm}
        />
        <ScheduleSummaryCard
          todayCount={todaySessions.length}
          futureCount={futureSessions.length}
          monthlyFutureCount={monthlyFutureCount}
          totalCount={sessions.length}
        />
        <CreateSessionCard
          sessionForm={sessionForm}
          onSessionFieldChange={handleSessionFieldChange}
          onCreateSession={handleCreateSession}
          isCreatingSession={isCreatingSession}
          todayIsoDate={todayIsoDate}
          procedures={procedures}
          isProceduresLoading={isProceduresLoading}
          proceduresError={proceduresError}
          createSessionError={createSessionError}
          createSessionSuccess={createSessionSuccess}
        />
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
