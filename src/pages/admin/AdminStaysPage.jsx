import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import { stays } from '../../data/adminData'

function AdminStaysPage({ onNavigate }) {
  return (
    <section className="section dashboard" id="admin-stays">
      <SectionHeading
        eyebrow="Администрирование"
        title="Все проживания"
        description="Активные и предстоящие заезды с деталями по комнатам."
      />
      <AdminNav current="admin-stays" onNavigate={onNavigate} />
      <article className="card table-card">
        <div className="table-toolbar">
          <div>
            <h3>Список проживаний</h3>
            <p className="muted">Данные обновляются при изменениях статуса.</p>
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
                <th>Комната</th>
                <th>Заезд</th>
                <th>Выезд</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {stays.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.room}</td>
                  <td>{item.checkIn}</td>
                  <td>{item.checkOut}</td>
                  <td>
                    <span
                      className={`status${item.statusTone ? ` status--${item.statusTone}` : ''}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn ghost small" type="button">
                        Открыть
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

export default AdminStaysPage
