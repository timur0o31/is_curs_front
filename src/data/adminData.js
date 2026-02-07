export const availableRooms = [
  { id: '101', type: 'Стандарт', floor: '1 этаж' },
  { id: '205', type: 'Комфорт', floor: '2 этаж' },
  { id: '308', type: 'Комфорт', floor: '3 этаж' },
  { id: '412', type: 'Люкс', floor: '4 этаж' },
]

export const stays = [
  {
    id: 'ST-401',
    name: 'Ирина Смирнова',
    room: '214',
    checkIn: '12.03',
    checkOut: '26.03',
    status: 'Активно',
    statusTone: 'success',
  },
  {
    id: 'ST-402',
    name: 'Сергей Блинов',
    room: '318',
    checkIn: '20.03',
    checkOut: '03.04',
    status: 'Предстоящее',
    statusTone: 'warn',
  },
  {
    id: 'ST-403',
    name: 'Марина Егорова',
    room: '122',
    checkIn: '05.02',
    checkOut: '19.02',
    status: 'Завершено',
    statusTone: '',
  },
  {
    id: 'ST-404',
    name: 'Алексей Поляков',
    room: '405',
    checkIn: '15.03',
    checkOut: '29.03',
    status: 'Активно',
    statusTone: 'success',
  },
]

export const stayRequests = [
  {
    id: 'ST-118',
    name: 'Светлана Корнеева',
    request: 'Продление',
    period: '12–19 марта',
    from: '2025-03-12',
    to: '2025-03-19',
    room: '312',
    submitted: '02.02',
    status: 'Ожидает',
    statusTone: 'warn',
  },
  {
    id: 'ST-119',
    name: 'Илья Громов',
    request: 'Досрочный выезд',
    period: '18 марта',
    from: '2025-03-18',
    to: '2025-03-18',
    room: '210',
    submitted: '01.02',
    status: 'Новая',
    statusTone: '',
  },
  {
    id: 'ST-120',
    name: 'Марина Юдина',
    request: 'Перенос даты',
    period: '15–22 марта',
    from: '2025-03-15',
    to: '2025-03-22',
    room: '405',
    submitted: '31.01',
    status: 'Нужны детали',
    statusTone: 'danger',
  },
]

export const doctorRequests = [
  {
    id: 'DR-204',
    name: 'Олег Виноградов',
    specialty: 'Физиотерапевт',
    experience: '8 лет',
    license: '77-2025-XX',
    submitted: '03.02',
    status: 'Новая',
    statusTone: '',
  },
  {
    id: 'DR-205',
    name: 'Мария Федорова',
    specialty: 'Кардиолог',
    experience: '11 лет',
    license: '78-2021-AB',
    submitted: '02.02',
    status: 'Документы получены',
    statusTone: 'warn',
  },
  {
    id: 'DR-206',
    name: 'Илья Савельев',
    specialty: 'Реабилитолог',
    experience: '6 лет',
    license: '50-2022-QP',
    submitted: '01.02',
    status: 'Требует проверки',
    statusTone: 'danger',
  },
]

export const roleActions = [
  {
    name: 'Анна Волкова',
    action: 'Запрос роли врача',
  },
  {
    name: 'Петр Лебедев',
    action: 'Блокировка аккаунта по заявке',
  },
]
