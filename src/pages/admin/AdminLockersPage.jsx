import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminLockerForm, { createDefaultLockerForm } from '../../components/forms/AdminLockerForm'

const initialLockers = []

const buildLockerId = (items) => {
  const maxIndex = items.reduce((max, item) => {
    const match = String(item.id).match(/(\d+)/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)
  return `LOCK-${String(maxIndex + 1).padStart(3, '0')}`
}

function AdminLockersPage({ onNavigate }) {
  const [lockers, setLockers] = useState(initialLockers)
  const [selectedLockerId, setSelectedLockerId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const selectedLocker = useMemo(
    () => lockers.find((item) => String(item.id) === String(selectedLockerId)) ?? null,
    [lockers, selectedLockerId],
  )

  const pendingDeleteLocker = useMemo(
    () => lockers.find((item) => String(item.id) === String(pendingDeleteId)) ?? null,
    [lockers, pendingDeleteId],
  )

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
    setPendingDeleteId(null)
    setFormMode('edit')
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

  const handleCreateSubmit = (formData) => {
    if (!Number.isInteger(formData.lockerNumber) || formData.lockerNumber <= 0) {
      toast.warn('Укажите корректный номер шкафчика')
      return
    }

    const alreadyExists = lockers.some((item) => Number(item.lockerNumber) === Number(formData.lockerNumber))
    if (alreadyExists) {
      toast.warn('Шкафчик с таким номером уже есть')
      return
    }

    if (formData.patientId != null) {
      const patientAlreadyAssigned = lockers.some((item) => Number(item.patientId) === Number(formData.patientId))
      if (patientAlreadyAssigned) {
        toast.warn('Этот пациент уже закреплен за другим шкафчиком')
        return
      }
    }

    const createdItem = {
      ...createDefaultLockerForm(),
      ...formData,
      id: buildLockerId(lockers),
    }

    setLockers((prev) => [createdItem, ...prev])
    setSelectedLockerId(createdItem.id)
    setFormMode(null)
    toast.success('Шкафчик добавлен')
  }

  const handleEditSubmit = (formData) => {
    if (!selectedLocker) {
      toast.warn('Выберите шкафчик для изменения')
      return
    }

    if (!Number.isInteger(formData.lockerNumber) || formData.lockerNumber <= 0) {
      toast.warn('Укажите корректный номер шкафчика')
      return
    }

    const duplicateLockerNumber = lockers.some(
      (item) => item.id !== selectedLocker.id && Number(item.lockerNumber) === Number(formData.lockerNumber),
    )
    if (duplicateLockerNumber) {
      toast.warn('Шкафчик с таким номером уже есть')
      return
    }

    if (formData.patientId != null) {
      const duplicatePatient = lockers.some(
        (item) => item.id !== selectedLocker.id && Number(item.patientId) === Number(formData.patientId),
      )
      if (duplicatePatient) {
        toast.warn('Этот пациент уже закреплен за другим шкафчиком')
        return
      }
    }

    setLockers((prev) =>
      prev.map((item) =>
        item.id === selectedLocker.id
          ? {
              ...item,
              ...formData,
            }
          : item,
      ),
    )
    setFormMode(null)
    toast.success('Шкафчик обновлен')
  }

  const handleDeleteConfirm = () => {
    if (!pendingDeleteLocker) return

    setLockers((prev) => prev.filter((item) => item.id !== pendingDeleteLocker.id))
    if (String(selectedLockerId) === String(pendingDeleteLocker.id)) {
      setSelectedLockerId(null)
    }
    setPendingDeleteId(null)
    setFormMode(null)
    toast.success('Шкафчик удален')
  }

  return (
    <section className="section dashboard" id="admin-lockers">
      <SectionHeading
        eyebrow="Администрирование"
        title="Шкафчики"
        description="Управление списком шкафчиков: добавление, изменение и удаление."
      />
      <AdminNav current="admin-lockers" onNavigate={onNavigate} />

      {formMode == null ? (
        <article className="card table-card">
          <div className="table-toolbar">
            <div>
              <h3>Список шкафчиков</h3>
            </div>
            <div className="action-row">
              <button className="btn primary small" type="button" onClick={handleCreate}>
                Создать
              </button>
              <button className="btn ghost small" type="button" onClick={handleEdit} disabled={!selectedLocker}>
                Изменить
              </button>
              <button
                className="btn danger small"
                type="button"
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
                        className={isSelected ? 'medication-row medication-row--selected' : 'medication-row'}
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
      ) : null}

      {formMode === 'create' ? (
        <article className="card form-card">
          <AdminLockerForm
            key="create"
            title="Новый шкафчик"
            description="Форма соответствует модели Locker из backend."
            submitLabel="Сохранить шкафчик"
            onSubmit={handleCreateSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {formMode === 'edit' ? (
        <article className="card form-card">
          <AdminLockerForm
            initialData={selectedLocker}
            title="Изменить шкафчик"
            description={
              selectedLocker
                ? `Редактирование шкафчика ${selectedLocker.lockerNumber} (${selectedLocker.id})`
                : ''
            }
            submitLabel="Сохранить изменения"
            onSubmit={handleEditSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {pendingDeleteLocker ? (
        <article className="card form-card">
          <div>
            <h3>Удалить шкафчик</h3>
            <p className="muted">
              Вы уверены, что хотите удалить шкафчик <strong>{pendingDeleteLocker.lockerNumber}</strong> (
              {pendingDeleteLocker.id})?
            </p>
          </div>
          <div className="form-actions">
            <button className="btn ghost" type="button" onClick={() => setPendingDeleteId(null)}>
              Отмена
            </button>
            <button className="btn danger" type="button" onClick={handleDeleteConfirm}>
              Удалить
            </button>
          </div>
        </article>
      ) : null}
    </section>
  )
}

export default AdminLockersPage
