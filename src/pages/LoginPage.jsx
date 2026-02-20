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
        title="Вход"
      />
      <div className="auth-grid">
        <LoginForm onNavigate={onNavigate} />
      </div>
    </section>
  )
}

export default LoginPage
