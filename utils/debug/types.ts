export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'network' | 'performance';

export type MonitoringKind = 'log' | 'error' | 'api' | 'performance' | 'pageview' | 'session' | 'heartbeat';

export type MonitoringRuntime = 'client' | 'server';

export type MonitoringContext = Record<string, unknown>;

export type MonitoringEntry = {
  id: string;
  kind: MonitoringKind;
  level: LogLevel;
  message: string;
  timestamp: string;
  runtime: MonitoringRuntime;
  environment: string;
  source: string;
  route?: string;
  url?: string;
  endpoint?: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  status?: number;
  durationMs?: number;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
  payloadPreview?: string;
  responsePreview?: string;
  tags?: string[];
  context?: MonitoringContext;
  fingerprint?: string;
  critical?: boolean;
};

export type DebugConfig = {
  appName: string;
  environment: string;
  debug: boolean;
  debugNetwork: boolean;
  debugPerformance: boolean;
  monitoringEnabled: boolean;
  emailAlertsEnabled: boolean;
  debugPanelEnabled: boolean;
  structuredJsonLogs: boolean;
  developerEmail: string;
  maxClientEntries: number;
  maxServerEntries: number;
  maxLogFileBytes: number;
  slowApiMs: number;
  slowPageMs: number;
  largePayloadBytes: number;
  alertCooldownMs: number;
  cronToken: string;
  siteUrl: string;
};

export type TrendMetric = {
  current: number | null;
  previous: number | null;
  deltaPercent: number | null;
};

export type WeeklyTopPage = {
  route: string;
  views: number;
};

export type WeeklySlowPage = {
  route: string;
  averageMs: number;
};

export type WeeklyAnalyticsSourceStatus = 'active' | 'partial' | 'unavailable';

export type WeeklyAnalyticsSource = {
  id: string;
  label: string;
  accentColor: string;
  status: WeeklyAnalyticsSourceStatus;
  summary: string;
  visitors?: TrendMetric;
  pageViews?: TrendMetric;
  bounceRate?: number | null;
  topPages?: WeeklyTopPage[];
  notes?: string[];
};

export type WeeklyReportSummary = {
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  visitors: TrendMetric;
  pageViews: TrendMetric;
  bounceRate: number | null;
  apiErrorRate: number | null;
  uptimePercentage: number | null;
  averagePageLoadMs: TrendMetric;
  slowApiCount: number;
  slowPageCount: number;
  largePayloadCount: number;
  topPages: WeeklyTopPage[];
  slowestPages: WeeklySlowPage[];
  insights: string[];
  analyticsSources: WeeklyAnalyticsSource[];
  adapterNotes: string[];
};

export type ExternalWeeklyMetrics = WeeklyAnalyticsSource;
