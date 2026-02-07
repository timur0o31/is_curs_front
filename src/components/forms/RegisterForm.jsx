import { useState } from 'react'

function RegisterForm({ onNavigate }) {
  const [role, setRole] = useState('patient')

  const handleSubmit = (event) => {
    event.preventDefault()
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

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="fullName">Имя и фамилия</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Например, Тимур Альметов"
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Электронная почта</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="role">Тип аккаунта</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="patient">Пациент (гость)</option>
            <option value="doctor">Врач</option>
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="phone">Телефон</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+7 (900) 000-00-00"
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="birthDate">Дата рождения</label>
            <input id="birthDate" name="birthDate" type="date" />
          </div>
        </div>
        {role === 'patient' ? (
          <div className="field">
            <label htmlFor="visitPurpose">Цель поездки</label>
            <select id="visitPurpose" name="visitPurpose" defaultValue="recovery">
              <option value="recovery">Восстановление и реабилитация</option>
              <option value="prevention">Профилактика и тонус</option>
              <option value="relax">Отдых и перезагрузка</option>
              <option value="consultation">Сопровождение специалистов</option>
            </select>
          </div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="specialization">Специализация</label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                placeholder="Например, кардиология"
                required={role === 'doctor'}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="experience">Стаж работы (лет)</label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  placeholder="Например, 8"
                  required={role === 'doctor'}
                />
              </div>
              <div className="field">
                <label htmlFor="license">Номер сертификата</label>
                <input
                  id="license"
                  name="license"
                  type="text"
                  placeholder="Например, 77-2025-XX"
                  required={role === 'doctor'}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="clinic">Медицинское учреждение</label>
              <input
                id="clinic"
                name="clinic"
                type="text"
                placeholder="Название клиники или санатория"
                required={role === 'doctor'}
              />
            </div>
            <p className="note">
              Заявка врача будет подтверждена администратором после проверки.
            </p>
          </>
        )}
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
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="notes">Особые пожелания</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            placeholder="Например, рекомендации по диете или ограничения."
          />
        </div>
        <label className="checkbox">
          <input type="checkbox" name="consent" required />
          <span>Даю согласие на обработку персональных данных и получение писем.</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Создать аккаунт
        </button>
        <a className="btn ghost" href="./" onClick={handleHomeClick}>
          На главную
        </a>
      </div>
      <p className="note">Восстановление доступа осуществляется через электронную почту.</p>
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
