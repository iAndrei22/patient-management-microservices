# Reports Page Functionalities

## Why this page exists
The Reports page gives a quick, read-only view of payment activity so users can understand revenue trends, service performance, and recent transactions without leaving the dashboard.

It is designed to be:
- Fast to scan (KPIs + charts + transactions table)
- Interactive enough for exploration (filters and sorting)
- Safe and non-destructive (no write operations)

## Backend data sources
All data is fetched from the analytics API through the gateway path prefix:
- Base path used by UI: `/api/analytics`
- UI client file: `src/lib/analytics.ts`

| UI feature / component | API endpoint (via gateway) | Notes |
| --- | --- | --- |
| KPI cards (`AnalyticsKpiCards`) | `GET /api/analytics/summary` | Total revenue, transaction count, average payment, top service |
| Revenue by service chart (`RevenueByServiceChart`) | `GET /api/analytics/revenue-by-service` | Pie chart by service type |
| Payments over time chart (`PaymentsOverTimeChart`) | `GET /api/analytics/payments-over-time?days={n}&interval={day|week|month}` | Uses selected date range + granularity |
| Payment volume chart (`PaymentsVolumeChart`) | `GET /api/analytics/payments-over-time?days={n}&interval={day|week|month}` | Reuses same time-series dataset, visualized as counts |
| Recent transactions table (`RecentPaymentsTable`) | `GET /api/analytics/recent-payments?limit=10` | Latest payment events |

## Current page features

### 1) Header actions
- Back to dashboard
- Log out
- Refresh (re-fetches all analytics requests)

### 2) KPI cards
- Total Revenue
- Transactions
- Average Payment
- Top Service

### 3) Filters and controls
- Date range presets: `7D`, `30D`, `90D`, `180D`, `1Y`
- Granularity toggle: `Day`, `Week`, `Month`
- Service type dropdown
- Reset filters button (returns to defaults)

### 4) Charts
- Revenue by Service Type (pie)
- Payments Over Time (line)
- Payment Volume (bar)

### 5) Recent transactions table
- Search by customer ID, service, or session ID
- Sort by date or amount
- Copy session ID action

### 6) UX states
- Skeleton loading blocks for KPIs/charts/table
- Filter-aware empty-state messages
- Error banner when analytics fetch fails

## Important implementation notes
- Currency symbol is normalized in UI (`$` -> `RON`) after fetch.
- Service type filtering is currently **client-side** on fetched data.
- Date range and granularity currently affect the **payments-over-time** dataset (line + volume charts).
- The page is read-only: no backend write endpoints are called.

