import { useDataset } from '../../data/DatasetContext'
import { formatDateTimeId, formatNumberId } from '../../logic/format'

/**
 * Panel ringkas run + pipeline intelligence. Dipakai Pulse (Agent Activity)
 * dan Research (Last Agent Run). Graceful saat trendSummary null.
 */
export default function AgentActivityPanel({ title }: { title: string }) {
  const { trendSummary } = useDataset()

  return (
    <section className="card agent-panel">
      <h3 className="card__title">{title}</h3>
      {trendSummary === null ? (
        <p className="facet__empty">Trend intelligence belum tersedia.</p>
      ) : (
        <>
          <dl className="agent-panel__grid">
            <div>
              <dt>Run ID</dt>
              <dd>{trendSummary.run.id}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{trendSummary.run.mode}</dd>
            </div>
            <div>
              <dt>Generated</dt>
              <dd>{formatDateTimeId(trendSummary.generated_at)}</dd>
            </div>
            <div>
              <dt>Sources visited</dt>
              <dd>{formatNumberId(trendSummary.run.sources_visited)}</dd>
            </div>
            <div>
              <dt>Fetched</dt>
              <dd>{formatNumberId(trendSummary.pipeline.fetched)}</dd>
            </div>
            <div>
              <dt>Duplicates removed</dt>
              <dd>{formatNumberId(trendSummary.pipeline.duplicates_removed)}</dd>
            </div>
            <div>
              <dt>Invalid dropped</dt>
              <dd>{formatNumberId(trendSummary.pipeline.invalid_dropped)}</dd>
            </div>
            <div>
              <dt>Final records</dt>
              <dd>{formatNumberId(trendSummary.pipeline.final)}</dd>
            </div>
          </dl>
          <p className="agent-panel__brief">Brief: {trendSummary.run.brief}</p>
          {trendSummary.run.failures.length === 0 ? (
            <p className="agent-panel__failures agent-panel__failures--ok">
              Tidak ada kegagalan sumber pada run ini.
            </p>
          ) : (
            <ul className="agent-panel__failures">
              {trendSummary.run.failures.map((failure) => (
                <li key={failure}>{failure}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
