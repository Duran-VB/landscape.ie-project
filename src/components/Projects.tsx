import { projects, type Project } from '../data/content'
import { MaskLines, Reveal } from './ui/Motion'
import { Photo } from './ui/Photo'
import './Projects.css'

const layouts = ['full', 'right', 'left'] as const

export function Projects() {
  return (
    <section id="projects" className="projects section bg-ivory">
      <div className="container">
        <div className="projects__head">
          <MaskLines className="display fs-xxl" lines={['Selected', <em key="w" className="caps">work</em>]} />
          <Reveal className="projects__count">
            <p className="label">({String(projects.length).padStart(2, '0')}) Projects</p>
            <p className="projects__note">
              Back gardens, front gardens and complete transformations — designed around each home.
            </p>
          </Reveal>
        </div>

        <div className="projects__list">
          {projects.map((project, i) => (
            <ProjectFeature key={project.title} project={project} index={i} layout={layouts[i % layouts.length]} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectFeature({ project, index, layout }: { project: Project; index: number; layout: (typeof layouts)[number] }) {
  return (
    <article className={`project project--${layout}`}>
      <Photo photo={project.photo} className="project__photo" parallax={layout === 'full' ? 8 : 6} reveal />
      <Reveal className="project__text" delay={0.1}>
        <p className="label project__index">
          {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </p>
        <h3 className="display fs-l project__title">{project.title}</h3>
        <p className="serif project__summary">
          <em>{project.summary}</em>
        </p>
        <ul className="project__tags" aria-label="Project includes">
          {project.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      </Reveal>
    </article>
  )
}
