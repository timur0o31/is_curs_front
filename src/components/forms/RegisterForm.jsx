import { useState } from 'react'

function RegisterForm({ onSubmit, onNavigate, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'patient',
  })
  const [localError, setLocalError] = useState('')

  const handleSubmitForm = (event) => {
    event.preventDefault()
    setLocalError('')

    if (formData.password !== formData.passwordConfirm) {
      setLocalError('Пароли не совпадают')
      return
    }

    onSubmit?.({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role.toUpperCase(),
    })
  }

  const handleHomeClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('home')
  }

  const handleLoginClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('login')
  }

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form className="card form-card" onSubmit={handleSubmitForm}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="fullName">Имя и фамилия</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.name}
            placeholder="Например, Тимур Альметов"
            onChange={(event) => handleFieldChange('name', event.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="email">Электронная почта</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            placeholder="name@example.com"
            autoComplete="email"
            onChange={(event) => handleFieldChange('email', event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="role">Тип аккаунта</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={(event) => handleFieldChange('role', event.target.value)}
          >
            <option value="patient">Пациент (гость)</option>
            <option value="doctor">Врач</option>
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(event) => handleFieldChange('password', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="passwordConfirm">Повторите пароль</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="Повторите пароль"
              autoComplete="new-password"
              required
              value={formData.passwordConfirm}
              onChange={(event) => handleFieldChange('passwordConfirm', event.target.value)}
            />
          </div>
        </div>
      </div>
      {localError ? <p className="note">{localError}</p> : null}
      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Создать аккаунт'}
        </button>
        <a className="btn ghost" href="./" onClick={handleHomeClick}>
          На главную
        </a>
      </div>
      <p className="note">
        Уже есть аккаунт?{' '}
        <a className="text-link" href="?page=login" onClick={handleLoginClick}>
          Войти
        </a>
      </p>
    </form>
  )
}

export default RegisterForm
