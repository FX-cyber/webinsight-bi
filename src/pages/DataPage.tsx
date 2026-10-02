import ImportPanel from '../components/data/ImportPanel'

const CONTRACT_ROWS: { scope: string; field: string; type: string; required: string }[] = [
  { scope: 'root', field: 'schema_version', type: 'string', required: 'wajib ("1.x")' },
  { scope: 'metadata', field: 'query', type: 'string', required: 'wajib' },
  { scope: 'metadata', field: 'generated_at', type: 'string ISO 8601', required: 'wajib' },
  { scope: 'metadata', field: 'record_count', type: 'number >= 0', required: 'wajib' },
  { scope: 'records[]', field: 'id', type: 'string unik', required: 'wajib' },
  { scope: 'records[]', field: 'title', type: 'string', required: 'wajib' },
  { scope: 'records[]', field: 'source', type: 'string', required: 'wajib' },
  { scope: 'records[]', field: 'summary', type: 'string', required: 'wajib' },
  { scope: 'records[]', field: 'url', type: 'string http/https', required: 'wajib' },
  { scope: 'records[]', field: 'date', type: 'string YYYY-MM-DD', required: 'opsional' },
  { scope: 'records[]', field: 'entity', type: 'string', required: 'opsional' },
  { scope: 'records[]', field: 'category', type: 'string', required: 'opsional' },
  { scope: 'records[]', field: 'topic', type: 'string', required: 'opsional' },
  { scope: 'records[]', field: 'location', type: 'string', required: 'opsional' },
  { scope: 'records[]', field: 'retrieved_at', type: 'string ISO 8601', required: 'opsional' },
]

const EXAMPLE_MINIMAL = `{
  "schema_version": "1.0",
  "metadata": {
    "query": "contoh kueri",
    "generated_at": "2026-10-01T09:00:00Z",
    "record_count": 1
  },
  "records": [
    {
      "id": "rec-001",
      "title": "Judul artikel",
      "source": "contoh.test",
      "summary": "Ringkasan satu sampai tiga kalimat.",
      "url": "https://contoh.test/artikel/1"
    }
  ]
}`

const EXAMPLE_FULL = `{
  "schema_version": "1.0",
  "metadata": {
    "query": "contoh kueri",
    "generated_at": "2026-10-01T09:00:00Z",
    "record_count": 1
  },
  "records": [
    {
      "id": "rec-001",
      "title": "Judul artikel",
      "source": "contoh.test",
      "summary": "Ringkasan satu sampai tiga kalimat.",
      "url": "https://contoh.test/artikel/1",
      "date": "2026-09-12",
      "entity": "Nama organisasi",
      "category": "Berita",
      "topic": "Pariwisata",
      "location": "Nama wilayah",
      "retrieved_at": "2026-10-01T09:12:00Z"
    }
  ]
}`

export default function DataPage() {
  return (
    <section className="page">
      <header className="page__head">
        <h2 className="page__title">Schema / Import Data</h2>
        <p className="page__lead">
          Dataset JSON mengikuti kontrak ini. WebInsight memvalidasi file sebelum digunakan.
        </p>
      </header>

      <div className="card">
        <h3 className="card__title">A. Data Contract (v1)</h3>
        <div className="table-wrap table-wrap--flat">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Bagian</th>
                <th scope="col">Field</th>
                <th scope="col">Tipe</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACT_ROWS.map((row) => (
                <tr key={`${row.scope}-${row.field}`}>
                  <td>{row.scope}</td>
                  <td>
                    <code>{row.field}</code>
                  </td>
                  <td>{row.type}</td>
                  <td>{row.required}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="card__note">
          Field opsional yang kosong, hanya spasi, atau tidak ada akan dinormalkan menjadi null.
          Record dengan field wajib tidak lengkap atau URL berskema selain http/https dibuang dan
          dilaporkan. Field di luar kontrak diabaikan.
        </p>

        <h4 className="card__subtitle">Contoh JSON minimal</h4>
        <pre className="code-block">
          <code>{EXAMPLE_MINIMAL}</code>
        </pre>
        <h4 className="card__subtitle">Contoh JSON lengkap</h4>
        <pre className="code-block">
          <code>{EXAMPLE_FULL}</code>
        </pre>
      </div>

      <div className="card">
        <h3 className="card__title">B. Import Dataset</h3>
        <ImportPanel />
      </div>
    </section>
  )
}
