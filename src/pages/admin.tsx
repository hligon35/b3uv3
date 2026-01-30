import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

interface AnalyticsItem {
  path: string;
  views: number;
  date: string;
}

interface DetailedAnalytics {
  totalViews: number;
  pageViews: AnalyticsItem[];
  topReferrers: { referrer: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceTypes: { device: string; count: number }[];
}




export default function Admin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [topReferrers, setTopReferrers] = useState<{ referrer: string; count: number }[]>([]);
  const [topBrowsers, setTopBrowsers] = useState<{ browser: string; count: number }[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<{ device: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    // Check authentication via cookie
    async function checkAuthAndFetch() {
      const res = await fetch('/api/subscribers');
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      const subs = await res.json();
      setSubscribers(subs);
      fetchAnalytics();
    }
    checkAuthAndFetch();
    // eslint-disable-next-line
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsRes = await fetch('/api/analytics');
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
        setTotalViews(data.total);
        setTopReferrers(data.topReferrers || []);
        setTopBrowsers(data.topBrowsers || []);
        setDeviceTypes(data.deviceTypes || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Subscribers ({subscribers.length})</h2>
            <div className="max-h-96 overflow-y-auto">
              {subscribers.map((sub) => (
                <div key={sub.id} className="border-b py-2">
                  <div className="font-medium">{sub.email}</div>
                  <div className="text-sm text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Page Analytics (Total: {totalViews})</h2>
            <div className="max-h-96 overflow-y-auto">
              {analytics.map((item, index) => (
                <div key={index} className="border-b py-2">
                  <div className="font-medium">{item.path}</div>
                  <div className="text-sm text-gray-500">{item.views} views on {item.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Top Referrers</h2>
            <div className="max-h-96 overflow-y-auto">
              {topReferrers.map((ref, index) => (
                <div key={index} className="border-b py-2">
                  <div className="font-medium text-sm">{ref.referrer || 'Direct'}</div>
                  <div className="text-sm text-gray-500">{ref.count} visits</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Browser Usage</h2>
            <div className="max-h-96 overflow-y-auto">
              {topBrowsers.map((browser, index) => (
                <div key={index} className="border-b py-2">
                  <div className="font-medium">{browser.browser}</div>
                  <div className="text-sm text-gray-500">{browser.count} users</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Device Types</h2>
            <div className="max-h-96 overflow-y-auto">
              {deviceTypes.map((device, index) => (
                <div key={index} className="border-b py-2">
                  <div className="font-medium">{device.device}</div>
                  <div className="text-sm text-gray-500">{device.count} visits</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl mb-4">Cloudflare Analytics</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-3">Comprehensive analytics available in your Cloudflare dashboard:</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Real-time Data</h4>
                  <ul className="text-xs space-y-1">
                    <li>• Live visitor count</li>
                    <li>• Current page views</li>
                    <li>• Active sessions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Geographic</h4>
                  <ul className="text-xs space-y-1">
                    <li>• Countries & cities</li>
                    <li>• Regional breakdown</li>
                    <li>• Time zone data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Technical</h4>
                  <ul className="text-xs space-y-1">
                    <li>• Device types</li>
                    <li>• Browser versions</li>
                    <li>• Operating systems</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Behavior</h4>
                  <ul className="text-xs space-y-1">
                    <li>• Session duration</li>
                    <li>• Bounce rates</li>
                    <li>• Page depth</li>
                  </ul>
                </div>
              </div>
              <a
                href="https://dash.cloudflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                View in Cloudflare Dashboard →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};