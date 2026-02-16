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
  getMySessions() {
    return sessionApi.get('/my')
  },
  createMySession(payload) {
    return sessionApi.post('/my', payload)
  },
}

export default DoctorDiary
