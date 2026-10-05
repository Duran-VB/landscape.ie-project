# Landscapes.ie: interactive website demo

A premium, image-led website concept for **Landscapes.ie** (landscaping and garden design, 086 312 7532). The centrepiece is **Design Your Garden**, a configurator where visitors choose options, watch an illustrated garden rebuild itself, and see an indicative price update live.

> **Frontend-only demonstration.** There is no backend, database, authentication or API. The enquiry form validates and shows a success state, but nothing is sent or stored. Nothing persists after a refresh.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

Requires Node 20 or later. The build output in `dist/` is static, so it can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, S3). For a sub-path host such as GitHub Pages, set `base` in `vite.config.ts`.

## What's on the page

| Section | Notes |
| --- | --- |
| Navigation | Transparent over the hero, compact and solid on scroll, hides while reading down. Full-screen menu on mobile. |
| Hero | Full-screen photo with a slow scale-in. On scroll the image drifts and scales while the next section slides over it. |
| Intro | Editorial statement whose words brighten as you scroll, plus overlapping images. |
| Visual statement | A framed image opens out to full-bleed; "From empty space / to somewhere you want to be." |
| Services | Editorial list. Hover shows a cursor-following image and expands the row; tap to open on touch. |
| Before / After | Draggable divider (mouse, touch and keyboard), with a one-off hint sweep. |
| Selected work | Three large, image-led project layouts. |
| Design. Build. Live outside. | A pinned, cinematic three-word sequence. |
| **Design Your Garden** | The configurator (below). |
| Reviews | 4.9 ★ · 60 Google Reviews, the three supplied reviews, and Google's review topics. |
| Process | Four steps. Pinned horizontal scroll on desktop, vertical story on mobile. |
| About | "Good gardens start with listening," backed by quotes from the reviews. |
| Final CTA and footer | Design Your Garden, call 086 312 7532, and photo credits. |

## The configurator

- **One piece of state** (`Selections` in `src/data/pricing.ts`): size, patio, paving, fencing, gate, planting, lighting, extras, plus optional length × width.
- **Every choice does two things.** It reshapes the illustrated garden and changes the estimate. A toast names both, for example "Premium patio · +€6,500", and the price digits roll to the new total.
- **The estimate** is `basePrice + every selected option`, calculated in `calculateEstimate()`. It is always labelled *Estimated Project Price* and shown with the indicative-estimate disclaimer.
- **The flow:** five steps, then "Your garden concept is ready" (preview, selections, breakdown, total), then a quote form with validation and a photo-upload preview, then a success state.

### Changing prices

All prices live in one object, `PRICES`, in [`src/data/pricing.ts`](src/data/pricing.ts):

```ts
export const PRICES = {
  basePrice: 8000,
  gardenSize: { small: 0, medium: 4000, large: 9000 },
  patio: { none: 0, standard: 4000, premium: 6500 },
  paving: { standard: 0, naturalStone: 2000, porcelain: 2500 },
  // …
}
```

Edit a number and the configurator, breakdown, concept summary and quote form all follow. Option labels and one-line notes are in `OPTIONS` in the same file.

### How the garden visual works

`src/components/configurator/scene/` draws a small isometric "architectural model" in SVG. There is no 3D engine.

- `iso.ts`: the projection (metres to pixels) and colour helpers, including the evening dusk tint.
- `parts.tsx`: drawing primitives such as boxes, shrubs, grasses, trees, the feature tree and bollards.
- `GardenScene.tsx`: lays out the house, fences, gate, patio (three paving finishes), planting beds, raised beds, seating, steps and lighting, depth-sorts them, and wraps each in an enter/exit animation. Materials cross-fade. Size and patio changes tween the whole layout smoothly (`useTween`). In evening view the scene dims and the lights, glazing and fire bowl glow.

To add an option, add it to `PRICES` and `OPTIONS`, then draw it in `GardenScene.tsx` behind a check on the selection.

## Editing content

| What | Where |
| --- | --- |
| Business details, nav, phone | `src/data/site.ts` |
| Reviews and review topics | `src/data/reviews.ts` (real reviews, quoted as supplied) |
| Services, projects, process, about | `src/data/content.ts` |
| Photography | `src/data/images.ts` and `src/assets/photos/` |
| Photo credits | `src/data/credits.ts` (also listed in the footer) |
| Colours, type, spacing | `src/styles/global.css` (CSS custom properties) |

## Photography: placeholders, please replace

The photos are **placeholders**. They are freely licensed (**CC BY 2.0**) Flickr images via the Open Images dataset, cropped and graded to a common warm, muted look. **They are not Landscapes.ie projects.** Every one is credited in `src/data/credits.ts` and in the footer under "Photo credits." Some come from other companies' Flickr accounts, so they must not be presented as Landscapes.ie's work on a live site.

The available copies are only 1024 px wide, so full-screen images look soft on large or high-density screens. Before going live:

1. Replace the files in `src/assets/photos/` with Landscapes.ie's own project photos at about 2400 px wide. Keep the file names, or update the imports in `src/data/images.ts`.
2. Use a real before/after pair from one project for `before.jpg` and `after.jpg`, shot from the same position.
3. Update the alt text in `src/data/images.ts` and clear out `src/data/credits.ts`.

## Stack

- **Vite + React 19 + TypeScript.** No router, no state library.
- **Motion** (`motion/react`) for reveals, scroll-linked effects, presence animations and the rolling price.
- **Lenis** for smooth scrolling. It is switched off when the visitor prefers reduced motion.
- **Plain CSS** with design tokens. Each component has its own stylesheet next to it.
- **Self-hosted fonts:** Instrument Serif (display) and Inter Tight (UI), via Fontsource.

### Project structure

```
src/
  App.tsx                     page composition + in-page link scrolling
  data/                       pricing, content, reviews, site details, images, credits
  lib/scroll.ts               Lenis smooth scroll + helpers
  hooks/                      useMediaQuery, useTween
  styles/global.css           design system
  components/
    Navbar, Hero, Intro, Statement, Services, BeforeAfter, Projects,
    Manifesto, Reviews, Process, About, CTA, Footer
    ui/                       Motion primitives, Photo, AnimatedPrice, Icons
    configurator/             GardenConfigurator, GardenPreview, Controls,
                              PriceSummary, QuoteForm, scene/
```

## Accessibility and motion

- Animation respects `prefers-reduced-motion`: smooth scroll is off, transitions are reduced and the price snaps.
- Configurator options are real radio buttons and checkboxes, so they work from the keyboard.
- The before/after divider is a keyboard slider (arrow keys, Home and End).
- The menu and quote form trap the page scroll, close on Escape and return focus.
- Form errors are announced and focus moves to the first invalid field.
