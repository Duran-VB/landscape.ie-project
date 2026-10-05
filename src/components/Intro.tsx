import { photos } from '../data/images'
import { ArrowRight } from './ui/Icons'
import { Reveal, ScrollWords } from './ui/Motion'
import { Photo } from './ui/Photo'
import './Intro.css'

export function Intro() {
  return (
    <section className="intro section bg-ivory" aria-label="Our approach">
      <div className="container intro__grid">
        <Reveal className="intro__eyebrow">
          <p className="label eyebrow">Our approach</p>
        </Reveal>

        <ScrollWords className="serif-display intro__statement" text="A garden should be more than something you look at." />

        <Reveal className="intro__answer" delay={0.1}>
          <p className="serif-display">
            <em>It should be somewhere you want to spend time.</em>
          </p>
        </Reveal>

        <div className="intro__media">
          <Photo photo={photos.intro} className="intro__photo-main" parallax={7} reveal />
          <Photo photo={photos.introDetail} className="intro__photo-detail" parallax={12} reveal />
        </div>

        <Reveal className="intro__copy" delay={0.15}>
          <p className="lead">
            Landscapes.ie designs and builds outdoor spaces around the people who use them. We start with how you want to
            live outdoors — then shape the patio, planting, boundaries and details to suit your home, your space and your
            plans.
          </p>
          <a href="#design" className="link">
            Start designing yours <ArrowRight />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
