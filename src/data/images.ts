// ---------------------------------------------------------------------------
// All photography in one place.
//
// The current images are PLACEHOLDERS: freely licensed (CC BY 2.0) Flickr
// photos via the Open Images dataset, graded to a common warm, muted look.
// They are not Landscapes.ie projects. Credits live in src/data/credits.ts.
//
// To use real Landscapes.ie photos, replace the files in src/assets/photos/
// (keep the names, or point the imports below at new files) and update the
// alt text. `position` sets the CSS object-position used when cropping.
// ---------------------------------------------------------------------------

import hero from '../assets/photos/hero.jpg'
import intro from '../assets/photos/intro.jpg'
import introDetail from '../assets/photos/intro-detail.jpg'
import statement from '../assets/photos/statement.jpg'
import serviceDesign from '../assets/photos/service-design.jpg'
import servicePatios from '../assets/photos/service-patios.jpg'
import serviceFencing from '../assets/photos/service-fencing.jpg'
import serviceTransformations from '../assets/photos/service-transformations.jpg'
import serviceFront from '../assets/photos/service-front.jpg'
import servicePlanting from '../assets/photos/service-planting.jpg'
import before from '../assets/photos/before.jpg'
import after from '../assets/photos/after.jpg'
import projectBack from '../assets/photos/project-back.jpg'
import projectFront from '../assets/photos/project-front.jpg'
import projectTransformation from '../assets/photos/project-transformation.jpg'
import manifestoDesign from '../assets/photos/manifesto-design.jpg'
import manifestoBuild from '../assets/photos/manifesto-build.jpg'
import manifestoLive from '../assets/photos/manifesto-live.jpg'
import processDiscover from '../assets/photos/process-discover.jpg'
import processDesign from '../assets/photos/process-design.jpg'
import processBuild from '../assets/photos/process-build.jpg'
import processEnjoy from '../assets/photos/process-enjoy.jpg'
import about from '../assets/photos/about.jpg'
import cta from '../assets/photos/cta.jpg'

export type Photo = { src: string; alt: string; position?: string }

const photo = (src: string, alt: string, position?: string): Photo => ({ src, alt, position })

export const photos = {
  hero: photo(hero, 'Curving gravel paths and lawn in a walled garden at golden hour', '35% 55%'),
  intro: photo(intro, 'Outdoor dining set under a parasol in a leafy garden'),
  introDetail: photo(introDetail, 'Ornamental grasses with Perovskia and white phlox'),
  statement: photo(statement, 'Contemporary garden with stepping stones over water and a timber pavilion', '62% 50%'),
  serviceDesign: photo(serviceDesign, 'Gravel path curving through naturalistic planting', '60% 50%'),
  servicePatios: photo(servicePatios, 'Granite-paved patio with garden chairs and a timber fence'),
  serviceFencing: photo(serviceFencing, 'New horizontal slatted timber fence beside a flowering lilac', '40% 50%'),
  serviceTransformations: photo(serviceTransformations, 'Small urban garden with decking, water and lush planting'),
  serviceFront: photo(serviceFront, 'Stone house with a gravel path through the front lawn'),
  servicePlanting: photo(servicePlanting, 'Hydrangeas in full flower'),
  before: photo(before, 'An overgrown, fenced back garden'),
  after: photo(after, 'A back garden with a timber fence, lawn and planted borders'),
  projectBack: photo(projectBack, 'Timber fence with trellis and gate above a sandstone patio'),
  projectFront: photo(projectFront, 'Block-paved driveway, lawn and young tree in front of a house'),
  projectTransformation: photo(projectTransformation, 'Paved path leading to a circular patio with a table and chairs'),
  manifestoDesign: photo(manifestoDesign, 'Striped lawn between a deep flower border and a clipped yew hedge'),
  manifestoBuild: photo(manifestoBuild, 'A circular paver patio being laid on a sand bed'),
  manifestoLive: photo(manifestoLive, 'A contemporary garden lit at dusk'),
  processDiscover: photo(processDiscover, 'A plain lawn and old fence: a garden waiting for a plan'),
  processDesign: photo(processDesign, 'Stone steps rising through terraced planting'),
  processBuild: photo(processBuild, 'New beds, edging and membrane during a garden build', '40% 50%'),
  processEnjoy: photo(processEnjoy, 'Timber pergola over chairs and a fire pit on gravel'),
  about: photo(about, 'Lawn, clipped yew hedge and white border with a teak bench'),
  cta: photo(cta, 'A long flower border beside a lawn and gravel path under an old stone wall', '40% 50%'),
}
