import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const diaryApi = axios.create({
  baseURL: `${API_BASE_URL}/api/diary-entries`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const medicalCardApi = axios.create({
  baseURL: `${API_BASE_URL}/api/medical-cards`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const attachAuthInterceptor = (apiClient) => {
  apiClient.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  })
}

attachAuthInterceptor(diaryApi)
attachAuthInterceptor(medicalCardApi)

const PatientDiary = {
  getEntriesByMedicalCardId(medicalCardId) {
    return diaryApi.get(`/medical-cards/${medicalCardId}/diary-entries`)
  },
  createEntryForMedicalCard(medicalCardId, comment) {
    return diaryApi.post(`/medical-cards/${medicalCardId}/diary-entries`, {
      comment,
    })
  },
  getMyMedicalCard() {
    return medicalCardApi.get('/my')
  },
}

export default PatientDiary
