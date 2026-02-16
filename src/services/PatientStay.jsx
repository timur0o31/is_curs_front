import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const patientStayApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

patientStayApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const PatientStay = {
  getMyStayRequests() {
    return patientStayApi.get('/stay-requests/my')
  },

  getMyRoom() {
    return patientStayApi.get('/rooms/my/number')
  },

  createCheckInRequest(payload) {
    return patientStayApi.post('/stay-requests/check-in', payload)
  },

  createExpansionRequest(payload) {
    return patientStayApi.post('/stay-requests/expansion', payload)
  },
}

export default PatientStay
