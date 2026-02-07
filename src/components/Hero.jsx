import { heroStats } from '../data/siteData'

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <span className="hero-badge">Новый формат санаторного сервиса</span>
        <h1>Ритм восстановления, который подстраивается под каждого гостя.</h1>
        <p className="hero-text">
          Санаторий объединяет лечение, отдых и персональные рекомендации. Гости
          получают расписание процедур, питание по диетам и помощь врачей в одном
          цифровом пространстве.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="#procedures">
            Выбрать процедуры
          </a>
          <a className="btn ghost" href="#events">
            Посмотреть мероприятия
          </a>
        </div>
        <div className="hero-stats">
          {heroStats.map((stat, index) => (
            <div
              className="stat reveal"
              style={{ '--delay': `${index * 0.1}s` }}
              key={stat.label}
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-panel">
        <div className="panel-card reveal" style={{ '--delay': '0.25s' }}>
          <div className="panel-heading">
            <span className="pill">Сегодня</span>
            <span className="panel-time">08:30–20:00</span>
          </div>
          <h3>Гостевой центр и сопровождение</h3>
          <p>
            Поможем выбрать программу, назначим первичный прием и покажем
            инфраструктуру санатория.
          </p>
          <div className="panel-grid">
            <div>
              <span className="panel-label">Ближайшая смена</span>
              <strong>12–26 марта</strong>
            </div>
            <div>
              <span className="panel-label">Температура источника</span>
              <strong>+32°C</strong>
            </div>
            <div>
              <span className="panel-label">Свободных мест</span>
              <strong>18 номеров</strong>
            </div>
          </div>
          <a className="link" href="#contacts">
            Запросить путевку →
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
