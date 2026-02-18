import { useMemo, useState } from 'react'

const PAGE_SIZE = 6

function ObservedPatientsCard({
  observedPatients,
  isObservedPatientsLoading,
  onStartPatientRegistration,
  selectedRegistrationPatient,
  onRegisterPatient,
  selectedRegistrationProcedureId,
  onRegistrationProcedureChange,
  effectiveRegistrationSessionId,
  onRegistrationSessionChange,
  procedures,
  isProceduresLoading,
  isRegisteringPatient,
  availableRegistrationSessions,
  isProcedureSessionsLoading,
  procedureSessionsError,
  formatDayLabel,
  selectedRegistrationSession,
  patientScheduleSessions,
  patientScheduleError,
  isPatientScheduleLoading,
  formatSessionTimeLabel,
  registerPatientError,
  registerPatientSuccess,
  onCloseRegistrationForm,
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(observedPatients.length / PAGE_SIZE)),
    [observedPatients.length],
  )
  const effectiveCurrentPage = Math.min(currentPage, totalPages)

  const pagedPatients = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * PAGE_SIZE
    return observedPatients.slice(startIndex, startIndex + PAGE_SIZE)
  }, [effectiveCurrentPage, observedPatients])

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, Math.min(prev, totalPages) - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, Math.min(prev, totalPages) + 1))
  }

  const selectedRegistrationDateLabel = selectedRegistrationSession
    ? formatDayLabel(selectedRegistrationSession.sessionDate)
    : ''

  const selectedDayPatientSessions = useMemo(() => {
    if (!selectedRegistrationSession?.sessionDate) return []

    return patientScheduleSessions.filter(
      (item) => item?.sessionDate === selectedRegistrationSession.sessionDate,
    )
  }, [patientScheduleSessions, selectedRegistrationSession])

  return (
    <article className="card">
      <h3>Пациенты под наблюдением</h3>
      {isObservedPatientsLoading ? (
        <p className="muted">Загружаем пациентов с активным проживанием...</p>
      ) : observedPatients.length === 0 ? (
        <p className="muted">Нет пациентов с активным проживанием под вашим наблюдением.</p>
      ) : (
        <>
          <ul className="list">
            {pagedPatients.map((item) => (
              <li className="list-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.status}</p>
                </div>
                <div className="action-row">
                  <span className="tag">В работе</span>
                  <button
                    className="btn ghost small"
                    type="button"
                    onClick={() => onStartPatientRegistration(item)}
                    title={
                      item.stayId == null
                        ? 'Нужен stayId в ответе /api/doctor/active-patients'
                        : 'Записать пациента на сессию'
                    }
                  >
                    Записать на сессию
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {observedPatients.length > PAGE_SIZE ? (
            <div className="action-row">
              <button
                className="btn ghost small"
                type="button"
                onClick={handlePrevPage}
                disabled={effectiveCurrentPage <= 1}
              >
                Назад
              </button>
              <span className="muted">
                Страница {effectiveCurrentPage} из {totalPages}
              </span>
              <button
                className="btn ghost small"
                type="button"
                onClick={handleNextPage}
                disabled={effectiveCurrentPage >= totalPages}
              >
                Далее
              </button>
            </div>
          ) : null}
          {selectedRegistrationPatient ? (
            <form className="doctor-session-form" onSubmit={onRegisterPatient}>
              <div className="field">
                <label htmlFor="registrationProcedure">Процедура</label>
                <select
                  id="registrationProcedure"
                  value={selectedRegistrationProcedureId}
                  onChange={onRegistrationProcedureChange}
                  disabled={isRegisteringPatient || isProceduresLoading}
                >
                  <option value="">Выберите процедуру</option>
                  {procedures.map((procedure) => (
                    <option key={`registration-procedure-${procedure.id}`} value={String(procedure.id)}>
                      {procedure.name}
                    </option>
                  ))}
                </select>
                {isProceduresLoading ? <p className="muted">Загружаем процедуры...</p> : null}
              </div>
              <div className="field">
                <label htmlFor="registrationSession">Сессия для записи</label>
                <select
                  id="registrationSession"
                  value={effectiveRegistrationSessionId}
                  onChange={onRegistrationSessionChange}
                  disabled={
                    isRegisteringPatient ||
                    !selectedRegistrationProcedureId ||
                    isProcedureSessionsLoading ||
                    availableRegistrationSessions.length === 0
                  }
                >
                  {!selectedRegistrationProcedureId ? (
                    <option value="">Сначала выберите процедуру</option>
                  ) : isProcedureSessionsLoading ? (
                    <option value="">Загружаем сессии...</option>
                  ) : availableRegistrationSessions.length === 0 ? (
                    <option value="">Нет доступных сессий</option>
                  ) : (
                    availableRegistrationSessions.map((item) => (
                      <option key={`registration-session-${item.id}`} value={String(item.id)}>
                        {formatDayLabel(item.sessionDate)} · {item.timeStart} · {item.title}
                      </option>
                    ))
                  )}
                </select>
                {procedureSessionsError ? (
                  <p className="doctor-session-feedback error">{procedureSessionsError}</p>
                ) : null}
              </div>
              <p className="muted">Пациент: {selectedRegistrationPatient.name}</p>
              {selectedRegistrationSession ? (
                <div className="doctor-patient-schedule-block">
                  <p className="muted">Занято на {selectedRegistrationDateLabel}</p>
                  {isPatientScheduleLoading ? (
                    <p className="muted">Загрузка...</p>
                  ) : patientScheduleError ? (
                    <p className="doctor-session-feedback error">{patientScheduleError}</p>
                  ) : selectedDayPatientSessions.length === 0 ? (
                    <p className="muted">Свободно.</p>
                  ) : (
                    <ul className="list doctor-patient-schedule-list">
                      {selectedDayPatientSessions.map((item) => (
                        <li className="list-item" key={`patient-day-session-${item.id}`}>
                          <div>
                            <strong>
                              {item.timeStart} · {item.title}
                            </strong>
                            <p>{formatSessionTimeLabel(item)}</p>
                          </div>
                          <span className="status">Занято</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
              {registerPatientError ? (
                <p className="doctor-session-feedback error">{registerPatientError}</p>
              ) : null}
              {registerPatientSuccess ? (
                <p className="doctor-session-feedback success">{registerPatientSuccess}</p>
              ) : null}
              <div className="form-actions">
                <button
                  className="btn primary small"
                  type="submit"
                  disabled={
                    isRegisteringPatient ||
                    selectedRegistrationPatient.stayId == null ||
                    !selectedRegistrationProcedureId ||
                    isProcedureSessionsLoading ||
                    availableRegistrationSessions.length === 0
                  }
                >
                  {isRegisteringPatient ? 'Записываем...' : 'Подтвердить запись'}
                </button>
                <button
                  className="btn ghost small"
                  type="button"
                  onClick={onCloseRegistrationForm}
                  disabled={isRegisteringPatient}
                >
                  Закрыть форму
                </button>
              </div>
            </form>
          ) : null}
        </>
      )}
    </article>
  )
}

export default ObservedPatientsCard
