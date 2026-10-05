// Real Google reviews supplied for the demo. Wording is quoted as written
// (one spelling corrected: "completly" → "completely"). Susan's review is
// truncated on Google, so it ends with an ellipsis rather than invented text.

export type Review = {
  author: string
  /** A verbatim excerpt used as the large pull quote. */
  pull: string
  /** The review text as supplied. */
  text: string
}

export const reviews: Review[] = [
  {
    author: 'Susan Beckman',
    pull: 'Ciaran listened to our specific requests and was even able to find a tree that is usually unavailable.',
    text: 'We are thrilled with our new garden and patio! Ciaran listened to our specific requests and was even able to find a tree that is usually unavailable. Work was started and completed in the timeline as promised…',
  },
  {
    author: 'John Clarke',
    pull: 'Can’t say enough good words about the experience.',
    text: 'Recently had our front drive/garden completely redesigned by Ciaran and team and can’t say enough good words about the experience. Ciaran done a great job on giving us design options and the lads on the job very pleasant to work with and got the whole thing completed in just over two weeks. Happy customer.',
  },
  {
    author: 'Claire & Emmet',
    pull: 'Ciaran and his team recently redid our whole garden — quickly and seamlessly!',
    text: 'Ciaran and his team recently redid our whole garden - quickly and seamlessly! They were a pleasure to work with and complete professionals from start to finish. I would highly recommend them!',
  },
]

// Topics Google highlights across the reviews, with the counts shown on the
// listing. Real data — do not pad this list.
export const reviewTopics = [
  { label: 'Back garden', count: 7 },
  { label: 'Fencing', count: 4 },
  { label: 'Quick completion', count: 3 },
  { label: 'Patio design', count: 2 },
]
