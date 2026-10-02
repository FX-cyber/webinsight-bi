import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
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
        <AreaChart data={series.points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="mentionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f7bf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(93, 108, 150, 0.15)" vertical={false} />
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
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3f7bf6"
            strokeWidth={2.5}
            fill="url(#mentionFill)"
            dot={series.points.length <= 40}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
