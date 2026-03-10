import type { LogLevel, MonitoringContext, MonitoringEntry, MonitoringKind, MonitoringRuntime } from '../debug/types';

type EntryInput = {
  kind: MonitoringKind;
  level: LogLevel;
  message: string;
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
  critical?: boolean;
};

export function createEntry(input: EntryInput): MonitoringEntry {
  const entry: MonitoringEntry = {
    id: createId(),
    kind: input.kind,
    level: input.level,
    message: input.message,
    timestamp: new Date().toISOString(),
    runtime: input.runtime,
    environment: input.environment,
    source: input.source,
    route: input.route,
    url: input.url,
    endpoint: input.endpoint,
    file: input.file,
    line: input.line,
    column: input.column,
    stack: input.stack,
    status: input.status,
    durationMs: input.durationMs,
    userAgent: input.userAgent,
    requestId: input.requestId,
    sessionId: input.sessionId,
    payloadPreview: input.payloadPreview,
    responsePreview: input.responsePreview,
    tags: input.tags,
    context: input.context,
    critical: input.critical,
  };

  entry.fingerprint = createFingerprint(entry);
  return entry;
}

export function createId(): string {
  const browserCrypto = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createFingerprint(entry: Partial<MonitoringEntry>): string {
  const base = [entry.kind, entry.level, entry.message, entry.endpoint, entry.route, entry.file, entry.line, entry.status]
    .filter(Boolean)
    .join('|');

  let hash = 5381;
  for (let index = 0; index < base.length; index += 1) {
    hash = (hash * 33) ^ base.charCodeAt(index);
  }
  return `fp_${Math.abs(hash >>> 0).toString(16)}`;
}

export function serializeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message || error.name || 'Unknown error', stack: error.stack };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  try {
    return { message: JSON.stringify(error) };
  } catch {
    return { message: String(error) };
  }
}

export function safeJson(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

export function previewValue(value: unknown, maxLength = 600): string {
  const raw = typeof value === 'string' ? value : safeJson(value, '[unserializable]');
  return raw.length > maxLength ? `${raw.slice(0, maxLength)}...` : raw;
}

export function getConsoleMethod(level: LogLevel): 'log' | 'warn' | 'error' {
  if (level === 'warn') {
    return 'warn';
  }
  if (level === 'error') {
    return 'error';
  }
  return 'log';
}

export function levelLabel(level: LogLevel): string {
  return level.toUpperCase();
}

export function shouldConsoleLog(entry: MonitoringEntry, debugEnabled: boolean, debugNetwork: boolean, debugPerformance: boolean): boolean {
  if (!debugEnabled) {
    return false;
  }
  if (entry.kind === 'api' && !debugNetwork) {
    return false;
  }
  if (entry.kind === 'performance' && !debugPerformance) {
    return false;
  }
  return true;
}

export function summarizeUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  try {
    const parsed = new URL(url, 'https://placeholder.local');
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}
