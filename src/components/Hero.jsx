import { heroStats } from '../data/siteData'

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <h1>Ритм восстановления, который подстраивается под каждого гостя.</h1>
        <p className="hero-text">
          Санаторий объединяет лечение, отдых и персональные рекомендации. Гости
          получают расписание процедур, питание по диетам и помощь врачей в одном
          цифровом пространстве.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="#procedures">
            Посмотреть процедуры
          </a>
          <a className="btn primary" href="#events">
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
    </section>
  )
}

export default Hero
