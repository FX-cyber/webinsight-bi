import RecordTable from '../components/explorer/RecordTable'
import FilterBar from '../components/filters/FilterBar'
import ResearchBriefComposer from '../components/research/ResearchBriefComposer'
import AgentActivityPanel from '../components/trend/AgentActivityPanel'
import { useFilters } from '../data/FilterContext'

export default function ResearchPage() {
  const { filteredRecords } = useFilters()

  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Research</h2>
        <p className="page__lead">
          Susun brief untuk riset agent, lihat run terakhir, dan telusuri record hasil research.
        </p>
      </header>

      <ResearchBriefComposer />
      <AgentActivityPanel title="Last Agent Run" />

      <FilterBar />
      <RecordTable records={filteredRecords} />
    </section>
  )
}
