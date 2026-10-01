import type { TrendTopic } from '../../contract/types'
import { formatNumberId } from '../../logic/format'
import { directionLabel } from '../../logic/trendView'

/** Hero Pulse: top trend dari run tren terakhir, informasi pertama yang dilihat. */
export default function TrendHero({ topic }: { topic: TrendTopic | null }) {
  if (topic === null) return null

  return (
    <article className="trend-hero">
      <span className="trend-hero__rank" aria-hidden="true">
        #01
      </span>
      <div className="trend-hero__main">
        <p className="trend-hero__eyebrow">Top trend · run tren terakhir</p>
        <h3 className="trend-hero__topic">{topic.topic}</h3>
        <p className="trend-hero__meta">
          {formatNumberId(topic.mentions)} mentions · {formatNumberId(topic.sources)} sources ·{' '}
          {formatNumberId(topic.recent_mentions)} dalam 24 jam
        </p>
        {topic.top_keywords.length === 0 ? null : (
          <p className="trend-hero__keywords">{topic.top_keywords.join(' · ')}</p>
        )}
      </div>
      <div className="trend-hero__score">
        <span className="trend-hero__score-value">{topic.trend_score.toFixed(1)}</span>
        <span className="trend-hero__score-label">Trend Score</span>
        <span className="trend-hero__direction">{directionLabel(topic.direction)}</span>
      </div>
    </article>
  )
}
