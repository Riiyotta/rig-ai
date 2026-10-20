import Overlays from './components/Overlays.jsx'
import Hero from './components/Hero.jsx'
import ProblemSection from './components/ProblemSection.jsx'
import IntroRig from './components/IntroRig.jsx'
import Difference from './components/Difference.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Benefits from './components/Benefits.jsx'
import GetStarted from './components/GetStarted.jsx'
import Faq from './components/Faq.jsx'
import Cta from './components/Cta.jsx'
import Footer from './components/Footer.jsx'

// DOM order mirrors recon/source/index.pretty.html (body L360-4172). The section-divider
// spacers between sections are part of <main>, not of any section component.
export default function App() {
  return (
    <>
      <Overlays />
      <Hero />
      <div className="content-lines"></div>
      <main className="content">
        <div style={{ paddingBottom: '4rem' }}>
          <div className="section-divider" style={{ position: 'relative', top: '4rem' }}></div>
        </div>
        <ProblemSection />
        <div className="section-divider"></div>
        <IntroRig />
        <div className="section-divider"></div>
        <Difference />
        <div className="section-divider"></div>
        <HowItWorks />
        <div className="section-divider"></div>
        <Benefits />
        <div className="section-divider"></div>
        <GetStarted />
        <div className="section-divider"></div>
        <Faq />
        <div className="section-divider"></div>
        <div style={{ paddingTop: '4rem' }}>
          <div className="section-divider" style={{ position: 'relative', top: '-4rem' }}></div>
        </div>
      </main>
      <Cta />
      <Footer />
    </>
  )
}
