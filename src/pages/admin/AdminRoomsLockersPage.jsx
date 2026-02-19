import { useState } from 'react'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'

const roomTypes = [
  { value: 'STANDARD', label: 'Стандарт' },
  { value: 'COMFORT', label: 'Комфорт' },
  { value: 'SUITE', label: 'Люкс' },
]

const roomStatuses = [
  { value: 'AVAILABLE', label: 'Доступна' },
  { value: 'RESERVED', label: 'Резерв' },
  { value: 'MAINTENANCE', label: 'На обслуживании' },
]

const lockerSizes = [
  { value: 'SMALL', label: 'Маленький' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'LARGE', label: 'Большой' },
]

const lockerStatuses = [
  { value: 'AVAILABLE', label: 'Свободен' },
  { value: 'BLOCKED', label: 'Заблокирован' },
  { value: 'SERVICE', label: 'Обслуживание' },
]

const lockerZones = [
  { value: 'WEST', label: 'Западный корпус' },
  { value: 'EAST', label: 'Восточный корпус' },
  { value: 'AQUA', label: 'Аквазона' },
]

const createDefaultRoomForm = () => ({
  roomNumber: '',
  floor: '1',
  type: 'STANDARD',
  capacity: '2',
  status: 'AVAILABLE',
  lockerFrom: '',
  lockerTo: '',
  hasBathroom: true,
  accessible: false,
  notes: '',
})

const createDefaultLockerForm = () => ({
  lockerNumber: '',
  roomNumber: '',
  zone: 'WEST',
  size: 'MEDIUM',
  status: 'AVAILABLE',
  pinCode: '',
  hasDigitalLock: true,
})

function AdminRoomsLockersPage({ onNavigate }) {
  const [roomForm, setRoomForm] = useState(createDefaultRoomForm)
  const [lockerForm, setLockerForm] = useState(createDefaultLockerForm)

  const handleRoomChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setRoomForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleLockerChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setLockerForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleRoomSubmit = (event) => {
    event.preventDefault()
  }

  const handleLockerSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <section className="section dashboard" id="admin-rooms-lockers">
      <SectionHeading
        eyebrow="Администрирование"
        title="Добавление комнат и шкафчиков"
        description="Подготовьте номерной фонд и инфраструктуру хранения для новых заездов."
      />
      <AdminNav current="admin-rooms-lockers" onNavigate={onNavigate} />
      <div className="dashboard-grid dashboard-grid--two">
        <article className="card form-card">
          <div>
            <h3>Новая комната</h3>
            <p className="muted">Форма страницы без фактического сохранения в базе.</p>
          </div>
          <form className="form-grid" onSubmit={handleRoomSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="room-number">Номер комнаты</label>
                <input
                  id="room-number"
                  type="text"
                  value={roomForm.roomNumber}
                  onChange={handleRoomChange('roomNumber')}
                  placeholder="Например, 312"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="room-floor">Этаж</label>
                <input
                  id="room-floor"
                  type="number"
                  min="1"
                  value={roomForm.floor}
                  onChange={handleRoomChange('floor')}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="room-type">Тип комнаты</label>
                <select id="room-type" value={roomForm.type} onChange={handleRoomChange('type')}>
                  {roomTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="room-capacity">Вместимость</label>
                <input
                  id="room-capacity"
                  type="number"
                  min="1"
                  value={roomForm.capacity}
                  onChange={handleRoomChange('capacity')}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="room-status">Статус</label>
              <select id="room-status" value={roomForm.status} onChange={handleRoomChange('status')}>
                {roomStatuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="room-locker-from">Шкафчики от</label>
                <input
                  id="room-locker-from"
                  type="number"
                  min="1"
                  value={roomForm.lockerFrom}
                  onChange={handleRoomChange('lockerFrom')}
                  placeholder="100"
                />
              </div>
              <div className="field">
                <label htmlFor="room-locker-to">Шкафчики до</label>
                <input
                  id="room-locker-to"
                  type="number"
                  min="1"
                  value={roomForm.lockerTo}
                  onChange={handleRoomChange('lockerTo')}
                  placeholder="112"
                />
              </div>
            </div>

            <label className="checkbox" htmlFor="room-has-bathroom">
              <input
                id="room-has-bathroom"
                type="checkbox"
                checked={roomForm.hasBathroom}
                onChange={handleRoomChange('hasBathroom')}
              />
              Санузел в комнате
            </label>

            <label className="checkbox" htmlFor="room-accessible">
              <input
                id="room-accessible"
                type="checkbox"
                checked={roomForm.accessible}
                onChange={handleRoomChange('accessible')}
              />
              Подходит для маломобильных гостей
            </label>

            <div className="field">
              <label htmlFor="room-notes">Комментарий</label>
              <textarea
                id="room-notes"
                rows={3}
                value={roomForm.notes}
                onChange={handleRoomChange('notes')}
                placeholder="Любые дополнительные параметры комнаты"
              />
            </div>

            <div className="form-actions">
              <button className="btn ghost" type="button" onClick={() => setRoomForm(createDefaultRoomForm())}>
                Очистить
              </button>
              <button className="btn primary" type="submit">
                Сохранить комнату
              </button>
            </div>
          </form>
        </article>

        <article className="card form-card">
          <div>
            <h3>Новый шкафчик</h3>
            <p className="muted">Отдельная карточка для ручного добавления шкафчиков.</p>
          </div>
          <form className="form-grid" onSubmit={handleLockerSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="locker-number">Номер шкафчика</label>
                <input
                  id="locker-number"
                  type="number"
                  min="1"
                  value={lockerForm.lockerNumber}
                  onChange={handleLockerChange('lockerNumber')}
                  placeholder="215"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="locker-room-number">Привязка к комнате</label>
                <input
                  id="locker-room-number"
                  type="text"
                  value={lockerForm.roomNumber}
                  onChange={handleLockerChange('roomNumber')}
                  placeholder="Например, 312"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="locker-zone">Зона</label>
                <select id="locker-zone" value={lockerForm.zone} onChange={handleLockerChange('zone')}>
                  {lockerZones.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="locker-size">Размер</label>
                <select id="locker-size" value={lockerForm.size} onChange={handleLockerChange('size')}>
                  {lockerSizes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="locker-status">Статус</label>
                <select id="locker-status" value={lockerForm.status} onChange={handleLockerChange('status')}>
                  {lockerStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="locker-pin">PIN-код</label>
                <input
                  id="locker-pin"
                  type="password"
                  value={lockerForm.pinCode}
                  onChange={handleLockerChange('pinCode')}
                  placeholder="4-6 цифр"
                />
              </div>
            </div>

            <label className="checkbox" htmlFor="locker-digital-lock">
              <input
                id="locker-digital-lock"
                type="checkbox"
                checked={lockerForm.hasDigitalLock}
                onChange={handleLockerChange('hasDigitalLock')}
              />
              Электронный замок
            </label>

            <div className="form-actions">
              <button className="btn ghost" type="button" onClick={() => setLockerForm(createDefaultLockerForm())}>
                Очистить
              </button>
              <button className="btn primary" type="submit">
                Сохранить шкафчик
              </button>
            </div>
          </form>
        </article>
      </div>
    </section>
  )
}

export default AdminRoomsLockersPage
