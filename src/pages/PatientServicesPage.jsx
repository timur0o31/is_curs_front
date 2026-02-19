import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import SectionHeading from '../components/SectionHeading'
import PatientFacilities from '../services/PatientFacilities'
import PatientStay from '../services/PatientStay'

const normalizePositiveInt = (value) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null
  return Math.trunc(numericValue)
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

const getRequestErrorMessage = (error, fallback) => {
  const status = error?.response?.status

  if (status === 400) return 'Сервер отклонил запрос. Проверьте данные.'
  if (status === 401) return 'Сессия истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для операции.'
  if (status === 404) return 'Метод не найден на сервере.'
  if (status === 409) return 'Ресурс уже занят. Обновите данные.'

  return fallback
}

const mapLocker = (item) => {
  const id = normalizePositiveInt(item?.id)
  const lockerNumber = normalizePositiveInt(item?.lockerNumber)

  if (id == null || lockerNumber == null) return null

  return {
    id,
    lockerNumber,
    patientId: normalizePositiveInt(item?.patientId),
  }
}

const mapDiningTable = (item) => {
  const id = normalizePositiveInt(item?.id)
  const tableNumber = normalizePositiveInt(item?.tableNumber)

  if (id == null || tableNumber == null) return null

  return {
    id,
    tableNumber,
  }
}

const mapSeat = (item) => {
  const id = normalizePositiveInt(item?.id)
  const diningTableId = normalizePositiveInt(item?.diningTableId)
  const seatNumber = normalizePositiveInt(item?.seatNumber)

  if (id == null || diningTableId == null || seatNumber == null) return null

  return {
    id,
    diningTableId,
    seatNumber,
    patientId: normalizePositiveInt(item?.patientId),
    isOccupied: Boolean(item?.isOccupied),
  }
}

const getPatientIdFromStayRequests = (items) => {
  if (!Array.isArray(items)) return null

  for (const item of items) {
    const patientId = normalizePositiveInt(item?.patientId)
    if (patientId != null) return patientId
  }

  return null
}

function PatientServicesPage({ onNavigate }) {
  const [patientId, setPatientId] = useState(null)
  const [isPatientIdLoading, setIsPatientIdLoading] = useState(true)
  const [patientIdError, setPatientIdError] = useState('')

  const [roomNumber, setRoomNumber] = useState(null)
  const [isRoomLoading, setIsRoomLoading] = useState(false)

  const [lockers, setLockers] = useState([])
  const [selectedLockerId, setSelectedLockerId] = useState(null)
  const [myLockerId, setMyLockerId] = useState(null)
  const [isLockersLoading, setIsLockersLoading] = useState(false)
  const [lockersError, setLockersError] = useState('')
  const [isLockerActionLoading, setIsLockerActionLoading] = useState(false)

  const [diningTables, setDiningTables] = useState([])
  const [seats, setSeats] = useState([])
  const [selectedSeatId, setSelectedSeatId] = useState(null)
  const [mySeatId, setMySeatId] = useState(null)
  const [isSeatsLoading, setIsSeatsLoading] = useState(false)
  const [seatsError, setSeatsError] = useState('')
  const [isSeatActionLoading, setIsSeatActionLoading] = useState(false)

  const hasAccessToken = Boolean(localStorage.getItem('accessToken'))

  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient')
  }

  const loadRoom = useCallback(async () => {
    if (!hasAccessToken) {
      setRoomNumber(null)
      setIsRoomLoading(false)
      return
    }

    setIsRoomLoading(true)

    try {
      const response = await PatientStay.getMyRoom()
      setRoomNumber(parseRoomNumber(response?.data))
    } catch {
      setRoomNumber(null)
    } finally {
      setIsRoomLoading(false)
    }
  }, [hasAccessToken])

  const resolvePatientId = useCallback(async () => {
    if (!hasAccessToken) {
      setPatientId(null)
      setPatientIdError('')
      setIsPatientIdLoading(false)
      return
    }

    setIsPatientIdLoading(true)
    setPatientIdError('')

    try {
      const response = await PatientStay.getMyStayRequests()
      const resolvedPatientId = getPatientIdFromStayRequests(response?.data)

      if (resolvedPatientId == null) {
        setPatientId(null)
        setPatientIdError(
          'Не удалось определить ID пациента. Нужен endpoint профиля пациента или хотя бы одна заявка на проживание.',
        )
        return
      }

      setPatientId(resolvedPatientId)
    } catch (error) {
      setPatientId(null)
      setPatientIdError(getRequestErrorMessage(error, 'Не удалось определить ID пациента.'))
    } finally {
      setIsPatientIdLoading(false)
    }
  }, [hasAccessToken])

  const loadLockers = useCallback(
    async (resolvedPatientId) => {
      setIsLockersLoading(true)
      setLockersError('')

      try {
        const [lockersResponse, myLockerResponse] = await Promise.all([
          PatientFacilities.getLockers(),
          resolvedPatientId != null
            ? PatientFacilities.getLockerByPatientId(resolvedPatientId).catch(() => null)
            : Promise.resolve(null),
        ])

        const lockerItems = Array.isArray(lockersResponse?.data) ? lockersResponse.data : []
        const mappedLockers = lockerItems.map(mapLocker).filter(Boolean).sort((a, b) => a.lockerNumber - b.lockerNumber)

        const myLocker = mapLocker(myLockerResponse?.data)
        const myLockerIdValue = myLocker?.id ?? null

        setLockers(mappedLockers)
        setMyLockerId(myLockerIdValue)

        setSelectedLockerId((current) => {
          const hasCurrent = mappedLockers.some((item) => item.id === current)
          if (hasCurrent) return current
          if (myLockerIdValue != null) return myLockerIdValue

          const firstSelectable = mappedLockers.find(
            (item) => item.patientId == null || item.patientId === resolvedPatientId,
          )
          return firstSelectable?.id ?? null
        })
      } catch (error) {
        setLockers([])
        setMyLockerId(null)
        setSelectedLockerId(null)
        setLockersError(getRequestErrorMessage(error, 'Не удалось загрузить шкафчики.'))
      } finally {
        setIsLockersLoading(false)
      }
    },
    [],
  )

  const loadDiningSeats = useCallback(
    async (resolvedPatientId) => {
      setIsSeatsLoading(true)
      setSeatsError('')

      try {
        const [tablesResponse, seatsResponse, mySeatsResponse] = await Promise.all([
          PatientFacilities.getDiningTables(),
          PatientFacilities.getSeats(),
          resolvedPatientId != null
            ? PatientFacilities.getSeatsByPatientId(resolvedPatientId).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ])

        const tableItems = Array.isArray(tablesResponse?.data) ? tablesResponse.data : []
        const seatItems = Array.isArray(seatsResponse?.data) ? seatsResponse.data : []
        const mySeatItems = Array.isArray(mySeatsResponse?.data) ? mySeatsResponse.data : []

        const mappedTables = tableItems.map(mapDiningTable).filter(Boolean).sort((a, b) => a.tableNumber - b.tableNumber)
        const mappedSeats = seatItems.map(mapSeat).filter(Boolean).sort((a, b) => a.seatNumber - b.seatNumber)
        const mappedMySeats = mySeatItems.map(mapSeat).filter(Boolean)

        const mySeatIdValue = mappedMySeats[0]?.id ?? null

        setDiningTables(mappedTables)
        setSeats(mappedSeats)
        setMySeatId(mySeatIdValue)

        setSelectedSeatId((current) => {
          const hasCurrent = mappedSeats.some((item) => item.id === current)
          if (hasCurrent) return current
          if (mySeatIdValue != null) return mySeatIdValue

          const firstSelectable = mappedSeats.find(
            (item) => !item.isOccupied || item.patientId === resolvedPatientId,
          )
          return firstSelectable?.id ?? null
        })
      } catch (error) {
        setDiningTables([])
        setSeats([])
        setMySeatId(null)
        setSelectedSeatId(null)
        setSeatsError(getRequestErrorMessage(error, 'Не удалось загрузить места в столовой.'))
      } finally {
        setIsSeatsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadRoom()
    resolvePatientId()
  }, [loadRoom, resolvePatientId])

  useEffect(() => {
    if (isPatientIdLoading) return
    loadLockers(patientId)
    loadDiningSeats(patientId)
  }, [isPatientIdLoading, loadDiningSeats, loadLockers, patientId])

  const roomLabel = useMemo(() => {
    if (isRoomLoading) return '...'
    if (!roomNumber) return 'не назначена'
    return roomNumber
  }, [isRoomLoading, roomNumber])

  const selectedLocker = useMemo(
    () => lockers.find((item) => item.id === selectedLockerId) ?? null,
    [lockers, selectedLockerId],
  )

  const selectedSeat = useMemo(
    () => seats.find((item) => item.id === selectedSeatId) ?? null,
    [seats, selectedSeatId],
  )

  const tableById = useMemo(
    () =>
      new Map(diningTables.map((item) => [item.id, item])),
    [diningTables],
  )

  const seatSections = useMemo(() => {
    const sections = diningTables.map((table) => ({
      table,
      seats: seats.filter((seat) => seat.diningTableId === table.id).sort((a, b) => a.seatNumber - b.seatNumber),
    }))

    const knownTableIds = new Set(diningTables.map((item) => item.id))
    const orphanTableIds = [...new Set(seats.map((seat) => seat.diningTableId).filter((id) => !knownTableIds.has(id)))]

    orphanTableIds.forEach((tableId) => {
      sections.push({
        table: { id: tableId, tableNumber: tableId },
        seats: seats.filter((seat) => seat.diningTableId === tableId).sort((a, b) => a.seatNumber - b.seatNumber),
      })
    })

    return sections
  }, [diningTables, seats])

  const seatLabel = useMemo(() => {
    if (!selectedSeat) return 'Место не выбрано'

    const table = tableById.get(selectedSeat.diningTableId)
    const tableLabel = table ? table.tableNumber : selectedSeat.diningTableId
    return `Стол ${tableLabel}, место ${selectedSeat.seatNumber}`
  }, [selectedSeat, tableById])

  const handleAssignLocker = async () => {
    if (patientId == null) {
      toast.error(patientIdError || 'Не удалось определить пациента для закрепления шкафчика.')
      return
    }

    if (!selectedLocker) {
      toast.warn('Выберите шкафчик.')
      return
    }

    if (selectedLocker.patientId != null && selectedLocker.patientId !== patientId) {
      toast.warn('Шкафчик уже занят.')
      return
    }

    setIsLockerActionLoading(true)

    try {
      await PatientFacilities.assignLocker(selectedLocker.id, patientId)
      await loadLockers(patientId)
      toast.success(`Шкафчик ${selectedLocker.lockerNumber} закреплен.`)
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Не удалось закрепить шкафчик.'))
    } finally {
      setIsLockerActionLoading(false)
    }
  }

  const handleReleaseLocker = async () => {
    if (patientId == null) {
      toast.error(patientIdError || 'Не удалось определить пациента.')
      return
    }

    setIsLockerActionLoading(true)

    try {
      await PatientFacilities.unassignLocker(patientId)
      await loadLockers(patientId)
      toast.success('Шкафчик освобожден.')
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Не удалось освободить шкафчик.'))
    } finally {
      setIsLockerActionLoading(false)
    }
  }

  const handleBookSeat = async () => {
    if (patientId == null) {
      toast.error(patientIdError || 'Не удалось определить пациента для выбора места.')
      return
    }

    if (!selectedSeat) {
      toast.warn('Выберите место в столовой.')
      return
    }

    if (selectedSeat.isOccupied && selectedSeat.patientId !== patientId) {
      toast.warn('Это место уже занято.')
      return
    }

    setIsSeatActionLoading(true)

    try {
      await PatientFacilities.bookSeat(patientId, selectedSeat.id)
      await loadDiningSeats(patientId)
      toast.success('Место закреплено.')
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Не удалось закрепить место.'))
    } finally {
      setIsSeatActionLoading(false)
    }
  }

  const handleReleaseSeat = async () => {
    if (patientId == null) {
      toast.error(patientIdError || 'Не удалось определить пациента.')
      return
    }

    setIsSeatActionLoading(true)

    try {
      await PatientFacilities.releaseSeat(patientId)
      await loadDiningSeats(patientId)
      setSelectedSeatId(null)
      toast.success('Место освобождено.')
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Не удалось освободить место.'))
    } finally {
      setIsSeatActionLoading(false)
    }
  }

  return (
    <section className="section dashboard" id="patient-services">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Сервисы проживания"
          title="Цифровые ключи, шкафчики и место в столовой"
          description="Выберите свободные слоты и закрепите доступы для комфортного отдыха."
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=patient" onClick={handleBack}>
            В кабинет
          </a>
        </div>
      </div>
      <div className="dashboard-grid dashboard-grid--two">
        <article className="card">
          <h3>Цифровые ключи и шкафчики</h3>
          <p className="muted">
            Комната {roomLabel}
            {selectedLocker ? ` · Выбран шкафчик ${selectedLocker.lockerNumber}` : ''}
            {myLockerId != null ? ' · Ваш шкафчик закреплен' : ''}
          </p>
          {patientIdError ? <p className="note">{patientIdError}</p> : null}
          {lockersError ? <p className="note">{lockersError}</p> : null}
          {isLockersLoading ? (
            <p className="muted">Загружаем шкафчики...</p>
          ) : lockers.length === 0 ? (
            <p className="muted">Шкафчики пока не настроены.</p>
          ) : (
            <div className="locker-grid">
              {lockers.map((locker) => {
                const isMine = patientId != null && locker.patientId === patientId
                const isTakenByOther = locker.patientId != null && !isMine
                const isSelected = selectedLockerId === locker.id

                return (
                  <button
                    key={locker.id}
                    type="button"
                    className={`locker${isTakenByOther ? ' locker--taken' : ''}${
                      isSelected ? ' locker--selected' : ''
                    }`}
                    onClick={() => setSelectedLockerId(locker.id)}
                    disabled={isTakenByOther}
                    aria-pressed={isSelected}
                    title={isMine ? `Ваш шкафчик ${locker.lockerNumber}` : `Шкафчик ${locker.lockerNumber}`}
                  >
                    {locker.lockerNumber}
                  </button>
                )
              })}
            </div>
          )}
          <div className="legend-row">
            <span className="legend-item">
              <span className="legend-dot legend-dot--free" />
              Свободен
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--taken" />
              Занят
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--selected" />
              Выбран
            </span>
          </div>
          <div className="action-row">
            <button className="btn primary small" type="button" onClick={() => toast.info('Ключ комнаты активирован.')}>
              Открыть комнату
            </button>
            <button
              className="btn ghost small"
              type="button"
              onClick={() => toast.info(selectedLocker ? `Шкафчик ${selectedLocker.lockerNumber} открыт.` : 'Выберите шкафчик.')}
              disabled={!selectedLocker}
            >
              Открыть шкафчик
            </button>
            <button
              className="btn success small"
              type="button"
              onClick={handleAssignLocker}
              disabled={isLockerActionLoading || isPatientIdLoading || !selectedLocker}
            >
              {isLockerActionLoading ? 'Сохраняем...' : 'Закрепить шкафчик'}
            </button>
            <button
              className="btn ghost small"
              type="button"
              onClick={handleReleaseLocker}
              disabled={isLockerActionLoading || myLockerId == null || patientId == null}
            >
              Освободить шкафчик
            </button>
          </div>
          <p className="note">Режим «Не беспокоить» активен с 21:00 до 08:00.</p>
        </article>

        <article className="card">
          <h3>Выбор места в столовой</h3>
          <p className="muted">
            Текущее место: {seatLabel}
            {mySeatId != null ? ' · Место закреплено за вами' : ''}
          </p>
          {seatsError ? <p className="note">{seatsError}</p> : null}
          {isSeatsLoading ? (
            <p className="muted">Загружаем схему мест...</p>
          ) : seatSections.length === 0 ? (
            <p className="muted">Схема столовой пока не настроена.</p>
          ) : (
            <div className="seat-map">
              {seatSections.map((section) => (
                <div className="table-section" key={`table-section-${section.table.id}`}>
                  <div className="table-header">
                    <span className="table-title">Стол {section.table.tableNumber}</span>
                    <span className="table-pill">{section.seats.length} мест</span>
                  </div>
                  <div className="seat-grid">
                    {section.seats.map((seat) => {
                      const isMine = patientId != null && seat.patientId === patientId
                      const isTakenByOther = seat.isOccupied && !isMine
                      const isSelected = selectedSeatId === seat.id

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          className={`seat${isTakenByOther ? ' seat--taken' : ''}${
                            isSelected ? ' seat--selected' : ''
                          }`}
                          onClick={() => setSelectedSeatId(seat.id)}
                          disabled={isTakenByOther}
                          aria-pressed={isSelected}
                          title={isMine ? `Ваше место: ${seat.seatNumber}` : `Место ${seat.seatNumber}`}
                        >
                          {seat.seatNumber}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="legend-row">
            <span className="legend-item">
              <span className="legend-dot legend-dot--free" />
              Свободно
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--taken" />
              Занято
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--selected" />
              Выбрано
            </span>
          </div>
          <div className="action-row">
            <button
              className="btn success small"
              type="button"
              onClick={handleBookSeat}
              disabled={isSeatActionLoading || isPatientIdLoading || !selectedSeat}
            >
              {isSeatActionLoading ? 'Сохраняем...' : 'Закрепить место'}
            </button>
            <button
              className="btn ghost small"
              type="button"
              onClick={() => setSelectedSeatId(null)}
              disabled={isSeatActionLoading}
            >
              Сбросить выбор
            </button>
            <button
              className="btn ghost small"
              type="button"
              onClick={handleReleaseSeat}
              disabled={isSeatActionLoading || mySeatId == null || patientId == null}
            >
              Освободить место
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default PatientServicesPage
