import { useEffect, useMemo, useState } from 'react'
import PatientTreatmentCard from '../components/doctor-diary/PatientTreatmentCard'
import DoctorDiaryNoteForm from '../components/forms/DoctorDiaryNoteForm'
import SectionHeading from '../components/SectionHeading'
import DoctorDiary from '../services/DoctorDiary'
import { mapActivePatients, normalizePositiveInt } from './doctorSessions/utils'

const DOCTOR_DIARY_PREFIX = '[DOCTOR]'
const PATIENT_DIARY_PREFIX = '[PATIENT]'

const parseDiaryComment = (rawComment) => {
  const comment = String(rawComment ?? '').trim()
  if (!comment) return null

  if (comment.startsWith(DOCTOR_DIARY_PREFIX)) {
    const text = comment.slice(DOCTOR_DIARY_PREFIX.length).trim()
    return {
      author: 'doctor',
      text: text || comment,
    }
  }

  if (comment.startsWith(PATIENT_DIARY_PREFIX)) {
    const text = comment.slice(PATIENT_DIARY_PREFIX.length).trim()
    return {
      author: 'patient',
      text: text || comment,
    }
  }

  return {
    author: 'unknown',
    text: comment,
  }
}

const mapDiaryEntries = (items) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const parsedComment = parseDiaryComment(item?.comment)
      if (!parsedComment) return null

      return {
        id: item?.id ?? `diary-${index}`,
        text: parsedComment.text,
        author: parsedComment.author,
      }
    })
    .filter(Boolean)
    .sort((first, second) => String(second.id).localeCompare(String(first.id), 'ru', { numeric: true }))

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для просмотра дневников.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint на бэкенде.'
  return fallback
}

function DoctorDiaryPage({ onNavigate }) {
  const role = String(localStorage.getItem('role') || '').toUpperCase()
  const accessToken = localStorage.getItem('accessToken')
  const shouldCheckDoctorStatus = role === 'DOCTOR' && Boolean(accessToken)

  const [isCheckingDoctorStatus, setIsCheckingDoctorStatus] = useState(shouldCheckDoctorStatus)
  const [isApprovedDoctor, setIsApprovedDoctor] = useState(true)

  const [observedPatients, setObservedPatients] = useState([])
  const [isObservedPatientsLoading, setIsObservedPatientsLoading] = useState(false)
  const [observedPatientsError, setObservedPatientsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [diaryEntries, setDiaryEntries] = useState([])
  const [isDiaryLoading, setIsDiaryLoading] = useState(false)
  const [diaryError, setDiaryError] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [saveCommentError, setSaveCommentError] = useState('')
  const [saveCommentSuccess, setSaveCommentSuccess] = useState('')

  const activePatientsWithId = useMemo(
    () => observedPatients.filter((item) => item.patientId != null),
    [observedPatients],
  )

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return activePatientsWithId

    return activePatientsWithId.filter((item) => item.name.toLowerCase().includes(query))
  }, [activePatientsWithId, searchQuery])

  const selectedPatient = useMemo(
    () =>
      activePatientsWithId.find((item) => String(item.patientId) === String(selectedPatientId)) ||
      null,
    [activePatientsWithId, selectedPatientId],
  )

  useEffect(() => {
    setSaveCommentError('')
    setSaveCommentSuccess('')
  }, [selectedPatient?.patientId])

  useEffect(() => {
    let cancelled = false

    if (!shouldCheckDoctorStatus) {
      setIsCheckingDoctorStatus(false)
      setIsApprovedDoctor(true)
      return () => {
        cancelled = true
      }
    }

    const loadDoctorStatus = async () => {
      setIsCheckingDoctorStatus(true)

      try {
        const response = await DoctorDiary.getDashboard()

        if (cancelled) return

        setIsApprovedDoctor(response?.data === true)
      } catch {
        if (cancelled) return

        setIsApprovedDoctor(false)
      } finally {
        if (!cancelled) {
          setIsCheckingDoctorStatus(false)
        }
      }
    }

    loadDoctorStatus()

    return () => {
      cancelled = true
    }
  }, [shouldCheckDoctorStatus])

  useEffect(() => {
    let cancelled = false

    const loadObservedPatients = async () => {
      if (!shouldCheckDoctorStatus || isCheckingDoctorStatus || !isApprovedDoctor) {
        if (!cancelled) {
          setObservedPatients([])
          setObservedPatientsError('')
          setIsObservedPatientsLoading(false)
        }
        return
      }

      setIsObservedPatientsLoading(true)
      setObservedPatientsError('')

      try {
        const response = await DoctorDiary.getActivePatients()
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setObservedPatients(mapActivePatients(items))
      } catch (error) {
        if (!cancelled) {
          setObservedPatients([])
          setObservedPatientsError(
            getErrorMessage(error, 'Не удалось загрузить пациентов с активным проживанием.'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsObservedPatientsLoading(false)
        }
      }
    }

    loadObservedPatients()

    return () => {
      cancelled = true
    }
  }, [isApprovedDoctor, isCheckingDoctorStatus, shouldCheckDoctorStatus])

  useEffect(() => {
    if (filteredPatients.length === 0) {
      if (selectedPatientId) {
        setSelectedPatientId('')
      }
      return
    }

    const isSelectedPresent = filteredPatients.some(
      (item) => String(item.patientId) === String(selectedPatientId),
    )

    if (!isSelectedPresent) {
      setSelectedPatientId(String(filteredPatients[0].patientId))
    }
  }, [filteredPatients, selectedPatientId])

  useEffect(() => {
    let cancelled = false

    const loadDiary = async () => {
      if (
        !shouldCheckDoctorStatus ||
        isCheckingDoctorStatus ||
        !isApprovedDoctor ||
        selectedPatient?.patientId == null
      ) {
        if (!cancelled) {
          setDiaryEntries([])
          setDiaryError('')
          setIsDiaryLoading(false)
        }
        return
      }

      setIsDiaryLoading(true)
      setDiaryError('')

      try {
        const response = await DoctorDiary.getPatientDiary(selectedPatient.patientId)
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setDiaryEntries(mapDiaryEntries(items))
      } catch (error) {
        if (!cancelled) {
          setDiaryEntries([])
          setDiaryError(getErrorMessage(error, 'Не удалось загрузить дневник пациента.'))
        }
      } finally {
        if (!cancelled) {
          setIsDiaryLoading(false)
        }
      }
    }

    loadDiary()

    return () => {
      cancelled = true
    }
  }, [isApprovedDoctor, isCheckingDoctorStatus, selectedPatient?.patientId, shouldCheckDoctorStatus])

  const showPendingApproval = shouldCheckDoctorStatus && !isCheckingDoctorStatus && !isApprovedDoctor

  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('doctor')
  }

  const handleOpenSessions = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('doctor-sessions')
  }

  const handleSubmitDoctorComment = async (rawComment) => {
    const patientId = normalizePositiveInt(selectedPatient?.patientId)

    if (patientId == null) {
      setSaveCommentError('Сначала выберите пациента из списка.')
      setSaveCommentSuccess('')
      return false
    }

    const comment = String(rawComment ?? '').trim()

    if (!comment) {
      setSaveCommentError('Комментарий не может быть пустым.')
      setSaveCommentSuccess('')
      return false
    }

    setIsSavingComment(true)
    setSaveCommentError('')
    setSaveCommentSuccess('')

    try {
      const payloadComment = comment.startsWith(DOCTOR_DIARY_PREFIX)
        ? comment
        : `${DOCTOR_DIARY_PREFIX} ${comment}`
      const response = await DoctorDiary.addCommentForPatient(patientId, payloadComment)
      const createdEntries = mapDiaryEntries([response?.data])

      if (createdEntries[0]) {
        setDiaryEntries((prev) => {
          const merged = [createdEntries[0], ...prev]
          const uniqueById = new Map(merged.map((item) => [String(item.id), item]))
          return [...uniqueById.values()]
        })
      }

      setSaveCommentSuccess('Комментарий сохранен в дневнике пациента.')
      return true
    } catch (error) {
      setSaveCommentError(getErrorMessage(error, 'Не удалось сохранить комментарий врача.'))
      return false
    } finally {
      setIsSavingComment(false)
    }
  }

  if (isCheckingDoctorStatus) {
    return (
      <section className="section diary doctor-diary" id="doctor-diary">
        <SectionHeading
          eyebrow="Дневники пациентов"
          title="Проверяем доступ к дневникам"
          description="Идет проверка статуса учетной записи врача."
        />
      </section>
    )
  }

  if (showPendingApproval) {
    return (
      <section className="section diary doctor-diary" id="doctor-diary">
        <SectionHeading
          eyebrow="Дневники пациентов"
          title="Дождитесь одобрения администратора"
          description="После активации учетной записи откроется доступ к дневникам пациентов."
        />
      </section>
    )
  }

  return (
    <section className="section diary doctor-diary" id="doctor-diary">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Дневники активных пациентов"
          title="Следите за динамикой и оставляйте рекомендации"
          description="Здесь отображаются записи пациентов с активным проживанием под вашим наблюдением."
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=doctor" onClick={handleBack}>
            К кабинету врача
          </a>
          <a className="btn primary" href="?page=doctor-sessions" onClick={handleOpenSessions}>
            К расписанию
          </a>
        </div>
      </div>
      <div className="diary-grid diary-grid--doctor">
        <div className="diary-stack">
          <aside className="card patient-list">
            <div className="patient-list-header">
              <div>
                <h3>Активные пациенты</h3>
                <p className="muted">{activePatientsWithId.length} доступны для просмотра дневников.</p>
              </div>
              <span className="pill">Под наблюдением</span>
            </div>
            <input
              className="filter-input"
              type="text"
              placeholder="Поиск по имени"
              aria-label="Поиск пациента"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {isObservedPatientsLoading ? (
              <p className="muted">Загружаем пациентов...</p>
            ) : observedPatientsError ? (
              <p className="doctor-session-feedback error">{observedPatientsError}</p>
            ) : observedPatients.length === 0 ? (
              <p className="muted">Сейчас нет пациентов с активным проживанием.</p>
            ) : activePatientsWithId.length === 0 ? (
              <p className="muted">Не удалось определить идентификаторы пациентов в ответе сервера.</p>
            ) : filteredPatients.length === 0 ? (
              <p className="muted">По вашему запросу пациентов не найдено.</p>
            ) : (
              <div className="patient-cards">
                {filteredPatients.map((patient) => {
                  const isActive = String(patient.patientId) === String(selectedPatientId)

                  return (
                    <button
                      className={`patient-card${isActive ? ' patient-card--active' : ''}`}
                      type="button"
                      key={patient.id}
                      onClick={() => setSelectedPatientId(String(patient.patientId))}
                    >
                      <div>
                        <strong>{patient.name}</strong>
                        <p className="muted">ID пациента: {patient.patientId}</p>
                      </div>
                      <span className="status">{patient.status}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </aside>
          <DoctorDiaryNoteForm
            selectedPatient={selectedPatient}
            onSubmitComment={handleSubmitDoctorComment}
            isSubmitting={isSavingComment}
            submitError={saveCommentError}
            submitSuccess={saveCommentSuccess}
            disabled={selectedPatient?.patientId == null}
          />
        </div>
        <div className="diary-stack">
          <article className="card patient-summary">
            <div className="patient-summary-header">
              <div>
                <span className="eyebrow">Выбранный пациент</span>
                <h3>{selectedPatient?.name || 'Пациент не выбран'}</h3>
                <p className="muted">
                  {selectedPatient
                    ? `ID пациента: ${selectedPatient.patientId}`
                    : 'Выберите пациента в списке слева'}
                </p>
              </div>
              <div className="diary-chips">
                <span className="chip chip--neutral">Активное проживание</span>
              </div>
            </div>
          </article>
          <article className="card diary-card">
            <div className="diary-card-header">
              <div>
                <h3>Записи дневника</h3>
                <p className="muted">Последние комментарии из дневника пациента.</p>
              </div>
            </div>
            {selectedPatient == null ? (
              <p className="muted">Выберите пациента, чтобы увидеть его записи.</p>
            ) : isDiaryLoading ? (
              <p className="muted">Загружаем дневник...</p>
            ) : diaryError ? (
              <p className="muted">{diaryError}</p>
            ) : diaryEntries.length === 0 ? (
              <p className="muted">У выбранного пациента пока нет записей в дневнике.</p>
            ) : (
              <div className="diary-entries">
                {diaryEntries.map((entry, index) => (
                  <article
                    className={`card diary-entry${index === 0 ? ' diary-entry--today' : ''}`}
                    key={entry.id}
                  >
                    <div className="diary-entry-header">
                      <div>
                        <span className="diary-date">Запись дневника</span>
                        <h3>Запись #{entry.id}</h3>
                      </div>
                      <div className="diary-chips">
                        <span className="chip chip--neutral">
                          {entry.author === 'doctor'
                            ? 'Врач'
                            : entry.author === 'patient'
                              ? 'Пациент'
                              : 'Комментарий'}
                        </span>
                      </div>
                    </div>
                    <p className="muted">{entry.text}</p>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>
        <div className="diary-stack">
          <PatientTreatmentCard selectedPatient={selectedPatient} />
        </div>
      </div>
    </section>
  )
}

export default DoctorDiaryPage
