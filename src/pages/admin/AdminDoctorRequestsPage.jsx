import { useEffect, useState } from 'react'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import api from "../../config/Api.js";

function AdminDoctorRequestsPage({ onNavigate }) {
  const [doctorRequests, setDoctorRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${api.BASE_URL}/doctor/no-working`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки врачей')
      }

      const data = await response.json()
      setDoctorRequests(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  const handleApprove = async (doctorId) => {
    try {
      const response = await fetch(
          `${api.BASE_URL}/doctor/approve?doctorId=${doctorId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
      )

      if (!response.ok) {
        throw new Error('Ошибка подтверждения врача')
      }

      // обновляем список после успешного подтверждения
      loadDoctors()
    } catch (error) {
      console.error(error)
    }
  }

  const handleReject = async (doctorId) => {
    if (!window.confirm('Вы уверены, что хотите отклонить заявку?')) return

    try {
      const response = await fetch(
          `${api.BASE_URL}/doctor?doctorId=${doctorId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
      )

      if (!response.ok) {
        throw new Error('Ошибка удаления врача')
      }

      // обновляем список после удаления
      loadDoctors()
    } catch (error) {
      console.error(error)
    }
  }

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
              <p className="muted">
                {loading ? 'Загрузка...' : 'Проверьте документы и подтвердите учетную запись.'}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>ФИО</th>
                <th>Специализация</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
              </thead>

              <tbody>
              {!loading && doctorRequests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="muted">
                      Нет заявок
                    </td>
                  </tr>
              )}

              {doctorRequests.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.id}</td>
                    <td>{doctor.name}</td>
                    <td>{doctor.specialization}</td>
                    <td>
                    <span className="status status--warning">
                      Ожидает подтверждения
                    </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                            className="btn success small"
                            onClick={() => handleApprove(doctor.id)}
                        >
                          Принять
                        </button>
                        <button
                            className="btn danger small"
                            onClick={() => handleReject(doctor.id)}
                        >
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
