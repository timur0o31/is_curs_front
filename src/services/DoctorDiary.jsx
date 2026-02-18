import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const doctorApi = axios.create({
  baseURL: `${API_BASE_URL}/api/doctor`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const sessionApi = axios.create({
  baseURL: `${API_BASE_URL}/api/sessions`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const procedureApi = axios.create({
  baseURL: `${API_BASE_URL}/api/procedures`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const registrationApi = axios.create({
  baseURL: `${API_BASE_URL}/api/registrations`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const medicamentApi = axios.create({
  baseURL: `${API_BASE_URL}/api/medicaments`,
  headers: {
    'Content-Type': 'application/json',
  },
})

doctorApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

sessionApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

procedureApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

registrationApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

medicamentApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

const DoctorDiary = {
  getDashboard() {
    return doctorApi.get('/dashboard')
  },
  getActivePatients() {
    return doctorApi.get('/active-patients')
  },
  getPatientDiary(patientId) {
    return doctorApi.get(`/patients/${patientId}/diary`)
  },
  getPatientSessions({ patientId, stayId, date, from, to }) {
    const requestConfig = date
      ? {
          params: {
            date,
          },
        }
      : from || to
        ? {
            params: {
              ...(from ? { from } : {}),
              ...(to ? { to } : {}),
            },
          }
        : undefined

    if (patientId != null) {
      return registrationApi.get(`/patients/${patientId}/schedule`, requestConfig)
    }

    // Fallback retained for compatibility while backend contracts are being unified.
    if (stayId != null) return Promise.resolve({ data: [] })

    return Promise.resolve({ data: [] })
  },
  getProcedures() {
    return procedureApi.get('')
  },
  getMySessions() {
    return sessionApi.get('/my')
  },
  getSessionsByProcedureId(procedureId) {
    return sessionApi.get('', {
      params: {
        procedureId,
      },
    })
  },
  createMySession(payload) {
    return sessionApi.post('/my', payload)
  },
  createMandatoryRegistration(payload) {
    return registrationApi.post('/mandatory', payload)
  },
  getMedicaments() {
    return medicamentApi.get('')
  },
  addCommentForPatient(patientId, comment) {
    return doctorApi.post(`/patients/${patientId}/comments`, comment, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  },
  assignPatientDiet(patientId, diet) {
    return doctorApi.post(`/patients/${patientId}/diet`, null, {
      params: {
        diet,
      },
    })
  },
  createPrescriptionForPatient(patientId, payload) {
    return doctorApi.post(`/patients/${patientId}/prescriptions`, payload)
  },
}

export default DoctorDiary
