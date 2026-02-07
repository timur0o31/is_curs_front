const adminNavItems = [
  { page: 'admin', label: 'Обзор' },
  { page: 'admin-stays', label: 'Проживания' },
  { page: 'admin-stay-requests', label: 'Заявки по проживанию' },
  { page: 'admin-doctor-requests', label: 'Регистрация врачей' },
]

function AdminNav({ current = 'admin', onNavigate }) {
  const handleNavigate = (event, page) => {
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(page)
  }

  return (
    <nav className="admin-nav" aria-label="Навигация администратора">
      {adminNavItems.map((item) => (
        <a
          key={item.page}
          className={`admin-tab${current === item.page ? ' is-active' : ''}`}
          href={`?page=${item.page}`}
          onClick={(event) => handleNavigate(event, item.page)}
          aria-current={current === item.page ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export default AdminNav
