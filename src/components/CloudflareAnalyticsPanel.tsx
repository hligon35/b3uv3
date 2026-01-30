import { useEffect, useState } from 'react';

export default function CloudflareAnalyticsPanel() {
  const [data, setData] = useState<any>(null);
  const [topUrls, setTopUrls] = useState<any[]>([]);
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
        setTopUrls(json.viewer?.zones?.[0]?.topRequests?.[0]?.sum?.topUrls || []);
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
        <>
          <table className="w-full text-sm mb-8">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Requests</th>
                <th className="text-left">Unique Visitors</th>
                <th className="text-left">Bandwidth</th>
                <th className="text-left">Threats</th>
                <th className="text-left">Status Codes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.dimensions.date}>
                  <td>{row.dimensions.date}</td>
                  <td>{row.sum.requests}</td>
                  <td>{row.sum.uniqueVisitors}</td>
                  <td>{(row.sum.bytes / 1024 / 1024).toFixed(2)} MB</td>
                  <td>{row.sum.threats}</td>
                  <td>
                    {row.sum.edgeResponseStatusMap?.map((s: any) => (
                      <span key={s.edgeResponseStatus} className="inline-block mr-2">
                        {s.edgeResponseStatus}: {s.requests}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Top URLs (Last 7 Days)</h3>
            {topUrls.length > 0 ? (
              <ul className="list-disc pl-6">
                {topUrls.map((url: any) => (
                  <li key={url.value}>
                    {url.value} <span className="text-gray-500">({url.count} requests)</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No top URLs found.</div>
            )}
          </div>
        </>
      )}
      {data && data.length === 0 && <div>No Cloudflare analytics data found.</div>}
    </div>
  );
}
