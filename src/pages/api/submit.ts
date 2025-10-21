import type { NextApiRequest, NextApiResponse } from 'next';

const FORM_AJAX_ENDPOINT = 'https://formsubmit.co/ajax/el/figabe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { fields } = req.body || {};
    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    const params = new URLSearchParams();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });

    const r = await fetch(FORM_AJAX_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ ok: false, ...data });
    }
    return res.status(200).json({ ok: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: 'Server error', detail: err?.message });
  }
}
