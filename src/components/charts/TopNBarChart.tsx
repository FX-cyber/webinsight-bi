import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WebRecord } from '../../contract/types'
import { uniqueCount } from '../../logic/counts'
import { formatNumberId } from '../../logic/format'
import { topNByField } from '../../logic/topN'
import type { TopField } from '../../logic/topN'
import ChartCard from './ChartCard'

interface TopNBarChartProps {
  title: string
  field: TopField
  color: string
  records: WebRecord[]
}

export default function TopNBarChart({ title, field, color, records }: TopNBarChartProps) {
  const entries = useMemo(() => topNByField(records, field), [records, field])
  const uniqueTotal = useMemo(
    () => uniqueCount(records.map((record) => record[field])),
    [records, field],
  )

  const height = Math.max(180, entries.length * 32)

  return (
    <ChartCard
      title={title}
      subtitle={`${entries.length} teratas dari ${uniqueTotal} nilai unik`}
      isEmpty={entries.length === 0}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={entries} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [formatNumberId(Number(value)), 'Jumlah record']}
            cursor={{ fill: 'var(--color-surface-alt)' }}
          />
          <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
