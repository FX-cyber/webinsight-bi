import type { TrendTopic } from '../../contract/types'
import { formatNumberId } from '../../logic/format'
import { directionLabel } from '../../logic/trendView'

interface TrendHeroProps {
  topic: TrendTopic | null
  category: string | null
}

/** Hero editorial: top trend sebagai headline, skor sebagai angka pendamping. */
export default function TrendHero({ topic, category }: TrendHeroProps) {
  if (topic === null) return null

  return (
    <section className="trend-hero">
      <div className="trend-hero__main">
        <span className="trend-hero__rank">#01 · TOP TREND</span>
        <h3 className="trend-hero__topic">{topic.topic}</h3>
        <p className="trend-hero__meta">
          {formatNumberId(topic.mentions)} mentions · {formatNumberId(topic.sources)} sources
          {category === null ? '' : ` · ${category}`}
        </p>
      </div>
      <div className="trend-hero__score">
        <span className="trend-hero__score-value">{topic.trend_score.toFixed(1)}</span>
        <span className="trend-hero__score-label">Trend Score</span>
        <span className="trend-hero__direction">{directionLabel(topic.direction)}</span>
      </div>
    </section>
  )
}
