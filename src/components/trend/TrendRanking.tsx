import type { TrendTopic } from '../../contract/types'
import { formatNumberId } from '../../logic/format'
import { directionLabel } from '../../logic/trendView'

/** Ranking trend: skor menurun, arah dinyatakan teks + panah (bukan warna saja). */
export default function TrendRanking({ topics }: { topics: TrendTopic[] }) {
  return (
    <section className="card trend-ranking">
      <h3 className="card__title">Rising Trends</h3>
      {topics.length === 0 ? (
        <p className="facet__empty">belum ada skor tren pada run terakhir</p>
      ) : (
        <ol className="trend-ranking__list">
          {topics.map((topic, index) => (
            <li className="trend-ranking__item" key={topic.topic}>
              <span className="trend-ranking__rank">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="trend-ranking__body">
                <span className="trend-ranking__topic">{topic.topic}</span>
                <span className="trend-ranking__meta">
                  {formatNumberId(topic.mentions)} mentions · {formatNumberId(topic.sources)}{' '}
                  sources
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
