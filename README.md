# ICT Progress Monitoring System

A responsive React web application for displaying ICT progress monitoring data, built with Redux Toolkit, Tailwind CSS, and React Router.

## Tech Stack
- **React 18** — UI framework
- **Redux Toolkit** — State management
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client
- **Lucide React** — Icons

## Features
- 📊 Dashboard with stats cards and job-type distribution chart
- 🔍 Barcode Times data table with search and job-type filtering
- 🌙 Light / Dark theme toggle (persisted in localStorage)
- 📱 Fully responsive layout with collapsible sidebar
- 🔄 Manual data refresh with loading indicators
- 📋 Record detail modal on row click
- 📈 Reports summary page
- ⚙️ Settings page showing API config and theme toggle

## Getting Started

```bash
npm install
npm start
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_BASE_URL` | `https://esystems.cdl.lk/backend/ICTProgressMonitoring` | API base URL |
| `REACT_APP_API_TIMEOUT` | `10000` | Request timeout (ms) |

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared UI: Card, Badge, Table, Modal, PageHeader
│   ├── layout/          # Header, Sidebar, Navigation breadcrumb
│   └── features/
│       ├── dashboard/   # StatsCard, JobTypeChart, RecentActivity
│       └── barcode/     # BarcodeTable, FilterBar, RecordDetailModal
├── pages/               # DashboardPage, BarcodePage, ReportsPage, SettingsPage
├── hooks/               # useFetch, useLocalStorage
├── services/            # api.js (Axios instance), barcodeService.js
├── store/               # Redux store, slices (ui, barcode), selectors
├── styles/              # globals.css, variables.css
└── utils/               # constants, formatters, helpers
```

## API

**Endpoint:** `GET /ProgressMonitoring/GetBarcodeTimes`

Returns a `ResultSet` array of records with fields:
`ictdate`, `divcode`, `dipcode`, `loccode`, `logdesc`, `requester`, `incharge`, `status`, `assignby`, `jobtype`, `reuhour`
