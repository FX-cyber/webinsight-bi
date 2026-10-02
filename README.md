# WebInsight Agent

**Agentic Public Web Intelligence & Trend BI**

WebInsight Agent menggunakan Qoder Agent untuk mencari, menyeleksi, memverifikasi, dan
menstrukturkan perkembangan publik dari internet. Hasil research diolah menjadi trend
intelligence berupa topic ranking, signal lintas sumber, source traceability, dan dashboard
Business Intelligence. Aplikasi webnya 100% statis: seluruh analitik berjalan di browser.

## Architecture

```
Qoder Agent (research: search -> browse -> verify -> extract -> score)
  -> public/data/web-data.json + public/data/trend-summary.json
     -> WebInsight Agent frontend (browser analytics)
        -> GitHub Pages (static hosting)
```

## Features

- Pulse: top trend hero, trend ranking, mentions over time, agent activity & data quality
- Research: composer brief untuk riset agent + tabel record hasil research
- Signals: signal lintas sumber (cross-source) dan single-source beserta evidence-nya
- Sources: agregasi publisher + daftar artikel asli
- Data: kontrak JSON, import manual (fallback/debug), dokumentasi trend-summary
- Filtering, sorting, pagination, detail record dengan tautan sumber asli

## Tech Stack

- React + Vite + TypeScript
- Recharts (chart)
- React Router (HashRouter, aman untuk static hosting)
- GitHub Pages + GitHub Actions (deploy)
- Qoder Agent / Qoder Automation (intelligence layer, di luar aplikasi web)

## Run Locally

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Qoder Agent & Automation

- Riset publik dijalankan oleh **Qoder Agent** dari sesi Qoder (interactive) atau melalui
  **Qoder Automation** (scheduled). Frontend tidak pernah menjalankan agent dan tidak
  membutuhkan backend.
- Satu **manual automation run** telah berhasil end-to-end: research multi-domain, staging
  candidate, validation gate, promote data, commit, dan push ke branch feature.
- **Recurring scheduled automation bergantung pada runtime Qoder lokal**: run terjadwal hanya
  terjadi saat komputer menyala, runtime Qoder aktif, dan internet tersedia. Ini bukan layanan
  cloud permanen.
- **Scheduled recurring soak test tidak diselesaikan**; kemampuan terjadwal bersifat opsional
  operasional dan belum diverifikasi penuh.
- Dashboard tetap dapat digunakan kapan pun dari **data terakhir yang tersimpan** di repository,
  meskipun agent/automation sedang tidak berjalan.
- GitHub Pages **tidak membutuhkan Qoder runtime** untuk menampilkan hasil.

## JSON Contract

Versi kontrak: `1.0`.

- Field wajib per record: `id`, `title`, `source`, `summary`, `url`
  (kurang satu saja -> record invalid dan tidak ikut analitik).
- Field opsional: `date`, `entity`, `category`, `topic`, `location`, `retrieved_at`
  (boleh tidak ada, `null`, atau string kosong -> dinormalisasi jadi `null`).
- Envelope: `schema_version`, `metadata` (`query`, `generated_at`, `record_count`), `records`.
- `url` harus ber-skema `http`/`https`.
- File pelengkap `trend-summary.json`: run metadata, pipeline quality, topic ranking
  (trend score 0-100), dan signals (cross-source/single-source).

## Deploy

1. Push repository ini ke GitHub.
2. Repository **Settings -> Pages -> Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy-pages.yml` menjalankan test, typecheck, build, lalu
   deploy isi `dist/` pada setiap push ke `main`.

Aplikasi tersedia di `https://USERNAME.github.io/webinsight-bi/`. Routing memakai HashRouter
(`#/`, `#/research`, `#/signals`, `#/sources`, `#/data`) sehingga tidak memerlukan rewrite SPA.

## Important

- Data bawaan awal bersifat sintetis; data terkini dihasilkan oleh agent research dari sumber
  publik dan selalu menyertakan tautan sumber asli.
- Data publik perlu diverifikasi ke sumber aslinya; signal cross-source menandakan dukungan
  lintas publisher, bukan jaminan kebenaran absolut.
- Aplikasi tidak menyimpan dataset hasil import ke server; import hanya hidup di sesi browser.
