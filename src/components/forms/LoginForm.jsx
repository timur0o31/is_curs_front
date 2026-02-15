import { useState } from "react";
import { login } from "../../api/auth.js";
import "./LoginForm.css"; // Импортируем стили для ошибок

function LoginForm({ onNavigate }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Сбрасываем предыдущую ошибку
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.target)

    try {
      const data = await login({
        email: formData.get('email'),
        password: formData.get('password'),
      })

      localStorage.setItem('accessToken', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('role', data.role)
      localStorage.setItem(
          'user',
          JSON.stringify({ email: data.email, name: data.name })
      )

      if (onNavigate) {
        onNavigate(data.role.toLowerCase())
      }
    } catch (error) {
      setError(error.message || 'Произошла ошибка при входе');

      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRegisterClick = (event) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate('register')
  }

  const handleCloseError = () => {
    setError(null);
  }

  return (
      <form className="card form-card" onSubmit={handleSubmit}>
        {error && (
            <div className="error-message" role="alert">
              <div className="error-content">
                <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="error-text">{error}</span>
                <button
                    type="button"
                    className="error-close-btn"
                    onClick={handleCloseError}
                    aria-label="Закрыть"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
        )}

        <div className="form-grid">
          <div className={`field ${error ? 'field-error' : ''}`}>
            <label htmlFor="loginEmail">Электронная почта</label>
            <input
                id="loginEmail"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className={error ? 'input-error' : ''}
            />
          </div>
          <div className={`field ${error ? 'field-error' : ''}`}>
            <label htmlFor="loginPassword">Пароль</label>
            <input
                id="loginPassword"
                name="password"
                type="password"
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className={error ? 'input-error' : ''}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
              className={`btn primary ${isLoading ? 'loading' : ''}`}
              type="submit"
              disabled={isLoading}
          >
            {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Вход...
                </>
            ) : 'Войти'}
          </button>
        </div>

        <p className="note">
          Нет аккаунта?{' '}
          <a
              className="text-link"
              href="?page=register"
              onClick={handleRegisterClick}
              style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
          >
            Создать
          </a>
        </p>
      </form>
  )
}

export default LoginForm