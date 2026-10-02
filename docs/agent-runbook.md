# WebInsight Trends — Agent Runbook

Runbook ini menjelaskan workflow riset yang dijalankan Qoder Agent untuk memperbarui
data WebInsight BI. Frontend tidak pernah menjalankan agent; agent dijalankan dari sesi
Qoder (interactive) atau Qoder Automation (scheduled, tahap berikutnya) dengan brief dari
`scripts/research-brief.json` atau dari halaman Research.

## Workflow

```
Research Brief
  -> Planning          : pecah objective menjadi 3-5 variasi search query
  -> Search            : jalankan pencarian publik (WebSearch), baca snippet + tanggal
  -> Source Selection  : pilih kandidat sesuai prioritas sumber; buang login/paywall/spam
  -> Browse            : buka setiap URL kandidat (WebFetch/browser), verifikasi isi
  -> Evidence Verification : pastikan judul, publisher, tanggal, dan klaim utama didukung halaman
  -> Extraction        : tulis WebRecord (paraphrase singkat, bukan salinan artikel)
  -> Deduplication     : buang URL duplikat dan artikel syndication yang jelas sama
  -> Topic Grouping    : bentuk topic dari evidence, bukan dari taxonomy sample
  -> Signal Grouping   : kelompokkan record yang membahas event/claim sama
  -> Trend Scoring     : skor 0-100 per topic (frequency + recency + source diversity)
  -> Validation        : validator kontrak + cek signal + npm test/typecheck/build
  -> Commit-if-valid   : commit hanya bila semua gate lolos
```

## Aturan evidence

- Field wajib WebRecord: `id`, `title`, `source`, `summary`, `url`.
- Field opsional: `date`, `entity`, `category`, `topic`, `location`, `retrieved_at`.
- URL wajib benar-benar dibuka; tanggal/publisher/entity tidak boleh dikarang.
- `summary` adalah paraphrase 1-2 kalimat yang didukung halaman sumber.
- Record di luar time window dibuang dan dihitung sebagai `invalid_dropped`.
- Kegagalan satu sumber dicatat di `run.failures` sebagai `{ "source", "reason" }`
  dan tidak menggagalkan seluruh research.

## Signal grouping

- Signal = satu perkembangan/claim/event dengan satu atau lebih record evidence.
- `status: "cross-source"` hanya bila record pendukung berasal dari >= 2 publisher berbeda
  dan membahas event/claim yang sama. Sama topik saja tidak cukup.
- Satu evidence => `status: "single-source"`.

## Trend scoring (per topic, bukan per artikel)

- `F = log1p(mentions) / log1p(50)` (cap konfigurasi)
- `R = recent_mentions / mentions` (recent = dalam `recent_window_hours`)
- `D = min(1, sources / min(mentions, 10))`
- `trend_score = 100 * (0.5*F + 0.3*R + 0.2*D)`, dibulatkan 1 desimal, rentang 0-100.
- Run pertama: `previous_trend_score = null` dan `direction = "flat"`; arah naik/turun
  hanya boleh diklaim bila ada baseline run sebelumnya yang valid.

## Safe output workflow

1. Tulis hasil ke `tmp/web-data.candidate.json` dan `tmp/trend-summary.candidate.json`.
2. Jalankan validator kontrak existing terhadap candidate.
3. Cek: semua `signal.record_ids` ada di records; `sources` signal = source record-nya;
   trend score dalam 0-100; `evidence_count` = panjang `record_ids`.
4. Jalankan `npm run test`, `npm run typecheck`, `npm run build`.
5. HANYA bila semua lolos, copy candidate ke `public/data/web-data.json` dan
   `public/data/trend-summary.json`.
6. Bila ada gate yang gagal: candidate dibuang, data branch sebelumnya tetap dipakai.

## Agent behavior log

Setiap run menulis `docs/last-agent-run.md` berisi fakta observable saja:
objective, search queries yang dipakai (termasuk refinement), kategori sumber yang
diperiksa, jumlah halaman dibuka, jumlah relevan, duplikat dibuang, record final,
signals cross-source/single-source, hasil validasi, dan status akhir.
Tidak menyimpan chain-of-thought atau reasoning internal.

## Runtime & keterbatasan automation

- Qoder Automation di environment ini berjalan melalui **runtime lokal (desktop)**, bukan
  layanan cloud permanen. Scheduled run hanya terjadi bila: komputer menyala, runtime
  Qoder aktif, dan koneksi internet tersedia. Run yang jatuh saat mesin mati akan
  terlewat tanpa jaminan catch-up.
- Permission mode automation: **Auto Approval** (least privilege yang masih memungkinkan
  run mandiri tanpa interaksi).
- Sampai approval merge, commit automation dibatasi pada tiga file
  (`public/data/web-data.json`, `public/data/trend-summary.json`, `docs/last-agent-run.md`)
  dan push hanya ke `origin feature/automated-trends`.
- **Meaningful-change guard:** commit hanya dilakukan bila record, topic, score, direction,
  signal, source/evidence, atau pipeline quality berubah secara substantif. Perubahan
  `generated_at`/run-id/timestamp saja berarti NO MEANINGFUL CHANGE dan tidak di-commit.
