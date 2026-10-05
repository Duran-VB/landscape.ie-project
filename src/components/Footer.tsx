import { credits, PHOTO_LICENSE } from '../data/credits'
import { footerLinks, site } from '../data/site'
import { ArrowUp } from './ui/Icons'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer bg-charcoal on-dark">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <p className="footer__name">{site.wordmark}</p>
            <p className="serif footer__tagline">{site.tagline}</p>
          </div>

          <div className="footer__contact">
            <p className="label footer__heading">Contact</p>
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={site.website} target="_blank" rel="noreferrer">
              {site.websiteLabel}
            </a>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <p className="label footer__heading">Explore</p>
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="footer__wordmark" aria-hidden>
          {site.wordmark}
        </p>

        <details className="footer__credits">
          <summary>Photo credits</summary>
          <p>
            Placeholder photography for this demo — not Landscapes.ie projects. Photos from Flickr via the Open Images dataset,
            licensed{' '}
            <a href={PHOTO_LICENSE.url} target="_blank" rel="noreferrer">
              {PHOTO_LICENSE.name}
            </a>
            ; cropped and colour-graded.
          </p>
          <ul>
            {credits.map((credit) => (
              <li key={credit.use}>
                <span>{credit.use}</span>{' '}
                <a href={credit.url} target="_blank" rel="noreferrer">
                  “{credit.title}”
                </a>{' '}
                by {credit.author}
              </li>
            ))}
          </ul>
        </details>

        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span>Concept demo — frontend only</span>
          <a href="#top" className="footer__top-link">
            Back to top <ArrowUp width={14} height={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
