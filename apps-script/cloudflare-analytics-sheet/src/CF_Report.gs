/*
  Read-only report endpoint for weekly summary consumers.
*/

function doGet(e) {
  var endpoint = (e && e.parameter && e.parameter.endpoint) ? String(e.parameter.endpoint) : '';

  try {
    if (endpoint === 'weekly_summary') {
      return cfAnalyticsJsonResponse(cfAnalyticsBuildWeeklySummary_(e));
    }

    return cfAnalyticsJsonResponse({
      ok: false,
      error: 'Unsupported endpoint.',
      supportedEndpoints: ['weekly_summary']
    });
  } catch (error) {
    return cfAnalyticsJsonResponse({
      ok: false,
      error: (error && error.message) ? error.message : String(error || 'Unknown error')
    });
  }
}

function cfAnalyticsBuildWeeklySummary_(e) {
  cfAnalyticsAuthorizeReportRequest_(e);

  var now = new Date();
  var currentTo = cfAnalyticsParseDateParam_(e, 'to', now);
  var currentFrom = cfAnalyticsParseDateParam_(e, 'from', new Date(currentTo.getTime() - 7 * 24 * 60 * 60 * 1000));
  var previousTo = cfAnalyticsParseDateParam_(e, 'compareTo', currentFrom);
  var previousFrom = cfAnalyticsParseDateParam_(e, 'compareFrom', new Date(previousTo.getTime() - (currentTo.getTime() - currentFrom.getTime())));

  var spreadsheet = SpreadsheetApp.openById(
    CF_ANALYTICS.requirePropAny(['CF_ANALYTICS_SHEET_ID', 'ANALYTICS_SHEET_ID'], 'CF_ANALYTICS_SHEET_ID')
  );
  var webSheet = spreadsheet.getSheetByName('CF_Web_5m');
  if (!webSheet) {
    throw new Error('Missing CF_Web_5m tab. Run cfAnalyticsSetupWizard first.');
  }

  var rows = cfAnalyticsReadWebRows_(webSheet);
  var currentTotals = cfAnalyticsSummarizeWebRows_(rows, currentFrom, currentTo);
  var previousTotals = cfAnalyticsSummarizeWebRows_(rows, previousFrom, previousTo);

  return {
    ok: true,
    source: 'cloudflare-google-sheets',
    generatedAt: now.toISOString(),
    range: {
      current: {
        from: currentFrom.toISOString(),
        to: currentTo.toISOString()
      },
      previous: {
        from: previousFrom.toISOString(),
        to: previousTo.toISOString()
      }
    },
    current: currentTotals,
    previous: previousTotals,
    lastRefresh: cfAnalyticsReadLastRefresh_(spreadsheet),
    notes: [
      'Read from CF_Web_5m in Google Sheets.',
      'Visitors are sourced from the uniques column; page views are sourced from the page_views column.'
    ]
  };
}

function cfAnalyticsAuthorizeReportRequest_(e) {
  var expected = String(CF_ANALYTICS.getProp('CF_REPORT_SECRET', '') || '').trim();
  if (!expected) {
    return;
  }

  var provided = (e && e.parameter && e.parameter.secret) ? String(e.parameter.secret).trim() : '';
  if (provided !== expected) {
    throw new Error('Unauthorized request.');
  }
}

function cfAnalyticsParseDateParam_(e, key, fallback) {
  var raw = (e && e.parameter && e.parameter[key]) ? String(e.parameter[key]).trim() : '';
  if (!raw) {
    return fallback;
  }

  var parsed = new Date(raw);
  if (!(parsed instanceof Date) || isNaN(parsed.getTime())) {
    throw new Error('Invalid date for parameter: ' + key);
  }
  return parsed;
}

function cfAnalyticsReadWebRows_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  return sheet.getRange(2, 2, lastRow - 1, 6).getValues();
}

function cfAnalyticsSummarizeWebRows_(rows, from, to) {
  var visitors = 0;
  var pageViews = 0;

  for (var i = 0; i < rows.length; i++) {
    var ts = rows[i][0];
    if (!(ts instanceof Date) || isNaN(ts.getTime())) {
      continue;
    }
    if (ts < from || ts >= to) {
      continue;
    }

    pageViews += Number(rows[i][4]) || 0;
    visitors += Number(rows[i][5]) || 0;
  }

  return {
    visitors: visitors,
    pageViews: pageViews
  };
}

function cfAnalyticsReadLastRefresh_(spreadsheet) {
  var dashboard = spreadsheet.getSheetByName('CF_Dashboard');
  if (!dashboard) {
    return null;
  }

  var value = dashboard.getRange('B11').getValue();
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

function cfAnalyticsJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}