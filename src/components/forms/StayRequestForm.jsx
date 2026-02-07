function StayRequestForm() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h3>Новая заявка на проживание</h3>
      <div className="form-grid">
        <div className="field-row">
          <div className="field">
            <label htmlFor="stayCheckIn">Дата заезда</label>
            <input id="stayCheckIn" name="checkIn" type="date" required />
          </div>
          <div className="field">
            <label htmlFor="stayCheckOut">Дата выезда</label>
            <input id="stayCheckOut" name="checkOut" type="date" required />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="stayRoomType">Тип номера</label>
            <select id="stayRoomType" name="roomType" defaultValue="comfort">
              <option value="standard">Стандарт</option>
              <option value="comfort">Комфорт</option>
              <option value="suite">Люкс</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="stayGuests">Количество гостей</label>
            <input id="stayGuests" name="guests" type="number" min="1" max="4" defaultValue="1" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="stayBuilding">Предпочтительный корпус</label>
            <select id="stayBuilding" name="building" defaultValue="A">
              <option value="A">Корпус A (тихий)</option>
              <option value="B">Корпус B (рядом с процедурами)</option>
              <option value="C">Корпус C (вид на парк)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="stayMeal">Питание</label>
            <select id="stayMeal" name="mealPlan" defaultValue="diet5">
              <option value="diet5">Диета №5</option>
              <option value="standard">Без ограничений</option>
              <option value="vegetarian">Вегетарианское</option>
              <option value="sugar-free">Без сахара</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="stayComment">Комментарий к заявке</label>
          <textarea
            id="stayComment"
            name="comment"
            rows="3"
            placeholder="Например, пожелания к номеру или ограничения."
          />
        </div>
        <label className="checkbox">
          <input type="checkbox" name="transfer" />
          <span>Нужен трансфер или помощь с багажом</span>
        </label>
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit">
          Отправить заявку
        </button>
        <button className="btn ghost" type="button">
          Сохранить черновик
        </button>
      </div>
      <p className="note">Заявка появится в списке после отправки.</p>
    </form>
  )
}

export default StayRequestForm
