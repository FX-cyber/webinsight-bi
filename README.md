# WebInsight BI

Public Web Intelligence Dashboard untuk data hasil ekstraksi Hermes. Aplikasi 100% statis:
seluruh pemrosesan (validasi, agregasi, analitik) berjalan di browser tanpa backend, database,
atau API key.

## Architecture

```
Hermes Agent (terpisah)
  -> web-data.json
     -> WebInsight BI (browser)
        -> analytics: KPI, chart, filtering, explorer
           -> GitHub Pages (static hosting)
```

## Features

- KPI ringkas (total records, unique sources/entities/topics)
- BI charts (time series, distribusi, top-N)
- Filtering: search, rentang tanggal, facet topic/category/source/entity
- Data Explorer: sorting, pagination, detail record
- Sources: agregasi per sumber + expand daftar artikel
- JSON import dengan validasi kontrak + konfirmasi sebelum dataset berubah
- Kontrak data Hermes v1.0 (field wajib/opsional dinormalisasi)

## Tech Stack

- React + Vite + TypeScript
- Recharts (chart)
- React Router (HashRouter, aman untuk static hosting)
- GitHub Pages + GitHub Actions (deploy)

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

## Hermes Integration

Hermes berjalan **terpisah** dari aplikasi ini dan menghasilkan file `web-data.json`.
Tidak ada integrasi API live. File hasil Hermes dapat dipakai dengan dua cara:

1. Ditempatkan di `public/data/web-data.json` (menjadi dataset bawaan saat build), atau
2. Di-import melalui halaman **Schema / Import Data** (diproses lokal di browser, tidak
   dikirim ke server mana pun).

## JSON Contract

Versi kontrak: `1.0`.

- Field wajib per record: `id`, `title`, `source`, `summary`, `url`
  (kurang satu saja -> record invalid dan tidak ikut analitik).
- Field opsional: `date`, `entity`, `category`, `topic`, `location`, `retrieved_at`
  (boleh tidak ada, `null`, atau string kosong -> dinormalisasi jadi `null`).
- Envelope: `schema_version`, `metadata` (`query`, `generated_at`, `record_count`), `records`.
- `url` harus ber-skema `http`/`https`.

## Deploy

1. Push repository ini ke GitHub (nama repo: `webinsight-bi`).
2. Repository **Settings -> Pages -> Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy-pages.yml` akan menjalankan test, typecheck, build,
   lalu deploy isi `dist/` ke GitHub Pages pada setiap push ke `main`.

Aplikasi dapat dibuka di `https://USERNAME.github.io/webinsight-bi/`. Routing memakai
HashRouter (`#/`, `#/explorer`, `#/sources`, `#/data`) sehingga tidak memerlukan rewrite SPA.

## Important

- Dataset bawaan (`public/data/web-data.json`) adalah **data sintetis** untuk keperluan
  pengujian dan pendidikan, bukan fakta atau artikel nyata.
- Data publik yang dipakai sebaiknya diverifikasi ke sumber aslinya.
- Aplikasi tidak menyimpan dataset hasil import ke server; import hanya hidup di sesi browser.
