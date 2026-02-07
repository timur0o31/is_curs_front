import { aboutHighlights } from '../data/siteData'
import SectionHeading from './SectionHeading'

function About() {
  return (
    <section className="section" id="about">
      <div className="split">
        <div>
          <SectionHeading
            eyebrow="О санатории"
            title="Премиальный формат оздоровления на природе"
            description="Санаторий сочетает медицинские программы, спокойный отдых и заботу о каждом госте. Цифровой сервис помогает ориентироваться в расписании и сервисах даже без регистрации."
          />
          <p className="lead">
            Мы следим за динамикой состояния здоровья, организуем комфортное
            проживание и координируем работу медицинского персонала.
          </p>
          <ul className="checklist">
            <li>Минеральные источники и современный лечебный корпус.</li>
            <li>Диетология, контролируемая врачами и нутрициологами.</li>
            <li>Пространства для отдыха, спорта и культурных встреч.</li>
          </ul>
        </div>
        <div className="card-stack">
          {aboutHighlights.map((item, index) => (
            <article
              className="card reveal"
              style={{ '--delay': `${index * 0.1}s` }}
              key={item.title}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
