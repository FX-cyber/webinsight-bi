/** Helper presentasi data berbasis Intl. Murni string, tanpa HTML/React. */

export const EMPTY_VALUE = '—'

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const numberFormat = new Intl.NumberFormat('id-ID')

/**
 * "YYYY-MM-DD" -> "1 Sep 2026". Komponen tanggal diparse eksplisit dan
 * diformat pada UTC sehingga tidak pernah bergeser satu hari karena timezone.
 */
export function formatDateId(value: string | null): string {
  if (value === null) return EMPTY_VALUE
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match === null) return EMPTY_VALUE
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return dateFormat.format(date)
}

/** ISO datetime -> "1 Okt 2026, 09.00" (UTC). */
export function formatDateTimeId(value: string | null): string {
  if (value === null) return EMPTY_VALUE
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateTimeFormat.format(date)
}

export function formatNumberId(value: number): string {
  return numberFormat.format(value)
}
