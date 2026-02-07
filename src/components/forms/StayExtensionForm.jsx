function StayExtensionForm() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Продление проживания</h3>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="extensionStayId">Номер проживания</label>
          <input id="extensionStayId" name="stayId" type="text" placeholder="Например, ST-401" />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="currentCheckOut">Текущий выезд</label>
            <input id="currentCheckOut" name="currentCheckOut" type="date" />
          </div>
          <div className="field">
            <label htmlFor="newCheckOut">Новая дата выезда</label>
            <input id="newCheckOut" name="newCheckOut" type="date" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="extensionReason">Причина продления</label>
          <textarea
            id="extensionReason"
            name="reason"
            rows="3"
            placeholder="Например, требуется дополнительный курс процедур."
          />
        </div>
        <div className="field">
          <label htmlFor="extensionPhone">Контактный телефон</label>
          <input
            id="extensionPhone"
            name="phone"
            type="tel"
            placeholder="+7 (900) 000-00-00"
            autoComplete="tel"
          />
        </div>
        <label className="checkbox">
          <input type="checkbox" name="priceConsent" defaultChecked />
          <span>Согласен с возможным пересчетом тарифа</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Отправить запрос
        </button>
        <button className="btn ghost" type="button">
          Написать администратору
        </button>
      </div>
      <p className="note">Ответ придет в течение рабочего дня.</p>
    </form>
  )
}

export default StayExtensionForm
