/*
  Public entrypoints

  - cfAnalyticsSetupWizard()
  - cfAnalyticsRefresh()
  - cfAnalyticsBackfill(days)
  - cfAnalyticsInstallTrigger()
  - cfAnalyticsRemoveTriggers()
*/

function cfAnalyticsSetupWizard() {
  var ui = SpreadsheetApp.getUi();

  var sheetId = CF_ANALYTICS.getPropAny(['CF_ANALYTICS_SHEET_ID', 'ANALYTICS_SHEET_ID'], '');
  if (!sheetId) {
    var resp = ui.prompt(
      'Cloudflare Analytics → Sheets',
      'Paste the Google Sheet ID where analytics should be stored:',
      ui.ButtonSet.OK_CANCEL
    );
    if (resp.getSelectedButton() !== ui.Button.OK) return;
    sheetId = resp.getResponseText().trim();
    if (!sheetId) throw new Error('Sheet ID is required.');
    CF_ANALYTICS.setProp('CF_ANALYTICS_SHEET_ID', sheetId);
  }

  var token = CF_ANALYTICS.getPropAny(['CF_API_TOKEN', 'CLOUDFLARE_API_TOKEN'], '');
  if (!token) {
    var tokenResp = ui.prompt(
      'Cloudflare API Token',
      'Paste your Cloudflare API token (same value as CLOUDFLARE_API_TOKEN in your .env.local).\nThis will be saved in Script Properties:',
      ui.ButtonSet.OK_CANCEL
    );
    if (tokenResp.getSelectedButton() !== ui.Button.OK) return;
    token = tokenResp.getResponseText().trim();
    if (!token) throw new Error('API token is required.');
    CF_ANALYTICS.setProp('CF_API_TOKEN', token);
  }

  // Zone ID (zoneTag) OR zone name (domain)
  // If the zone id is already provided (including alias), skip prompting for name.
  var zoneTag = CF_ANALYTICS.getPropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], '');
  var zoneName = CF_ANALYTICS.getProp('CF_ZONE_NAME', 'b3unstoppable.net');
  if (!zoneTag) {
    var zoneResp = ui.prompt(
      'Zone (ID or name)',
      'Paste the Zone ID (32-char hex) OR type the zone name (domain), e.g. b3unstoppable.net:',
      ui.ButtonSet.OK_CANCEL
    );
    if (zoneResp.getSelectedButton() !== ui.Button.OK) return;
    var zoneInput = (zoneResp.getResponseText() || '').trim();
    if (!zoneInput) throw new Error('Zone ID or zone name is required.');

    if (/^[a-f0-9]{32}$/i.test(zoneInput)) {
      zoneTag = zoneInput;
      CF_ANALYTICS.setProp('CF_ZONE_TAG', zoneTag);
    } else {
      zoneName = zoneInput;
      CF_ANALYTICS.setProp('CF_ZONE_NAME', zoneName);
    }
  }

  // Web Analytics site tag (token from snippet)
  var siteTag = CF_ANALYTICS.getPropAny(['CF_WEB_SITE_TAG', 'CLOUDFLARE_ANALYTICS_TOKEN'], '');
  var webDisabled = String(CF_ANALYTICS.getProp('CF_DISABLE_WEB_ANALYTICS', '')).trim().toLowerCase();
  webDisabled = (webDisabled === '1' || webDisabled === 'true' || webDisabled === 'yes' || webDisabled === 'on');
  if (!siteTag && !webDisabled) {
    var siteResp = ui.prompt(
      'Web Analytics site tag (optional)',
      'Paste the Web Analytics siteTag/token (Web Analytics → Manage site → snippet).\n\nLeave blank to SKIP Web Analytics for now (Zone/Traffic will still work).\nIf you already have CLOUDFLARE_ANALYTICS_TOKEN in .env.local, it is usually the same value:',
      ui.ButtonSet.OK_CANCEL
    );
    if (siteResp.getSelectedButton() !== ui.Button.OK) return;
    siteTag = (siteResp.getResponseText() || '').trim();
    if (!siteTag) {
      CF_ANALYTICS.setProp('CF_DISABLE_WEB_ANALYTICS', 'true');
    } else {
      CF_ANALYTICS.setProp('CF_DISABLE_WEB_ANALYTICS', 'false');
      CF_ANALYTICS.setProp('CF_WEB_SITE_TAG', siteTag);
    }
  }

  // Optional settings
  var refreshMin = CF_ANALYTICS.getProp('CF_REFRESH_MINUTES', '5');
  var refreshResp = ui.prompt(
    'Refresh interval (minutes)',
    'Enter refresh minutes (recommended 5; Apps Script may not support <5):',
    ui.ButtonSet.OK_CANCEL
  );
  if (refreshResp.getSelectedButton() !== ui.Button.OK) return;
  refreshMin = (refreshResp.getResponseText() || '').trim() || refreshMin;
  CF_ANALYTICS.setProp('CF_REFRESH_MINUTES', refreshMin);

  var windowHours = CF_ANALYTICS.getProp('CF_REFRESH_WINDOW_HOURS', '12');
  var windowResp = ui.prompt(
    'Refresh window (hours)',
    'How many hours back should each refresh re-pull (covers late-arriving data)? Suggested 12:',
    ui.ButtonSet.OK_CANCEL
  );
  if (windowResp.getSelectedButton() !== ui.Button.OK) return;
  windowHours = (windowResp.getResponseText() || '').trim() || windowHours;
  CF_ANALYTICS.setProp('CF_REFRESH_WINDOW_HOURS', windowHours);

  var retention = CF_ANALYTICS.getProp('CF_RETENTION_DAYS', '30');
  var retentionResp = ui.prompt(
    'Retention (days)',
    'How many days of 5-minute data to keep in Sheets? Suggested 30:',
    ui.ButtonSet.OK_CANCEL
  );
  if (retentionResp.getSelectedButton() !== ui.Button.OK) return;
  retention = (retentionResp.getResponseText() || '').trim() || retention;
  CF_ANALYTICS.setProp('CF_RETENTION_DAYS', retention);

  // Discover IDs if missing
  zoneTag = CF_ANALYTICS.getPropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], '');
  if (!zoneTag) {
    zoneTag = CF_ANALYTICS.findZoneIdByName(zoneName);
    if (!zoneTag) {
      var z = ui.prompt(
        'Zone ID not found',
        'Could not auto-discover zoneTag from name. Paste Zone ID manually:',
        ui.ButtonSet.OK_CANCEL
      );
      if (z.getSelectedButton() !== ui.Button.OK) return;
      zoneTag = (z.getResponseText() || '').trim();
    }
    if (!zoneTag) throw new Error('Zone ID is required.');
    CF_ANALYTICS.setProp('CF_ZONE_TAG', zoneTag);
  }

  var accountTag = CF_ANALYTICS.getPropAny(['CF_ACCOUNT_TAG', 'CLOUDFLARE_ACCOUNT_ID'], '');
  if (!accountTag) {
    try {
      accountTag = CF_ANALYTICS.findFirstAccountId();
    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      if (msg.indexOf('Invalid access token') !== -1) {
        ui.alert(
          'Invalid Cloudflare API token',
          'Cloudflare rejected the API token. This usually means you pasted the placeholder name (e.g. "CLOUDFLARE_API_TOKEN") instead of the actual token value, or the token was revoked/typoed.\n\nFix: Apps Script → Project Settings → Script Properties → set CF_API_TOKEN (or CLOUDFLARE_API_TOKEN) to the real token string from Cloudflare → My Profile → API Tokens.\n\nThen run cfAnalyticsSetupWizard() again.',
          ui.ButtonSet.OK
        );
      }
      throw e;
    }
    if (!accountTag) {
      var a = ui.prompt(
        'Account ID not found',
        'Could not auto-discover accountTag. Paste Account ID manually:',
        ui.ButtonSet.OK_CANCEL
      );
      if (a.getSelectedButton() !== ui.Button.OK) return;
      accountTag = (a.getResponseText() || '').trim();
    }
    if (!accountTag) throw new Error('Account ID is required.');
    CF_ANALYTICS.setProp('CF_ACCOUNT_TAG', accountTag);
  }

  // Create tabs + dashboard
  CF_SHEETS.ensureAllTabs();

  // Install trigger
  cfAnalyticsInstallTrigger();

  ui.alert(
    'Setup complete',
    'Tabs created (CF_Web_5m, CF_Zone_5m, CF_DNS_5m, CF_Dashboard). A refresh trigger was installed.\n\nNext: Run cfAnalyticsRefresh once to validate data pulls. If nothing shows up, run cfAnalyticsHealthCheck() and review the Logs.',
    ui.ButtonSet.OK
  );
}

function cfAnalyticsSetupFromScriptProperties() {
  // Headless setup: no prompts. Useful if the wizard appears to hang.
  // Required Script Properties (or aliases):
  // - CF_ANALYTICS_SHEET_ID (or ANALYTICS_SHEET_ID)
  // - CF_API_TOKEN (or CLOUDFLARE_API_TOKEN)
  // - CF_ZONE_TAG (or CLOUDFLARE_ZONE_ID)
  // - CF_ACCOUNT_TAG (or auto-discovered by wizard; set manually here)
  // - CF_WEB_SITE_TAG (or CLOUDFLARE_ANALYTICS_TOKEN)

  // Validate required config exists
  CF_ANALYTICS.requirePropAny(['CF_ANALYTICS_SHEET_ID', 'ANALYTICS_SHEET_ID'], 'CF_ANALYTICS_SHEET_ID');
  CF_ANALYTICS.requirePropAny(['CF_API_TOKEN', 'CLOUDFLARE_API_TOKEN'], 'CF_API_TOKEN');
  CF_ANALYTICS.requirePropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], 'CF_ZONE_TAG');
  var webDisabled = String(CF_ANALYTICS.getProp('CF_DISABLE_WEB_ANALYTICS', '')).trim().toLowerCase();
  webDisabled = (webDisabled === '1' || webDisabled === 'true' || webDisabled === 'yes' || webDisabled === 'on');
  if (!webDisabled) {
    CF_ANALYTICS.requirePropAny(['CF_WEB_SITE_TAG', 'CLOUDFLARE_ANALYTICS_TOKEN'], 'CF_WEB_SITE_TAG');
  }

  // Account id is optional if we can discover it
  var accountTag = CF_ANALYTICS.getPropAny(['CF_ACCOUNT_TAG', 'CLOUDFLARE_ACCOUNT_ID'], '');
  if (!accountTag) {
    accountTag = CF_ANALYTICS.findFirstAccountId();
    if (!accountTag) {
      throw new Error('Missing Script Property: CF_ACCOUNT_TAG (and could not auto-discover via /accounts).');
    }
    CF_ANALYTICS.setProp('CF_ACCOUNT_TAG', accountTag);
  }

  CF_SHEETS.ensureAllTabs();
  cfAnalyticsInstallTrigger();
  return { ok: true };
}

function cfAnalyticsInstallTrigger() {
  // Remove existing triggers for our handler
  cfAnalyticsRemoveTriggers();

  var minutes = parseInt(CF_ANALYTICS.getProp('CF_REFRESH_MINUTES', '5'), 10);
  if (!minutes || minutes < 5) minutes = 5;

  ScriptApp.newTrigger('cfAnalyticsRefresh')
    .timeBased()
    .everyMinutes(minutes)
    .create();
}

function cfAnalyticsRemoveTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction && triggers[i].getHandlerFunction() === 'cfAnalyticsRefresh') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function cfAnalyticsRefresh() {
  var result = CF_SHEETS.refreshOnce();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function cfAnalyticsSmokeTest() {
  // Runs a small query window and logs dataset variants, without requiring a full sheet refresh.
  // Accept either CF_* names or env-style aliases as Script Properties.
  var zoneTag = CF_ANALYTICS.requirePropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], 'CF_ZONE_TAG');

  var webDisabled = String(CF_ANALYTICS.getProp('CF_DISABLE_WEB_ANALYTICS', '')).trim().toLowerCase();
  webDisabled = (webDisabled === '1' || webDisabled === 'true' || webDisabled === 'yes' || webDisabled === 'on');
  var siteTag = webDisabled ? '' : CF_ANALYTICS.requirePropAny(['CF_WEB_SITE_TAG', 'CLOUDFLARE_ANALYTICS_TOKEN'], 'CF_WEB_SITE_TAG');

  // Account tag: try property, else auto-discover and persist.
  var accountTag = CF_ANALYTICS.getPropAny(['CF_ACCOUNT_TAG', 'CLOUDFLARE_ACCOUNT_ID'], '');
  if (!accountTag) {
    accountTag = CF_ANALYTICS.findFirstAccountId();
    if (!accountTag) {
      throw new Error('Missing Script Property: CF_ACCOUNT_TAG (and could not auto-discover via /accounts).');
    }
    CF_ANALYTICS.setProp('CF_ACCOUNT_TAG', accountTag);
  }

  var end = new Date();
  var start = new Date(end.getTime() - 60 * 60 * 1000);

  var zoneRes = CF_ANALYTICS.queryZone5m(zoneTag, start, end);
  var webRes = webDisabled ? { dataset: 'disabled', groups: [] } : CF_ANALYTICS.queryWeb5m(accountTag, siteTag, start, end);

  var out = {
    zoneVariant: zoneRes.variant,
    zonePoints: (zoneRes.groups || []).length,
    webDataset: webRes.dataset,
    webPoints: (webRes.groups || []).length
  };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function cfAnalyticsDnsSmokeTest() {
  var zoneTag = CF_ANALYTICS.requirePropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], 'CF_ZONE_TAG');
  var end = new Date();
  var start = new Date(end.getTime() - 60 * 60 * 1000);
  var dnsRes = CF_ANALYTICS.queryDns5m(zoneTag, start, end);
  var out = { dnsDataset: dnsRes.dataset, dnsPoints: (dnsRes.groups || []).length };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function cfAnalyticsHealthCheck() {
  // Quick diagnostics for "nothing showing" cases.
  // - Confirms Script Properties state (web disabled?)
  // - Runs short Zone/DNS/Web queries over wider windows
  // - Prints likely causes when point counts are zero

  var zoneTag = CF_ANALYTICS.requirePropAny(['CF_ZONE_TAG', 'CLOUDFLARE_ZONE_ID'], 'CF_ZONE_TAG');

  var webDisabled = String(CF_ANALYTICS.getProp('CF_DISABLE_WEB_ANALYTICS', '')).trim().toLowerCase();
  webDisabled = (webDisabled === '1' || webDisabled === 'true' || webDisabled === 'yes' || webDisabled === 'on');

  // Account tag: try property, else auto-discover and persist.
  var accountTag = CF_ANALYTICS.getPropAny(['CF_ACCOUNT_TAG', 'CLOUDFLARE_ACCOUNT_ID'], '');
  if (!accountTag) {
    accountTag = CF_ANALYTICS.findFirstAccountId();
    if (accountTag) CF_ANALYTICS.setProp('CF_ACCOUNT_TAG', accountTag);
  }

  var siteTag = webDisabled ? '' : CF_ANALYTICS.getPropAny(['CF_WEB_SITE_TAG', 'CLOUDFLARE_ANALYTICS_TOKEN'], '');

  var now = new Date();
  var windows = [
    { label: '1h', start: new Date(now.getTime() - 1 * 60 * 60 * 1000), end: now },
    { label: '6h', start: new Date(now.getTime() - 6 * 60 * 60 * 1000), end: now },
    { label: '24h', start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now }
  ];

  var results = {
    zoneTag: zoneTag,
    accountTag: accountTag || '(missing)',
    webDisabled: webDisabled,
    siteTagPresent: Boolean(siteTag),
    checks: []
  };

  for (var i = 0; i < windows.length; i++) {
    var w = windows[i];
    var zoneRes = CF_ANALYTICS.queryZone5m(zoneTag, w.start, w.end);
    var dnsRes = { dataset: 'error', groups: [] };
    var dnsErr = '';
    try {
      dnsRes = CF_ANALYTICS.queryDns5m(zoneTag, w.start, w.end);
    } catch (eDns) {
      dnsErr = (eDns && eDns.message) ? eDns.message : String(eDns);
    }
    var webRes = { dataset: 'disabled', groups: [] };

    if (!webDisabled && accountTag && siteTag) {
      webRes = CF_ANALYTICS.queryWeb5m(accountTag, siteTag, w.start, w.end);
    }

    results.checks.push({
      window: w.label,
      zoneVariant: zoneRes.variant,
      zonePoints: (zoneRes.groups || []).length,
      dnsDataset: dnsRes.dataset,
      dnsPoints: (dnsRes.groups || []).length,
      dnsError: dnsErr,
      webDataset: webRes.dataset,
      webPoints: (webRes.groups || []).length
    });
  }

  // Heuristic hints
  var hints = [];
  if (webDisabled) {
    hints.push('Web is disabled in Script Properties (CF_DISABLE_WEB_ANALYTICS=true). Enable it and set CF_WEB_SITE_TAG if you want Web Analytics pulled.');
  } else if (!siteTag) {
    hints.push('Web is enabled but CF_WEB_SITE_TAG is missing. Paste the siteTag/token from the Web Analytics snippet.');
  }

  var zoneAny = results.checks.some(function (c) { return c.zonePoints > 0; });
  if (!zoneAny) {
    hints.push('Zone/HTTP points are 0 across windows. Most common causes: DNS record is not proxied (grey cloud), traffic bypasses Cloudflare, or the site has very low/no traffic.');
  }

  var dnsAny = results.checks.some(function (c) { return c.dnsPoints > 0; });
  if (!dnsAny) {
    hints.push('DNS points are 0 across windows. Causes: no DNS traffic for that zone, DNS not served by Cloudflare for the queried zone, or DNS dataset not available on your plan/API scope.');
  }

  results.hints = hints;

  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

function cfAnalyticsDiscoverWebAnalyticsDatasets() {
  // Lists Account fields that look like Web Analytics / RUM datasets.
  var candidates = []
    .concat(CF_ANALYTICS.discoverAccountFieldsLike('web'))
    .concat(CF_ANALYTICS.discoverAccountFieldsLike('rum'));

  // De-dupe by name
  var seen = {};
  var out = [];
  for (var i = 0; i < candidates.length; i++) {
    var n = candidates[i].name;
    if (seen[n]) continue;
    seen[n] = true;
    out.push(candidates[i]);
  }

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function cfAnalyticsDebugZoneSchema() {
  var out = CF_ANALYTICS.debugZoneHttpRequestsSchema();
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function cfAnalyticsBackfill(days) {
  // Backfill by temporarily increasing the refresh window.
  days = Number(days || 7);
  if (days <= 0) days = 7;

  var oldWindow = CF_ANALYTICS.getProp('CF_REFRESH_WINDOW_HOURS', '12');
  CF_ANALYTICS.setProp('CF_REFRESH_WINDOW_HOURS', String(days * 24));
  try {
    return cfAnalyticsRefresh();
  } finally {
    CF_ANALYTICS.setProp('CF_REFRESH_WINDOW_HOURS', oldWindow);
  }
}
