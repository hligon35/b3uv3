import { collectAnalyticsSources, getMonitoringAdapters } from './adapters';
import type { MonitoringEntry, TrendMetric, WeeklyAnalyticsSource, WeeklyReportSummary } from './types';
import { readServerEntries } from '../logger/server';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const EXPECTED_HEARTBEATS_PER_WEEK = 7 * 24 * 2;

export async function buildWeeklyReportSummary(now = new Date()): Promise<WeeklyReportSummary> {
  const entries = await readServerEntries(5000);
  const currentTo = now;
  const currentFrom = new Date(now.getTime() - WEEK_MS);
  const previousFrom = new Date(now.getTime() - WEEK_MS * 2);

  const currentEntries = filterEntries(entries, currentFrom, currentTo);
  const previousEntries = filterEntries(entries, previousFrom, currentFrom);

  const currentVisitors = countVisitors(currentEntries);
  const previousVisitors = countVisitors(previousEntries);
  const currentPageViews = countPageViews(currentEntries);
  const previousPageViews = countPageViews(previousEntries);
  const bounceRate = computeBounceRate(currentEntries);
  const apiErrorRate = computeApiErrorRate(currentEntries);
  const uptimePercentage = computeUptime(currentEntries);
  const currentAveragePageLoad = computeAveragePageLoad(currentEntries);
  const previousAveragePageLoad = computeAveragePageLoad(previousEntries);
  const topPages = computeTopPages(currentEntries);
  const slowestPages = computeSlowestPages(currentEntries);
  const slowApiCount = currentEntries.filter((entry) => entry.kind === 'api' && typeof entry.durationMs === 'number' && entry.durationMs > 1200).length;
  const slowPageCount = currentEntries.filter((entry) => entry.kind === 'performance' && entry.tags?.includes('page')).length;
  const largePayloadCount = currentEntries.filter((entry) => Number(entry.context?.responseBytes || 0) > 250_000).length;

  const analyticsSources: WeeklyAnalyticsSource[] = [
    {
      id: 'app',
      label: 'App Tracking',
      accentColor: '#0A5FB4',
      status: 'active',
      summary: 'These numbers come directly from the site itself, including pageviews, route timing, browser telemetry, and monitored API activity.',
      visitors: createTrend(currentVisitors, previousVisitors),
      pageViews: createTrend(currentPageViews, previousPageViews),
      bounceRate,
      topPages: topPages.slice(0, 3),
      notes: ['This is the primary data source for the KPI cards and performance sections in the weekly report.'],
    },
    ...(await collectAnalyticsSources({
      current: { from: currentFrom, to: currentTo },
      previous: { from: previousFrom, to: currentFrom },
    })),
  ];

  const adapterNotes: string[] = [];
  for (const adapter of getMonitoringAdapters()) {
    if (adapter.enabled) {
      adapterNotes.push(`${adapter.name} is enabled for future weekly metric collection.`);
      await adapter.collectWeeklyMetrics({ from: currentFrom, to: currentTo });
    } else {
      adapterNotes.push(`${adapter.name} is currently disabled.`);
    }
  }

  const insights = buildInsights({
    visitors: createTrend(currentVisitors, previousVisitors),
    pageViews: createTrend(currentPageViews, previousPageViews),
    averagePageLoadMs: createTrend(currentAveragePageLoad, previousAveragePageLoad),
    bounceRate,
    topPages,
    slowestPages,
    apiErrorRate,
  });

  return {
    generatedAt: now.toISOString(),
    period: {
      from: currentFrom.toISOString(),
      to: currentTo.toISOString(),
    },
    visitors: createTrend(currentVisitors, previousVisitors),
    pageViews: createTrend(currentPageViews, previousPageViews),
    bounceRate,
    apiErrorRate,
    uptimePercentage,
    averagePageLoadMs: createTrend(currentAveragePageLoad, previousAveragePageLoad),
    slowApiCount,
    slowPageCount,
    largePayloadCount,
    topPages,
    slowestPages,
    insights,
    analyticsSources,
    adapterNotes,
  };
}

function filterEntries(entries: MonitoringEntry[], from: Date, to: Date): MonitoringEntry[] {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return entries.filter((entry) => {
    const timestamp = Date.parse(entry.timestamp);
    return Number.isFinite(timestamp) && timestamp >= fromTime && timestamp < toTime;
  });
}

function countVisitors(entries: MonitoringEntry[]): number {
  return new Set(entries.filter((entry) => entry.kind === 'pageview' && entry.sessionId).map((entry) => entry.sessionId)).size;
}

function countPageViews(entries: MonitoringEntry[]): number {
  return entries.filter((entry) => entry.kind === 'pageview').length;
}

function computeBounceRate(entries: MonitoringEntry[]): number | null {
  const sessions = new Map<string, { pageViews: number; durationMs: number }>();

  for (const entry of entries) {
    if (!entry.sessionId) {
      continue;
    }

    const current = sessions.get(entry.sessionId) || { pageViews: 0, durationMs: 0 };
    if (entry.kind === 'pageview') {
      current.pageViews += 1;
    }
    if (entry.kind === 'session' && typeof entry.durationMs === 'number') {
      current.durationMs = Math.max(current.durationMs, entry.durationMs);
    }
    sessions.set(entry.sessionId, current);
  }

  const values = Array.from(sessions.values()).filter((session) => session.pageViews > 0);
  if (values.length === 0) {
    return null;
  }

  const bounced = values.filter((session) => session.pageViews <= 1 && session.durationMs < 30_000).length;
  return Number(((bounced / values.length) * 100).toFixed(1));
}

function computeApiErrorRate(entries: MonitoringEntry[]): number | null {
  const apiEntries = entries.filter((entry) => entry.kind === 'api');
  if (apiEntries.length === 0) {
    return null;
  }
  const failures = apiEntries.filter((entry) => (entry.status || 0) >= 400 || entry.level === 'error').length;
  return Number(((failures / apiEntries.length) * 100).toFixed(1));
}

function computeAveragePageLoad(entries: MonitoringEntry[]): number | null {
  const pageEntries = entries.filter((entry) => entry.kind === 'performance' && entry.tags?.includes('page') && typeof entry.durationMs === 'number');
  if (pageEntries.length === 0) {
    return null;
  }
  const total = pageEntries.reduce((sum, entry) => sum + Number(entry.durationMs || 0), 0);
  return Number((total / pageEntries.length).toFixed(0));
}

function computeTopPages(entries: MonitoringEntry[]) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.kind !== 'pageview') {
      continue;
    }
    const route = entry.route || entry.url || '/';
    counts.set(route, (counts.get(route) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([route, views]) => ({ route, views }));
}

function computeSlowestPages(entries: MonitoringEntry[]) {
  const grouped = new Map<string, number[]>();
  for (const entry of entries) {
    if (entry.kind !== 'performance' || !entry.tags?.includes('page') || typeof entry.durationMs !== 'number') {
      continue;
    }
    const route = entry.route || entry.url || '/';
    grouped.set(route, [...(grouped.get(route) || []), entry.durationMs]);
  }

  return Array.from(grouped.entries())
    .map(([route, values]) => ({
      route,
      averageMs: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(0)),
    }))
    .sort((left, right) => right.averageMs - left.averageMs)
    .slice(0, 5);
}

function computeUptime(entries: MonitoringEntry[]): number | null {
  const heartbeats = entries.filter((entry) => entry.kind === 'heartbeat').length;
  if (heartbeats === 0) {
    return null;
  }
  return Number(Math.min(100, (heartbeats / EXPECTED_HEARTBEATS_PER_WEEK) * 100).toFixed(1));
}

function createTrend(current: number | null, previous: number | null): TrendMetric {
  if (current === null && previous === null) {
    return { current: null, previous: null, deltaPercent: null };
  }
  if (previous === null || previous === 0) {
    return { current, previous, deltaPercent: current === null ? null : 100 };
  }
  if (current === null) {
    return { current: null, previous, deltaPercent: -100 };
  }
  return {
    current,
    previous,
    deltaPercent: Number((((current - previous) / previous) * 100).toFixed(1)),
  };
}

function buildInsights(input: {
  visitors: TrendMetric;
  pageViews: TrendMetric;
  averagePageLoadMs: TrendMetric;
  bounceRate: number | null;
  topPages: Array<{ route: string; views: number }>;
  slowestPages: Array<{ route: string; averageMs: number }>;
  apiErrorRate: number | null;
}): string[] {
  const insights: string[] = [];

  if (typeof input.visitors.deltaPercent === 'number') {
    const direction = input.visitors.deltaPercent >= 0 ? 'increased' : 'decreased';
    insights.push(`Traffic ${direction} by ${Math.abs(input.visitors.deltaPercent)}% compared to the prior week.`);
  }

  if (input.topPages[0]) {
    insights.push(`Most visitors entered through ${input.topPages[0].route}.`);
  }

  if (typeof input.averagePageLoadMs.deltaPercent === 'number' && input.averagePageLoadMs.current !== null) {
    if (input.averagePageLoadMs.deltaPercent > 5) {
      insights.push(`Average page load time increased to ${input.averagePageLoadMs.current}ms, so page performance slowed slightly this week.`);
    } else if (input.averagePageLoadMs.deltaPercent < -5) {
      insights.push(`Average page load time improved to ${input.averagePageLoadMs.current}ms this week.`);
    }
  }

  if (input.slowestPages[0]) {
    insights.push(`${input.slowestPages[0].route} was the slowest observed page this week.`);
  }

  if (typeof input.apiErrorRate === 'number') {
    insights.push(`The API error rate was ${input.apiErrorRate}% across monitored server requests.`);
  }

  if (typeof input.bounceRate === 'number') {
    insights.push(`Estimated bounce rate was ${input.bounceRate}% based on monitored sessions.`);
  }

  return insights.slice(0, 6);
}
