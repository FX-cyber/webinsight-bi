import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle: string
  isEmpty: boolean
  children: ReactNode
}

export default function ChartCard({ title, subtitle, isEmpty, children }: ChartCardProps) {
  return (
    <div className="chart-card">
      <div className="chart-card__head">
        <h3 className="chart-card__title">{title}</h3>
        <p className="chart-card__subtitle">{subtitle}</p>
      </div>
      {isEmpty ? <p className="chart-empty">Data tidak cukup untuk chart ini.</p> : children}
    </div>
  )
}
