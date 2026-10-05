import { principles } from '../data/content'
import { photos } from '../data/images'
import { MaskLines, Reveal } from './ui/Motion'
import { Photo } from './ui/Photo'
import './About.css'

export function About() {
  return (
    <section id="about" className="about section bg-ivory">
      <div className="container about__grid">
        <div className="about__head">
          <Reveal>
            <p className="label eyebrow about__eyebrow">About</p>
          </Reveal>
          <MaskLines
            className="display fs-xl"
            lines={['Good gardens', 'start with', <em key="l" className="caps">listening.</em>]}
          />
          <Reveal delay={0.1}>
            <p className="lead about__lead">
              Every garden starts with a conversation. Ciaran and the team take the time to understand how you want to use
              your outdoor space, talk you through the options, then build it carefully and keep to the timeline agreed.
            </p>
            <p className="about__aside">You don’t have to take our word for it — here’s what homeowners say.</p>
          </Reveal>
        </div>

        <Photo photo={photos.about} className="about__photo" parallax={8} reveal />

        <ol className="about__principles">
          {principles.map((p, i) => (
            <li key={p.title}>
              <Reveal className="principle" y={24}>
                <span className="label principle__num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="serif principle__title">{p.title}</h3>
                <p className="principle__copy">{p.copy}</p>
                <figure className="principle__quote">
                  <blockquote>“{p.quote}”</blockquote>
                  <figcaption className="label">{p.author}</figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
