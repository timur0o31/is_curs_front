import { useMemo, useState } from 'react'

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const toIsoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMonthLabel = (date) =>
  date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

const defaultFormatDayLabel = (value) => {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
  })
}

const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

function ScheduleCalendar({
  sessions = [],
  todayIsoDate = '',
  requestedDate = '',
  title = 'Календарь',
  description = '',
  emptyDateText = 'Выберите дату',
  emptySessionsText = 'На выбранную дату записей нет.',
  statusLabel = 'Запланировано',
  formatDayLabel = defaultFormatDayLabel,
  getSessionMeta,
}) {
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (isIsoDate(requestedDate)) {
      const [yearValue, monthValue] = requestedDate.split('-').map(Number)
      if (Number.isFinite(yearValue) && Number.isFinite(monthValue)) {
        return new Date(yearValue, monthValue - 1, 1)
      }
    }

    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  const [selectedDate, setSelectedDate] = useState(() => (isIsoDate(requestedDate) ? requestedDate : ''))

  const currentMonthKey = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = String(calendarMonth.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }, [calendarMonth])

  const monthSessionMap = useMemo(() => {
    const map = new Map()

    sessions.forEach((item) => {
      if (!item?.sessionDate || !item.sessionDate.startsWith(currentMonthKey)) return

      const dayItems = map.get(item.sessionDate) || []
      dayItems.push(item)
      map.set(item.sessionDate, dayItems)
    })

    map.forEach((value, key) => {
      map.set(
        key,
        value.sort((first, second) => String(first.timeStart).localeCompare(String(second.timeStart))),
      )
    })

    return map
  }, [currentMonthKey, sessions])

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateValue = new Date(year, month, day)
      const dateIso = toIsoDate(dateValue)
      const daySessions = monthSessionMap.get(dateIso) || []

      cells.push({
        day,
        dateIso,
        isPast: todayIsoDate ? dateIso < todayIsoDate : false,
        sessionsCount: daySessions.length,
      })
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    return cells
  }, [calendarMonth, monthSessionMap, todayIsoDate])

  const selectedDateSessions = useMemo(() => {
    const availableDates = [...monthSessionMap.keys()].sort()
    const effectiveSelectedDate =
      selectedDate && monthSessionMap.has(selectedDate) ? selectedDate : availableDates[0] || ''

    if (!effectiveSelectedDate) return []
    return monthSessionMap.get(effectiveSelectedDate) || []
  }, [monthSessionMap, selectedDate])

  const availableDates = useMemo(() => [...monthSessionMap.keys()].sort(), [monthSessionMap])

  const effectiveSelectedDate =
    selectedDate && monthSessionMap.has(selectedDate) ? selectedDate : availableDates[0] || ''

  const handleCalendarMonthChange = (delta) => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <article className="card schedule-calendar-card">
      <div className="schedule-calendar-header">
        <div>
          <h3>{title}</h3>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        <div className="action-row">
          <button className="btn ghost small" type="button" onClick={() => handleCalendarMonthChange(-1)}>
            Предыдущий
          </button>
          <span className="schedule-calendar-month">{formatMonthLabel(calendarMonth)}</span>
          <button className="btn ghost small" type="button" onClick={() => handleCalendarMonthChange(1)}>
            Следующий
          </button>
        </div>
      </div>
      <div className="schedule-calendar-grid">
        {DAYS_OF_WEEK.map((day) => (
          <div className="schedule-calendar-weekday" key={day}>
            {day}
          </div>
        ))}
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <div className="schedule-calendar-day schedule-calendar-day--empty" key={`empty-${index}`} />
          }

          const isSelected = effectiveSelectedDate === cell.dateIso
          const dayClassName = [
            'schedule-calendar-day',
            cell.isPast ? 'schedule-calendar-day--past' : '',
            cell.sessionsCount > 0 ? 'schedule-calendar-day--filled' : '',
            isSelected ? 'schedule-calendar-day--selected' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              className={dayClassName}
              key={cell.dateIso}
              type="button"
              onClick={() => setSelectedDate(cell.dateIso)}
            >
              <span className="schedule-calendar-day-number">{cell.day}</span>
              {cell.sessionsCount > 0 ? (
                <span className="schedule-calendar-day-count">{cell.sessionsCount}</span>
              ) : null}
            </button>
          )
        })}
      </div>
      <div className="schedule-calendar-details">
        <h4>{effectiveSelectedDate ? formatDayLabel(effectiveSelectedDate) : emptyDateText}</h4>
        {selectedDateSessions.length === 0 ? (
          <p className="muted">{emptySessionsText}</p>
        ) : (
          <ul className="list">
            {selectedDateSessions.map((item) => {
              const sessionMeta = getSessionMeta ? getSessionMeta(item) : ''

              return (
                <li className="list-item" key={`calendar-${item.id}`}>
                  <div>
                    <strong>
                      {item.timeStart} · {item.title}
                    </strong>
                    {sessionMeta ? <p>{sessionMeta}</p> : null}
                  </div>
                  <span className="status">{statusLabel}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </article>
  )
}

export default ScheduleCalendar
