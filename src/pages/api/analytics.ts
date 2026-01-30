import { NextApiRequest, NextApiResponse } from 'next';
import { insertPageView, getAnalytics, getTopReferrers, getTopBrowsers, getDeviceTypes } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Track page view
    const { path, referrer, userAgent, language, screenSize } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.connection.remoteAddress || '';

    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }

    try {
      await insertPageView({ path, referrer, userAgent, language, screenSize, ip });
      res.status(200).json({ message: 'Tracked' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to track' });
    }
  } else if (req.method === 'GET') {
    // Secure with httpOnly cookie
    const { parse } = await import('cookie');
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    if (cookies.admin_auth !== 'true') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const [analytics, topReferrers, topBrowsers, deviceTypes] = await Promise.all([
        getAnalytics(),
        getTopReferrers(),
        getTopBrowsers(),
        getDeviceTypes()
      ]);

      // Calculate total views from analytics
      const total = Array.isArray(analytics)
        ? analytics.reduce((sum, row) => sum + (row.views || 0), 0)
        : 0;

      res.status(200).json({
        analytics,
        total,
        topReferrers,
        topBrowsers,
        deviceTypes
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}