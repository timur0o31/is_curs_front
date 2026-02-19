import { useEffect, useMemo, useState } from 'react'
import DoctorDiary from '../../services/DoctorDiary'
import { getTodayIsoDate } from '../../utils/dateTime'

const DIET_OPTIONS = [
  { value: 'DIET_1', label: 'Диета 1' },
  { value: 'DIET_2', label: 'Диета 2' },
  { value: 'DIET_3', label: 'Диета 3' },
  { value: 'DIET_4', label: 'Диета 4' },
]

const getDefaultPrescriptionForm = () => ({
  medicamentId: '',
  dosage: '',
  frequency: '',
  startDate: getTodayIsoDate(),
  endDate: '',
})

const normalizePositiveInt = (value) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null
  return Math.trunc(numericValue)
}

const mapMedicaments = (items) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const id = normalizePositiveInt(item?.id)
      const name = String(item?.name ?? '').trim()
      if (id == null || !name) return null
      return { id, name }
    })
    .filter(Boolean)
    .sort((first, second) => first.name.localeCompare(second.name, 'ru'))

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 400) return 'Проверьте корректность заполнения формы.'
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для выполнения операции.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint на бэкенде.'
  return fallback
}

function PatientTreatmentCard({ selectedPatient }) {
  const selectedPatientId = useMemo(
    () => normalizePositiveInt(selectedPatient?.patientId),
    [selectedPatient?.patientId],
  )
  const selectedMedicalCardId = useMemo(
    () => normalizePositiveInt(selectedPatient?.medicalCardId),
    [selectedPatient?.medicalCardId],
  )

  const [dietValue, setDietValue] = useState('')
  const [isAssigningDiet, setIsAssigningDiet] = useState(false)
  const [dietError, setDietError] = useState('')
  const [dietSuccess, setDietSuccess] = useState('')

  const [medicaments, setMedicaments] = useState([])
  const [isMedicamentsLoading, setIsMedicamentsLoading] = useState(false)
  const [medicamentsError, setMedicamentsError] = useState('')

  const [prescriptionForm, setPrescriptionForm] = useState(getDefaultPrescriptionForm)
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false)
  const [prescriptionError, setPrescriptionError] = useState('')
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('')

  const hasSelectedPatient = selectedPatientId != null

  useEffect(() => {
    let cancelled = false

    const loadMedicaments = async () => {
      setIsMedicamentsLoading(true)
      setMedicamentsError('')

      try {
        const response = await DoctorDiary.getMedicaments()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setMedicaments(mapMedicaments(items))
      } catch (error) {
        if (cancelled) return

        setMedicaments([])
        setMedicamentsError(getErrorMessage(error, 'Не удалось загрузить список препаратов.'))
      } finally {
        if (!cancelled) {
          setIsMedicamentsLoading(false)
        }
      }
    }

    loadMedicaments()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setDietError('')
    setDietSuccess('')
    setPrescriptionError('')
    setPrescriptionSuccess('')
  }, [selectedPatientId])

  const handleDietSubmit = async (event) => {
    event.preventDefault()

    if (!hasSelectedPatient) {
      setDietError('Выберите пациента в списке слева.')
      setDietSuccess('')
      return
    }

    if (!dietValue) {
      setDietError('Выберите диету.')
      setDietSuccess('')
      return
    }

    setIsAssigningDiet(true)
    setDietError('')
    setDietSuccess('')

    try {
      await DoctorDiary.assignPatientDiet(selectedPatientId, dietValue)
      setDietSuccess(`Диета назначена: ${DIET_OPTIONS.find((item) => item.value === dietValue)?.label || dietValue}.`)
    } catch (error) {
      setDietError(getErrorMessage(error, 'Не удалось назначить диету.'))
    } finally {
      setIsAssigningDiet(false)
    }
  }

  const handlePrescriptionFieldChange = (event) => {
    const { name, value } = event.target
    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePrescriptionSubmit = async (event) => {
    event.preventDefault()

    if (!hasSelectedPatient) {
      setPrescriptionError('Выберите пациента в списке слева.')
      setPrescriptionSuccess('')
      return
    }

    const medicamentId = normalizePositiveInt(prescriptionForm.medicamentId)
    const dosage = prescriptionForm.dosage === '' ? null : normalizePositiveInt(prescriptionForm.dosage)
    const frequency = normalizePositiveInt(prescriptionForm.frequency)
    const startDate = String(prescriptionForm.startDate || '').trim()
    const endDate = String(prescriptionForm.endDate || '').trim()

    if (isMedicamentsLoading) {
      setPrescriptionError('Дождитесь загрузки списка препаратов.')
      setPrescriptionSuccess('')
      return
    }

    if (medicaments.length === 0) {
      setPrescriptionError('Справочник препаратов пуст или недоступен. Введите медикаменты в систему.')
      setPrescriptionSuccess('')
      return
    }

    if (medicamentId == null) {
      setPrescriptionError('Выберите препарат.')
      setPrescriptionSuccess('')
      return
    }

    const isKnownMedicament = medicaments.some((item) => item.id === medicamentId)
    if (!isKnownMedicament) {
      setPrescriptionError('Выбранный препарат не найден в справочнике сервера.')
      setPrescriptionSuccess('')
      return
    }

    if (frequency == null) {
      setPrescriptionError('Укажите кратность приема (раз в день).')
      setPrescriptionSuccess('')
      return
    }

    if (!startDate) {
      setPrescriptionError('Укажите дату начала.')
      setPrescriptionSuccess('')
      return
    }

    if (endDate && endDate < startDate) {
      setPrescriptionError('Дата окончания не может быть раньше даты начала.')
      setPrescriptionSuccess('')
      return
    }

    if (prescriptionForm.dosage !== '' && dosage == null) {
      setPrescriptionError('Дозировка должна быть положительным числом.')
      setPrescriptionSuccess('')
      return
    }

    setIsCreatingPrescription(true)
    setPrescriptionError('')
    setPrescriptionSuccess('')

    try {
      const payload = {
        medicamentId,
        dosage,
        frequency,
        startDate,
        endDate: endDate || null,
        ...(selectedMedicalCardId != null ? { medicalCardId: selectedMedicalCardId } : {}),
      }

      await DoctorDiary.createPrescriptionForPatient(selectedPatientId, payload)
      setPrescriptionSuccess('Назначение сохранено.')
      setPrescriptionForm((prev) => ({
        ...prev,
        dosage: '',
        frequency: '',
        endDate: '',
      }))
    } catch (error) {
      setPrescriptionError(getErrorMessage(error, 'Не удалось сохранить назначение лекарства.'))
    } finally {
      setIsCreatingPrescription(false)
    }
  }

  return (
    <>
      <article className="card doctor-treatment-card">
        <div className="diary-card-header">
          <div>
            <h3>Диета</h3>
            <p className="muted">
              Пациент: {selectedPatient?.name || 'не выбран'}
              {selectedPatientId != null ? ` · ID ${selectedPatientId}` : ''}
            </p>
          </div>
        </div>

        <form className="doctor-session-form" onSubmit={handleDietSubmit}>
          <div className="field">
            <label htmlFor="doctor-patient-diet">Диета</label>
            <select
              id="doctor-patient-diet"
              value={dietValue}
              onChange={(event) => setDietValue(event.target.value)}
              disabled={!hasSelectedPatient || isAssigningDiet}
            >
              <option value="">Выберите диету</option>
              {DIET_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {dietError ? <p className="doctor-session-feedback error">{dietError}</p> : null}
          {dietSuccess ? <p className="doctor-session-feedback success">{dietSuccess}</p> : null}
          <div className="form-actions">
            <button
              className="btn ghost small"
              type="submit"
              disabled={!hasSelectedPatient || isAssigningDiet}
            >
              {isAssigningDiet ? 'Сохраняем...' : 'Назначить диету'}
            </button>
          </div>
        </form>
      </article>

      <article className="card doctor-treatment-card">
        <div className="diary-card-header">
          <div>
            <h3>Назначение лекарства</h3>
            <p className="muted">
              Пациент: {selectedPatient?.name || 'не выбран'}
              {selectedPatientId != null ? ` · ID ${selectedPatientId}` : ''}
            </p>
          </div>
        </div>

        <form className="doctor-session-form" onSubmit={handlePrescriptionSubmit}>
          <div className="field">
            <label htmlFor="doctor-patient-medicament">Препарат</label>
            <select
              id="doctor-patient-medicament"
              name="medicamentId"
              value={prescriptionForm.medicamentId}
              onChange={handlePrescriptionFieldChange}
              disabled={!hasSelectedPatient || isCreatingPrescription || isMedicamentsLoading || medicaments.length === 0}
            >
              <option value="">
                {isMedicamentsLoading
                  ? 'Загрузка препаратов...'
                  : medicaments.length === 0
                    ? 'Нет доступных препаратов'
                    : 'Выберите препарат'}
              </option>
              {medicaments.map((item) => (
                <option key={`doctor-medicament-${item.id}`} value={String(item.id)}>
                  {item.name} (ID {item.id})
                </option>
              ))}
            </select>
            {isMedicamentsLoading ? <p className="muted">Загружаем препараты...</p> : null}
            {!isMedicamentsLoading && medicamentsError ? (
              <p className="doctor-session-feedback error">{medicamentsError}</p>
            ) : null}
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="doctor-patient-dosage">Дозировка (опционально)</label>
              <input
                id="doctor-patient-dosage"
                name="dosage"
                type="number"
                min="1"
                step="1"
                placeholder="Например, 1"
                value={prescriptionForm.dosage}
                onChange={handlePrescriptionFieldChange}
                disabled={!hasSelectedPatient || isCreatingPrescription}
              />
            </div>
            <div className="field">
              <label htmlFor="doctor-patient-frequency">Кратность приема</label>
              <input
                id="doctor-patient-frequency"
                name="frequency"
                type="number"
                min="1"
                step="1"
                placeholder="Раз в день"
                value={prescriptionForm.frequency}
                onChange={handlePrescriptionFieldChange}
                disabled={!hasSelectedPatient || isCreatingPrescription}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="doctor-patient-start-date">Дата начала</label>
              <input
                id="doctor-patient-start-date"
                name="startDate"
                type="date"
                value={prescriptionForm.startDate}
                onChange={handlePrescriptionFieldChange}
                disabled={!hasSelectedPatient || isCreatingPrescription}
              />
            </div>
            <div className="field">
              <label htmlFor="doctor-patient-end-date">Дата окончания (опционально)</label>
              <input
                id="doctor-patient-end-date"
                name="endDate"
                type="date"
                min={prescriptionForm.startDate || undefined}
                value={prescriptionForm.endDate}
                onChange={handlePrescriptionFieldChange}
                disabled={!hasSelectedPatient || isCreatingPrescription}
              />
            </div>
          </div>
          {prescriptionError ? <p className="doctor-session-feedback error">{prescriptionError}</p> : null}
          {prescriptionSuccess ? (
            <p className="doctor-session-feedback success">{prescriptionSuccess}</p>
          ) : null}
          <div className="form-actions">
            <button
              className="btn primary small"
              type="submit"
              disabled={!hasSelectedPatient || isCreatingPrescription}
            >
              {isCreatingPrescription ? 'Сохраняем...' : 'Назначить лекарство'}
            </button>
          </div>
        </form>
      </article>
    </>
  )
}

export default PatientTreatmentCard
