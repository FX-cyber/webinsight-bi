import type { WebRecord } from '../../contract/types'
import { buildKpiSummary } from '../../logic/counts'
import { formatNumberId } from '../../logic/format'

const EMPTY_DISPLAY = '—'

export default function KpiGrid({ records }: { records: WebRecord[] }) {
  const kpi = buildKpiSummary(records)
  const cards = [
    { label: 'Total Records', value: formatNumberId(kpi.totalRecords) },
    {
      label: 'Unique Sources',
      value: kpi.uniqueSources === 0 ? EMPTY_DISPLAY : formatNumberId(kpi.uniqueSources),
    },
    {
      label: 'Unique Entities',
      value: kpi.uniqueEntities === 0 ? EMPTY_DISPLAY : formatNumberId(kpi.uniqueEntities),
    },
    {
      label: 'Unique Topics',
      value: kpi.uniqueTopics === 0 ? EMPTY_DISPLAY : formatNumberId(kpi.uniqueTopics),
    },
  ]

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div className="kpi-card" key={card.label}>
          <span className="kpi-card__value">{card.value}</span>
          <span className="kpi-card__label">{card.label}</span>
        </div>
      ))}
    </div>
  )
}
