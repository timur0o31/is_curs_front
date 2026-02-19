import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminMedicationForm from '../../components/forms/AdminMedicationForm'
import api from "../../config/Api.js";

const API_URL = '/medicaments'

function AdminMedicationsPage({ onNavigate }) {
  const [medications, setMedications] = useState([])
  const [selectedMedicationId, setSelectedMedicationId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [loading, setLoading] = useState(false)

  // ===== API =====

  const fetchMedications = async () => {
    try {
      setLoading(true)
      const res = await fetch(api.BASE_URL + API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      })
      if (!res.ok) throw new Error('Ошибка загрузки')
      const data = await res.json()
      setMedications(data)
    } catch (e) {
      toast.error('Не удалось загрузить медикаменты')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  // ===== selected =====

  const selectedMedication = useMemo(
    () => medications.find((m) => m.id === selectedMedicationId) ?? null,
    [medications, selectedMedicationId],
  )

  const pendingDeleteMedication = useMemo(
    () => medications.find((m) => m.id === pendingDeleteId) ?? null,
    [medications, pendingDeleteId],
  )

  // ===== actions =====

  const handleSelect = (item) => {
    setSelectedMedicationId(item.id)
  }

  const handleCreate = () => {
    setFormMode('create')
    setPendingDeleteId(null)
  }

  const handleEdit = () => {
    if (!selectedMedication) {
      toast.warn('Сначала выберите медикамент')
      return
    }
    setFormMode('edit')
  }

  const handleDeleteRequest = () => {
    if (!selectedMedication) {
      toast.warn('Сначала выберите медикамент')
      return
    }
    setPendingDeleteId(selectedMedication.id)
  }

  const handleFormCancel = () => {
    setFormMode(null)
  }

  // ===== create =====

  const handleCreateSubmit = async (formData) => {
    if (!formData.name) {
      toast.warn('Укажите название')
      return
    }

    try {
      const res = await fetch(api.BASE_URL + API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}`},
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      const created = await res.json()

      setSelectedMedicationId(created.id)
      setFormMode(null)
      fetchMedications()

      toast.success('Медикамент добавлен')
    } catch {
      toast.error('Ошибка создания')
    }
  }

  // ===== edit =====

  const handleEditSubmit = async (formData) => {
    if (!selectedMedication) return

    try {
      const res = await fetch(`${API_URL}/${selectedMedication.id}`, {
method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(formData),
})

if (!res.ok) throw new Error()

setFormMode(null)
fetchMedications()
toast.success('Медикамент обновлён')
} catch {
  toast.error('Ошибка обновления')
}
}

// ===== delete =====

const handleDeleteConfirm = async () => {
  if (!pendingDeleteMedication) return

  try {
    const res = await fetch(`${API_URL}/${pendingDeleteMedication.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) throw new Error()

    if (selectedMedicationId === pendingDeleteMedication.id) {
      setSelectedMedicationId(null)
    }

    setPendingDeleteId(null)
    fetchMedications()
    toast.success('Медикамент удалён')
  } catch {
    toast.error('Ошибка удаления')
  }
}

return (
    <section className="section dashboard" id="admin-medications">
      <SectionHeading
          eyebrow="Администрирование"
          title="Медикаменты"
          description="Справочник медикаментов"
      />

      <AdminNav current="admin-medications" onNavigate={onNavigate} />

      {/* ===== TABLE ===== */}
      {formMode == null && (
          <article className="card table-card">
            <div className="table-toolbar">
              <h3>Список медикаментов</h3>

              <div className="action-row">
                <button className="btn primary small" onClick={handleCreate}>
                  Создать
                </button>
                <button
                    className="btn ghost small"
                    onClick={handleEdit}
                    disabled={!selectedMedication}
                >
                  Изменить
                </button>
                <button
                    className="btn danger small"
                    onClick={handleDeleteRequest}
                    disabled={!selectedMedication}
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Описание</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr>
                      <td colSpan={3}>Загрузка...</td>
                    </tr>
                ) : medications.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Медикаменты не найдены</td>
                    </tr>
                ) : (
                    medications.map((item) => {
                      const isSelected = item.id === selectedMedicationId

                      return (
                          <tr
                              key={item.id}
                              className={
                                isSelected
                                    ? 'medication-row medication-row--selected'
                                    : 'medication-row'
                              }
                              onClick={() => handleSelect(item)}
                          >
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.description || '—'}</td>
                          </tr>
                      )
                    })
                )}
                </tbody>
              </table>
            </div>
          </article>
      )}

      {/* ===== CREATE ===== */}
      {formMode === 'create' && (
          <article className="card form-card">
            <AdminMedicationForm
                title="Новый медикамент"
                submitLabel="Сохранить"
                onSubmit={handleCreateSubmit}
                onCancel={handleFormCancel}
            />
          </article>
      )}

      {/* ===== EDIT ===== */}
      {formMode === 'edit' && (
          <article className="card form-card">
            <AdminMedicationForm
                initialData={selectedMedication}
                title="Изменить медикамент"
                submitLabel="Сохранить изменения"
                onSubmit={handleEditSubmit}
                onCancel={handleFormCancel}
            />
          </article>
      )}

      {/* ===== DELETE ===== */}
      {pendingDeleteMedication && (
          <article className="card form-card">
            <h3>Удалить медикамент</h3>
            <p className="muted">
              Удалить <strong>{pendingDeleteMedication.name}</strong> (
              {pendingDeleteMedication.id})?
            </p>

            <div className="form-actions">
              <button
                  className="btn ghost"
                  onClick={() => setPendingDeleteId(null)}
              >
                Отмена
              </button>
              <button className="btn danger" onClick={handleDeleteConfirm}>
                Удалить
              </button>
            </div>
          </article>
      )}
    </section>
)
}

export default AdminMedicationsPage