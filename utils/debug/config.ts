import type { DebugConfig, MonitoringRuntime } from './types';

const DEFAULT_DEVELOPER_EMAIL = 'hligon@getsparqd.com';

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readString(value: string | undefined, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function resolveSiteUrl(runtime: MonitoringRuntime): string {
  if (runtime === 'client' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  const candidate =
    readString(process.env.NEXT_PUBLIC_SITE_URL) ||
    readString(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    readString(process.env.VERCEL_URL);

  if (!candidate) {
    return '';
  }

  return candidate.startsWith('http') ? candidate : `https://${candidate}`;
}

function readClientFlag(name: string, fallback: boolean): boolean {
  return readBoolean(process.env[`NEXT_PUBLIC_${name}`], fallback);
}

function readServerFlag(name: string, fallback: boolean): boolean {
  return readBoolean(process.env[name] || process.env[`NEXT_PUBLIC_${name}`], fallback);
}

export function getDebugConfig(runtime: MonitoringRuntime): DebugConfig {
  const debug = runtime === 'client' ? readClientFlag('DEBUG', false) : readServerFlag('DEBUG', false);
  const environment = readString(process.env.NEXT_PUBLIC_APP_ENV, readString(process.env.NODE_ENV, 'development'));

  return {
    appName: 'SparQ Digital Monitoring',
    environment,
    debug,
    debugNetwork: runtime === 'client' ? readClientFlag('DEBUG_NETWORK', debug) : readServerFlag('DEBUG_NETWORK', debug),
    debugPerformance: runtime === 'client' ? readClientFlag('DEBUG_PERFORMANCE', debug) : readServerFlag('DEBUG_PERFORMANCE', debug),
    monitoringEnabled:
      runtime === 'client'
        ? readClientFlag('MONITORING_ENABLED', true)
        : readServerFlag('MONITORING_ENABLED', true),
    emailAlertsEnabled: runtime === 'server' ? readServerFlag('MONITORING_EMAIL_ALERTS', true) : false,
    debugPanelEnabled: runtime === 'client' ? readClientFlag('DEBUG_PANEL', true) : false,
    structuredJsonLogs:
      runtime === 'client'
        ? readClientFlag('DEBUG_JSON_LOGS', environment === 'production')
        : readServerFlag('DEBUG_JSON_LOGS', environment === 'production'),
    developerEmail: readString(process.env.MONITORING_TO_EMAIL, DEFAULT_DEVELOPER_EMAIL),
    maxClientEntries: readNumber(process.env.NEXT_PUBLIC_DEBUG_BUFFER_LIMIT, 250),
    maxServerEntries: readNumber(process.env.DEBUG_SERVER_BUFFER_LIMIT, 2000),
    maxLogFileBytes: readNumber(process.env.DEBUG_SERVER_MAX_BYTES, 2_000_000),
    slowApiMs: readNumber(process.env.DEBUG_SLOW_API_MS || process.env.NEXT_PUBLIC_DEBUG_SLOW_API_MS, 1200),
    slowPageMs: readNumber(process.env.DEBUG_SLOW_PAGE_MS || process.env.NEXT_PUBLIC_DEBUG_SLOW_PAGE_MS, 2500),
    largePayloadBytes: readNumber(process.env.DEBUG_LARGE_PAYLOAD_BYTES || process.env.NEXT_PUBLIC_DEBUG_LARGE_PAYLOAD_BYTES, 250_000),
    alertCooldownMs: readNumber(process.env.DEBUG_ALERT_COOLDOWN_MS, 60 * 60 * 1000),
    cronToken: readString(process.env.MONITORING_CRON_TOKEN),
    siteUrl: resolveSiteUrl(runtime),
  };
}
