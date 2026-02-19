import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminProcedureForm from '../../components/forms/AdminProcedureForm'
import api from '../../config/Api.js'

const API_URL = '/procedures'

const formatOptionalLabel = (value) => (value ? 'Да' : 'Нет')

function AdminProceduresPage({ onNavigate }) {
  const [procedures, setProcedures] = useState([])
  const [selectedProcedureId, setSelectedProcedureId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    fetch(api.BASE_URL + API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
        .then((res) => {
          if (!res.ok) throw new Error()
          return res.json()
        })
        .then(setProcedures)
        .catch(() => toast.error('Ошибка загрузки процедур'))
  }, [])

  const selectedProcedure = useMemo(
      () => procedures.find((item) => String(item.id) === String(selectedProcedureId)) ?? null,
      [procedures, selectedProcedureId],
  )

  const pendingDeleteProcedure = useMemo(
      () => procedures.find((item) => String(item.id) === String(pendingDeleteId)) ?? null,
      [procedures, pendingDeleteId],
  )

  const handleSelectProcedure = (item) => {
    setSelectedProcedureId(item.id)
  }

  const handleCreate = () => {
    setFormMode('create')
    setPendingDeleteId(null)
  }

  const handleEdit = () => {
    if (!selectedProcedure) {
      toast.warn('Сначала выберите процедуру в таблице')
      return
    }
    setFormMode('edit')
    setPendingDeleteId(null)
  }

  const handleDeleteRequest = () => {
    if (!selectedProcedure) {
      toast.warn('Сначала выберите процедуру в таблице')
      return
    }
    setPendingDeleteId(selectedProcedure.id)
  }

  const handleFormCancel = () => {
    setFormMode(null)
  }

  const handleCreateSubmit = async (formData) => {
    if (!formData.name) {
      toast.warn('Укажите название процедуры')
      return
    }

    if (!formData.duration) {
      toast.warn('Укажите длительность процедуры')
      return
    }

    try {
      const res = await fetch(api.BASE_URL + API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      const createdProcedure = await res.json()

      setProcedures((prev) => [createdProcedure, ...prev])
      setSelectedProcedureId(createdProcedure.id)
      setFormMode(null)

      toast.success('Процедура добавлена')
    } catch {
      toast.error('Ошибка при создании процедуры')
    }
  }

  /* =========================
     UPDATE PROCEDURE (PUT)
     ========================= */
  const handleEditSubmit = async (formData) => {
    if (!selectedProcedure) return

    if (!formData.name) {
      toast.warn('Укажите название процедуры')
      return
    }

    if (!formData.duration) {
      toast.warn('Укажите длительность процедуры')
      return
    }

    try {
      const res = await fetch(`${api.BASE_URL + API_URL}/${selectedProcedure.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      const updatedProcedure = await res.json()

      setProcedures((prev) =>
          prev.map((item) => (item.id === updatedProcedure.id ? updatedProcedure : item)),
      )

      setFormMode(null)
      toast.success('Процедура обновлена')
    } catch {
      toast.error('Ошибка при обновлении процедуры')
    }
  }

  /* =========================
     DELETE PROCEDURE (DELETE)
     ========================= */
  const handleDeleteConfirm = async () => {
    if (!pendingDeleteProcedure) return

    try {
      const res = await fetch(`${api.BASE_URL + API_URL}/${pendingDeleteProcedure.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!res.ok) throw new Error()

      setProcedures((prev) =>
          prev.filter((item) => item.id !== pendingDeleteProcedure.id),
      )

      if (String(selectedProcedureId) === String(pendingDeleteProcedure.id)) {
        setSelectedProcedureId(null)
      }

      setPendingDeleteId(null)
      setFormMode(null)

      toast.success('Процедура удалена')
    } catch {
      toast.error('Ошибка при удалении процедуры')
    }
  }

  return (
      <section className="section dashboard" id="admin-procedures">
        <SectionHeading
            eyebrow="Администрирование"
            title="Процедуры"
            description="Список процедур и отдельная форма создания/редактирования."
        />

        <AdminNav current="admin-procedures" onNavigate={onNavigate} />

        {formMode == null && (
            <article className="card table-card">
              <div className="table-toolbar">
                <h3>Список процедур</h3>

                <div className="action-row">
                  <button className="btn primary small" onClick={handleCreate}>
                    Создать
                  </button>
                  <button
                      className="btn ghost small"
                      onClick={handleEdit}
                      disabled={!selectedProcedure}
                  >
                    Изменить
                  </button>
                  <button
                      className="btn danger small"
                      onClick={handleDeleteRequest}
                      disabled={!selectedProcedure}
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
                    <th>Базовые места</th>
                    <th>Опциональная</th>
                    <th>Длительность</th>
                  </tr>
                  </thead>
                  <tbody>
                  {procedures.length === 0 ? (
                      <tr>
                        <td colSpan={6}>Процедуры не найдены</td>
                      </tr>
                  ) : (
                      procedures.map((item) => {
                        const isSelected = String(item.id) === String(selectedProcedureId)

                        return (
                            <tr
                                key={item.id}
                                className={
                                  isSelected
                                      ? 'medication-row medication-row--selected'
                                      : 'medication-row'
                                }
                                onClick={() => handleSelectProcedure(item)}
                            >
                              <td>{item.id}</td>
                              <td>{item.name}</td>
                              <td>{item.description || '—'}</td>
                              <td>{item.defaultSeats ?? '—'}</td>
                              <td>{formatOptionalLabel(item.isOptional)}</td>
                              <td>{item.duration || '—'}</td>
                            </tr>
                        )
                      })
                  )}
                  </tbody>
                </table>
              </div>
            </article>
        )}

        {formMode === 'create' && (
            <article className="card form-card">
              <AdminProcedureForm
                  title="Новая процедура"
                  submitLabel="Сохранить процедуру"
                  onSubmit={handleCreateSubmit}
                  onCancel={handleFormCancel}
              />
            </article>
        )}

        {formMode === 'edit' && selectedProcedure && (
            <article className="card form-card">
              <AdminProcedureForm
                  initialData={selectedProcedure}
                  title="Изменить процедуру"
                  submitLabel="Сохранить изменения"
                  onSubmit={handleEditSubmit}
                  onCancel={handleFormCancel}
              />
            </article>
        )}

        {pendingDeleteProcedure && (
            <article className="card form-card">
              <h3>Удалить процедуру</h3>
              <p className="muted">
                Вы уверены, что хотите удалить <strong>{pendingDeleteProcedure.name}</strong> (
                {pendingDeleteProcedure.id})?
              </p>

              <div className="form-actions">
                <button className="btn ghost" onClick={() => setPendingDeleteId(null)}>
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

export default AdminProceduresPage
