import { photos, type Photo } from './images'

// Section copy. Kept deliberately short and free of invented claims —
// credibility comes from the real reviews in reviews.ts.

export type Service = { number: string; title: string; description: string; photo: Photo }

export const services: Service[] = [
  {
    number: '01',
    title: 'Garden Design',
    description: 'Layouts shaped around how you want to use the space — with options to compare before anything is built.',
    photo: photos.serviceDesign,
  },
  {
    number: '02',
    title: 'Patios & Paving',
    description: 'Patios, terraces and paths that extend the house outdoors, laid to last.',
    photo: photos.servicePatios,
  },
  {
    number: '03',
    title: 'Fencing',
    description: 'Timber boundaries and gates that bring privacy, shelter and structure.',
    photo: photos.serviceFencing,
  },
  {
    number: '04',
    title: 'Garden Transformations',
    description: 'Complete redesigns that take a whole garden from tired to transformed.',
    photo: photos.serviceTransformations,
  },
  {
    number: '05',
    title: 'Front Gardens & Driveways',
    description: 'Front drives and gardens redesigned to give the house a better first impression.',
    photo: photos.serviceFront,
  },
  {
    number: '06',
    title: 'Planting & Finishing',
    description: 'Trees, borders and final details that bring the finished space to life.',
    photo: photos.servicePlanting,
  },
]

export type Project = { title: string; summary: string; tags: string[]; photo: Photo }

export const projects: Project[] = [
  {
    title: 'Back Garden',
    summary: 'Complete transformation',
    tags: ['Patio', 'Fencing', 'Planting'],
    photo: photos.projectBack,
  },
  {
    title: 'Front Garden',
    summary: 'Driveway + garden redesign',
    tags: ['Driveway', 'Paving', 'Planting'],
    photo: photos.projectFront,
  },
  {
    title: 'Garden Transformation',
    summary: 'Patio + planting + boundaries',
    tags: ['Patio', 'Planting', 'Boundaries'],
    photo: photos.projectTransformation,
  },
]

export type ProcessStep = { number: string; title: string; copy: string; photo: Photo }

export const processSteps: ProcessStep[] = [
  { number: '01', title: 'Discover', copy: 'Tell us what you’re imagining.', photo: photos.processDiscover },
  { number: '02', title: 'Design', copy: 'Work through the possibilities for your space.', photo: photos.processDesign },
  { number: '03', title: 'Build', copy: 'Our team brings the design to life.', photo: photos.processBuild },
  { number: '04', title: 'Enjoy', copy: 'Step outside into something completely different.', photo: photos.processEnjoy },
]

// "Good gardens start with listening" — each principle is backed by the
// words of a real customer.
export type Principle = { title: string; copy: string; quote: string; author: string }

export const principles: Principle[] = [
  {
    title: 'Listening',
    copy: 'Every project starts with what you want from the space — the specifics, not a template.',
    quote: 'Ciaran listened to our specific requests',
    author: 'Susan Beckman',
  },
  {
    title: 'Design options',
    copy: 'You see the possibilities and choose the direction before work begins.',
    quote: 'a great job on giving us design options',
    author: 'John Clarke',
  },
  {
    title: 'Quality workmanship',
    copy: 'A careful, tidy team on site from the first day to the last.',
    quote: 'complete professionals from start to finish',
    author: 'Claire & Emmet',
  },
  {
    title: 'Reliable timelines',
    copy: 'A plan you can count on, so you know when your garden will be ready.',
    quote: 'completed in the timeline as promised',
    author: 'Susan Beckman',
  },
  {
    title: 'Complete transformations',
    copy: 'Patios, boundaries, planting and finishing — delivered as one joined-up project.',
    quote: 'redid our whole garden — quickly and seamlessly',
    author: 'Claire & Emmet',
  },
]
