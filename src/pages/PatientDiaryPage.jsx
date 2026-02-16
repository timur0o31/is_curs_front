import DiaryEntryForm from '../components/forms/DiaryEntryForm'
import SectionHeading from '../components/SectionHeading'

const diaryEntries = [
  {
    id: 'entry-1',
    date: '05.02',
    time: '18:40',
    title: 'Самочувствие стабильное',
    note: 'После водолечения стало легче дышать, но к вечеру появилась усталость.',
    mood: 'Спокойное',
    moodTone: 'good',
    pain: '2 / 10',
    sleep: '7ч 20м',
    pressure: '118/76',
    tags: ['Водолечение', 'ЛФК'],
  },
  {
    id: 'entry-2',
    date: '04.02',
    time: '20:10',
    title: 'Небольшая усталость',
    note: 'Сильная нагрузка на ЛФК, нужна пауза завтра до обеда.',
    mood: 'Усталость',
    moodTone: 'warn',
    pain: '4 / 10',
    sleep: '6ч 40м',
    pressure: '122/80',
    tags: ['ЛФК', 'Массаж'],
  },
  {
    id: 'entry-3',
    date: '03.02',
    time: '19:05',
    title: 'Улучшение состояния',
    note: 'Сон стал глубже, настроение лучше. Планирую посетить йогу у озера.',
    mood: 'Отличное',
    moodTone: 'good',
    pain: '1 / 10',
    sleep: '8ч 10м',
    pressure: '116/74',
    tags: ['Соляная комната', 'Бассейн'],
  },
]

const doctorNotes = [
  {
    id: 'note-1',
    author: 'Врач-реабилитолог',
    date: '05.02',
    text: 'Отмечаем стабильное состояние. Завтра можно снизить нагрузку на ЛФК.',
  },
  {
    id: 'note-2',
    author: 'Терапевт',
    date: '03.02',
    text: 'Продолжайте отмечать сон и уровень боли, это помогает корректировать режим.',
  },
]

const summaryMetrics = [
  { label: 'Записей за неделю', value: '5' },
  { label: 'Средний сон', value: '7ч 15м' },
  { label: 'Средняя боль', value: '2.4 / 10' },
  { label: 'Настроение', value: 'Спокойное' },
]

function PatientDiaryPage({ onNavigate }) {
  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient')
  }

  return (
    <section className="section diary" id="patient-diary">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Дневник состояния здоровья"
          title="Фиксируйте изменения самочувствия и делитесь ими с врачом"
          description="Записи помогают корректировать план лечения и отслеживать динамику."
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
      <div className="diary-grid">
        <div className="diary-stack">
          <article className="card diary-card">
            <div className="diary-card-header">
              <div>
                <h3>Лента записей</h3>
                <p className="muted">Последние записи за последние дни.</p>
              </div>
              <div className="filter-row">
                <button className="chip chip--active" type="button">
                  Все
                </button>
                <button className="chip" type="button">
                  Неделя
                </button>
                <button className="chip" type="button">
                  Месяц
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
          <article className="card diary-card">
            <div className="diary-card-header">
              <div>
                <h3>Комментарии врачей</h3>
                <p className="muted">Последние рекомендации по дневнику.</p>
              </div>
            </div>
            <div className="diary-notes">
              {doctorNotes.map((note) => (
                <div className="note-block" key={note.id}>
                  <div className="note-header">
                    <span className="note-author">{note.author}</span>
                    <span className="note-date">{note.date}</span>
                  </div>
                  <p>{note.text}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
        <div className="diary-stack">
          <DiaryEntryForm />
          <article className="card diary-card">
            <h3>Чек-лист дня</h3>
            <ul className="checklist">
              <li>Заполнить дневник самочувствия.</li>
              <li>Отметить процедуры и препараты.</li>
              <li>Сохранить заметку для врача.</li>
            </ul>
          </article>
          <article className="card diary-card">
            <h3>Напоминания</h3>
            <div className="list">
              <div className="list-item">
                <div>
                  <strong>Медикаменты</strong>
                  <p>Прием препарата в 14:30.</p>
                </div>
                <span className="status">Сегодня</span>
              </div>
              <div className="list-item">
                <div>
                  <strong>Процедура</strong>
                  <p>Массаж в 16:00.</p>
                </div>
                <span className="status">Запланировано</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default PatientDiaryPage
