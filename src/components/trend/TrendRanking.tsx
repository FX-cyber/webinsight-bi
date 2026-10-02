import type { TrendTopic } from '../../contract/types'
import { formatNumberId } from '../../logic/format'
import { directionLabel } from '../../logic/trendView'

/** Ranking tren sebagai baris editorial, bukan kumpulan card. */
export default function TrendRanking({ topics }: { topics: TrendTopic[] }) {
  return (
    <section>
      <div className="chart-card__head">
        <h3 className="section-title">Trend Ranking</h3>
        <p className="section-subtitle">Skor 0-100 dari frequency, recency, dan source diversity</p>
      </div>
      {topics.length === 0 ? (
        <p className="meta-line">Belum ada skor tren pada data yang dimuat.</p>
      ) : (
        <ol className="trend-ranking__list">
          {topics.map((topic, index) => (
            <li className="trend-ranking__item" key={topic.topic}>
              <span className="trend-ranking__rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="trend-ranking__body">
                <span className="trend-ranking__topic">{topic.topic}</span>
                <span className="trend-ranking__meta">
                  {formatNumberId(topic.mentions)} mentions · {formatNumberId(topic.sources)} sources
                </span>
              </span>
              <span className="trend-ranking__score">
                <span className="trend-ranking__score-value">{topic.trend_score.toFixed(1)}</span>
                <span className="trend-ranking__direction">{directionLabel(topic.direction)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
