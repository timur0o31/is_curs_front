import SectionHeading from './SectionHeading'

function Contacts() {
  return (
    <section className="section contact" id="contacts">
      <SectionHeading
        eyebrow="Контакты"
        title="Узнайте о программах и проживании"
        description="Мы расскажем о доступных сменах, номерах и расписании процедур."
      />
      <div className="contact-grid">
        <article className="card contact-card reveal" style={{ '--delay': '0s' }}>
          <h3>Как нас найти</h3>
          <p>
            Санаторий расположен на берегу озера в 40 минутах от города. До
            территории ходит трансфер от вокзала.
          </p>
          <div className="contact-list">
            <div>
              <span className="contact-label">Адрес</span>
              <p>Ленинградская обл., пос. Лесное, ул. Озерная, 7</p>
            </div>
            <div>
              <span className="contact-label">Телефон</span>
              <p>+7 (812) 555-21-34</p>
            </div>
            <div>
              <span className="contact-label">Почта</span>
              <p>hello@sever-ber.eg</p>
            </div>
          </div>
        </article>
        <article className="card contact-card accent reveal" style={{ '--delay': '0.1s' }}>
          <h3>Подобрать программу</h3>
          <p>
            Оставьте заявку, и команда подберет врачей и расписание процедур под
            ваши цели.
          </p>
          <div className="contact-actions">
            <button className="btn primary" type="button">
              Связаться с менеджером
            </button>
            <button className="btn ghost" type="button">
              Скачать буклет
            </button>
          </div>
          <p className="note">Ответим в течение рабочего дня.</p>
        </article>
      </div>
    </section>
  )
}

export default Contacts
