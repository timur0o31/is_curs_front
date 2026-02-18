import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const patientScheduleApi = axios.create({
  baseURL: `${API_BASE_URL}/api/registrations`,
  headers: {
    'Content-Type': 'application/json',
  },
})

patientScheduleApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const PatientSessions = {
  getMySchedule(params = {}) {
    return patientScheduleApi.get('/my/schedule', {
      params,
    })
  },
  getMyRegistrations(required) {
    const requestConfig =
      typeof required === 'boolean'
        ? {
            params: {
              required,
            },
          }
        : undefined

    return patientScheduleApi.get('/my', requestConfig)
  },
  createMyRegistration(sessionId) {
    return patientScheduleApi.post('/my', {
      sessionId,
    })
  },
  cancelMyRegistration(sessionId) {
    return patientScheduleApi.delete(`/my/${sessionId}`)
  },
}

export default PatientSessions
