import { navItems } from '../data/siteData'

function Footer({ page = 'home', onNavigate }) {
  const isHome = page === 'home'
  const isRegister = page === 'register'
  const isLogin = page === 'login'
  const isDashboard =
    page === 'patient' ||
    page === 'doctor' ||
    page === 'admin' ||
    page === 'admin-stays' ||
    page === 'admin-stay-requests' ||
    page === 'admin-doctor-requests' ||
    page === 'diary' ||
    page === 'doctor-diary' ||
    page === 'doctor-sessions' ||
    page === 'patient-services' ||
    page === 'patient-stay-requests'

  const handleNavigate = (event, target) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(target)
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <span className="brand-title">Северный Берег</span>
          <p className="muted">
            Сервисная система для санатория: процедуры, врачи, мероприятия и
            забота о гостях.
          </p>
        </div>
        {isHome ? (
          <div className="footer-links">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </div>
        ) : (
          <div className="footer-links">
            <a href="./" onClick={(event) => handleNavigate(event, 'home')}>
              На главную
            </a>
            {isRegister ? (
              <a href="?page=login" onClick={(event) => handleNavigate(event, 'login')}>
                Войти
              </a>
            ) : isLogin ? (
              <a href="?page=register" onClick={(event) => handleNavigate(event, 'register')}>
                Регистрация
              </a>
            ) : isDashboard ? (
              <a href="?page=login" onClick={(event) => handleNavigate(event, 'login')}>
                Выйти
              </a>
            ) : (
              <a href="?page=register" onClick={(event) => handleNavigate(event, 'register')}>
                Регистрация
              </a>
            )}
            <span className="footer-small">Мы ответим на все вопросы о путевках.</span>
          </div>
        )}
        <div className="footer-note">© 2025 Санаторий «Северный Берег»</div>
      </div>
    </footer>
  )
}

export default Footer
