// Utilities to submit forms to the Apps Script backend without iframes.
// We attempt a standard fetch first; if CORS blocks, fall back to no-cors and
// assume success (fire-and-forget). Callers should show optimistic success.

export async function submitFormToEndpoint(form: HTMLFormElement, actionUrl: string): Promise<'sent'> {
  const data = new FormData(form);
  if (!data.has('via')) data.append('via', 'fetch');
  // Use a single no-cors POST to avoid CORS preflight/duplicates. Response is opaque.
  try {
    await fetch(actionUrl, { method: 'POST', body: data, mode: 'no-cors', credentials: 'omit' });
    return 'sent';
  } catch {
    throw new Error('submit-failed');
  }
}
