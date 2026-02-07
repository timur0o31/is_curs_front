import SectionHeading from './SectionHeading'

function Doctors({ items = [] }) {
  const hasItems = items.length > 0

  return (
    <section className="section" id="doctors">
      <SectionHeading
        eyebrow="Врачи"
        title="Команда врачей и медицинского персонала"
        description="Опытные специалисты ведут пациента на каждом этапе оздоровления."
      />
      {hasItems ? (
        <div className="card-grid doctors-grid">
          {items.map((doctor, index) => (
            <article
              className="card doctor-card reveal"
              style={{ '--delay': `${index * 0.08}s` }}
              key={doctor.name}
            >
              <div className="doctor-top">
                <div className="avatar" aria-hidden="true">
                  {doctor.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </div>
                <div>
                  <h3>{doctor.name}</h3>
                  <p className="muted">{doctor.role}</p>
                </div>
              </div>
              <p className="doctor-focus">{doctor.focus}</p>
              <div className="doctor-meta">
                <span className="pill">{doctor.experience}</span>
              </div>
              <div className="tag-list">
                {doctor.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Список врачей появится после загрузки данных из сервиса.
        </div>
      )}
    </section>
  )
}

export default Doctors
