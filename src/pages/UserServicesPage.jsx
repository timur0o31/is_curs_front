import { useState } from 'react'
import SectionHeading from '../components/SectionHeading'

const takenLockers = new Set([2, 5, 9, 12, 17, 21, 23])
const lockerSlots = Array.from({ length: 24 }, (_, index) => index + 1)

const seatTables = [
  { id: 'A', seats: [1, 2, 3, 4, 5, 6] },
  { id: 'B', seats: [1, 2, 3, 4, 5, 6] },
  { id: 'C', seats: [1, 2, 3, 4, 5, 6] },
]

const takenSeats = new Set(['A1', 'A2', 'B5', 'C3', 'C6'])

function UserServicesPage({ onNavigate }) {
  const [selectedLocker, setSelectedLocker] = useState(18)
  const [selectedSeat, setSelectedSeat] = useState('B4')

  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('user')
  }

  const seatTable = selectedSeat?.charAt(0)
  const seatNumber = selectedSeat?.slice(1)
  const seatLabel = selectedSeat ? `Стол ${seatTable}, место ${seatNumber}` : 'Место не выбрано'

  return (
    <section className="section dashboard" id="user-services">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Сервисы проживания"
          title="Цифровые ключи, шкафчики и место в столовой"
          description="Выберите свободные слоты и закрепите доступы для комфортного отдыха."
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=user" onClick={handleBack}>
            В кабинет
          </a>
        </div>
      </div>
      <div className="dashboard-grid dashboard-grid--two">
        <article className="card">
          <h3>Цифровые ключи и шкафчики</h3>
          <p className="muted">Комната 214 · Выбран шкафчик {selectedLocker}</p>
          <div className="locker-grid">
            {lockerSlots.map((locker) => {
              const isTaken = takenLockers.has(locker)
              const isSelected = selectedLocker === locker
              return (
                <button
                  key={locker}
                  type="button"
                  className={`locker${isTaken ? ' locker--taken' : ''}${
                    isSelected ? ' locker--selected' : ''
                  }`}
                  onClick={() => setSelectedLocker(locker)}
                  disabled={isTaken}
                  aria-pressed={isSelected}
                >
                  {locker}
                </button>
              )
            })}
          </div>
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
            <button className="btn primary small" type="button">
              Открыть комнату
            </button>
            <button className="btn ghost small" type="button">
              Открыть шкафчик
            </button>
            <button className="btn success small" type="button">
              Закрепить шкафчик
            </button>
          </div>
          <p className="note">Режим «Не беспокоить» активен с 21:00 до 08:00.</p>
        </article>
        <article className="card">
          <h3>Выбор места в столовой</h3>
          <p className="muted">Текущее место: {seatLabel}</p>
          <div className="seat-map">
            {seatTables.map((table) => (
              <div className="table-section" key={table.id}>
                <div className="table-header">
                  <span className="table-title">Стол {table.id}</span>
                  <span className="table-pill">{table.seats.length} мест</span>
                </div>
                <div className="seat-grid">
                  {table.seats.map((seat) => {
                    const seatId = `${table.id}${seat}`
                    const isTaken = takenSeats.has(seatId)
                    const isSelected = selectedSeat === seatId
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat${isTaken ? ' seat--taken' : ''}${
                          isSelected ? ' seat--selected' : ''
                        }`}
                        onClick={() => setSelectedSeat(seatId)}
                        disabled={isTaken}
                        aria-pressed={isSelected}
                      >
                        {seatId}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
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
            <button className="btn success small" type="button">
              Закрепить место
            </button>
            <button className="btn ghost small" type="button" onClick={() => setSelectedSeat(null)}>
              Сбросить выбор
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default UserServicesPage
