// Utilities to submit forms to the forms backend without iframes.
// Same-origin endpoints can return a real JSON status; cross-origin fallbacks
// keep the previous fire-and-forget behavior for legacy Apps Script URLs.

import { monitoredFetch } from '../../utils/debug/client';

export async function submitFormToEndpoint(form: HTMLFormElement, actionUrl: string): Promise<'sent'> {
  const data = new FormData(form);
  if (!data.has('via')) data.append('via', 'fetch');
  try {
    const target = new URL(actionUrl, window.location.href);
    const isSameOrigin = target.origin === window.location.origin;
    const response = await monitoredFetch(target.toString(), {
      method: 'POST',
      ...(isSameOrigin
        ? {
            headers: {
              Accept: 'application/json, text/html;q=0.9,*/*;q=0.8',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(data.entries())),
          }
        : {
            headers: {
              Accept: 'application/json, text/html;q=0.9,*/*;q=0.8',
            },
            body: data,
          }),
      credentials: 'omit',
    }, {
      label: 'Form submission request',
      route: window.location.pathname,
      source: 'forms-submit',
    });

    if (!response.ok) {
      throw new Error(`submit-failed:${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (isSameOrigin && contentType.includes('application/json')) {
      const result = await response.json();
      if (result?.ok === false) {
        throw new Error(String(result.error || 'submit-failed'));
      }
    }

    return 'sent';
  } catch {
    try {
      const target = new URL(actionUrl, window.location.href);
      if (target.origin === window.location.origin) {
        throw new Error('submit-failed');
      }
      await monitoredFetch(target.toString(), { method: 'POST', body: data, mode: 'no-cors', credentials: 'omit' }, { label: 'Cross-origin form fallback', route: window.location.pathname, source: 'forms-submit' });
      return 'sent';
    } catch {
      throw new Error('submit-failed');
    }
  }
}
