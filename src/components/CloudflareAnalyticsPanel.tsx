import { useEffect, useState } from 'react';

export default function CloudflareAnalyticsPanel() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/cf-analytics');
        if (!res.ok) throw new Error('Failed to fetch Cloudflare Analytics');
        const json = await res.json();
        setData(json.viewer?.zones?.[0]?.httpRequests1dGroups || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow mt-8">
      <h2 className="text-2xl mb-4">Cloudflare Analytics (Last 7 Days)</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {data && data.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Date</th>
              <th className="text-left">Requests</th>
              <th className="text-left">Unique Visitors</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.dimensions.date}>
                <td>{row.dimensions.date}</td>
                <td>{row.sum.requests}</td>
                <td>{row.sum.uniqueVisitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data && data.length === 0 && <div>No Cloudflare analytics data found.</div>}
    </div>
  );
}
