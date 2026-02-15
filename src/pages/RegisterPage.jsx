import { useState } from 'react'
import { toast } from 'react-toastify'
import SectionHeading from '../components/SectionHeading'
import RegisterForm from '../components/forms/RegisterForm'
import Register from '../services/Register'

function RegisterPage({ onNavigate }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (severity, summary, detail = '') => {
    const message = detail ? `${summary}: ${detail}` : summary

    if (severity === 'success') {
      toast.success(message)
      return
    }

    if (severity === 'warn') {
      toast.warn(message)
      return
    }

    if (severity === 'info') {
      toast.info(message)
      return
    }

    toast.error(message)
  }

  const handleError = (error) => {
    if (!error?.response) {
      showToast('error', 'Ошибка', 'Проверь подключение к серверу')
      return
    }

    const data = error.response.data

    if (typeof data === 'string' && data.trim()) {
      showToast('error', 'Ошибка', data)
      return
    }

    if (data?.fields && typeof data.fields === 'object') {
      const fieldDetails = Object.entries(data.fields)
        .map(([field, message]) => `${field}: ${message}`)
        .join('; ')

      showToast('error', data.error || 'Ошибка валидации', fieldDetails)
      return
    }

    if (data?.error) {
      showToast('error', data.error, data.data || data.message || '')
      return
    }

    showToast('error', 'Ошибка', error.message || 'Не удалось зарегистрироваться')
  }

  const handleRegisterSubmit = async (payload) => {
    setIsSubmitting(true)

    try {
      await Register.register(payload)
      showToast('success', 'Успех', 'Регистрация прошла успешно')
      if (onNavigate) {
        onNavigate('login')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section register">
      <SectionHeading
        eyebrow="Регистрация"
        title="Создайте аккаунт для доступа к персональному сервису"
        description="После регистрации вы сможете управлять расписанием процедур, получать уведомления и связываться с врачами."
      />
      <div className="register-grid">
        <RegisterForm
          onSubmit={handleRegisterSubmit}
          onNavigate={onNavigate}
          isSubmitting={isSubmitting}
        />
        <aside className="card register-aside">
          <h3>Что откроется после регистрации</h3>
          <ul className="checklist">
            <li>Персональное расписание процедур и питания.</li>
            <li>Уведомления о приеме лекарств и событиях.</li>
            <li>Доступ к цифровым ключам от комнаты и шкафчика.</li>
            <li>Возможность вести дневник состояния здоровья.</li>
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default RegisterPage
