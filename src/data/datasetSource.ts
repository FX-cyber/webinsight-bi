import { validateDataset, validateDatasetText } from '../contract/validate'
import type { ValidationIssue, ValidationResult } from '../contract/validate'

/**
 * Sumber dataset: memuat bawaan lewat fetch dan menilai dataset impor.
 * Seluruh keputusan validasi tetap milik validator kontrak (T3); file ini
 * hanya orchestrasi I/O dan keputusan terima/tolak, sehingga mudah diuji
 * tanpa React.
 */

export const DEFAULT_DATASET_PATH = 'data/web-data.json'

/** Relatif terhadap BASE_URL agar tetap benar di GitHub Pages project path. */
export function defaultDatasetUrl(): string {
  return `${import.meta.env.BASE_URL}${DEFAULT_DATASET_PATH}`
}

export type DefaultLoadOutcome =
  | { kind: 'ready'; validation: ValidationResult }
  | { kind: 'error'; message: string }

export async function loadDefaultDataset(): Promise<DefaultLoadOutcome> {
  let text: string
  try {
    const response = await fetch(defaultDatasetUrl())
    if (!response.ok) {
      return {
        kind: 'error',
        message: `Dataset bawaan tidak dapat dimuat (HTTP ${response.status}). Periksa file ${DEFAULT_DATASET_PATH}.`,
      }
    }
    text = await response.text()
  } catch {
    return {
      kind: 'error',
      message: `Dataset bawaan tidak dapat dimuat. Periksa koneksi atau keberadaan file ${DEFAULT_DATASET_PATH}.`,
    }
  }

  const validation = validateDatasetText(text)
  if (validation.dataset === null) {
    const first = validation.issues[0]
    return {
      kind: 'error',
      message: first
        ? `Dataset bawaan ditolak: ${first.message}`
        : 'Dataset bawaan ditolak karena tidak sesuai kontrak.',
    }
  }
  return { kind: 'ready', validation }
}

export type ImportDecision =
  | { accepted: true; validation: ValidationResult }
  | { accepted: false; message: string; issues: ValidationIssue[] }

/**
 * Menilai dataset impor dengan validator yang sama. Envelope gagal => ditolak
 * tanpa menyentuh dataset aktif. Envelope lolos (termasuk 0 record valid)
 * => diterima; empty state ditangani UI, bukan di sini.
 */
export function evaluateImport(input: unknown): ImportDecision {
  const validation = validateDataset(input)
  if (validation.dataset === null) {
    const first = validation.issues[0]
    return {
      accepted: false,
      message: first
        ? `Dataset impor ditolak: ${first.message}`
        : 'Dataset impor ditolak karena tidak sesuai kontrak.',
      issues: validation.issues,
    }
  }
  return { accepted: true, validation }
}

export type RestoreSource =
  | { kind: 'cache'; validation: ValidationResult }
  | { kind: 'refetch' }

/** Restore memakai cache hasil load pertama; hanya fetch ulang bila cache belum ada. */
export function resolveRestore(cached: ValidationResult | null): RestoreSource {
  return cached === null ? { kind: 'refetch' } : { kind: 'cache', validation: cached }
}
