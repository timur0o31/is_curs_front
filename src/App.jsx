import { useEffect, useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import Header from './components/Header'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminDoctorRequestsPage from './pages/admin/AdminDoctorRequestsPage'
import AdminStayRequestsPage from './pages/admin/AdminStayRequestsPage'
import AdminStaysPage from './pages/admin/AdminStaysPage'
import DoctorDiaryPage from './pages/DoctorDiaryPage'
import DoctorDashboardPage from './pages/DoctorDashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PatientDashboardPage from './pages/PatientDashboardPage.jsx'
import PatientDiaryPage from './pages/PatientDiaryPage'
import RegisterPage from './pages/RegisterPage'
import PatientStayRequestsPage from './pages/PatientStayRequestsPage.jsx'
import PatientServicesPage from './pages/PatientServicesPage.jsx'

const ALLOWED_PAGES = new Set([
  'register',
  'login',
  'patient',
  'doctor',
  'admin',
  'admin-stays',
  'admin-stay-requests',
  'admin-doctor-requests',
  'diary',
  'doctor-diary',
  'patient-services',
  'patient-stay-requests',
])

const getPageFromLocation = () => {
  if (typeof window === 'undefined') return 'home'
  const params = new URLSearchParams(window.location.search)
  const page = params.get('page')
  if (ALLOWED_PAGES.has(page)) {
    return page
  }
  return 'home'
}

function App() {
  const [page, setPage] = useState(getPageFromLocation)

  useEffect(() => {
    const handlePopState = () => {
      setPage(getPageFromLocation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigate = (nextPage) => {
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    if (ALLOWED_PAGES.has(nextPage)) {
      url.searchParams.set('page', nextPage)
    }
    window.history.pushState({}, '', `${url.pathname}${url.search}`)
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <Header page={page} onNavigate={navigate} />
      <main>
        {page === 'register' ? (
          <RegisterPage onNavigate={navigate} />
        ) : page === 'login' ? (
          <LoginPage onNavigate={navigate} />
        ) : page === 'patient' ? (
          <PatientDashboardPage onNavigate={navigate} />
        ) : page === 'doctor' ? (
          <DoctorDashboardPage onNavigate={navigate} />
        ) : page === 'admin' ? (
          <AdminDashboardPage onNavigate={navigate} />
        ) : page === 'admin-stays' ? (
          <AdminStaysPage onNavigate={navigate} />
        ) : page === 'admin-stay-requests' ? (
          <AdminStayRequestsPage onNavigate={navigate} />
        ) : page === 'admin-doctor-requests' ? (
          <AdminDoctorRequestsPage onNavigate={navigate} />
        ) : page === 'diary' ? (
          <PatientDiaryPage onNavigate={navigate} />
        ) : page === 'patient-services' ? (
          <PatientServicesPage onNavigate={navigate} />
        ) : page === 'patient-stay-requests' ? (
          <PatientStayRequestsPage onNavigate={navigate} />
        ) : page === 'doctor-diary' ? (
          <DoctorDiaryPage onNavigate={navigate} />
        ) : (
          <HomePage />
        )}
      </main>
      <Footer page={page} onNavigate={navigate} />
    </div>
  )
}

export default App
