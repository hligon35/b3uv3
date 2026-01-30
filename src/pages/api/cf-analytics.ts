import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCloudflareAnalytics } from '../../lib/cloudflareAnalytics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  try {
    // Example: Get total requests and unique visitors for last 7 days
    const query = `
      query($zoneTag: string, $start: DateTime!, $end: DateTime!) {
        viewer {
          zones(filter: {zoneTag: $zoneTag}) {
            httpRequests1dGroups(limit: 7, filter: {date_geq: $start, date_leq: $end}) {
              dimensions { date }
              sum {
                requests
                uniqueVisitors
                bytes
                threats
                edgeResponseStatusMap { edgeResponseStatus, requests }
              }
            }
            topRequests: httpRequests1dGroups(limit: 1, filter: {date_geq: $start, date_leq: $end}) {
              sum {
                topUrls: topN(field: "requestHost", limit: 10) { count, value }
              }
            }
          }
        }
      }
    `;
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const data = await fetchCloudflareAnalytics(query, { start, end });
    res.status(200).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}
