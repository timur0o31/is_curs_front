const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const isIsoDate = (value) => typeof value === 'string' && ISO_DATE_PATTERN.test(value)

export const toIsoDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseDateValue = (value) => {
  if (!value) return null

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (isIsoDate(trimmedValue)) {
      const date = new Date(`${trimmedValue}T00:00:00`)
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export const normalizeDateValue = (value) => {
  if (!value) return ''

  if (typeof value === 'string') {
    const directDate = value.slice(0, 10)
    if (isIsoDate(directDate)) return directDate
  }

  const date = parseDateValue(value)
  return date ? toIsoDate(date) : ''
}

export const normalizeTimeValue = (value) => {
  if (!value) return ''

  if (typeof value === 'string') {
    const match = value.match(/^(\d{2}:\d{2})/)
    if (match) return match[1]
  }

  return ''
}

export const getTodayIsoDate = () => toIsoDate(new Date())

export const getTomorrowIsoDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toIsoDate(date)
}

const padTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export const getCurrentTimeValue = () => padTime(new Date())

export const getRoundedCurrentTimeValue = (stepMinutes = 10) => {
  const date = new Date()

  const normalizedStep =
    Number.isInteger(stepMinutes) && stepMinutes > 0 ? Math.min(stepMinutes, 60) : 10
  date.setMinutes(Math.ceil(date.getMinutes() / normalizedStep) * normalizedStep, 0, 0)

  return padTime(date)
}

export const getTodayStart = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export const isOnOrAfterToday = (value, { emptyIsValid = true } = {}) => {
  if (!value) return emptyIsValid

  const date = parseDateValue(value)
  if (!date) return false

  date.setHours(0, 0, 0, 0)
  return date.getTime() >= getTodayStart().getTime()
}

export const getDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0

  const start = parseDateValue(startDate)
  const end = parseDateValue(endDate)

  if (!start || !end) return 0

  const diffMs = end.getTime() - start.getTime()
  if (diffMs <= 0) return 0

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export const formatRuDate = (
  value,
  options = { day: '2-digit', month: '2-digit' },
  { fallback = '—', keepRawOnInvalid = false } = {},
) => {
  if (!value) return fallback

  const date = parseDateValue(value)
  if (!date) {
    return keepRawOnInvalid ? String(value) : fallback
  }

  return date.toLocaleDateString('ru-RU', options)
}
