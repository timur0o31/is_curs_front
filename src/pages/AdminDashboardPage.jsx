import AdminNav from '../components/admin/AdminNav'
import SectionHeading from '../components/SectionHeading'
import { availableRooms, doctorRequests, stayRequests, stays } from '../data/adminData'

const summaryCards = [
  {
    label: 'Активные проживания',
    value: stays.filter((item) => item.status === 'Активно').length,
  },
  {
    label: 'Заявки по проживанию',
    value: stayRequests.length,
  },
  {
    label: 'Регистрация врачей',
    value: doctorRequests.length,
  },
  {
    label: 'Свободных комнат',
    value: availableRooms.length,
  },
]

function AdminDashboardPage({ onNavigate }) {
  return (
    <section className="section dashboard" id="admin-dashboard">
      <SectionHeading
        eyebrow="Панель администратора"
        title="Обзор по санаторию"
        description="Быстрый доступ к ключевым показателям и ролям."
      />
      <AdminNav current="admin" onNavigate={onNavigate} />
      <div className="summary-grid">
        {summaryCards.map((item) => (
          <div className="card summary-card" key={item.label}>
            <span className="metric-label">{item.label}</span>
            <span className="metric-value">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <article className="card">
          <h3>Сводка по санаторию</h3>
          <div className="metric-grid">
            <div className="metric">
              <span className="metric-label">Гостей сейчас</span>
              <span className="metric-value">186</span>
            </div>
            <div className="metric">
              <span className="metric-label">Свободно мест</span>
              <span className="metric-value">42</span>
            </div>
            <div className="metric">
              <span className="metric-label">Новые заявки</span>
              <span className="metric-value">9</span>
            </div>
            <div className="metric">
              <span className="metric-label">Врачи онлайн</span>
              <span className="metric-value">14</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default AdminDashboardPage
