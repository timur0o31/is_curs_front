import { useEffect, useMemo, useState } from 'react'
import DiaryEntryForm from '../components/forms/DiaryEntryForm'
import SectionHeading from '../components/SectionHeading'
import PatientDiary from '../services/PatientDiary'

const DOCTOR_DIARY_PREFIX = '[DOCTOR]'
const PATIENT_DIARY_PREFIX = '[PATIENT]'

const normalizePositiveInt = (value) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null
  return Math.trunc(numericValue)
}

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status
  if (status === 401) return 'Сессия авторизации истекла. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для работы с дневником.'
  if (status === 404) return 'Метод не найден на сервере. Проверьте endpoint на бэкенде.'
  return fallback
}

const extractMedicalCardId = (value) => {
  if (!value || typeof value !== 'object') return null
  return normalizePositiveInt(value?.id ?? value?.medicalCardId ?? null)
}

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
      const id = item?.id ?? `entry-${index}`
      const parsedComment = parseDiaryComment(item?.comment)
      if (!parsedComment) return null

      return {
        id,
        comment: parsedComment.text,
        author: parsedComment.author,
      }
    })
    .filter(Boolean)
    .sort((first, second) => {
      const firstId = Number(first.id)
      const secondId = Number(second.id)

      if (Number.isFinite(firstId) && Number.isFinite(secondId)) {
        return secondId - firstId
      }

      return String(second.id).localeCompare(String(first.id), 'ru', { numeric: true })
    })

function PatientDiaryPage({ onNavigate }) {
  const [medicalCardId, setMedicalCardId] = useState(null)
  const [isResolvingMedicalCard, setIsResolvingMedicalCard] = useState(true)
  const [medicalCardError, setMedicalCardError] = useState('')

  const [diaryEntries, setDiaryEntries] = useState([])
  const [isDiaryLoading, setIsDiaryLoading] = useState(false)
  const [diaryError, setDiaryError] = useState('')

  const [isCreatingEntry, setIsCreatingEntry] = useState(false)
  const [createEntryError, setCreateEntryError] = useState('')
  const [createEntrySuccess, setCreateEntrySuccess] = useState('')

  const summaryMetrics = useMemo(() => {
    const lastEntry = diaryEntries[0] ? `#${diaryEntries[0].id}` : '—'
    const syncStatus = isResolvingMedicalCard || isDiaryLoading ? 'Синхронизация...' : 'Актуально'

    return [
      { label: 'Записей всего', value: String(diaryEntries.length) },
      { label: 'Последняя запись', value: lastEntry },
      { label: 'Статус', value: syncStatus },
    ]
  }, [diaryEntries, isDiaryLoading, isResolvingMedicalCard, medicalCardId])

  const handleBack = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('patient')
  }

  useEffect(() => {
    let cancelled = false

    const resolveMedicalCardId = async () => {
      setIsResolvingMedicalCard(true)
      setMedicalCardError('')

      try {
        const response = await PatientDiary.getMyMedicalCard()
        const resolvedMedicalCardId = extractMedicalCardId(response?.data)

        if (!cancelled) {
          if (resolvedMedicalCardId == null) {
            setMedicalCardId(null)
            setMedicalCardError(
              'Бэкенд вернул неожиданный формат /api/medical-cards/my. Ожидается MedicalCardDto с полем id.',
            )
          } else {
            setMedicalCardId(resolvedMedicalCardId)
            setMedicalCardError('')
          }
        }
      } catch (error) {
        if (!cancelled) {
          setMedicalCardId(null)
          setMedicalCardError(getErrorMessage(error, 'Не удалось загрузить медицинскую карту.'))
        }
      }
    }

    resolveMedicalCardId()
      .catch(() => {
        if (!cancelled) {
          setMedicalCardId(null)
          setMedicalCardError('Не удалось определить медицинскую карту пациента.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolvingMedicalCard(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadDiaryEntries = async () => {
      if (medicalCardId == null) {
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
        const response = await PatientDiary.getEntriesByMedicalCardId(medicalCardId)
        const items = Array.isArray(response?.data) ? response.data : []

        if (cancelled) return

        setDiaryEntries(mapDiaryEntries(items))
      } catch (error) {
        if (!cancelled) {
          setDiaryEntries([])
          setDiaryError(getErrorMessage(error, 'Не удалось загрузить записи дневника.'))
        }
      } finally {
        if (!cancelled) {
          setIsDiaryLoading(false)
        }
      }
    }

    loadDiaryEntries()

    return () => {
      cancelled = true
    }
  }, [medicalCardId])

  const handleCreateEntry = async ({ comment }) => {
    if (medicalCardId == null) {
      setCreateEntryError('Не удалось определить медкарту. Сохранение записи недоступно.')
      setCreateEntrySuccess('')
      return false
    }

    const normalizedComment = String(comment ?? '').trim()
    if (!normalizedComment) {
      setCreateEntryError('Запись не может быть пустой.')
      setCreateEntrySuccess('')
      return false
    }

    setIsCreatingEntry(true)
    setCreateEntryError('')
    setCreateEntrySuccess('')

    try {
      const payloadComment = normalizedComment.startsWith(PATIENT_DIARY_PREFIX)
        ? normalizedComment
        : `${PATIENT_DIARY_PREFIX} ${normalizedComment}`
      const response = await PatientDiary.createEntryForMedicalCard(medicalCardId, payloadComment)

      const createdEntries = mapDiaryEntries([response?.data])
      if (createdEntries[0]) {
        setDiaryEntries((prev) => {
          const next = [createdEntries[0], ...prev]
          const uniqueById = new Map(next.map((item) => [String(item.id), item]))
          return [...uniqueById.values()]
        })
      }

      setCreateEntrySuccess('Запись в дневник сохранена.')
      return true
    } catch (error) {
      setCreateEntryError(getErrorMessage(error, 'Не удалось сохранить запись в дневник.'))
      return false
    } finally {
      setIsCreatingEntry(false)
    }
  }

  return (
    <section className="section diary" id="patient-diary">
      <div className="diary-header">
        <SectionHeading
          eyebrow="Дневник состояния здоровья"
          title="Фиксируйте изменения самочувствия и делитесь ими с врачом"
          description="Записи помогают корректировать план лечения и отслеживать динамику."
        />
        <div className="action-row">
          <a className="btn ghost" href="?page=patient" onClick={handleBack}>
            В кабинет
          </a>
        </div>
      </div>
      <div className="summary-grid">
        {summaryMetrics.map((item) => (
          <div className="card summary-card" key={item.label}>
            <span className="metric-label">{item.label}</span>
            <span className="metric-value">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="diary-grid">
        <div className="diary-stack">
          <article className="card diary-card">
            <div className="diary-card-header">
              <div>
                <h3>Лента записей</h3>
                <p className="muted">Ваши последние записи по состоянию здоровья.</p>
              </div>
            </div>
            {isResolvingMedicalCard ? (
              <p className="muted">Определяем медицинскую карту...</p>
            ) : medicalCardError ? (
              <p className="doctor-session-feedback error">{medicalCardError}</p>
            ) : isDiaryLoading ? (
              <p className="muted">Загружаем записи...</p>
            ) : diaryError ? (
              <p className="doctor-session-feedback error">{diaryError}</p>
            ) : diaryEntries.length === 0 ? (
              <p className="muted">Записей пока нет. Добавьте первую запись справа.</p>
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
                              ? 'Вы'
                              : 'Комментарий'}
                        </span>
                      </div>
                    </div>
                    <p className="muted diary-entry-text">{entry.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>
        <div className="diary-stack">
          <DiaryEntryForm
            onCreateEntry={handleCreateEntry}
            isSubmitting={isCreatingEntry}
            submitError={createEntryError}
            submitSuccess={createEntrySuccess}
            disabled={isResolvingMedicalCard}
          />
        </div>
      </div>
    </section>
  )
}

export default PatientDiaryPage
