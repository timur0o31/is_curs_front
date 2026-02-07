import About from '../components/About'
import Contacts from '../components/Contacts'
import Doctors from '../components/Doctors'
import Events from '../components/Events'
import Hero from '../components/Hero'
import Procedures from '../components/Procedures'
import { doctors, procedures } from '../data/siteData'

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Procedures items={procedures} />
      <Doctors items={doctors} />
      <Events />
      <Contacts />
    </>
  )
}

export default HomePage
