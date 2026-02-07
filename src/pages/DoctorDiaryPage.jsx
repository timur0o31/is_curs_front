import DoctorDiaryNoteForm from '../components/forms/DoctorDiaryNoteForm'
import SectionHeading from '../components/SectionHeading'

const patientList = [
  {
    id: 'P-204',
    name: 'Екатерина Морозова',
    room: '214',
    lastUpdate: 'Запись 2ч назад',
    status: 'Нужен контроль',
    statusTone: 'warn',
  },
  {
    id: 'P-205',
    name: 'Сергей Блинов',
    room: '318',
    lastUpdate: 'Запись 1д назад',
    status: 'Стабильно',
    statusTone: '',
  },
  {
    id: 'P-206',
    name: 'Марина Егорова',
    room: '122',
    lastUpdate: 'Запись 3д назад',
    status: 'Риск',
    statusTone: 'danger',
  },
  {
    id: 'P-207',
    name: 'Алексей Поляков',
    room: '405',
    lastUpdate: 'Запись сегодня',
    status: 'Стабильно',
    statusTone: '',
  },
]

const summaryMetrics = [
  { label: 'Средний сон', value: '6ч 40м' },
  { label: 'Средняя боль', value: '3.2 / 10' },
  { label: 'Настроение', value: 'Усталость' },
  { label: 'Давление', value: '122/80' },
]

const diaryEntries = [
  {
    id: 'd-1',
    date: '05.02',
    time: '18:40',
    title: 'Усталость после ЛФК',
    note: 'После занятий появилась усталость, требуется отдых до утра.',
    mood: 'Усталость',
    moodTone: 'warn',
    pain: '4 / 10',
    sleep: '6ч 20м',
    pressure: '124/82',
    tags: ['ЛФК', 'Массаж'],
  },
  {
    id: 'd-2',
    date: '04.02',
    time: '20:10',
    title: 'Стабильное состояние',
    note: 'Дыхание ровное, боли нет, аппетит хороший.',
    mood: 'Спокойное',
    moodTone: 'good',
    pain: '2 / 10',
    sleep: '7ч 10м',
    pressure: '118/78',
    tags: ['Водолечение', 'Соляная комната'],
  },
]

const alerts = [
  {
    id: 'a-1',
    title: 'Нужна проверка давления',
    details: 'Отметка выше 130/85 за последние 2 дня.',
    status: 'Сигнал',
    statusTone: 'warn',
  },
  {
    id: 'a-2',
    title: 'Запрос на корректировку процедур',
    details: 'Пациент просит снизить нагрузку по ЛФК.',
    status: 'Заявка',
    statusTone: 'default',
  },
]

function DoctorDiaryPage({ onNavigate }) {
  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('doctor')
  }

  return (
    <section className="section diary doctor-diary" id="doctor-diary">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Дневники пациентов"
          title="Следите за динамикой и оставляйте рекомендации"
          description="Записи пациентов помогают корректировать план лечения и вовремя реагировать на изменения."
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=doctor" onClick={handleBack}>
            К кабинету врача
          </a>
          <button className="btn primary" type="button">
            Назначить процедуру
          </button>
        </div>
      </div>
      <div className="diary-grid diary-grid--doctor">
        <aside className="card patient-list">
          <div className="patient-list-header">
            <div>
              <h3>Пациенты</h3>
              <p className="muted">12 активных записей на сегодня.</p>
            </div>
            <span className="pill">Приоритет</span>
          </div>
          <input
            className="filter-input"
            type="text"
            placeholder="Поиск по имени или палате"
            aria-label="Поиск пациента"
          />
          <div className="patient-cards">
            {patientList.map((patient, index) => (
              <button
                className={`patient-card${index === 0 ? ' patient-card--active' : ''}`}
                type="button"
                key={patient.id}
              >
                <div>
                  <strong>{patient.name}</strong>
                  <p className="muted">
                    Палата {patient.room} · {patient.lastUpdate}
                  </p>
                </div>
                <span
                  className={`status${
                    patient.statusTone ? ` status--${patient.statusTone}` : ''
                  }`}
                >
                  {patient.status}
                </span>
              </button>
            ))}
          </div>
        </aside>
        <div className="diary-stack">
          <article className="card patient-summary">
            <div className="patient-summary-header">
              <div>
                <span className="eyebrow">Пациент</span>
                <h3>Екатерина Морозова</h3>
                <p className="muted">Палата 214 · Программа «Кардио-лёгкая»</p>
              </div>
              <div className="diary-chips">
                <span className="chip chip--warn">Нужен контроль</span>
                <span className="chip chip--neutral">План обновлён</span>
              </div>
            </div>
            <div className="summary-grid summary-grid--compact">
              {summaryMetrics.map((item) => (
                <div className="card summary-card summary-card--mini" key={item.label}>
                  <span className="metric-label">{item.label}</span>
                  <span className="metric-value">{item.value}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="card diary-card">
            <div className="diary-card-header">
              <div>
                <h3>Записи пациента</h3>
                <p className="muted">Последние записи и их динамика.</p>
              </div>
              <div className="filter-row">
                <button className="chip chip--active" type="button">
                  Неделя
                </button>
                <button className="chip" type="button">
                  Месяц
                </button>
                <button className="chip" type="button">
                  Все
                </button>
              </div>
            </div>
            <div className="diary-entries">
              {diaryEntries.map((entry, index) => (
                <article
                  className={`card diary-entry${index === 0 ? ' diary-entry--today' : ''}`}
                  key={entry.id}
                >
                  <div className="diary-entry-header">
                    <div>
                      <span className="diary-date">
                        {entry.date} · {entry.time}
                      </span>
                      <h3>{entry.title}</h3>
                    </div>
                    <div className="diary-chips">
                      <span className={`chip chip--${entry.moodTone}`}>
                        Настроение: {entry.mood}
                      </span>
                      <span className="chip chip--neutral">Боль: {entry.pain}</span>
                    </div>
                  </div>
                  <p className="muted">{entry.note}</p>
                  <div className="diary-metrics">
                    <span>Сон: {entry.sleep}</span>
                    <span>Давление: {entry.pressure}</span>
                  </div>
                  <div className="diary-tags">
                    {entry.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
        <div className="diary-stack">
          <DoctorDiaryNoteForm />
          <article className="card diary-card">
            <h3>Сигналы</h3>
            <ul className="list">
              {alerts.map((item) => (
                <li className="list-item" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.details}</p>
                  </div>
                  <span
                    className={`status${
                      item.statusTone && item.statusTone !== 'default'
                        ? ` status--${item.statusTone}`
                        : ''
                    }`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </article>
          <article className="card diary-card">
            <h3>Быстрые действия</h3>
            <div className="action-row">
              <button className="btn success small" type="button">
                Назначить диету
              </button>
              <button className="btn ghost small" type="button">
                Отложить ЛФК
              </button>
              <button className="btn danger small" type="button">
                Срочный осмотр
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default DoctorDiaryPage
