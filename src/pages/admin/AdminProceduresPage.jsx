import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import AdminNav from '../../components/admin/AdminNav'
import SectionHeading from '../../components/SectionHeading'
import AdminProcedureForm, { createDefaultProcedureForm } from '../../components/forms/AdminProcedureForm'

const initialProcedures = []

const buildProcedureId = (items) => {
  const maxIndex = items.reduce((max, item) => {
    const match = String(item.id).match(/(\d+)/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0)
  return `PROC-${String(maxIndex + 1).padStart(3, '0')}`
}

const formatOptionalLabel = (value) => (value ? 'Да' : 'Нет')

function AdminProceduresPage({ onNavigate }) {
  const [procedures, setProcedures] = useState(initialProcedures)
  const [selectedProcedureId, setSelectedProcedureId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

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
    setPendingDeleteId(null)
    setFormMode('edit')
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

  const handleCreateSubmit = (formData) => {
    if (!formData.name) {
      toast.warn('Укажите название процедуры')
      return
    }

    if (!formData.duration) {
      toast.warn('Укажите длительность процедуры')
      return
    }

    const createdItem = {
      ...createDefaultProcedureForm(),
      ...formData,
      id: buildProcedureId(procedures),
    }

    setProcedures((prev) => [createdItem, ...prev])
    setSelectedProcedureId(createdItem.id)
    setFormMode(null)
    toast.success('Процедура добавлена')
  }

  const handleEditSubmit = (formData) => {
    if (!selectedProcedure) {
      toast.warn('Выберите процедуру для изменения')
      return
    }

    if (!formData.name) {
      toast.warn('Укажите название процедуры')
      return
    }

    if (!formData.duration) {
      toast.warn('Укажите длительность процедуры')
      return
    }

    setProcedures((prev) =>
      prev.map((item) =>
        item.id === selectedProcedure.id
          ? {
              ...item,
              ...formData,
            }
          : item,
      ),
    )
    setFormMode(null)
    toast.success('Процедура обновлена')
  }

  const handleDeleteConfirm = () => {
    if (!pendingDeleteProcedure) return

    setProcedures((prev) => prev.filter((item) => item.id !== pendingDeleteProcedure.id))
    if (String(selectedProcedureId) === String(pendingDeleteProcedure.id)) {
      setSelectedProcedureId(null)
    }
    setPendingDeleteId(null)
    setFormMode(null)
    toast.success('Процедура удалена')
  }

  return (
    <section className="section dashboard" id="admin-procedures">
      <SectionHeading
        eyebrow="Администрирование"
        title="Процедуры"
        description="Список процедур и отдельная форма создания/редактирования."
      />
      <AdminNav current="admin-procedures" onNavigate={onNavigate} />

      {formMode == null ? (
        <article className="card table-card">
          <div className="table-toolbar">
            <div>
              <h3>Список процедур</h3>
            </div>
            <div className="action-row">
              <button className="btn primary small" type="button" onClick={handleCreate}>
                Создать
              </button>
              <button className="btn ghost small" type="button" onClick={handleEdit} disabled={!selectedProcedure}>
                Изменить
              </button>
              <button
                className="btn danger small"
                type="button"
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
                        className={isSelected ? 'medication-row medication-row--selected' : 'medication-row'}
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
      ) : null}

      {formMode === 'create' ? (
        <article className="card form-card">
          <AdminProcedureForm
            key="create"
            title="Новая процедура"
            description="Форма соответствует модели Procedure из backend."
            submitLabel="Сохранить процедуру"
            onSubmit={handleCreateSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {formMode === 'edit' ? (
        <article className="card form-card">
          <AdminProcedureForm
            initialData={selectedProcedure}
            title="Изменить процедуру"
            description={
              selectedProcedure
                ? `Редактирование: ${selectedProcedure.name} (${selectedProcedure.id})`
                : 'Выберите процедуру в списке.'
            }
            submitLabel="Сохранить изменения"
            onSubmit={handleEditSubmit}
            onCancel={handleFormCancel}
          />
        </article>
      ) : null}

      {pendingDeleteProcedure ? (
        <article className="card form-card">
          <div>
            <h3>Удалить процедуру</h3>
            <p className="muted">
              Вы уверены, что хотите удалить <strong>{pendingDeleteProcedure.name}</strong> (
              {pendingDeleteProcedure.id})?
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

export default AdminProceduresPage
