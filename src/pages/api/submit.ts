import type { NextApiRequest, NextApiResponse } from 'next';

// Deprecated: This legacy endpoint previously proxied to a third-party form service.
// The site now uses a Google Apps Script backend (NEXT_PUBLIC_FORMS_API) and this route is unused.
// Keeping this file as a safe no-op to avoid confusion if linked directly.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Explicitly signal that this route is gone.
  res.status(410).json({ ok: false, error: 'This endpoint is deprecated. Please use the public forms powered by Google Apps Script.' });
}
