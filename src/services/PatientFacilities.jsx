import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const patientFacilitiesApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

patientFacilitiesApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const PatientFacilities = {
  getLockers() {
    return patientFacilitiesApi.get('/lockers')
  },
  getLockerByPatientId(patientId) {
    return patientFacilitiesApi.get(`/lockers/by-patient/${patientId}`)
  },
  assignLocker(lockerId, patientId) {
    return patientFacilitiesApi.post(`/lockers/${lockerId}/assign`, null, {
      params: { patientId },
    })
  },
  unassignLocker(patientId) {
    return patientFacilitiesApi.post('/lockers/unassign', null, {
      params: { patientId },
    })
  },
  getDiningTables() {
    return patientFacilitiesApi.get('/dining-tables')
  },
  getSeats() {
    return patientFacilitiesApi.get('/seats')
  },
  getSeatsByPatientId(patientId) {
    return patientFacilitiesApi.get('/seats', {
      params: { patientId },
    })
  },
  bookSeat(patientId, seatId) {
    return patientFacilitiesApi.post('/seats/book', null, {
      params: { patientId, seatId },
    })
  },
  releaseSeat(patientId) {
    return patientFacilitiesApi.post('/seats/release', null, {
      params: { patientId },
    })
  },
}

export default PatientFacilities
