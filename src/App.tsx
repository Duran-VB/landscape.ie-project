import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { About } from './components/About'
import { BeforeAfter } from './components/BeforeAfter'
import { CTA } from './components/CTA'
import { GardenConfigurator } from './components/configurator/GardenConfigurator'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Intro } from './components/Intro'
import { Manifesto } from './components/Manifesto'
import { Navbar } from './components/Navbar'
import { Process } from './components/Process'
import { Projects } from './components/Projects'
import { Reviews } from './components/Reviews'
import { Services } from './components/Services'
import { Statement } from './components/Statement'
import { initSmoothScroll, scrollToTarget } from './lib/scroll'

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  // Smooth-scroll every in-page link (#projects, #design, …).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
      const hash = link.getAttribute('href') ?? '#'
      e.preventDefault()
      if (hash === '#' || hash === '#top') {
        scrollToTarget(0)
        return
      }
      const target = document.querySelector<HTMLElement>(hash)
      if (!target) return
      scrollToTarget(target)
      history.replaceState(null, '', hash)
      if (hash === '#main') target.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Intro />
        <Statement />
        <Services />
        <BeforeAfter />
        <Projects />
        <Manifesto />
        <GardenConfigurator />
        <Reviews />
        <Process />
        <About />
        <CTA />
      </main>
      <Footer />
      <div className="grain" aria-hidden />
    </MotionConfig>
  )
}
