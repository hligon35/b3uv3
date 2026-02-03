# Cloudflare Analytics → Google Sheets (Near‑Real‑Time)

This folder contains a Google Apps Script that pulls **Cloudflare Web Analytics** (RUM) and **Zone/Traffic Analytics** into a Google Sheet, updated on a schedule (typically every 5 minutes), with a dashboard designed around **6‑hour blocks**.

## What you get

- Near-real-time refresh (time-driven trigger)
- 5-minute time buckets stored in Sheets
- 6-hour block filtering (00–06, 06–12, 12–18, 18–24) on the Dashboard
- Separate raw tabs for Web Analytics and Zone Analytics

## Prereqs (Cloudflare)

1. Create a Cloudflare **API Token**.
   - Minimum permissions vary by plan/features, but typically:
     - **Zone:Read** for the target zone
     - **Analytics:Read** (or equivalent) for GraphQL analytics
     - **Account:Read** (to resolve account id)

2. Get identifiers:
   - `zoneTag` = Zone ID for `b3unstoppable.net`
   - `accountTag` = Account ID
   - `siteTag` = Web Analytics site tag (from Web Analytics → Manage site → snippet token)

The script can auto-discover `zoneTag` and `accountTag` if the token has access.

## Script Properties (what to set in Apps Script)

Primary keys used by the script:
- `CF_API_TOKEN`
- `CF_ZONE_TAG`
- `CF_ACCOUNT_TAG`
- `CF_WEB_SITE_TAG`
- `CF_ANALYTICS_SHEET_ID`

Accepted aliases (handy if you copy/paste from `.env.local`):
- `CLOUDFLARE_API_TOKEN` → `CF_API_TOKEN`
- `CLOUDFLARE_ZONE_ID` → `CF_ZONE_TAG`
- `CLOUDFLARE_ANALYTICS_TOKEN` → `CF_WEB_SITE_TAG`

## Prereqs (Google)

- A Google Sheet you want to populate
- A Google Apps Script project (can be standalone or attached to that Sheet)

## Install

Option A (simple):
1. Open your Google Sheet → Extensions → Apps Script.
2. Create 3 new script files and paste in the contents from:
   - `src/CF_Analytics.gs`
   - `src/CF_Sheets.gs`
   - `src/CF_Setup.gs`

Option B (advanced): manage with clasp (not included here).

## First run

1. In Apps Script, run `cfAnalyticsSetupWizard`.
2. Grant permissions when prompted.
3. The wizard will:
   - store Script Properties (token/ids)
   - create/update the required tabs
   - install an auto-refresh trigger

## Ongoing

- Scheduled function: `cfAnalyticsRefresh`
- Manual backfill: `cfAnalyticsBackfill(days)`

## If Web Analytics fails (schema differences)

Cloudflare’s Web Analytics / RUM GraphQL dataset names can vary by plan.

1. Run `cfAnalyticsDiscoverWebAnalyticsDatasets()` to list likely datasets.
2. Set Script Property `CF_WEB_DATASET_OVERRIDE` to the dataset name you want to use.
3. Re-run `cfAnalyticsSmokeTest()`.

## Notes / limits

- Apps Script triggers are not truly real-time; 5 minutes is typically the practical minimum.
- Cloudflare GraphQL datasets/fields can vary by plan. The script uses safe fallbacks if a field isn’t available.

