import SectionHeading from './SectionHeading'

function Procedures({ items = [] }) {
  const hasItems = items.length > 0

  return (
    <section className="section" id="procedures">
      <SectionHeading
        eyebrow="Процедуры"
        title="Основные направления лечения и восстановления"
        description="Перечень процедур доступен без авторизации. Полный план лечения формируется по назначению врача."
      />
      {hasItems ? (
        <div className="card-grid">
          {items.map((item, index) => (
            <article
              className="card reveal"
              style={{ '--delay': `${index * 0.08}s` }}
              key={item.title}
            >
              <div className="card-tag">{item.level}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="card-meta">
                <span>{item.duration}</span>
                <span>Назначение врача</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Список процедур загрузится после подключения сервиса.
        </div>
      )}
    </section>
  )
}

export default Procedures
