import SectionHeading from '../components/SectionHeading'
import LoginForm from '../components/forms/LoginForm'

function LoginPage({ onNavigate }) {
  const handleRoleClick = (event, role) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(role)
  }

  return (
    <section className="section auth">
      <SectionHeading
        eyebrow="Вход"
        title="Войдите, чтобы управлять расписанием и сервисами"
        description="Введите почту и пароль, чтобы получить доступ к персональному кабинету."
      />
      <div className="auth-grid">
        <LoginForm onNavigate={onNavigate} />
        <aside className="card auth-aside">
          <h3>Доступно после входа</h3>
          <ul className="checklist">
            <li>Управление личным расписанием процедур.</li>
            <li>Уведомления о приеме лекарств и процедурах.</li>
            <li>Режим «Не беспокоить» и цифровые ключи.</li>
            <li>Дневник состояния здоровья с рекомендациями врача.</li>
          </ul>
          <div className="aside-panel">
            <span className="panel-label">Нет доступа?</span>
            <p>
              Если вы врач, регистрация проходит через подтверждение учетной
              записи.
            </p>
            <div className="action-row">
              <a
                className="btn ghost small"
                href="?page=register"
                onClick={(event) => handleRoleClick(event, 'register')}
              >
                Регистрация
              </a>
            </div>
          </div>
          <div className="aside-panel">
            <span className="panel-label">Демо-доступ</span>
            <p>Посмотрите интерфейсы ролей без авторизации.</p>
            <div className="action-row">
              <a
                className="btn ghost small"
                href="?page=patient"
                onClick={(event) => handleRoleClick(event, 'patient')}
              >
                Пациент
              </a>
              <a
                className="btn ghost small"
                href="?page=doctor"
                onClick={(event) => handleRoleClick(event, 'doctor')}
              >
                Врач
              </a>
              <a
                className="btn ghost small"
                href="?page=admin"
                onClick={(event) => handleRoleClick(event, 'admin')}
              >
                Админ
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default LoginPage
