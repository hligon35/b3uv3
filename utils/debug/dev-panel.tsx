import { useEffect, useState } from 'react';
import { getDebugConfig } from './config';
import { clearClientEntries, exportClientEntries, getClientBufferEventName, readClientEntries } from '../logger/client';
import type { MonitoringEntry } from './types';

export function DebugPanel() {
  const config = getDebugConfig('client');
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<MonitoringEntry[]>([]);

  useEffect(() => {
    if (!config.debug || !config.debugPanelEnabled) {
      return;
    }

    const refresh = () => {
      setEntries(readClientEntries().slice(-40).reverse());
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        refresh();
        setIsOpen((current) => !current);
      }
    };

    refresh();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(getClientBufferEventName(), refresh as EventListener);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(getClientBufferEventName(), refresh as EventListener);
      window.removeEventListener('storage', refresh);
    };
  }, [config.debug, config.debugPanelEnabled]);

  if (!config.debug || !config.debugPanelEnabled || !isOpen) {
    return null;
  }

  return (
    <div className="debug-panel-shell">
      <div className="debug-panel-header">
        <div>
          <div className="debug-panel-kicker">Debug Panel</div>
          <div className="debug-panel-title">Recent logs, API calls, errors, and timings</div>
        </div>
        <div className="debug-panel-actions">
          <button type="button" onClick={downloadLogs} className="debug-panel-button">
            Export
          </button>
          <button
            type="button"
            onClick={() => {
              clearClientEntries();
              setEntries([]);
            }}
            className="debug-panel-button"
          >
            Clear
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="debug-panel-button">
            Close
          </button>
        </div>
      </div>
      <div className="debug-panel-body">
        {entries.length === 0 ? (
          <div className="debug-panel-empty">No client-side debug events have been captured yet.</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="debug-panel-entry">
              <div className="debug-panel-entry-meta">
                <strong className={`debug-panel-level debug-panel-level-${entry.level}`}>{entry.level.toUpperCase()}</strong>
                <span className="debug-panel-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="debug-panel-message">{entry.message}</div>
              <div className="debug-panel-details">
                {entry.route || entry.endpoint || entry.url ? <div>{entry.route || entry.endpoint || entry.url}</div> : null}
                {typeof entry.status === 'number' ? <div>Status: {entry.status}</div> : null}
                {typeof entry.durationMs === 'number' ? <div>Duration: {entry.durationMs}ms</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function downloadLogs(): void {
  const blob = new Blob([exportClientEntries()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sparq-debug-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

