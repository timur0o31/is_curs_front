import { navItems } from '../data/siteData'

function Header({ page = 'home', onNavigate }) {
  const isHome = page === 'home'
  const isRegister = page === 'register'
  const isLogin = page === 'login'
  const isDashboard =
    page === 'user' ||
    page === 'doctor' ||
    page === 'admin' ||
    page === 'admin-stays' ||
    page === 'admin-stay-requests' ||
    page === 'admin-doctor-requests' ||
    page === 'diary' ||
    page === 'doctor-diary' ||
    page === 'user-services' ||
    page === 'user-stay-requests'

  const pageLabels = {
    register: 'Регистрация',
    login: 'Вход',
    user: 'Кабинет пациента',
    doctor: 'Кабинет врача',
    admin: 'Панель администратора',
    'admin-stays': 'Проживания',
    'admin-stay-requests': 'Заявки по проживанию',
    'admin-doctor-requests': 'Регистрация врачей',
    diary: 'Дневник пациента',
    'doctor-diary': 'Дневник пациентов',
    'user-services': 'Сервисы проживания',
    'user-stay-requests': 'Заявки на проживание',
  }

  const handleNavigate = (event, target) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(target)
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <span className="brand-title">Санаторий «Северный Берег»</span>
            <span className="brand-subtitle">Сервис для спокойного восстановления</span>
          </div>
        </div>
        {isHome ? (
          <nav className="nav-links" aria-label="Основная навигация">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>
        ) : (
          <div className="nav-links nav-links--compact" aria-hidden="true">
            {pageLabels[page] || 'Навигация'}
          </div>
        )}
        <div className="header-actions">
          {isHome ? (
            <>
              <a
                className="btn ghost"
                href="?page=login"
                onClick={(event) => handleNavigate(event, 'login')}
              >
                Войти
              </a>
              <a
                className="btn primary"
                href="?page=register"
                onClick={(event) => handleNavigate(event, 'register')}
              >
                Регистрация
              </a>
            </>
          ) : isRegister ? (
            <>
              <a className="btn ghost" href="./" onClick={(event) => handleNavigate(event, 'home')}>
                На главную
              </a>
              <a
                className="btn primary"
                href="?page=login"
                onClick={(event) => handleNavigate(event, 'login')}
              >
                Войти
              </a>
            </>
          ) : isLogin ? (
            <>
              <a className="btn ghost" href="./" onClick={(event) => handleNavigate(event, 'home')}>
                На главную
              </a>
              <a
                className="btn primary"
                href="?page=register"
                onClick={(event) => handleNavigate(event, 'register')}
              >
                Регистрация
              </a>
            </>
          ) : isDashboard ? (
            <>
              <a className="btn ghost" href="./" onClick={(event) => handleNavigate(event, 'home')}>
                На главную
              </a>
              <a
                className="btn primary"
                href="?page=login"
                onClick={(event) => handleNavigate(event, 'login')}
              >
                Выйти
              </a>
            </>
          ) : (
            <>
              <a className="btn ghost" href="./" onClick={(event) => handleNavigate(event, 'home')}>
                На главную
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
