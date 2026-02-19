import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminMedicationForm, { createDefaultMedicationForm } from '../../components/forms/AdminMedicationForm'

const initialMedications = [
]

const buildMedicationId = (items) => {
  const maxIndex = items.reduce((max, item) => {
    const match = String(item.id).match(/(\d+)/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)
  return `MED-${String(maxIndex + 1).padStart(3, '0')}`
}

function AdminMedicationsPage({ onNavigate }) {
  const [medications, setMedications] = useState(initialMedications)
  const [selectedMedicationId, setSelectedMedicationId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  const selectedMedication = useMemo(
    () => medications.find((item) => String(item.id) === String(selectedMedicationId)) ?? null,
    [medications, selectedMedicationId],
  )

  const pendingDeleteMedication = useMemo(
    () => medications.find((item) => String(item.id) === String(pendingDeleteId)) ?? null,
    [medications, pendingDeleteId],
  )

  const handleSelectMedication = (item) => {
    setSelectedMedicationId(item.id)
  }

  const handleCreate = () => {
    setFormMode('create')
    setPendingDeleteId(null)
  }

  const handleEdit = () => {
    if (!selectedMedication) {
      toast.warn('Сначала выберите медикамент в таблице')
      return
    }
    setPendingDeleteId(null)
    setFormMode('edit')
  }

  const handleDeleteRequest = () => {
    if (!selectedMedication) {
      toast.warn('Сначала выберите медикамент в таблице')
      return
    }
    setPendingDeleteId(selectedMedication.id)
  }

  const handleFormCancel = () => {
    setFormMode(null)
  }

  const handleCreateSubmit = (formData) => {
    if (!formData.name) {
      toast.warn('Укажите название медикамента')
      return
    }

    const createdItem = {
      ...createDefaultMedicationForm(),
      ...formData,
      id: buildMedicationId(medications),
    }

    setMedications((prev) => [createdItem, ...prev])
    setSelectedMedicationId(createdItem.id)
    setFormMode(null)
    toast.success('Медикамент добавлен')
  }

  const handleEditSubmit = (formData) => {
    if (!selectedMedication) {
      toast.warn('Выберите медикамент для изменения')
      return
    }

    if (!formData.name) {
      toast.warn('Укажите название медикамента')
      return
    }

    setMedications((prev) =>
      prev.map((item) =>
        item.id === selectedMedication.id
          ? {
              ...item,
              ...formData,
            }
          : item,
      ),
    )
    setFormMode(null)
    toast.success('Медикамент обновлен')
  }

  const handleDeleteConfirm = () => {
    if (!pendingDeleteMedication) return

    setMedications((prev) => prev.filter((item) => item.id !== pendingDeleteMedication.id))
    if (String(selectedMedicationId) === String(pendingDeleteMedication.id)) {
      setSelectedMedicationId(null)
    }
    setPendingDeleteId(null)
    setFormMode(null)
    toast.success('Медикамент удален')
  }

  return (
    <section className="section dashboard" id="admin-medications">
      <SectionHeading
        eyebrow="Администрирование"
        title="Медикаменты"
        description="Список препаратов в стиле админ-таблиц, форма вынесена отдельно."
      />
      <AdminNav current="admin-medications" onNavigate={onNavigate} />

      {formMode == null ? (
        <article className="card table-card">
          <div className="table-toolbar">
            <div>
              <h3>Список медикаментов</h3>
            </div>
            <div className="action-row">
              <button className="btn primary small" type="button" onClick={handleCreate}>
                Создать
              </button>
              <button className="btn ghost small" type="button" onClick={handleEdit} disabled={!selectedMedication}>
                Изменить
              </button>
              <button
                className="btn danger small"
                type="button"
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
                {medications.length === 0 ? (
                  <tr>
                    <td colSpan={3}>Медикаменты не найдены</td>
                  </tr>
                ) : (
                  medications.map((item) => {
                    const isSelected = String(item.id) === String(selectedMedicationId)
                    return (
                      <tr
                        key={item.id}
                        className={isSelected ? 'medication-row medication-row--selected' : 'medication-row'}
                        onClick={() => handleSelectMedication(item)}
                      >
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.notes || '—'}</td>
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
          <AdminMedicationForm
            key="create"
            title="Новый медикамент"
            description="Поля формы оставлены как были."
            submitLabel="Сохранить медикамент"
            onSubmit={handleCreateSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {formMode === 'edit' ? (
        <article className="card form-card">
          <AdminMedicationForm
            initialData={selectedMedication}
            title="Изменить медикамент"
            description={
              selectedMedication
                ? `Редактирование: ${selectedMedication.name} (${selectedMedication.id})`
                : 'Выберите медикамент в списке.'
            }
            submitLabel="Сохранить изменения"
            onSubmit={handleEditSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {pendingDeleteMedication ? (
        <article className="card form-card">
          <div>
            <h3>Удалить медикамент</h3>
            <p className="muted">
              Вы уверены, что хотите удалить <strong>{pendingDeleteMedication.name}</strong> (
              {pendingDeleteMedication.id})?
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

export default AdminMedicationsPage
