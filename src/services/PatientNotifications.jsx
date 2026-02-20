import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const notificationsApi = axios.create({
  baseURL: `${API_BASE_URL}/api/notifications`,
  headers: {
    'Content-Type': 'application/json',

  },
})

notificationsApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const PatientNotifications = {
  getMyNotifications() {
    return notificationsApi.get('')
  },
  getMyUnreadNotifications() {
    return notificationsApi.get('/unread')
  },
  markAsRead(notificationId) {
    return notificationsApi.post(`/${notificationId}/read`)
  },
}

export default PatientNotifications
