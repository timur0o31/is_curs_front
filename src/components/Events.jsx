import { events } from '../data/siteData'
import SectionHeading from './SectionHeading'

function Events() {
  return (
    <section className="section" id="events">
      <SectionHeading
        eyebrow="Мероприятия"
        title="Культурные и спортивные события для гостей"
        description="Афиша обновляется еженедельно и доступна всем посетителям сайта."
      />
      <div className="event-list">
        {events.map((event, index) => (
          <article
            className="event-card reveal"
            style={{ '--delay': `${index * 0.08}s` }}
            key={event.title}
          >
            <div className="event-date">
              <span className="event-day">{event.day}</span>
              <span className="event-time">{event.time}</span>
            </div>
            <div className="event-body">
              <span className="pill">{event.tag}</span>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Events
