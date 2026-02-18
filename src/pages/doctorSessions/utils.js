import {
  formatRuDate,
  getCurrentTimeValue as getCurrentTimeValueShared,
  getRoundedCurrentTimeValue,
  getTodayIsoDate as getTodayIsoDateShared,
  getTomorrowIsoDate as getTomorrowIsoDateShared,
  normalizeDateValue,
  normalizeTimeValue,
} from '../../utils/dateTime'

export const getTodayIsoDate = () => getTodayIsoDateShared()

export const getTomorrowIsoDate = () => getTomorrowIsoDateShared()

export const getDefaultTimeValue = () => getRoundedCurrentTimeValue(10)

export const getCurrentTimeValue = () => getCurrentTimeValueShared()

const extractIsoDate = (...values) => {
  for (const value of values) {
    const normalizedDate = normalizeDateValue(value)
    if (normalizedDate) return normalizedDate
  }

  return ''
}

export const formatDayLabel = (value) =>
  formatRuDate(value, {
    day: '2-digit',
    month: 'long',
  })

const formatDateLabel = (value) =>
  formatRuDate(value, {
    day: '2-digit',
    month: '2-digit',
  })

export const normalizePositiveInt = (value) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null
  return Math.trunc(numericValue)
}

const normalizeDurationMinutes = (value) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null
  return Math.trunc(numericValue)
}

const timeValueToMinutes = (value) => {
  if (typeof value !== 'string') return null

  const match = value.match(/^(\d{2}):(\d{2})/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  return hours * 60 + minutes
}

const getSessionInterval = (item) => {
  const start = timeValueToMinutes(item?.timeStart)
  if (start == null) return null

  const explicitEnd = timeValueToMinutes(item?.timeEnd)
  const durationMinutes = normalizeDurationMinutes(item?.durationMinutes)

  let end = explicitEnd
  if (end == null && durationMinutes != null) {
    end = start + durationMinutes
  }

  if (end == null || end <= start) {
    end = start + 30
  }

  return { start, end }
}

export const formatSessionTimeLabel = (item) => {
  if (!item?.timeStart) return '—'

  const explicitEnd = normalizeTimeValue(item?.timeEnd)
  if (explicitEnd) return `${item.timeStart}–${explicitEnd}`

  const interval = getSessionInterval(item)
  if (!interval) return item.timeStart

  const endHours = String(Math.floor((interval.end % (24 * 60)) / 60)).padStart(2, '0')
  const endMinutes = String(interval.end % 60).padStart(2, '0')

  return `${item.timeStart}–${endHours}:${endMinutes}`
}

const looksLikeStayEntity = (item) =>
  item?.checkInDate != null ||
  item?.arrivalDate != null ||
  item?.dateIn != null ||
  item?.checkOutDate != null ||
  item?.dischargeDate != null ||
  item?.endDate != null ||
  item?.stay != null ||
  item?.activeStay != null

const getPatientIdFromActivePatient = (item) => {
  const explicitPatientId = normalizePositiveInt(
    item?.patientId ??
      item?.patient?.id ??
      item?.patient?.patientId ??
      item?.patientInfo?.id ??
      item?.person?.id ??
      item?.residentId ??
      null,
  )

  if (explicitPatientId != null) return explicitPatientId
  if (looksLikeStayEntity(item)) return null

  return normalizePositiveInt(item?.id ?? null)
}

const extractProcedureNames = (value) => {
  if (!Array.isArray(value)) return []

  const names = value
    .map((item) => {
      if (typeof item === 'string') return item

      if (!item || typeof item !== 'object') return ''

      return (
        item?.name ??
        item?.title ??
        item?.procedureName ??
        item?.procedureTitle ??
        item?.procedure?.name ??
        item?.session?.procedureName ??
        item?.session?.procedureTitle ??
        item?.session?.procedure?.name ??
        ''
      )
    })
    .map((item) => String(item || '').trim())
    .filter(Boolean)

  return [...new Set(names)].sort((first, second) => first.localeCompare(second, 'ru'))
}

const getStayIdFromActivePatient = (item) => {
  const directStayId = normalizePositiveInt(
    item?.stayId ??
      item?.stay?.id ??
      item?.stay?.stayId ??
      item?.activeStayId ??
      item?.currentStayId ??
      item?.residentStayId ??
      null,
  )

  if (directStayId != null) return directStayId

  if (!looksLikeStayEntity(item)) return null

  return normalizePositiveInt(item?.id)
}

const getStayDateRangeFromActivePatient = (item) => ({
  stayStartDate: extractIsoDate(
    item?.stayStartDate,
    item?.checkInDate,
    item?.arrivalDate,
    item?.dateIn,
    item?.startDate,
    item?.stay?.stayStartDate,
    item?.stay?.checkInDate,
    item?.stay?.arrivalDate,
    item?.stay?.dateIn,
    item?.stay?.startDate,
    item?.activeStay?.stayStartDate,
    item?.activeStay?.checkInDate,
    item?.activeStay?.arrivalDate,
    item?.activeStay?.dateIn,
    item?.activeStay?.startDate,
    item?.stayRequest?.checkInDate,
    item?.stayRequest?.arrivalDate,
    item?.stayRequest?.dateIn,
    item?.stayRequest?.startDate,
  ),
  stayEndDate: extractIsoDate(
    item?.stayEndDate,
    item?.checkOutDate,
    item?.dischargeDate,
    item?.dateOut,
    item?.endDate,
    item?.stay?.stayEndDate,
    item?.stay?.checkOutDate,
    item?.stay?.dischargeDate,
    item?.stay?.dateOut,
    item?.stay?.endDate,
    item?.activeStay?.stayEndDate,
    item?.activeStay?.checkOutDate,
    item?.activeStay?.dischargeDate,
    item?.activeStay?.dateOut,
    item?.activeStay?.endDate,
    item?.stayRequest?.checkOutDate,
    item?.stayRequest?.dischargeDate,
    item?.stayRequest?.dateOut,
    item?.stayRequest?.endDate,
  ),
})

const getPatientProceduresFromActivePatient = (item) =>
  extractProcedureNames(
    item?.procedures ??
      item?.patientProcedures ??
      item?.registeredProcedures ??
      item?.sessionProcedures ??
      item?.patient?.procedures ??
      item?.sessions ??
      [],
  )

export const mapActivePatients = (items) =>
  items
    .filter((item) => item != null)
    .map((item, index) => {
      if (typeof item === 'string') {
        const name = item.trim() || `Пациент #${index + 1}`

        return {
          id: `name-${name}-${index}`,
          stayId: null,
          patientId: null,
          name,
          status: 'Активное проживание',
          stayStartDate: '',
          stayEndDate: '',
          procedureNames: [],
        }
      }

      const patientName = String(item?.patientName ?? item?.name ?? item?.patient?.name ?? '').trim()
      const patientId = getPatientIdFromActivePatient(item)
      const name = patientName || (patientId != null ? `Пациент #${patientId}` : 'Пациент')
      const stayId = getStayIdFromActivePatient(item)
      const { stayStartDate, stayEndDate } = getStayDateRangeFromActivePatient(item)
      const dischargeLabel = formatDateLabel(stayEndDate)
      const procedureNames = getPatientProceduresFromActivePatient(item)

      return {
        id: item?.id ?? patientId ?? stayId ?? `${name}-${index}`,
        stayId,
        patientId,
        name,
        status: dischargeLabel === '—' ? 'Активное проживание' : `Активно до ${dischargeLabel}`,
        stayStartDate,
        stayEndDate,
        procedureNames,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name, 'ru'))

export const mapSessions = (items) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const session = item?.session && typeof item.session === 'object' ? item.session : item
      const sessionDate = normalizeDateValue(
        session?.sessionDate ?? session?.date ?? item?.sessionDate ?? item?.date ?? null,
      )
      const timeStart = normalizeTimeValue(
        session?.timeStart ?? session?.time ?? item?.timeStart ?? item?.time ?? null,
      )
      const timeEnd = normalizeTimeValue(
        session?.timeEnd ?? session?.endTime ?? item?.timeEnd ?? item?.endTime ?? null,
      )
      const durationMinutes = normalizeDurationMinutes(
        session?.durationMinutes ?? session?.duration ?? item?.durationMinutes ?? item?.duration,
      )

      if (!sessionDate || !timeStart) return null

      const procedureName = String(
        session?.procedureName ??
          session?.procedureTitle ??
          session?.procedure?.name ??
          item?.procedureName ??
          item?.procedureTitle ??
          item?.procedure?.name ??
          '',
      ).trim()
      const procedureId = session?.procedureId ?? item?.procedureId ?? null

      return {
        id:
          session?.id ??
          item?.sessionId ??
          item?.id ??
          `session-${sessionDate}-${timeStart}-${index}`,
        sessionDate,
        timeStart,
        timeEnd,
        durationMinutes,
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

export const mapProcedures = (items) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const id = Number(item?.id)
      const name = String(item?.name ?? '').trim()

      if (!Number.isFinite(id) || id <= 0 || !name) return null

      return {
        id: Math.trunc(id),
        name,
      }
    })
    .filter(Boolean)
    .sort((first, second) => first.name.localeCompare(second.name, 'ru'))

export const mergeSessions = (current, incoming) => {
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

export const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для работы с расписанием.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint на бэкенде.'
  return fallback
}
