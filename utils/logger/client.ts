import { getDebugConfig } from '../debug/config';
import type { MonitoringEntry } from '../debug/types';
import { createEntry, getConsoleMethod, levelLabel, previewValue, serializeError, shouldConsoleLog } from './shared';

const CLIENT_BUFFER_KEY = 'sparq.debug.client.buffer';
const BUFFER_EVENT = 'sparq:debug-buffer-updated';

declare global {
  interface Window {
    __SPARQ_ORIGINAL_FETCH__?: typeof fetch;
  }
}

type ClientEntryInput = Omit<Parameters<typeof createEntry>[0], 'runtime' | 'environment' | 'source' | 'userAgent'> & {
  source?: string;
};

export function logClientEntry(input: ClientEntryInput): MonitoringEntry {
  const config = getDebugConfig('client');
  const entry = createEntry({
    ...input,
    runtime: 'client',
    environment: config.environment,
    source: input.source || 'browser',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  });

  persistClientEntry(entry);
  writeConsoleEntry(entry);
  return entry;
}

export function captureClientError(error: unknown, input: Omit<ClientEntryInput, 'kind' | 'level' | 'message'> = {}): MonitoringEntry {
  const normalized = serializeError(error);
  return logClientEntry({
    ...input,
    kind: 'error',
    level: 'error',
    message: normalized.message,
    stack: input.stack || normalized.stack,
    critical: true,
  });
}

export function persistClientEntry(entry: MonitoringEntry): void {
  const config = getDebugConfig('client');
  try {
    const entries = readClientEntries();
    entries.push(entry);
    const trimmed = entries.slice(-config.maxClientEntries);
    window.localStorage.setItem(CLIENT_BUFFER_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent(BUFFER_EVENT));
  } catch {
    // Ignore localStorage failures in private browsing and locked-down browsers.
  }
}

export function readClientEntries(): MonitoringEntry[] {
  try {
    const raw = window.localStorage.getItem(CLIENT_BUFFER_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MonitoringEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearClientEntries(): void {
  try {
    window.localStorage.removeItem(CLIENT_BUFFER_KEY);
    window.dispatchEvent(new CustomEvent(BUFFER_EVENT));
  } catch {
    // Ignore localStorage failures.
  }
}

export function exportClientEntries(): string {
  return JSON.stringify(readClientEntries(), null, 2);
}

export function getClientBufferEventName(): string {
  return BUFFER_EVENT;
}

function writeConsoleEntry(entry: MonitoringEntry): void {
  const config = getDebugConfig('client');
  if (!shouldConsoleLog(entry, config.debug, config.debugNetwork, config.debugPerformance)) {
    return;
  }

  const method = getConsoleMethod(entry.level);
  if (config.structuredJsonLogs) {
    console[method](JSON.stringify(entry));
    return;
  }

  const colorMap: Record<MonitoringEntry['level'], string> = {
    info: '#2563eb',
    warn: '#b45309',
    error: '#b91c1c',
    success: '#15803d',
    network: '#0f766e',
    performance: '#7c3aed',
  };

  console[method](
    `%c[${levelLabel(entry.level)}]%c ${entry.timestamp} ${entry.message}`,
    `color:${colorMap[entry.level]};font-weight:700;`,
    'color:#475569;',
    entry.context || entry.payloadPreview || entry.responsePreview ? previewValue(entry.context || entry.payloadPreview || entry.responsePreview) : '',
  );
}
