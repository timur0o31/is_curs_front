function LoginForm({ onNavigate }) {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  const handleRegisterClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('register')
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="loginEmail">Электронная почта</label>
          <input
            id="loginEmail"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="loginPassword">Пароль</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            placeholder="Введите пароль"
            autoComplete="current-password"
            required
          />
        </div>
        <label className="checkbox">
          <input type="checkbox" name="remember" />
          <span>Запомнить меня на этом устройстве</span>
        </label>
        <button className="text-link" type="button">
          Забыли пароль?
        </button>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Войти
        </button>
        <a className="btn ghost" href="?page=register" onClick={handleRegisterClick}>
          Регистрация
        </a>
      </div>
      <p className="note">
        Нет аккаунта?{' '}
        <a className="text-link" href="?page=register" onClick={handleRegisterClick}>
          Создать
        </a>
      </p>
    </form>
  )
}

export default LoginForm
