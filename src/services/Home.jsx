import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const Home = {
  getProcedures() {
    return publicApi.get('/procedures')
  },
  getDoctors() {
    return publicApi.get('/doctors')
  },
  getEvents() {
    return publicApi.get('/events')
  },
  getHome() {
    return publicApi.get('/home')
  },
}

export default Home
