import { useEffect, useState } from 'react'
import About from '../components/About'
import Doctors from '../components/Doctors'
import Events from '../components/Events'
import Hero from '../components/Hero'
import Procedures from '../components/Procedures'
import Home from '../services/Home'

const HOME_PROCEDURES_LIMIT = 6

const mapProcedure = (item) => ({
  title: item?.name || 'Процедура',
  description: item?.shortDescription || 'Описание будет добавлено',
  duration: 'По расписанию',
  level: 'Назначение',
})

const mapDoctor = (item) => ({
  name: item?.name || 'Врач санатория',
  role: item?.specialization || 'Специалист',
  focus: item?.specialization
    ? `Специализация: ${item.specialization}`
    : 'Специалист санатория',
  tags: item?.specialization ? [item.specialization] : ['Санаторий'],
})

const mapEvent = (item) => {
  const date = item?.date ? new Date(item.date) : null

  return {
    day: date
      ? date.toLocaleDateString('ru-RU', { weekday: 'long', day: '2-digit', month: '2-digit' })
      : 'Дата уточняется',
    time: 'В течение дня',
    title: item?.title || 'Событие',
    description: item?.description || 'Описание события будет добавлено',
    tag: item?.place || 'Санаторий',
  }
}

function HomePage() {
  const [procedureItems, setProcedureItems] = useState([])
  const [doctorItems, setDoctorItems] = useState([])
  const [eventItems, setEventItems] = useState([])

  useEffect(() => {
    let cancelled = false

    const loadHomeData = async () => {
      const [proceduresResult, doctorsResult, eventsResult] = await Promise.allSettled([
        Home.getProcedures(),
        Home.getDoctors(),
        Home.getEvents(),
      ])

      if (cancelled) return

      if (proceduresResult.status === 'fulfilled') {
        setProcedureItems(
          proceduresResult.value.data
            .map(mapProcedure)
            .slice(0, HOME_PROCEDURES_LIMIT),
        )
      }

      if (doctorsResult.status === 'fulfilled') {
        setDoctorItems(doctorsResult.value.data.map(mapDoctor))
      }

      if (eventsResult.status === 'fulfilled') {
        setEventItems(eventsResult.value.data.map(mapEvent))
      }
    }

    loadHomeData()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <Hero />
      <About />
      <Procedures items={procedureItems} />
      <Doctors items={doctorItems} />
      <Events items={eventItems} />
    </>
  )
}

export default HomePage
