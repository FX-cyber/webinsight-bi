import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { DatasetOrigin, WebDataset, WebRecord } from '../contract/types'
import type { ValidationIssue, ValidationResult, ValidationStats } from '../contract/validate'
import {
  evaluateImport,
  loadDefaultDataset,
  resolveRestore,
} from './datasetSource'
import type { ImportDecision } from './datasetSource'

/**
 * Satu-satunya sumber data aplikasi. Dataset bawaan dimuat sekali saat mount;
 * dataset impor hidup in-memory dan hilang saat halaman dimuat ulang.
 */

export type DatasetStatus = 'loading' | 'ready' | 'error'

export type { ImportDecision }

interface DatasetContextValue {
  status: DatasetStatus
  activeDataset: WebDataset | null
  records: WebRecord[]
  origin: DatasetOrigin
  stats: ValidationStats | null
  issues: ValidationIssue[]
  error: string | null
  retryDefaultDataset: () => void
  importDataset: (input: unknown) => ImportDecision
  restoreDefaultDataset: () => void
}

const DatasetContext = createContext<DatasetContextValue | null>(null)

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<DatasetStatus>('loading')
  const [activeDataset, setActiveDataset] = useState<WebDataset | null>(null)
  const [origin, setOrigin] = useState<DatasetOrigin>('bundled')
  const [stats, setStats] = useState<ValidationStats | null>(null)
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [error, setError] = useState<string | null>(null)
  const bundledCache = useRef<ValidationResult | null>(null)

  const applyValidation = useCallback(
    (validation: ValidationResult, nextOrigin: DatasetOrigin) => {
      setActiveDataset(validation.dataset)
      setOrigin(nextOrigin)
      setStats(validation.stats)
      setIssues(validation.issues)
      setError(null)
      setStatus('ready')
    },
    [],
  )

  const loadDefault = useCallback(async () => {
    setStatus('loading')
    setError(null)
    const outcome = await loadDefaultDataset()
    if (outcome.kind === 'error') {
      setActiveDataset(null)
      setStats(null)
      setIssues([])
      setOrigin('bundled')
      setError(outcome.message)
      setStatus('error')
      return
    }
    bundledCache.current = outcome.validation
    applyValidation(outcome.validation, 'bundled')
  }, [applyValidation])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const outcome = await loadDefaultDataset()
      if (cancelled) return
      if (outcome.kind === 'error') {
        setActiveDataset(null)
        setStats(null)
        setIssues([])
        setError(outcome.message)
        setStatus('error')
        return
      }
      bundledCache.current = outcome.validation
      applyValidation(outcome.validation, 'bundled')
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [applyValidation])

  const retryDefaultDataset = useCallback(() => {
    void loadDefault()
  }, [loadDefault])

  const restoreDefaultDataset = useCallback(() => {
    const source = resolveRestore(bundledCache.current)
    if (source.kind === 'refetch') {
      void loadDefault()
      return
    }
    applyValidation(source.validation, 'bundled')
  }, [applyValidation, loadDefault])

  const importDataset = useCallback(
    (input: unknown): ImportDecision => {
      const decision = evaluateImport(input)
      if (!decision.accepted) return decision
      applyValidation(decision.validation, 'imported')
      return decision
    },
    [applyValidation],
  )

  const value = useMemo<DatasetContextValue>(
    () => ({
      status,
      activeDataset,
      records: activeDataset?.records ?? [],
      origin,
      stats,
      issues,
      error,
      retryDefaultDataset,
      importDataset,
      restoreDefaultDataset,
    }),
    [
      status,
      activeDataset,
      origin,
      stats,
      issues,
      error,
      retryDefaultDataset,
      importDataset,
      restoreDefaultDataset,
    ],
  )

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
}

export function useDataset(): DatasetContextValue {
  const context = useContext(DatasetContext)
  if (context === null) {
    throw new Error('useDataset harus dipakai di dalam DatasetProvider.')
  }
  return context
}
