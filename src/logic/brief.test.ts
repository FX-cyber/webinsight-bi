import { describe, expect, it } from 'vitest'
import { briefFileName, buildResearchBrief } from './brief'
import type { BriefInput } from './brief'

const input = (overrides: Partial<BriefInput> = {}): BriefInput => ({
  query: 'Adopsi AI di sekolah',
  topicScope: 'education',
  windowHours: 48,
  sourcePreference: 'mixed',
  generatedAt: '2026-10-01T12:00:00Z',
  ...overrides,
})

describe('buildResearchBrief', () => {
  it('deterministik untuk input yang sama', () => {
    expect(buildResearchBrief(input())).toBe(buildResearchBrief(input()))
  })

  it('memuat query, scope, window, dan preferensi sumber', () => {
    const brief = buildResearchBrief(input())
    expect(brief).toContain('Adopsi AI di sekolah')
    expect(brief).toContain('education')
    expect(brief).toContain('48 jam')
    expect(brief).toContain('Mixed')
  })

  it('menulis baris waktu hanya bila generatedAt diberikan', () => {
    expect(buildResearchBrief(input())).toContain('Brief generated at: 2026-10-01T12:00:00Z')
    expect(buildResearchBrief(input({ generatedAt: null }))).not.toContain('Brief generated at')
  })

  it('scope kosong menjadi topic-agnostic', () => {
    expect(buildResearchBrief(input({ topicScope: '   ' }))).toContain('topic-agnostic')
  })

  it('menyertakan langkah verifikasi lintas sumber dan kontrak output', () => {
    const brief = buildResearchBrief(input())
    expect(brief).toContain('cross-source')
    expect(brief).toContain('trend-summary.json')
  })
})

describe('briefFileName', () => {
  it('membuat slug deterministik berakhiran .md', () => {
    expect(briefFileName('Adopsi AI  di Sekolah!')).toBe('adopsi-ai-di-sekolah.md')
  })

  it('query kosong memakai nama fallback', () => {
    expect(briefFileName('   ')).toBe('research-brief.md')
  })
})
