import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthorizedMonitoringRequest, recordHeartbeat, withApiMonitoring } from '../../../../utils/debug/server';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  if (!isAuthorizedMonitoringRequest(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  await recordHeartbeat('github-actions');
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
}

export default withApiMonitoring('debug-health', handler, { alertOnHttpError: false });
