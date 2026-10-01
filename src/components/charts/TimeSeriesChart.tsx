import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WebRecord } from '../../contract/types'
import { formatDateId, formatNumberId } from '../../logic/format'
import { buildTimeSeries } from '../../logic/timeSeries'
import ChartCard from './ChartCard'

export default function TimeSeriesChart({
  records,
  title = 'Mentions Over Time',
}: {
  records: WebRecord[]
  title?: string
}) {
  const series = useMemo(() => buildTimeSeries(records), [records])

  const subtitle = [
    series.granularity === 'daily' ? 'Agregasi harian' : 'Agregasi bulanan',
    series.excludedWithoutDate > 0
      ? `${series.excludedWithoutDate} record tanpa tanggal tidak ditampilkan`
      : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ')

  return (
    <ChartCard title={title} subtitle={subtitle} isEmpty={series.points.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={series.points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11 }}
            minTickGap={28}
            tickFormatter={(value: string) =>
              series.granularity === 'daily' ? formatDateId(value) : value
            }
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(value) => [formatNumberId(Number(value)), 'Jumlah record']}
            labelFormatter={(label) =>
              series.granularity === 'daily' ? formatDateId(String(label)) : String(label)
            }
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={series.points.length <= 40}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
