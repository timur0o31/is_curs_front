import SectionHeading from '../components/SectionHeading'
import StayExtensionForm from '../components/forms/StayExtensionForm'
import StayRequestForm from '../components/forms/StayRequestForm'

const summaryMetrics = [
  { label: 'Текущая бронь', value: '12–26 марта' },
  { label: 'Комната', value: '214' },
  { label: 'Статус', value: 'Активно' },
  { label: 'Заявок в обработке', value: '1' },
]

const requestHistory = [
  {
    id: 'REQ-118',
    type: 'Новая заявка',
    period: '12–26 марта',
    submitted: '02.02',
    status: 'Ожидает',
    tone: 'warn',
  },
  {
    id: 'REQ-112',
    type: 'Продление проживания',
    period: 'до 29 марта',
    submitted: '28.01',
    status: 'Согласовано',
    tone: 'success',
  },
  {
    id: 'REQ-104',
    type: 'Перенос даты',
    period: '05–12 января',
    submitted: '10.01',
    status: 'Отклонено',
    tone: 'danger',
  },
]

function UserStayRequestsPage({ onNavigate }) {
  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('user')
  }

  return (
    <section className="section dashboard" id="user-stay-requests">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Проживание"
          title="Заявки и продление проживания"
          description="Заполните заявку на заселение или отправьте запрос на продление текущего проживания."
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=user" onClick={handleBack}>
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
        <StayRequestForm />
        <div className="dashboard-stack">
          <StayExtensionForm />
          <article className="card">
            <h3>Мои заявки</h3>
            <p className="muted">История поданных заявок и их статус.</p>
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
          </article>
        </div>
      </div>
    </section>
  )
}

export default UserStayRequestsPage
