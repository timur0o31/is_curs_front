import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import SectionHeading from '../components/SectionHeading'
import StayExtensionForm from '../components/forms/StayExtensionForm'
import StayRequestForm from '../components/forms/StayRequestForm'
import PatientStay from '../services/PatientStay'
import { formatRuDate, isOnOrAfterToday, parseDateValue } from '../utils/dateTime'

const STATUS_VIEW = {
  PENDING: { label: 'Ожидает', tone: 'warn' },
  APPROVED: { label: 'Согласовано', tone: 'success' },
  REJECTED: { label: 'Отклонено', tone: 'danger' },
}

const REQUEST_HISTORY_CACHE_PREFIX = 'patient_stay_requests_cache'

const getRequestHistoryCacheKey = () => {
  try {
    const rawUser = localStorage.getItem('user')
    const parsedUser = rawUser ? JSON.parse(rawUser) : null
    const userEmail = parsedUser?.email ? String(parsedUser.email).trim().toLowerCase() : 'anonymous'
    return `${REQUEST_HISTORY_CACHE_PREFIX}:${userEmail}`
  } catch {
    return `${REQUEST_HISTORY_CACHE_PREFIX}:anonymous`
  }
}

const readCachedRequestHistory = (cacheKey) => {
  try {
    const raw = localStorage.getItem(cacheKey)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeCachedRequestHistory = (cacheKey, requests) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(requests))
  } catch {
    return
  }
}

const formatDate = (value) =>
  formatRuDate(
    value,
    {
      day: '2-digit',
      month: '2-digit',
    },
    { keepRawOnInvalid: true },
  )

const formatPeriod = (admissionDate, dischargeDate) => {
  if (!admissionDate && !dischargeDate) {
    return 'Период не указан'
  }

  if (!admissionDate) {
    return `до ${formatDate(dischargeDate)}`
  }

  if (!dischargeDate) {
    return `с ${formatDate(admissionDate)}`
  }

  return `${formatDate(admissionDate)} – ${formatDate(dischargeDate)}`
}

const mapStayRequestToView = (request) => {
  const statusData = STATUS_VIEW[request?.status] || { label: request?.status || 'Неизвестно', tone: '' }
  const requestType = request?.type === 'EXPANSION' ? 'Продление проживания' : 'Новая заявка'
  const createdAt = parseDateValue(request?.createdAt)
  const sortTimestamp = createdAt ? createdAt.getTime() : Date.now()

  return {
    id: request?.id ? `REQ-${request.id}` : `REQ-${sortTimestamp}`,
    requestId: request?.id ?? null,
    type: requestType,
    period: formatPeriod(request?.admissionDate, request?.dischargeDate),
    submitted: formatDate(request?.createdAt || request?.admissionDate),
    status: statusData.label,
    tone: statusData.tone,
    rawStatus: request?.status,
    rawType: request?.type,
    rawAdmissionDate: request?.admissionDate,
    rawDischargeDate: request?.dischargeDate,
    sortTimestamp,
  }
}

function PatientStayRequestsPage({ onNavigate }) {
  const requestHistoryCacheKey = getRequestHistoryCacheKey()
  const [requestHistory, setRequestHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false)
  const [isSubmittingExpansion, setIsSubmittingExpansion] = useState(false)

  const activeCheckIn = useMemo(() => {
    const activeItems = requestHistory.filter(
      (item) =>
        item.rawStatus === 'APPROVED' &&
        item.rawType === 'CHECK_IN' &&
        isOnOrAfterToday(item.rawDischargeDate),
    )

    if (activeItems.length === 0) return null

    return activeItems.sort((a, b) => {
      const first = new Date(a.rawDischargeDate || 0).getTime()
      const second = new Date(b.rawDischargeDate || 0).getTime()
      return second - first
    })[0]
  }, [requestHistory])

  const hasActiveStay = Boolean(activeCheckIn)

  const summaryMetrics = useMemo(() => {
    const pendingCount = requestHistory.filter((item) => item.rawStatus === 'PENDING').length

    return [
      { label: 'Текущая бронь', value: activeCheckIn ? activeCheckIn.period : 'Нет активной брони' },
      { label: 'Комната', value: activeCheckIn ? 'Назначена администратором' : 'Еще не назначена' },
      { label: 'Статус', value: activeCheckIn ? 'Активно' : 'Нет активной заявки' },
      { label: 'Заявок в обработке', value: String(pendingCount) },
    ]
  }, [activeCheckIn, requestHistory])

  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient')
  }

  const hasAccessToken = () => Boolean(localStorage.getItem('accessToken'))

  const handleError = useCallback((error, fallbackMessage) => {
    const status = error?.response?.status

    if (!status) {
      toast.error('Ошибка: Проверь подключение к серверу')
      return
    }

    const data = error.response.data

    if (status === 401) {
      toast.error('Сессия истекла. Войдите снова.')
      if (onNavigate) {
        onNavigate('login')
      }
      return
    }

    if (status === 403) {
      toast.error('Недостаточно прав для отправки заявки. Проверьте, что вход выполнен как пациент.')
      return
    }

    if (status === 404) {
      toast.error('Endpoint заявок не найден на сервере.')
      return
    }

    if (typeof data === 'string' && data.trim()) {
      toast.error(`Ошибка: ${data}`)
      return
    }

    if (data?.message) {
      toast.error(`Ошибка: ${data.message}`)
      return
    }

    if (status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже.')
      return
    }

    toast.error(`Ошибка (${status}): ${fallbackMessage}`)
  }, [onNavigate])

  const loadRequestHistory = useCallback(async () => {
    if (!hasAccessToken()) {
      setRequestHistory([])
      setIsLoadingHistory(false)
      return
    }
    const cached = readCachedRequestHistory(requestHistoryCacheKey)
    if (cached.length > 0) {
      setRequestHistory(cached)
    }
    setIsLoadingHistory(true)

    try {
      const response = await PatientStay.getMyStayRequests()

      if (Array.isArray(response.data)) {
        const mapped = response.data
          .map(mapStayRequestToView)
          .sort((a, b) => b.sortTimestamp - a.sortTimestamp)

        setRequestHistory(mapped)
        writeCachedRequestHistory(requestHistoryCacheKey, mapped)
      }
    } catch (error) {
      handleError(error, 'Не удалось загрузить заявки')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [handleError, requestHistoryCacheKey])
  useEffect(() => {
    loadRequestHistory()
  }, [loadRequestHistory])

  const handleCreateStayRequest = async (formData) => {
    if (!hasAccessToken()) {
      toast.error('Нет токена авторизации. Войдите в систему.')
      if (onNavigate) {
        onNavigate('login')
      }
      return false
    }
    setIsSubmittingCheckIn(true)

    try {
      const payload = {
        admissionDate: formData.checkIn,
        dischargeDate: formData.checkOut,
      }
      const response = await PatientStay.createCheckInRequest(payload)
      const created = response.data
      if (created && typeof created === 'object') {
        const createdItem = mapStayRequestToView(created)
        setRequestHistory((prev) => {
          const next = [createdItem, ...prev.filter((item) => item.requestId !== createdItem.requestId)].sort(
            (a, b) => b.sortTimestamp - a.sortTimestamp,
          )
          writeCachedRequestHistory(requestHistoryCacheKey, next)
          return next
        })
      } else {
        await loadRequestHistory()
      }

      toast.success('Заявка на проживание отправлена')
      return true
    } catch (error) {
      handleError(error, 'Не удалось отправить заявку на проживание')
      return false
    } finally {
      setIsSubmittingCheckIn(false)
    }
  }

  const handleCreateExpansionRequest = async (formData) => {
    if (!hasAccessToken()) {
      toast.error('Нет токена авторизации. Войдите в систему.')
      if (onNavigate) {
        onNavigate('login')
      }
      return false
    }

    setIsSubmittingExpansion(true)

    try {
      const payload = {
        admissionDate: formData.currentCheckOut || formData.newCheckOut,
        dischargeDate: formData.newCheckOut,
      }

      const response = await PatientStay.createExpansionRequest(payload)
      const created = response.data

      if (created && typeof created === 'object') {
        const createdItem = mapStayRequestToView(created)
        setRequestHistory((prev) => {
          const next = [createdItem, ...prev.filter((item) => item.requestId !== createdItem.requestId)].sort(
            (a, b) => b.sortTimestamp - a.sortTimestamp,
          )
          writeCachedRequestHistory(requestHistoryCacheKey, next)
          return next
        })
      } else {
        await loadRequestHistory()
      }

      toast.success('Запрос на продление отправлен')
      return true
    } catch (error) {
      handleError(error, 'Не удалось отправить запрос на продление')
      return false
    } finally {
      setIsSubmittingExpansion(false)
    }
  }

  return (
    <section className="section dashboard" id="patient-stay-requests">
      <div className="diary-header">
        <SectionHeading
          title="Проживание"
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=patient" onClick={handleBack}>
            В кабинет
          </a>
        </div>
      </div>
      <div className="summary-grid">
        {summaryMetrics.map((item) => (
          <div className="card summary-card" key={item.label}>
            <span className="metric-label">{item.label}</span>
            <span className="metric-value">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="dashboard-grid dashboard-grid--two">
        <div className="dashboard-stack">
          {hasActiveStay ? (
            <>
              <article className="card">
                <h3>Продление проживания</h3>
                <p className="muted">
                  Активное проживание до {formatDate(activeCheckIn?.rawDischargeDate)}.
                  Новая заявка на заселение недоступна, можно только продлить текущую.
                </p>
              </article>
              <StayExtensionForm
                onSubmit={handleCreateExpansionRequest}
                isSubmitting={isSubmittingExpansion}
                initialCurrentCheckOut={activeCheckIn?.rawDischargeDate || ''}
              />
            </>
          ) : (
            <>
              <article className="card">
                <h3>Новая заявка</h3>
                <p className="muted">
                  Активного проживания нет. Отправьте заявку на заселение, после одобрения станет доступно продление.
                </p>
              </article>
              <StayRequestForm
                onSubmit={handleCreateStayRequest}
                isSubmitting={isSubmittingCheckIn}
              />
            </>
          )}
        </div>
        <div className="dashboard-stack">
          <article className="card">
            <h3>Мои заявки</h3>
            {isLoadingHistory && requestHistory.length === 0 ? (
              <p className="muted">Загрузка заявок...</p>
            ) : requestHistory.length === 0 ? (
              <p className="muted">Пока заявок нет. Создайте первую заявку.</p>
            ) : (
              <ul className="list">
                {requestHistory.map((request) => (
                  <li className="list-item" key={request.id}>
                    <div>
                      <strong>{request.type}</strong>
                      <p>
                        {request.period} · Подано {request.submitted}
                      </p>
                    </div>
                    <span
                      className={`status${request.tone ? ` status--${request.tone}` : ''}`}
                    >
                      {request.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}

export default PatientStayRequestsPage
