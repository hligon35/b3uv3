# Sheet schema + dashboard layout

## Tabs

### CF_Config (key/value)
Used for visibility only; source of truth is Script Properties.

Keys written by the wizard:
- `ZONE_NAME` (e.g. `b3unstoppable.net`)
- `ZONE_TAG`
- `ACCOUNT_TAG`
- `WEB_SITE_TAG`
- `REFRESH_MINUTES`
- `REFRESH_WINDOW_HOURS`
- `RETENTION_DAYS`

### CF_Web_5m (Cloudflare Web Analytics)
**One row per 5-minute bucket**.

Columns:
- **A `ts_utc`**: ISO timestamp string (UTC) from Cloudflare `datetimeFiveMinutes`.
- **B `ts`**: same timestamp as a Sheets datetime.
- **C `block_start`**: local-time 6-hour block start (floored).
- **D `block_label`**: e.g. `2026-02-03 06:00–12:00`.
- **E `visits`**
- **F `page_views`**
- **G `uniques`** (when available)

### CF_Zone_5m (Zone/Traffic analytics)
**One row per 5-minute bucket**.

Columns:
- **A `ts_utc`**: ISO timestamp string (UTC) from Cloudflare `datetimeFiveMinutes`.
- **B `ts`**: same timestamp as a Sheets datetime.
- **C `block_start`**: local-time 6-hour block start (floored).
- **D `block_label`**
- **E `requests`**
- **F `bytes`** (bandwidth)
- **G `edge_response_bytes`**
- **H `cached_bytes`**
- **I `visits`** (if returned by dataset)
- **J `uniques`** (if returned by dataset)

### CF_Dashboard
A single-screen dashboard designed around a 6-hour slice.

Inputs:
- **B3** selected date
- **B4** selected block start (`00:00`, `06:00`, `12:00`, `18:00`)

Derived:
- **D4** block start datetime (`=B3 + TIMEVALUE(B4)`)
- **E4** block end (`=D4 + TIME(6,0,0)`)

KPIs (examples):
- Web visits: `=SUMIFS(CF_Web_5m!E:E, CF_Web_5m!B:B, ">="&$D$4, CF_Web_5m!B:B, "<"&$E$4)`
- Zone requests: `=SUMIFS(CF_Zone_5m!E:E, CF_Zone_5m!B:B, ">="&$D$4, CF_Zone_5m!B:B, "<"&$E$4)`

Series table (A15):
- A dynamic array formula builds a 5-minute timeseries for the selected 6-hour block by filtering `CF_Zone_5m` and looking up matching timestamps in `CF_Web_5m`.

## Data retention

Retention is enforced on both raw tabs by deleting rows older than `RETENTION_DAYS`.

## Refresh strategy

Scheduled refresh re-pulls the last `REFRESH_WINDOW_HOURS` to allow near-real-time updates and late-arriving counts.

