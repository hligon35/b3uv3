// Utilities to submit forms to the Apps Script backend without iframes.
// We attempt a standard fetch first; if CORS blocks, fall back to no-cors and
// assume success (fire-and-forget). Callers should show optimistic success.

export async function submitFormToEndpoint(form: HTMLFormElement, actionUrl: string): Promise<'ok' | 'sent'> {
  const data = new FormData(form);
  // Hint to backend that this is XHR (optional)
  if (!data.has('via')) data.append('via', 'fetch');
  // Use POST with FormData (multipart/form-data simple request)
  try {
    const res = await fetch(actionUrl, { method: 'POST', body: data, credentials: 'omit' });
    // If CORS is not allowed, browsers usually reject rather than give a response
    if ((res as any).type === 'opaque') return 'sent';
    // We don't rely on body; any 2xx is considered success
    if (res.ok) return 'ok';
  } catch {
    // swallow and attempt no-cors
  }
  try {
    await fetch(actionUrl, { method: 'POST', body: data, mode: 'no-cors', credentials: 'omit' });
    return 'sent';
  } catch {
    // Final failure propagated to caller
    throw new Error('submit-failed');
  }
}
