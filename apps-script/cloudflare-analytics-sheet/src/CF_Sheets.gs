/*
  Sheet schema + refresh logic.

  Tabs created:
    - CF_Config
    - CF_Web_5m
    - CF_Zone_5m
    - CF_Dashboard

  Data schema (both CF_Web_5m and CF_Zone_5m):
    A ts_utc (text ISO string)
    B ts (datetime)
    C block_start (datetime, floored to 6h)
    D block_label (text)
    E.. metrics
*/

var CF_SHEETS = (function () {
  'use strict';

  function props() {
    return PropertiesService.getScriptProperties();
  }

  function sheetId() {
    return CF_ANALYTICS.requirePropAny(['CF_ANALYTICS_SHEET_ID', 'ANALYTICS_SHEET_ID'], 'CF_ANALYTICS_SHEET_ID');
  }

  function ss() {
    return SpreadsheetApp.openById(sheetId());
  }

  function ensureSheet(name) {
    var spreadsheet = ss();
    var sh = spreadsheet.getSheetByName(name);
    if (!sh) sh = spreadsheet.insertSheet(name);
    return sh;
  }

  function setHeaders(sh, headers) {
    sh.clear();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.autoResizeColumns(1, Math.min(headers.length, 12));
  }

  function formatDataSheet(sh) {
    sh.setFrozenRows(1);
    sh.getRange(2, 2, sh.getMaxRows() - 1, 2).setNumberFormat('yyyy-mm-dd hh:mm');
  }

  function ensureConfigTab() {
    var sh = ensureSheet('CF_Config');
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, 2).setValues([['Key', 'Value']]);
      sh.getRange(1, 1, 1, 2).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    return sh;
  }

  function writeConfigDefaults() {
    var sh = ensureConfigTab();
    var defaults = [
      ['ZONE_NAME', CF_ANALYTICS.getProp('CF_ZONE_NAME', 'b3unstoppable.net')],
      ['ZONE_TAG', CF_ANALYTICS.getProp('CF_ZONE_TAG', '')],
      ['ACCOUNT_TAG', CF_ANALYTICS.getProp('CF_ACCOUNT_TAG', '')],
      ['WEB_SITE_TAG', CF_ANALYTICS.getProp('CF_WEB_SITE_TAG', '')],
      ['REFRESH_MINUTES', CF_ANALYTICS.getProp('CF_REFRESH_MINUTES', '5')],
      ['REFRESH_WINDOW_HOURS', CF_ANALYTICS.getProp('CF_REFRESH_WINDOW_HOURS', '12')],
      ['RETENTION_DAYS', CF_ANALYTICS.getProp('CF_RETENTION_DAYS', '30')]
    ];

    // Merge: update existing keys or append.
    var last = sh.getLastRow();
    var existing = {};
    if (last >= 2) {
      var vals = sh.getRange(2, 1, last - 1, 2).getValues();
      for (var i = 0; i < vals.length; i++) {
        if (vals[i][0]) existing[String(vals[i][0])] = i + 2;
      }
    }

    for (var j = 0; j < defaults.length; j++) {
      var k = defaults[j][0];
      var row = existing[k];
      if (row) sh.getRange(row, 2).setValue(defaults[j][1]);
      else sh.appendRow(defaults[j]);
    }

    sh.autoResizeColumns(1, 2);
  }

  function ensureDataTabs() {
    var web = ensureSheet('CF_Web_5m');
    var zone = ensureSheet('CF_Zone_5m');
    var dns = ensureSheet('CF_DNS_5m');

    if (web.getLastRow() === 0) {
      setHeaders(web, ['ts_utc', 'ts', 'block_start', 'block_label', 'visits', 'page_views', 'uniques']);
      formatDataSheet(web);
    }

    if (zone.getLastRow() === 0) {
      setHeaders(zone, ['ts_utc', 'ts', 'block_start', 'block_label', 'requests', 'bytes', 'edge_response_bytes', 'cached_bytes', 'visits', 'uniques']);
      formatDataSheet(zone);
    }

    if (dns.getLastRow() === 0) {
      setHeaders(dns, ['ts_utc', 'ts', 'block_start', 'block_label', 'dns_queries']);
      formatDataSheet(dns);
    }

    return { web: web, zone: zone, dns: dns };
  }

  function ensureDashboardTab() {
    var dash = ensureSheet('CF_Dashboard');
    function setSeriesFormula() {
      // Wrap in IFERROR so a block with no rows doesn't show #N/A.
      dash.getRange('A15').setFormula(
        '=IFERROR(LET(' +
        'start,$D$4,end,$E$4,' +
        't,SORT(UNIQUE({' +
        'FILTER(CF_Zone_5m!B:B,CF_Zone_5m!B:B>=start,CF_Zone_5m!B:B<end);' +
        'FILTER(CF_DNS_5m!B:B,CF_DNS_5m!B:B>=start,CF_DNS_5m!B:B<end)' +
        '})),' +
        'wV,IFERROR(VLOOKUP(t,CF_Web_5m!B:G,4,FALSE),0),' +
        'wPV,IFERROR(VLOOKUP(t,CF_Web_5m!B:G,5,FALSE),0),' +
        'wU,IFERROR(VLOOKUP(t,CF_Web_5m!B:G,6,FALSE),0),' +
        'zReq,IFERROR(VLOOKUP(t,CF_Zone_5m!B:J,4,FALSE),0),' +
        'zBy,IFERROR(VLOOKUP(t,CF_Zone_5m!B:J,5,FALSE),0),' +
        'zEBy,IFERROR(VLOOKUP(t,CF_Zone_5m!B:J,6,FALSE),0),' +
        'zCBy,IFERROR(VLOOKUP(t,CF_Zone_5m!B:J,7,FALSE),0),' +
        'dQ,IFERROR(VLOOKUP(t,CF_DNS_5m!B:E,4,FALSE),0),' +
        'HSTACK(t,wV,wPV,wU,zReq,zBy,zCBy,zEBy,dQ)' +
        '),"")'
      );
    }

    if (dash.getLastRow() === 0) {
      dash.getRange(1, 1, 1, 10).setValues([[
        'Cloudflare Analytics Dashboard', '', '', '', '', '', '', '', '', ''
      ]]);
      dash.getRange('A1').setFontSize(16).setFontWeight('bold');

      dash.getRange('A3').setValue('Select date');
      dash.getRange('B3').setValue(new Date());
      dash.getRange('A4').setValue('Select 6h block start');
      dash.getRange('B4').setValue('00:00');
      dash.getRange('D3').setValue('Block start');
      dash.getRange('E3').setValue('Block end');

      // Data validation for 6h blocks
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['00:00', '06:00', '12:00', '18:00'], true)
        .setAllowInvalid(false)
        .build();
      dash.getRange('B4').setDataValidation(rule);

      // Compute block start/end
      dash.getRange('D4').setFormula('=B3 + TIMEVALUE(B4)');
      dash.getRange('E4').setFormula('=D4 + TIME(6,0,0)');
      dash.getRange('D4:E4').setNumberFormat('yyyy-mm-dd hh:mm');

      // KPI labels
      dash.getRange('A6').setValue('Web Analytics (RUM)');
      dash.getRange('A7').setValue('Visits');
      dash.getRange('A8').setValue('Page views');
      dash.getRange('A9').setValue('Uniques');

      dash.getRange('D6').setValue('Zone / Traffic');
      dash.getRange('D7').setValue('Requests');
      dash.getRange('D8').setValue('Bandwidth (bytes)');
      dash.getRange('D9').setValue('Cached bytes');

      dash.getRange('G6').setValue('DNS');
      dash.getRange('G7').setValue('DNS queries');

      dash.getRange('B6').setValue('');
      dash.getRange('E6').setValue('');

      // KPI formulas scoped to selected 6h block
      dash.getRange('B7').setFormula('=SUMIFS(CF_Web_5m!E:E, CF_Web_5m!B:B, ">="&$D$4, CF_Web_5m!B:B, "<"&$E$4)');
      dash.getRange('B8').setFormula('=SUMIFS(CF_Web_5m!F:F, CF_Web_5m!B:B, ">="&$D$4, CF_Web_5m!B:B, "<"&$E$4)');
      dash.getRange('B9').setFormula('=SUMIFS(CF_Web_5m!G:G, CF_Web_5m!B:B, ">="&$D$4, CF_Web_5m!B:B, "<"&$E$4)');

      dash.getRange('E7').setFormula('=SUMIFS(CF_Zone_5m!E:E, CF_Zone_5m!B:B, ">="&$D$4, CF_Zone_5m!B:B, "<"&$E$4)');
      dash.getRange('E8').setFormula('=SUMIFS(CF_Zone_5m!F:F, CF_Zone_5m!B:B, ">="&$D$4, CF_Zone_5m!B:B, "<"&$E$4)');
      dash.getRange('E9').setFormula('=SUMIFS(CF_Zone_5m!H:H, CF_Zone_5m!B:B, ">="&$D$4, CF_Zone_5m!B:B, "<"&$E$4)');

      dash.getRange('H7').setFormula('=SUMIFS(CF_DNS_5m!E:E, CF_DNS_5m!B:B, ">="&$D$4, CF_DNS_5m!B:B, "<"&$E$4)');

      dash.getRange('A11').setValue('Last refresh');
      dash.getRange('B11').setValue('');
      dash.getRange('B11').setNumberFormat('yyyy-mm-dd hh:mm:ss');

      // Table for last 72 points (6 hours @ 5 minutes)
      dash.getRange('A13').setValue('5-minute series (selected 6h block)');
      dash.getRange('A14:I14').setValues([[
        'ts',
        'web_visits',
        'web_page_views',
        'web_uniques',
        'zone_requests',
        'zone_bytes',
        'zone_cached_bytes',
        'zone_edge_bytes',
        'dns_queries'
      ]]);
      dash.getRange('A14:I14').setFontWeight('bold');

      // Dynamic array table (Sheets) via FILTER + VLOOKUPs
      setSeriesFormula();

      // Basic formatting
      dash.setFrozenRows(14);
      dash.autoResizeColumns(1, 9);
      dash.getRange('A6:H6').setFontWeight('bold');

      // Charts (built off the series table area; it will auto-update as the formula updates)
      // Keep ranges generously sized to avoid chart breakage.
      var chartRangeRows = 250;

      // Chart 1: Web visits + page views
      var c1 = dash.newChart()
        .setChartType(Charts.ChartType.LINE)
        .addRange(dash.getRange(14, 1, chartRangeRows, 3)) // ts, web_visits, web_page_views
        .setPosition(6, 7, 0, 0)
        .setOption('title', 'Web Analytics (6h block)')
        .setOption('legend', { position: 'bottom' })
        .build();
      dash.insertChart(c1);

      // Chart 2: Zone requests + bandwidth
      var c2 = dash.newChart()
        .setChartType(Charts.ChartType.LINE)
        .addRange(dash.getRange(14, 1, chartRangeRows, 1)) // ts
        .addRange(dash.getRange(14, 5, chartRangeRows, 1)) // zone_requests
        .addRange(dash.getRange(14, 6, chartRangeRows, 1)) // zone_bytes
        .setPosition(20, 7, 0, 0)
        .setOption('title', 'Zone / Traffic (6h block)')
        .setOption('legend', { position: 'bottom' })
        .build();
      dash.insertChart(c2);

      // Chart 3: DNS queries
      var c3 = dash.newChart()
        .setChartType(Charts.ChartType.LINE)
        .addRange(dash.getRange(14, 1, chartRangeRows, 1)) // ts
        .addRange(dash.getRange(14, 9, chartRangeRows, 1)) // dns_queries
        .setPosition(34, 7, 0, 0)
        .setOption('title', 'DNS Queries (6h block)')
        .setOption('legend', { position: 'bottom' })
        .build();
      dash.insertChart(c3);
    }

    // Migration: dashboards created before DNS column support (or before IFERROR wrapping)
    // can show #N/A or lack dns series.
    var f = String(dash.getRange('A15').getFormula() || '');
    if (f && (f.indexOf('IFERROR(LET(') === -1 || f.indexOf('CF_DNS_5m') === -1)) {
      setSeriesFormula();
    }

    return dash;
  }

  function sixHourBlockStart(dateObj) {
    // Floor to 6-hour blocks in local time.
    var ms = dateObj.getTime();
    var sixH = 6 * 60 * 60 * 1000;
    return new Date(Math.floor(ms / sixH) * sixH);
  }

  function blockLabel(blockStart) {
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    var y = blockStart.getFullYear();
    var m = pad(blockStart.getMonth() + 1);
    var d = pad(blockStart.getDate());
    var h1 = pad(blockStart.getHours());
    var end = new Date(blockStart.getTime() + 6 * 60 * 60 * 1000);
    var h2 = pad(end.getHours());
    return y + '-' + m + '-' + d + ' ' + h1 + ':00–' + h2 + ':00';
  }

  function upsertByTsUtc(sh, rows, tsUtcColIndex) {
    // rows: array of arrays matching sheet columns.
    // tsUtcColIndex: 0-based index in rows for the ISO ts string.

    if (!rows || !rows.length) return { inserted: 0, updated: 0 };

    // Build index from existing sheet (ts_utc in column A)
    var lastRow = sh.getLastRow();
    var existingIndex = {};
    if (lastRow >= 2) {
      var existing = sh.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        var key = existing[i][0];
        if (key) existingIndex[String(key)] = i + 2;
      }
    }

    var updated = 0;
    var inserted = 0;
    var toAppend = [];
    var toUpdate = [];

    for (var r = 0; r < rows.length; r++) {
      var tsUtc = String(rows[r][tsUtcColIndex]);
      var rowIndex = existingIndex[tsUtc];
      if (rowIndex) {
        toUpdate.push({ rowIndex: rowIndex, values: rows[r] });
      } else {
        toAppend.push(rows[r]);
        inserted++;
      }
    }

    // Batch updates (group contiguous rows) to avoid slow per-row calls
    if (toUpdate.length) {
      toUpdate.sort(function (a, b) { return a.rowIndex - b.rowIndex; });
      var start = toUpdate[0].rowIndex;
      var buf = [toUpdate[0].values];
      var prev = toUpdate[0].rowIndex;
      for (var i = 1; i < toUpdate.length; i++) {
        var u = toUpdate[i];
        if (u.rowIndex === prev + 1) {
          buf.push(u.values);
        } else {
          sh.getRange(start, 1, buf.length, buf[0].length).setValues(buf);
          updated += buf.length;
          start = u.rowIndex;
          buf = [u.values];
        }
        prev = u.rowIndex;
      }
      sh.getRange(start, 1, buf.length, buf[0].length).setValues(buf);
      updated += buf.length;
    }

    if (toAppend.length) {
      sh.getRange(sh.getLastRow() + 1, 1, toAppend.length, toAppend[0].length).setValues(toAppend);
    }

    // Keep sorted by timestamp
    if (sh.getLastRow() > 2) {
      sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).sort({ column: 2, ascending: true });
    }

    // Apply retention
    applyRetention(sh);

    return { inserted: inserted, updated: updated };
  }

  function applyRetention(sh) {
    var retentionDays = parseInt(CF_ANALYTICS.getProp('CF_RETENTION_DAYS', '30'), 10);
    if (!retentionDays || retentionDays <= 0) return;

    var cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    var last = sh.getLastRow();
    if (last < 2) return;

    // Column B is datetime
    var dates = sh.getRange(2, 2, last - 1, 1).getValues();
    var firstKeepRow = null;
    for (var i = 0; i < dates.length; i++) {
      var d = dates[i][0];
      if (d && d instanceof Date && d >= cutoff) {
        firstKeepRow = i + 2;
        break;
      }
    }

    if (firstKeepRow && firstKeepRow > 2) {
      sh.deleteRows(2, firstKeepRow - 2);
    }
  }

  function buildWebRows(groups) {
    var out = [];
    for (var i = 0; i < groups.length; i++) {
      var dim = groups[i].dimensions || {};
      var ts = dim.datetimeFiveMinutes || dim.datetimeMinute || dim.datetime || dim.datetimeHour;
      if (!ts) continue;
      var d = new Date(ts);
      var b = sixHourBlockStart(d);

      var sum = groups[i].sum || {};
      var uniq = groups[i].uniq || {};

      var visits = sum.visits || sum.Visits || sum.visit || sum.sessions || sum.sessionCount || 0;
      var pageViews =
        sum.pageViews ||
        sum.pageviews ||
        sum.page_views ||
        sum.views ||
        sum.pageViewCount ||
        sum.pageLoadCount ||
        sum.pageLoads ||
        0;
      var uniques = uniq.uniques || uniq.uniqueVisitors || uniq.uniq || 0;

      out.push([
        ts,
        d,
        b,
        blockLabel(b),
        Number(visits) || 0,
        Number(pageViews) || 0,
        Number(uniques) || 0
      ]);
    }
    return out;
  }

  function buildZoneRows(groups) {
    var out = [];
    for (var i = 0; i < groups.length; i++) {
      var dim = groups[i].dimensions || {};
      var ts = dim.datetimeFiveMinutes;
      if (!ts) continue;
      var d = new Date(ts);
      var b = sixHourBlockStart(d);

      var sum = groups[i].sum || {};
      var uniq = groups[i].uniq || {};

      out.push([
        ts,
        d,
        b,
        blockLabel(b),
        Number(sum.requests) || 0,
        Number(sum.bytes) || 0,
        Number(sum.edgeResponseBytes) || 0,
        Number(sum.cachedBytes) || 0,
        Number(sum.visits) || 0,
        Number(uniq.uniques) || 0
      ]);
    }
    return out;
  }

  function buildDnsRows(groups) {
    // groups: normalized objects from CF_ANALYTICS.queryDns5m(): { ts, queries }
    var out = [];
    for (var i = 0; i < groups.length; i++) {
      var ts = groups[i].ts;
      if (!ts) continue;
      var d = new Date(ts);
      var b = sixHourBlockStart(d);

      out.push([
        ts,
        d,
        b,
        blockLabel(b),
        Number(groups[i].queries) || 0
      ]);
    }
    return out;
  }

  function refreshOnce() {
    var lock = LockService.getScriptLock();
    // Avoid long waits when a trigger overlaps a manual run
    if (!lock.tryLock(20000)) {
      throw new Error('Another refresh is already running. Try again in a minute.');
    }

    var webDisabled = String(CF_ANALYTICS.getProp('CF_DISABLE_WEB_ANALYTICS', '')).trim().toLowerCase();
    webDisabled = (webDisabled === '1' || webDisabled === 'true' || webDisabled === 'yes' || webDisabled === 'on');

    var ids = {
      accountTag: CF_ANALYTICS.requirePropAny(['CF_ACCOUNT_TAG', 'CLOUDFLARE_ACCOUNT_ID'], 'CF_ACCOUNT_TAG'),
      zoneTag: CF_ANALYTICS.requirePropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], 'CF_ZONE_TAG'),
      siteTag: webDisabled ? '' : CF_ANALYTICS.requirePropAny(['CF_WEB_SITE_TAG', 'CLOUDFLARE_ANALYTICS_TOKEN'], 'CF_WEB_SITE_TAG')
    };

    try {
      var now = new Date();
      var w = CF_ANALYTICS.getWindow(now);

      Logger.log('Refresh window: ' + w.start.toISOString() + ' → ' + w.end.toISOString());

      var tabs = ensureDataTabs();
      ensureConfigTab();
      ensureDashboardTab();

      // Zone/Traffic
      Logger.log('Querying Zone analytics…');
      var zoneRes = CF_ANALYTICS.queryZone5m(ids.zoneTag, w.start, w.end);
      Logger.log('Zone analytics points: ' + (zoneRes.groups || []).length + ' (variant=' + zoneRes.variant + ')');
      var zoneRows = buildZoneRows(zoneRes.groups);
      var zoneResult = upsertByTsUtc(tabs.zone, zoneRows, 0);

      // DNS
      Logger.log('Querying DNS analytics…');
      var dnsRes = CF_ANALYTICS.queryDns5m(ids.zoneTag, w.start, w.end);
      Logger.log('DNS analytics points: ' + (dnsRes.groups || []).length + ' (dataset=' + dnsRes.dataset + ')');
      var dnsRows = buildDnsRows(dnsRes.groups);
      var dnsResult = upsertByTsUtc(tabs.dns, dnsRows, 0);

      // Web Analytics
      var webRes = { dataset: 'disabled', groups: [] };
      var webResult = { inserted: 0, updated: 0 };
      if (!webDisabled) {
        Logger.log('Querying Web analytics…');
        webRes = CF_ANALYTICS.queryWeb5m(ids.accountTag, ids.siteTag, w.start, w.end);
        Logger.log('Web analytics points: ' + (webRes.groups || []).length + ' (dataset=' + webRes.dataset + ')');
        var webRows = buildWebRows(webRes.groups);
        webResult = upsertByTsUtc(tabs.web, webRows, 0);
      } else {
        Logger.log('Web analytics disabled (CF_DISABLE_WEB_ANALYTICS=true); skipping.');
      }

      // Stamp dashboard
      var dash = ensureSheet('CF_Dashboard');
      dash.getRange('B11').setValue(new Date());

      return {
        windowStart: w.start,
        windowEnd: w.end,
        zoneVariant: zoneRes.variant,
        webDataset: webRes.dataset,
        dnsDataset: dnsRes.dataset,
        zone: zoneResult,
        web: webResult,
        dns: dnsResult
      };
    } finally {
      lock.releaseLock();
    }
  }

  return {
    ensureAllTabs: function () {
      writeConfigDefaults();
      ensureDataTabs();
      ensureDashboardTab();
    },
    refreshOnce: refreshOnce
  };
})();
