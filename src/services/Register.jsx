import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
})

const Register = {
  register(payload) {
    return authApi.post('/register', payload)
  },
  login(payload) {
    return authApi.post('/login', payload)
  },
}

export default Register
