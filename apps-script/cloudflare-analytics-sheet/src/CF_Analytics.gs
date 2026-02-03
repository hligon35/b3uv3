/*
  Cloudflare Analytics → Google Sheets

  This file handles:
  - Cloudflare REST helpers (discover account/zone ids)
  - Cloudflare GraphQL queries (Zone/Traffic + Web Analytics)

  Script Properties used (set by cfAnalyticsSetupWizard):
    CF_API_TOKEN
    CF_ACCOUNT_TAG
    CF_ZONE_TAG
    CF_ZONE_NAME (optional)
    CF_WEB_SITE_TAG (Web Analytics site tag/token)

    CF_REFRESH_MINUTES (default 5)
    CF_REFRESH_WINDOW_HOURS (default 12)
    CF_RETENTION_DAYS (default 30)

    CF_ANALYTICS_SHEET_ID
*/

var CF_ANALYTICS = (function () {
  'use strict';

  var GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
  var API_BASE = 'https://api.cloudflare.com/client/v4';
  var CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

  function props() {
    return PropertiesService.getScriptProperties();
  }

  function getProp(key, fallback) {
    var v = props().getProperty(key);
    return (v === null || v === undefined || v === '') ? fallback : v;
  }

  function getPropAny(keys, fallback) {
    for (var i = 0; i < keys.length; i++) {
      var v = props().getProperty(keys[i]);
      if (v !== null && v !== undefined && v !== '') return v;
    }
    return fallback;
  }

  function setProp(key, value) {
    props().setProperty(key, String(value));
  }

  function requireProp(key) {
    var v = getProp(key, null);
    if (!v) throw new Error('Missing Script Property: ' + key);
    return v;
  }

  function requirePropAny(keys, label) {
    var v = getPropAny(keys, null);
    if (!v) throw new Error('Missing Script Property: ' + (label || keys[0]));
    return v;
  }

  function authHeaders() {
    var token = requirePropAny(['CF_API_TOKEN', 'CLOUDFLARE_API_TOKEN'], 'CF_API_TOKEN');
    return {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }

  function fetchJson(url, options) {
    options = options || {};
    options.muteHttpExceptions = true;
    var res = UrlFetchApp.fetch(url, options);
    var text = res.getContentText();
    var code = res.getResponseCode();
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Non-JSON response (' + code + '): ' + text);
    }

    // Cloudflare REST APIs typically return HTTP 200 even when success=false.
    if (data && typeof data.success === 'boolean' && data.success === false) {
      var errMsg = (data.errors && data.errors[0] && data.errors[0].message)
        ? data.errors[0].message
        : (data.messages && data.messages[0] && data.messages[0].message)
          ? data.messages[0].message
          : text;
      throw new Error('HTTP ' + code + ' from ' + url + ': ' + errMsg);
    }
    if (code < 200 || code >= 300) {
      var msg = (data && data.errors && data.errors[0] && data.errors[0].message) ? data.errors[0].message : text;
      throw new Error('HTTP ' + code + ' from ' + url + ': ' + msg);
    }
    return data;
  }

  // ---------- REST discovery ----------

  function listAccounts() {
    var url = API_BASE + '/accounts?page=1&per_page=50';
    var data = fetchJson(url, { method: 'get', headers: authHeaders() });
    return (data && data.result) ? data.result : [];
  }

  function findAccountIdByName(name) {
    var accounts = listAccounts();
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].name === name) return accounts[i].id;
    }
    return null;
  }

  function findFirstAccountId() {
    var accounts = listAccounts();
    return accounts.length ? accounts[0].id : null;
  }

  function findZoneIdByName(zoneName) {
    var url = API_BASE + '/zones?name=' + encodeURIComponent(zoneName) + '&status=active&page=1&per_page=50';
    var data = fetchJson(url, { method: 'get', headers: authHeaders() });
    var zones = (data && data.result) ? data.result : [];
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].name === zoneName) return zones[i].id;
    }
    return null;
  }

  // ---------- GraphQL ----------

  function graphql(query) {
    var payload = JSON.stringify({ query: query });
    var data = fetchJson(GRAPHQL_ENDPOINT, {
      method: 'post',
      headers: authHeaders(),
      payload: payload
    });
    if (data && data.errors && data.errors.length) {
      throw new Error('GraphQL error: ' + (data.errors[0].message || JSON.stringify(data.errors[0])));
    }
    return data;
  }

  function cache() {
    return CacheService.getScriptCache();
  }

  function cacheGetJson(key) {
    var raw = cache().get(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function cachePutJson(key, value) {
    cache().put(key, JSON.stringify(value), CACHE_TTL_SECONDS);
  }

  function cacheKeyForZone(zoneTag, suffix) {
    return 'cf:zone:' + String(zoneTag || '') + ':' + suffix;
  }

  function cacheKeyForAccount(accountTag, suffix) {
    return 'cf:account:' + String(accountTag || '') + ':' + suffix;
  }

  function introspectType(typeName) {
    var ck = 'gql:introspect:' + typeName;
    var cached = cacheGetJson(ck);
    if (cached) return cached;
    var q =
      'query {' +
      ' __type(name: "' + escapeGqlString(typeName) + '") {' +
      '  name' +
      '  fields { name description }' +
      ' }' +
      '}';
    var res = graphql(q);
    var t = (res && res.data && res.data.__type) ? res.data.__type : null;
    if (t) cachePutJson(ck, t);
    return t;
  }

  function introspectTypeWithFieldTypes(typeName) {
    // Like introspectType(), but includes GraphQL type info for each field.
    // Cached because this can be expensive.
    var ck = 'gql:introspect2:' + typeName;
    var cached = cacheGetJson(ck);
    if (cached) return cached;

    var q =
      'query {' +
      ' __type(name: "' + escapeGqlString(typeName) + '") {' +
      '  name' +
      '  fields {' +
      '   name' +
      '   description' +
      '   type {' +
      '    kind name' +
      '    ofType { kind name ' +
      '      ofType { kind name ' +
      '        ofType { kind name ' +
      '          ofType { kind name ' +
      '            ofType { kind name ' +
      '              ofType { kind name ' +
      '                ofType { kind name }' +
      '              }' +
      '            }' +
      '          }' +
      '        }' +
      '      }' +
      '    }' +
      '   }' +
      '  }' +
      ' }' +
      '}';

    var res = graphql(q);
    var t = (res && res.data && res.data.__type) ? res.data.__type : null;
    if (t) cachePutJson(ck, t);
    return t;
  }

  function discoverFields(typeName, containsLower) {
    var t = introspectType(typeName);
    if (!t || !t.fields) return [];
    var out = [];
    var needle = String(containsLower || '').toLowerCase();
    for (var i = 0; i < t.fields.length; i++) {
      var name = t.fields[i].name;
      if (!needle || String(name).toLowerCase().indexOf(needle) !== -1) {
        out.push({ name: name, description: t.fields[i].description || '' });
      }
    }
    return out;
  }

  function firstExistingType(typeNames) {
    for (var i = 0; i < typeNames.length; i++) {
      var t = introspectType(typeNames[i]);
      if (t) return t;
    }
    return null;
  }

  function fieldNameSet(typeObj) {
    var set = {};
    if (!typeObj || !typeObj.fields) return set;
    for (var i = 0; i < typeObj.fields.length; i++) set[typeObj.fields[i].name] = true;
    return set;
  }

  function unwrapNamedType(typeRef) {
    // Walk through ofType wrappers until we find a named type.
    var t = typeRef;
    while (t) {
      if (t.name) return t.name;
      t = t.ofType;
    }
    return null;
  }

  function findField(typeObj, fieldName) {
    if (!typeObj || !typeObj.fields) return null;
    for (var i = 0; i < typeObj.fields.length; i++) {
      if (typeObj.fields[i].name === fieldName) return typeObj.fields[i];
    }
    return null;
  }

  function pickFields(availableSet, preferredList, minCount) {
    var out = [];
    for (var i = 0; i < preferredList.length; i++) {
      var f = preferredList[i];
      if (availableSet[f]) out.push(f);
    }
    if (out.length >= (minCount || 1)) return out;
    return out; // allow empty; caller will handle
  }

  function getHttpRequestGroupMetricFields() {
    // Discover types dynamically from Zone.httpRequestsAdaptiveGroups → group.sum/uniq
    var zoneType = introspectTypeWithFieldTypes('Zone');
    var httpField = findField(zoneType, 'httpRequestsAdaptiveGroups');
    if (!httpField || !httpField.type) {
      return { sumFields: [], uniqFields: [] };
    }

    var groupTypeName = unwrapNamedType(httpField.type);
    if (!groupTypeName) return { sumFields: [], uniqFields: [] };

    var groupType = introspectTypeWithFieldTypes(groupTypeName);
    var sumField = findField(groupType, 'sum');
    var uniqField = findField(groupType, 'uniq');

    var sumTypeName = sumField && sumField.type ? unwrapNamedType(sumField.type) : null;
    var uniqTypeName = uniqField && uniqField.type ? unwrapNamedType(uniqField.type) : null;

    var sumType = sumTypeName ? introspectType(sumTypeName) : null;
    var uniqType = uniqTypeName ? introspectType(uniqTypeName) : null;

    var sumAvail = fieldNameSet(sumType);
    var uniqAvail = fieldNameSet(uniqType);

    var sumPreferred = ['requests', 'bytes', 'edgeResponseBytes', 'cachedBytes', 'visits', 'pageViews'];
    var uniqPreferred = ['uniques'];

    var sumFields = pickFields(sumAvail, sumPreferred, 1);
    // If none of the preferred fields exist, fall back to any available field (first one)
    if (!sumFields.length && sumType && sumType.fields && sumType.fields.length) {
      sumFields = [sumType.fields[0].name];
    }

    var uniqFields = pickFields(uniqAvail, uniqPreferred, 0);
    if (!uniqFields.length) uniqFields = []; // optional

    return { sumFields: sumFields, uniqFields: uniqFields };
  }

  function debugZoneHttpRequestsSchema() {
    var zoneType = introspectTypeWithFieldTypes('Zone');
    var httpField = findField(zoneType, 'httpRequestsAdaptiveGroups');
    var groupTypeName = httpField && httpField.type ? unwrapNamedType(httpField.type) : null;
    var groupType = groupTypeName ? introspectTypeWithFieldTypes(groupTypeName) : null;
    var sumField = findField(groupType, 'sum');
    var uniqField = findField(groupType, 'uniq');
    var sumTypeName = sumField && sumField.type ? unwrapNamedType(sumField.type) : null;
    var uniqTypeName = uniqField && uniqField.type ? unwrapNamedType(uniqField.type) : null;
    var sumType = sumTypeName ? introspectType(sumTypeName) : null;
    var uniqType = uniqTypeName ? introspectType(uniqTypeName) : null;

    return {
      hasHttpRequestsAdaptiveGroups: !!httpField,
      httpRequestsAdaptiveGroupsType: groupTypeName,
      groupFields: groupType && groupType.fields ? groupType.fields.map(function (f) {
        return { name: f.name, type: unwrapNamedType(f.type) };
      }) : [],
      sumTypeName: sumTypeName,
      sumFields: sumType && sumType.fields ? sumType.fields.map(function (f) { return f.name; }) : [],
      uniqTypeName: uniqTypeName,
      uniqFields: uniqType && uniqType.fields ? uniqType.fields.map(function (f) { return f.name; }) : [],
      zoneFields_http: discoverFields('Zone', 'http').map(function (f) { return f.name; }).slice(0, 80),
      zoneFields_request: discoverFields('Zone', 'request').map(function (f) { return f.name; }).slice(0, 80)
    };
  }

  function typeHasField(typeName, fieldName) {
    var t = introspectType(typeName);
    if (!t || !t.fields) return false;
    for (var i = 0; i < t.fields.length; i++) {
      if (t.fields[i].name === fieldName) return true;
    }
    return false;
  }

  function escapeGqlString(s) {
    return String(s)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }

  function iso(d) {
    return new Date(d).toISOString();
  }

  function sortIsoKeys(obj) {
    var keys = [];
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) keys.push(k);
    keys.sort();
    return keys;
  }

  function isTruthy(v) {
    if (v === null || v === undefined) return false;
    var s = String(v).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y' || s === 'on';
  }

  function toInt(v, fallback) {
    var n = parseInt(String(v), 10);
    return isFinite(n) ? n : fallback;
  }

  function roundDownToFiveMinutes(dateObj) {
    var ms = dateObj.getTime();
    var bucket = 5 * 60 * 1000;
    return new Date(Math.floor(ms / bucket) * bucket);
  }

  function getWindow(now) {
    var hours = parseInt(getProp('CF_REFRESH_WINDOW_HOURS', '12'), 10);
    var end = roundDownToFiveMinutes(now);
    var start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    return { start: start, end: end };
  }

  // Zone/Traffic query (5 minute buckets)
  function queryZone5m(zoneTag, startDate, endDate) {
    // GraphQL introspection can be unavailable or restricted. Instead of guessing type names,
    // we probe individual metric fields and then request the richest supported set.

    function probeSumField(fieldName) {
      var q =
        'query {' +
        ' viewer {' +
        '  zones(filter:{zoneTag:"' + escapeGqlString(zoneTag) + '"}) {' +
        '   httpRequestsAdaptiveGroups(' +
        '    limit: 1,' +
        '    filter: { datetime_geq: "' + iso(startDate) + '", datetime_lt: "' + iso(endDate) + '" }' +
        '   ) {' +
        '    dimensions { datetimeFiveMinutes }' +
        '    sum { ' + fieldName + ' }' +
        '   }' +
        '  }' +
        ' }' +
        '}';
      graphql(q);
      return true;
    }

    function probeUniqUniques() {
      var q =
        'query {' +
        ' viewer {' +
        '  zones(filter:{zoneTag:"' + escapeGqlString(zoneTag) + '"}) {' +
        '   httpRequestsAdaptiveGroups(' +
        '    limit: 1,' +
        '    filter: { datetime_geq: "' + iso(startDate) + '", datetime_lt: "' + iso(endDate) + '" }' +
        '   ) {' +
        '    dimensions { datetimeFiveMinutes }' +
        '    uniq { uniques }' +
        '   }' +
        '  }' +
        ' }' +
        '}';
      graphql(q);
      return true;
    }

    var ck = cacheKeyForZone(zoneTag, 'httpRequestsAdaptiveGroups:metrics');
    var cached = cacheGetJson(ck);
    var supported = cached;

    if (!supported || !supported.sumFields || !supported.sumFields.length) {
      var candidates = ['requests', 'bytes', 'edgeResponseBytes', 'cachedBytes', 'visits', 'pageViews'];
      var sumFields = [];
      var lastErr;
      for (var i = 0; i < candidates.length; i++) {
        try {
          if (probeSumField(candidates[i])) sumFields.push(candidates[i]);
        } catch (e) {
          lastErr = e;
        }
      }
      if (!sumFields.length) {
        throw lastErr || new Error('Zone query failed: no supported sum fields found.');
      }

      var uniqOk = false;
      try { uniqOk = probeUniqUniques(); } catch (e2) { uniqOk = false; }

      supported = { sumFields: sumFields, uniqUniques: uniqOk };
      cachePutJson(ck, supported);
    }

    var sumBlock = 'sum { ' + supported.sumFields.join(' ') + ' }';
    var uniqBlock = supported.uniqUniques ? ' uniq { uniques }' : '';

    var query =
      'query {' +
      ' viewer {' +
      '  zones(filter:{zoneTag:"' + escapeGqlString(zoneTag) + '"}) {' +
      '   httpRequestsAdaptiveGroups(' +
      '    limit: 10000,' +
      '    filter: { datetime_geq: "' + iso(startDate) + '", datetime_lt: "' + iso(endDate) + '" },' +
      '    orderBy: [datetimeFiveMinutes_ASC]' +
      '   ) {' +
      '    dimensions { datetimeFiveMinutes }' +
      '    ' + sumBlock +
           uniqBlock +
      '   }' +
      '  }' +
      ' }' +
      '}';

    var res = graphql(query);
    var groups = res.data.viewer.zones[0].httpRequestsAdaptiveGroups || [];
    return { variant: 'probed:' + supported.sumFields.join(','), groups: groups };
  }

  // Web Analytics (RUM) query (5 minute buckets)
  // NOTE: Cloudflare’s schema varies by plan. We attempt common dataset names.
  function queryWeb5m(accountTag, siteTag, startDate, endDate) {
    if (isTruthy(getProp('CF_DISABLE_WEB_ANALYTICS', '')) || !siteTag) {
      return { dataset: 'disabled', groups: [] };
    }

    var override = getProp('CF_WEB_DATASET_OVERRIDE', '');
    var datasetCandidates = override
      ? [override]
      : [
          // historically observed names in some accounts
          'webAnalyticsAdaptiveGroups',
          'rumPageloadEventsAdaptiveGroups',
          'rumPerformanceEventsAdaptiveGroups'
        ];

    // If GraphQL introspection is available, filter to datasets that exist on Account.
    // Some environments/plans restrict introspection (Account type may come back null/empty).
    // In that case, skip filtering and probe the common dataset names directly.
    var acctType;
    try {
      acctType = introspectType('Account');
    } catch (e) {
      acctType = null;
    }

    if (acctType && acctType.fields && acctType.fields.length) {
      var filtered = [];
      for (var i = 0; i < datasetCandidates.length; i++) {
        if (typeHasField('Account', datasetCandidates[i])) filtered.push(datasetCandidates[i]);
      }
      datasetCandidates = filtered;
      if (!datasetCandidates.length) {
        throw new Error(
          'No Web Analytics/RUM datasets found on Account type. ' +
          'This may mean Web Analytics is not enabled for this account, your plan doesn\'t expose it in GraphQL, or the dataset name differs. ' +
          'Try cfAnalyticsDiscoverWebAnalyticsDatasets(); if that also returns empty, set CF_WEB_DATASET_OVERRIDE and retry.'
        );
      }
    }

    var fieldCandidates = [
      // High-level Web Analytics
      { sum: 'visits pageViews', uniq: 'uniques' },
      { sum: 'visits pageViews', uniq: null },
      // RUM-style fields sometimes differ
      { sum: 'pageViews visits', uniq: 'uniques' },
      { sum: 'pageViews visits', uniq: null }
    ];

    var lastErr;

    for (var d = 0; d < datasetCandidates.length; d++) {
      for (var f = 0; f < fieldCandidates.length; f++) {
        var dataset = datasetCandidates[d];
        var fields = fieldCandidates[f];

        var uniqBlock = fields.uniq ? (' uniq { ' + fields.uniq + ' }') : '';

        // Many account-scoped datasets accept a generic `filter` input.
        // We include siteTag in the filter; if a given dataset doesn’t accept it,
        // this attempt will fail and we’ll try another dataset.
        var q =
          'query {' +
          ' viewer {' +
          '  accounts(filter:{accountTag:"' + escapeGqlString(accountTag) + '"}) {' +
          '   ' + dataset + '(' +
          '    limit: 10000,' +
          '    filter: { siteTag: "' + escapeGqlString(siteTag) + '",' +
          '              datetime_geq: "' + iso(startDate) + '",' +
          '              datetime_lt: "' + iso(endDate) + '" },' +
          '    orderBy: [datetimeFiveMinutes_ASC]' +
          '   ) {' +
          '    dimensions { datetimeFiveMinutes }' +
          '    sum { ' + fields.sum + ' }' +
               uniqBlock +
          '   }' +
          '  }' +
          ' }' +
          '}';

        try {
          var res = graphql(q);
          var acct = res.data.viewer.accounts[0];
          var groups = acct[dataset] || [];
          return { dataset: dataset, groups: groups };
        } catch (e) {
          lastErr = e;
        }
      }
    }

    throw new Error(
      'Failed to query Web Analytics via GraphQL. ' +
      'Most common causes: wrong siteTag, Web Analytics not enabled/available on plan, token lacks required permissions, or schema differs. ' +
      'Last error: ' + (lastErr && lastErr.message ? lastErr.message : String(lastErr))
    );
  }

  // DNS analytics query (5 minute buckets)
  // NOTE: Dataset/field names vary by plan/account, and introspection may be unavailable.
  // Prefer REST DNS Analytics bytime endpoint (more consistently available).
  // If desired, GraphQL probing can be enabled via CF_DNS_QUERY_MODE=graphql.
  function queryDns5m(zoneTag, startDate, endDate) {
    if (isTruthy(getProp('CF_DISABLE_DNS_ANALYTICS', ''))) {
      return { dataset: 'disabled', groups: [] };
    }

    var mode = String(getProp('CF_DNS_QUERY_MODE', 'rest')).trim().toLowerCase();
    // rest | graphql | auto
    if (mode !== 'rest' && mode !== 'graphql' && mode !== 'auto') mode = 'rest';

    function queryDns5mRest(z, s, e) {
      // Cloudflare REST DNS Analytics endpoint returns minute buckets; roll up into 5-minute.
      // Free plan enforces a max queryable range (often 6 hours). Chunk automatically.

      var maxHours = toInt(getProp('CF_DNS_MAX_QUERY_HOURS', '6'), 6);
      if (!maxHours || maxHours < 1) maxHours = 6;
      var maxMs = maxHours * 60 * 60 * 1000;

      var bucketSums = {};
      var cursor = new Date(s);
      var end = new Date(e);

      function fetchOne(sinceDate, untilDate) {
        var url =
          API_BASE +
          '/zones/' + encodeURIComponent(z) +
          '/dns_analytics/report/bytime' +
          '?since=' + encodeURIComponent(iso(sinceDate)) +
          '&until=' + encodeURIComponent(iso(untilDate)) +
          '&time_delta=minute' +
          '&metrics=queryCount';

        var data = fetchJson(url, { method: 'get', headers: authHeaders() });
        var result = data && data.result ? data.result : null;
        if (!result) return;

        var intervals = result.time_intervals || result.timeIntervals || null;
        var query = result.query || {};
        var metricsList = query.metrics || [];
        var mIdx = metricsList.indexOf('queryCount');
        if (mIdx === -1 && metricsList.length === 1) mIdx = 0;

        var rows = result.data || [];
        if (!intervals || !intervals.length || !rows.length || mIdx < 0) return;

        for (var r = 0; r < rows.length; r++) {
          var metricsMatrix = rows[r].metrics;
          if (!metricsMatrix || !metricsMatrix.length) continue;
          var series = metricsMatrix[mIdx] || null;
          if (!series || !series.length) continue;

          for (var t = 0; t < intervals.length && t < series.length; t++) {
            var startIso = intervals[t] && intervals[t][0] ? intervals[t][0] : null;
            if (!startIso) continue;
            var ms = new Date(startIso).getTime();
            if (!isFinite(ms)) continue;
            var bucketMs = Math.floor(ms / (5 * 60 * 1000)) * (5 * 60 * 1000);
            var bucketIso = new Date(bucketMs).toISOString();
            bucketSums[bucketIso] = (bucketSums[bucketIso] || 0) + (Number(series[t]) || 0);
          }
        }
      }

      while (cursor < end) {
        var next = new Date(Math.min(end.getTime(), cursor.getTime() + maxMs));
        try {
          fetchOne(cursor, next);
        } catch (err) {
          var msg = err && err.message ? err.message : String(err);
          if (msg.indexOf('Maximum queryable time period') !== -1) {
            throw new Error(
              msg +
              ' Fix: reduce CF_DNS_MAX_QUERY_HOURS (default 6) or keep DNS mode as REST and let it chunk; ' +
              'also consider reducing CF_REFRESH_WINDOW_HOURS to limit calls.'
            );
          }
          throw err;
        }
        cursor = next;
      }

      var keys = sortIsoKeys(bucketSums);
      var out = [];
      for (var i = 0; i < keys.length; i++) {
        out.push({ ts: keys[i], queries: Number(bucketSums[keys[i]]) || 0 });
      }

      return { dataset: 'rest:dns_analytics/bytime', groups: out };
    }

    function queryDns5mGraphql(z, s, e) {
      var datasetOverride = getProp('CF_DNS_DATASET_OVERRIDE', '');
      var ck = cacheKeyForZone(z, 'dns:combo');
      var cached = cacheGetJson(ck);

      var combo = cached && cached.dataset ? cached : null;

      var datasetCandidates = datasetOverride
        ? [datasetOverride]
        : [
            'dnsAnalyticsAdaptiveGroups',
            'dnsAnalyticsGroups',
            'dnsQueriesAdaptiveGroups',
            'dnsQueriesGroups',
            'dnsRequestsAdaptiveGroups',
            'dnsRequestsGroups'
          ];

      var dimCandidates = ['datetimeFiveMinutes', 'datetimeMinute', 'datetime', 'datetimeHour'];
      var sumCandidates = ['queries', 'queryCount', 'requests', 'count', 'totalQueries'];

      function buildProbeQuery(dataset, dimField, sumField) {
        return (
          'query {' +
          ' viewer {' +
          '  zones(filter:{zoneTag:"' + escapeGqlString(z) + '"}) {' +
          '   ' + dataset + '(' +
          '    limit: 1,' +
          '    filter: { datetime_geq: "' + iso(s) + '", datetime_lt: "' + iso(e) + '" }' +
          '   ) {' +
          '    dimensions { ' + dimField + ' }' +
          '    sum { ' + sumField + ' }' +
          '   }' +
          '  }' +
          ' }' +
          '}'
        );
      }

      function buildQuery(dataset, dimField, sumField) {
        return (
          'query {' +
          ' viewer {' +
          '  zones(filter:{zoneTag:"' + escapeGqlString(z) + '"}) {' +
          '   ' + dataset + '(' +
          '    limit: 10000,' +
          '    filter: { datetime_geq: "' + iso(s) + '", datetime_lt: "' + iso(e) + '" }' +
          '   ) {' +
          '    dimensions { ' + dimField + ' }' +
          '    sum { ' + sumField + ' }' +
          '   }' +
          '  }' +
          ' }' +
          '}'
        );
      }

      if (!combo) {
        var lastErr;
        for (var d = 0; d < datasetCandidates.length; d++) {
          for (var di = 0; di < dimCandidates.length; di++) {
            for (var sc = 0; sc < sumCandidates.length; sc++) {
              var ds = datasetCandidates[d];
              var dim = dimCandidates[di];
              var sum = sumCandidates[sc];
              try {
                graphql(buildProbeQuery(ds, dim, sum));
                combo = { dataset: ds, dimField: dim, sumField: sum };
                cachePutJson(ck, combo);
                d = datasetCandidates.length;
                di = dimCandidates.length;
                break;
              } catch (e3) {
                lastErr = e3;
              }
            }
          }
        }
        if (!combo) {
          throw new Error(
            'Failed to find a working DNS analytics dataset/field combo via GraphQL. ' +
            'Last error: ' + (lastErr && lastErr.message ? lastErr.message : String(lastErr))
          );
        }
      }

      var res = graphql(buildQuery(combo.dataset, combo.dimField, combo.sumField));
      var raw = (res && res.data && res.data.viewer && res.data.viewer.zones && res.data.viewer.zones[0])
        ? (res.data.viewer.zones[0][combo.dataset] || [])
        : [];

      var out = [];
      for (var i = 0; i < raw.length; i++) {
        var dimObj = raw[i].dimensions || {};
        var ts = dimObj[combo.dimField];
        if (!ts) continue;
        var sumObj = raw[i].sum || {};
        var v = sumObj[combo.sumField];
        out.push({ ts: ts, queries: Number(v) || 0 });
      }

      return { dataset: 'graphql:' + combo.dataset + ':' + combo.dimField + ':' + combo.sumField, groups: out };
    }

    if (mode === 'rest') {
      return queryDns5mRest(zoneTag, startDate, endDate);
    }
    if (mode === 'graphql') {
      return queryDns5mGraphql(zoneTag, startDate, endDate);
    }

    // auto: try GraphQL first, then REST.
    try {
      return queryDns5mGraphql(zoneTag, startDate, endDate);
    } catch (e) {
      var restRes = queryDns5mRest(zoneTag, startDate, endDate);
      // Preserve original error context if REST also returns empty.
      if (!restRes.groups || !restRes.groups.length) {
        restRes.dataset = (restRes.dataset || 'rest') + ' (graphql failed: ' + (e && e.message ? e.message : String(e)) + ')';
      }
      return restRes;
    }
  }

  return {
    getProp: getProp,
    getPropAny: getPropAny,
    setProp: setProp,
    requireProp: requireProp,
    requirePropAny: requirePropAny,

    findZoneIdByName: findZoneIdByName,
    listAccounts: listAccounts,
    findAccountIdByName: findAccountIdByName,
    findFirstAccountId: findFirstAccountId,

    getWindow: getWindow,
    queryZone5m: queryZone5m,
    queryWeb5m: queryWeb5m,
    queryDns5m: queryDns5m
    ,
    discoverAccountFieldsLike: function (substr) { return discoverFields('Account', substr); },
    discoverZoneFieldsLike: function (substr) { return discoverFields('Zone', substr); },
    debugZoneHttpRequestsSchema: debugZoneHttpRequestsSchema
  };
})();
