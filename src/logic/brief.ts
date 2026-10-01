export type SourcePreference = 'publisher' | 'rss' | 'general' | 'mixed'

export const SOURCE_PREFERENCE_LABELS: Record<SourcePreference, string> = {
  publisher: 'Publisher / official sources',
  rss: 'RSS / feeds',
  general: 'General public web',
  mixed: 'Mixed',
}

export interface BriefInput {
  query: string
  topicScope: string
  windowHours: number
  sourcePreference: SourcePreference
  /** ISO timestamp saat brief dibuat; null berarti baris waktu tidak ditulis. */
  generatedAt: string | null
}

/**
 * Menyusun research brief self-contained untuk dijalankan manual di sesi
 * Qoder agent. Fungsi murni dan deterministik: input sama menghasilkan
 * teks sama. Halaman Research tidak menjalankan agent apa pun.
 */
export function buildResearchBrief(input: BriefInput): string {
  const lines: string[] = [
    '# WebInsight Trends - Research Brief',
    '',
    `Objective: Riset publik untuk query "${input.query.trim()}".`,
    `Topic scope: ${input.topicScope.trim() === '' ? 'topic-agnostic' : input.topicScope.trim()}`,
    `Time window: ${input.windowHours} jam terakhir`,
    `Source preference: ${SOURCE_PREFERENCE_LABELS[input.sourcePreference]}`,
  ]

  if (input.generatedAt !== null) {
    lines.push(`Brief generated at: ${input.generatedAt}`)
  }

  lines.push(
    '',
    '## Steps',
    '1. Tentukan 3-5 variasi search query dari objective di atas.',
    '2. Cari sumber publik (WebSearch), prioritaskan preferensi sumber di atas.',
    '3. Buka minimal 3 sumber berbeda (browser/WebFetch) dan nilai relevansinya.',
    '4. Bila hasil tipis, perbaiki query dan ulangi pencarian.',
    '5. Verifikasi tiap klaim: tanggal publikasi, publisher, dan konfirmasi lintas sumber bila ada.',
    '6. Ekstrak record mengikuti kontrak WebRecord (id, title, date, source, entity, category, topic, location, summary, url, retrieved_at).',
    '7. Kelompokkan signal: klaim yang sama dari >= 2 source berbeda ditandai cross-source.',
    '8. Hitung trend score per topic (frequency + recency + source diversity, skala 0-100).',
    '9. Tulis public/data/web-data.json dan public/data/trend-summary.json sesuai kontrak v1.',
    '10. Jalankan validator dan npm run test; commit hanya jika kedua file berubah.',
    '',
    '## Constraints',
    '- Tanpa login, paywall, CAPTCHA, atau browser automation agresif.',
    '- Tanpa API berbayar atau secret.',
    '- Setiap record wajib menyertakan url sumber asli.',
    '- Summary maksimal 400 karakter dan bukan salinan penuh artikel.',
    '- Jika semua sumber gagal, jangan menimpa dataset existing.',
  )

  return lines.join('\n')
}

/** Nama file brief yang deterministik dari query. */
export function briefFileName(query: string): string {
  const slug = query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${slug === '' ? 'research-brief' : slug}.md`
}
