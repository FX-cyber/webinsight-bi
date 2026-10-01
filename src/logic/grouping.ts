/**
 * Helper pengelompokan kategorikal yang dipakai counts, topN, dan sources.
 * Semua perbandingan case-insensitive; label tampilan tetap bentuk aslinya.
 */

export interface LabelGroup<T> {
  /** Variasi tulisan yang dipilih sebagai label tampilan. */
  label: string
  count: number
  items: T[]
}

export function groupKey(value: string): string {
  return value.trim().toLowerCase()
}

export function matchesLabel(candidate: string, value: string | null): boolean {
  return value !== null && groupKey(candidate) === groupKey(value)
}

/**
 * Mengelompokkan item berdasarkan nilai teks secara case-insensitive; null dilewati.
 *
 * Label representatif = variasi yang paling sering muncul. Bila frekuensi seri,
 * dipakai variasi yang lebih dulu muncul di input (urutan insersi Map dipertahankan
 * dan pembaruan label hanya terjadi saat count strictly lebih besar), sehingga
 * hasilnya deterministik untuk input yang sama.
 */
export function groupByLabel<T>(items: T[], getValue: (item: T) => string | null): LabelGroup<T>[] {
  const groups = new Map<string, LabelGroup<T> & { variants: Map<string, number> }>()

  for (const item of items) {
    const value = getValue(item)
    if (value === null) continue
    const key = groupKey(value)

    let group = groups.get(key)
    if (group === undefined) {
      group = { label: value, count: 0, items: [], variants: new Map() }
      groups.set(key, group)
    }

    group.count += 1
    group.items.push(item)

    const variantCount = (group.variants.get(value) ?? 0) + 1
    const bestCount = group.variants.get(group.label) ?? 0
    group.variants.set(value, variantCount)
    if (variantCount > bestCount) group.label = value
  }

  return [...groups.values()].map(({ label, count, items }) => ({ label, count, items }))
}

/**
 * Comparator deterministik: count menurun, lalu label menaik memakai perbandingan
 * code-unit (bukan locale) agar urutan stabil di semua lingkungan.
 */
export function compareByCountDesc<T extends { count: number }>(getLabel: (item: T) => string) {
  return (a: T, b: T): number => {
    if (a.count !== b.count) return b.count - a.count
    const labelA = getLabel(a)
    const labelB = getLabel(b)
    if (labelA === labelB) return 0
    return labelA < labelB ? -1 : 1
  }
}
