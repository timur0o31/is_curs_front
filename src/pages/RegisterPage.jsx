import SectionHeading from '../components/SectionHeading'
import RegisterForm from '../components/forms/RegisterForm'

function RegisterPage({ onNavigate }) {
  return (
    <section className="section register">
      <SectionHeading
        eyebrow="Регистрация"
        title="Создайте аккаунт для доступа к персональному сервису"
        description="После регистрации вы сможете управлять расписанием процедур, получать уведомления и связываться с врачами."
      />
      <div className="register-grid">
        <RegisterForm onNavigate={onNavigate} />
        <aside className="card register-aside">
          <h3>Что откроется после регистрации</h3>
          <ul className="checklist">
            <li>Персональное расписание процедур и питания.</li>
            <li>Уведомления о приеме лекарств и событиях.</li>
            <li>Доступ к цифровым ключам от комнаты и шкафчика.</li>
            <li>Возможность вести дневник состояния здоровья.</li>
          </ul>
          <div className="aside-panel">
            <span className="panel-label">Нужна помощь?</span>
            <p>
              Специалисты службы поддержки ответят на вопросы по регистрационной
              форме и выбору программы.
            </p>
            <button className="btn ghost" type="button">
              Написать в поддержку
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default RegisterPage
