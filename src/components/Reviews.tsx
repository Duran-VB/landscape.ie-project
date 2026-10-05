import { reviews, reviewTopics } from '../data/reviews'
import { site } from '../data/site'
import { Stars } from './ui/Icons'
import { MaskLines, Reveal } from './ui/Motion'
import './Reviews.css'

export function Reviews() {
  return (
    <section id="reviews" className="reviews section bg-forest on-dark">
      <div className="container reviews__grid">
        <div className="reviews__aside">
          <Reveal>
            <p className="label eyebrow reviews__eyebrow">Google reviews</p>
          </Reveal>
          <MaskLines className="display fs-l" lines={['Trusted by', <em key="h" className="caps">homeowners</em>]} />

          <Reveal className="reviews__score" delay={0.1}>
            <span className="reviews__big">{site.rating}</span>
            <span className="reviews__meta">
              <Stars rating={site.rating} className="reviews__stars" />
              <span>{site.reviewCount} Google Reviews</span>
            </span>
          </Reveal>

          <Reveal className="reviews__topics" delay={0.15}>
            <p className="label reviews__topics-title">Mentioned in reviews</p>
            <ul>
              {reviewTopics.map((topic) => (
                <li key={topic.label}>
                  {topic.label} <span>{topic.count}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="reviews__list">
          {reviews.map((review, i) => (
            <Reveal key={review.author} className="review" y={36} amount={0.3}>
              <figure>
                <span className="label review__index">{String(i + 1).padStart(2, '0')}</span>
                <blockquote>
                  <p className="review__pull serif">“{review.pull}”</p>
                  <p className="review__text">{review.text}</p>
                </blockquote>
                <figcaption className="review__by">
                  <span className="review__author">{review.author}</span>
                  <span className="label review__source">Google review</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
