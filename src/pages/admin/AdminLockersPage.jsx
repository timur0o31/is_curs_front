import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminLockerForm from '../../components/forms/AdminLockerForm'
import api from "../../config/Api.js";

const API_URL = '/lockers'

function AdminLockersPage({ onNavigate }) {
  const [lockers, setLockers] = useState([])
  const [selectedLockerId, setSelectedLockerId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    fetch(api.BASE_URL + API_URL, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    })
        .then((res) => {
          if (!res.ok) throw new Error()
          return res.json()
        })
        .then(setLockers)
        .catch(() => toast.error('Ошибка загрузки шкафчиков'))
  }, [])

  const selectedLocker = useMemo(
      () => lockers.find((item) => String(item.id) === String(selectedLockerId)) ?? null,
      [lockers, selectedLockerId],
  )

  const pendingDeleteLocker = useMemo(
      () => lockers.find((item) => String(item.id) === String(pendingDeleteId)) ?? null,
      [lockers, pendingDeleteId],
  )

  /* =========================
     HANDLERS
     ========================= */
  const handleSelectLocker = (item) => {
    setSelectedLockerId(item.id)
  }

  const handleCreate = () => {
    setFormMode('create')
    setPendingDeleteId(null)
  }

  const handleEdit = () => {
    if (!selectedLocker) {
      toast.warn('Сначала выберите шкафчик в таблице')
      return
    }
    setFormMode('edit')
    setPendingDeleteId(null)
  }

  const handleDeleteRequest = () => {
    if (!selectedLocker) {
      toast.warn('Сначала выберите шкафчик в таблице')
      return
    }
    setPendingDeleteId(selectedLocker.id)
  }

  const handleFormCancel = () => {
    setFormMode(null)
  }

  /* =========================
     CREATE LOCKER (POST)
     ========================= */
  const handleCreateSubmit = async (formData) => {
    if (!Number.isInteger(formData.lockerNumber) || formData.lockerNumber <= 0) {
      toast.warn('Укажите корректный номер шкафчика')
      return
    }

    if (formData.patientId != null) {
      const patientAlreadyAssigned = lockers.some(
          (item) => Number(item.patientId) === Number(formData.patientId),
      )
      if (patientAlreadyAssigned) {
        toast.warn('Этот пациент уже закреплен за другим шкафчиком')
        return
      }
    }

    try {
      const res = await fetch(api.BASE_URL + API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      const createdLocker = await res.json()

      setLockers((prev) => [createdLocker, ...prev])
      setSelectedLockerId(createdLocker.id)
      setFormMode(null)

      toast.success('Шкафчик добавлен')
    } catch {
      toast.error('Ошибка при создании шкафчика')
    }
  }

  /* =========================
     DELETE LOCKER (DELETE)
     ========================= */
  const handleDeleteConfirm = async () => {
    if (!pendingDeleteLocker) return

    try {
      const res = await fetch(`${api.BASE_URL + API_URL}/${pendingDeleteLocker.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      })

      if (!res.ok) throw new Error()

      setLockers((prev) => prev.filter((item) => item.id !== pendingDeleteLocker.id))

      if (String(selectedLockerId) === String(pendingDeleteLocker.id)) {
        setSelectedLockerId(null)
      }

      setPendingDeleteId(null)
      setFormMode(null)

      toast.success('Шкафчик удален')
    } catch {
      toast.error('Ошибка при удалении шкафчика')
    }
  }

  return (
      <section className="section dashboard" id="admin-lockers">
        <SectionHeading
            eyebrow="Администрирование"
            title="Шкафчики"
            description="Управление списком шкафчиков: добавление, изменение и удаление."
        />

        <AdminNav current="admin-lockers" onNavigate={onNavigate} />

        {formMode == null && (
            <article className="card table-card">
              <div className="table-toolbar">
                <h3>Список шкафчиков</h3>

                <div className="action-row">
                  <button className="btn primary small" onClick={handleCreate}>
                    Создать
                  </button>
                  <button
                      className="btn ghost small"
                      onClick={handleEdit}
                      disabled={!selectedLocker}
                  >
                    Изменить
                  </button>
                  <button
                      className="btn danger small"
                      onClick={handleDeleteRequest}
                      disabled={!selectedLocker}
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
                    <th>Номер шкафчика</th>
                    <th>ID пациента</th>
                  </tr>
                  </thead>
                  <tbody>
                  {lockers.length === 0 ? (
                      <tr>
                        <td colSpan={3}>Шкафчики не найдены</td>
                      </tr>
                  ) : (
                      lockers.map((item) => {
                        const isSelected = String(item.id) === String(selectedLockerId)

                        return (
                            <tr
                                key={item.id}
                                className={
                                  isSelected
                                      ? 'medication-row medication-row--selected'
                                      : 'medication-row'
                                }
                                onClick={() => handleSelectLocker(item)}
                            >
                              <td>{item.id}</td>
                              <td>{item.lockerNumber}</td>
                              <td>{item.patientId ?? '—'}</td>
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
              <AdminLockerForm
                  title="Новый шкафчик"
                  submitLabel="Сохранить шкафчик"
                  onSubmit={handleCreateSubmit}
                  onCancel={handleFormCancel}
              />
            </article>
        )}

        {formMode === 'edit' && selectedLocker && (
            <article className="card form-card">
              <AdminLockerForm
                  initialData={selectedLocker}
                  title="Изменить шкафчик"
                  submitLabel="Сохранить изменения"
                  onSubmit={() => toast.info('PUT /lockers пока не реализован')}
                  onCancel={handleFormCancel}
              />
            </article>
        )}

        {pendingDeleteLocker && (
            <article className="card form-card">
              <h3>Удалить шкафчик</h3>
              <p className="muted">
                Удалить шкафчик <strong>{pendingDeleteLocker.lockerNumber}</strong> (
                {pendingDeleteLocker.id})?
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

export default AdminLockersPage
