import { useEffect, useState } from 'react'
import SectionHeading from '../components/SectionHeading'
import DoctorDiary from '../services/DoctorDiary'
import {
  formatRuDate,
  getTodayIsoDate,
  normalizeDateValue,
  normalizeTimeValue,
} from '../utils/dateTime'

const formatDayLabel = (value) =>
  formatRuDate(value, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

const formatDateLabel = (value) =>
  formatRuDate(value, {
    day: '2-digit',
    month: '2-digit',
  })

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
        title: procedureName || (procedureId != null ? `Процедура #${procedureId}` : 'Консультация'),
      }
    })
    .filter(Boolean)
    .sort((first, second) => first.timeStart.localeCompare(second.timeStart))

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для работы с расписанием.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint на бэкенде.'
  return fallback
}

function DoctorDashboardPage({ onNavigate }) {
  const role = String(localStorage.getItem('role') || '').toUpperCase()
  const accessToken = localStorage.getItem('accessToken')
  const shouldCheckDoctorStatus = role === 'DOCTOR' && Boolean(accessToken)

  const [isCheckingDoctorStatus, setIsCheckingDoctorStatus] = useState(shouldCheckDoctorStatus)
  const [isApprovedDoctor, setIsApprovedDoctor] = useState(true)
  const [observedPatients, setObservedPatients] = useState([])
  const [isObservedPatientsLoading, setIsObservedPatientsLoading] = useState(false)
  const [todaySessions, setTodaySessions] = useState([])
  const [isTodaySessionsLoading, setIsTodaySessionsLoading] = useState(false)
  const [todaySessionsError, setTodaySessionsError] = useState('')

  const todayIsoDate = getTodayIsoDate()

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
    const loadTodaySessions = async () => {
      if (!shouldCheckDoctorStatus || isCheckingDoctorStatus || !isApprovedDoctor) {
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
        const response = await DoctorDiary.getMySessions()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        const mappedSessions = mapSessions(items)
        setTodaySessions(mappedSessions.filter((item) => item.sessionDate === todayIsoDate))
      } catch (error) {
        if (!cancelled) {
          setTodaySessions([])
          setTodaySessionsError(getErrorMessage(error, 'Не удалось загрузить приемы на сегодня.'))
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
  }, [isApprovedDoctor, isCheckingDoctorStatus, shouldCheckDoctorStatus, todayIsoDate])

  const showPendingApproval = shouldCheckDoctorStatus && !isCheckingDoctorStatus && !isApprovedDoctor

  const handleNavigate = (event, page) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(page)
  }

  if (isCheckingDoctorStatus) {
    return (
      <section className="section dashboard" id="doctor-dashboard">
        <SectionHeading
          eyebrow="Кабинет врача"
          title="Проверяем доступ к кабинету"
          description="Идет проверка статуса учетной записи врача."
        />
      </section>
    )
  }

  if (showPendingApproval) {
    return (
      <section className="section dashboard" id="doctor-dashboard">
        <SectionHeading
          eyebrow="Кабинет врача"
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
    <section className="section dashboard" id="doctor-dashboard">
      <SectionHeading
        eyebrow="Кабинет врача"
        title="Рабочий обзор врача"
        description="Здесь быстрый доступ к расписанию, пациентам под наблюдением и дневникам."
      />
      <div className="dashboard-grid dashboard-grid--three">
        <article className="card">
          <h3>Приемы сегодня</h3>
          <p className="muted">Дата: {formatDayLabel(todayIsoDate)}</p>
          {isTodaySessionsLoading ? (
            <p className="muted">Загружаем приемы на сегодня...</p>
          ) : todaySessionsError ? (
            <p className="muted">{todaySessionsError}</p>
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
            <a
              className="btn primary small"
              href="?page=doctor-sessions"
              onClick={(event) => handleNavigate(event, 'doctor-sessions')}
            >
              Открыть расписание
            </a>
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
          <h3>Дневники пациентов</h3>
          <p className="muted">Проверяйте новые записи и оставляйте рекомендации по лечению.</p>
          <div className="action-row">
            <a
              className="btn ghost small"
              href="?page=doctor-diary"
              onClick={(event) => handleNavigate(event, 'doctor-diary')}
            >
              Открыть дневники
            </a>
          </div>
        </article>
      </div>
    </section>
  )
}

export default DoctorDashboardPage
