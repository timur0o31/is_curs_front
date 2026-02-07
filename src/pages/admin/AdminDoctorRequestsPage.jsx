import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import { doctorRequests } from '../../data/adminData'

function AdminDoctorRequestsPage({ onNavigate }) {
  return (
    <section className="section dashboard" id="admin-doctor-requests">
      <SectionHeading
        eyebrow="Администрирование"
        title="Регистрация врачей"
        description="Проверка документов и подтверждение доступа."
      />
      <AdminNav current="admin-doctor-requests" onNavigate={onNavigate} />
      <article className="card table-card">
        <div className="table-toolbar">
          <div>
            <h3>Заявки врачей</h3>
            <p className="muted">Проверьте документы и подтвердите учетную запись.</p>
          </div>
          <div className="action-row">
            <button className="btn ghost small" type="button">
              Фильтр
            </button>
            <button className="btn ghost small" type="button">
              Экспорт
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ФИО</th>
                <th>Специализация</th>
                <th>Стаж</th>
                <th>Сертификат</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {doctorRequests.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.specialty}</td>
                  <td>{item.experience}</td>
                  <td>{item.license}</td>
                  <td>{item.submitted}</td>
                  <td>
                    <span
                      className={`status${item.statusTone ? ` status--${item.statusTone}` : ''}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn success small" type="button">
                        Принять
                      </button>
                      <button className="btn danger small" type="button">
                        Отклонить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

export default AdminDoctorRequestsPage
