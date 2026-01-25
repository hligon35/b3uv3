import { useState, useEffect } from 'react';

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
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [topReferrers, setTopReferrers] = useState<{ referrer: string; count: number }[]>([]);
  const [topBrowsers, setTopBrowsers] = useState<{ browser: string; count: number }[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<{ device: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchData(token);
    }
  }, []);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const [subsRes, analyticsRes] = await Promise.all([
        fetch('/api/subscribers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (subsRes.ok) {
        const subs = await subsRes.json();
        setSubscribers(subs);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
        setTotalViews(data.total);
        setTopReferrers(data.topReferrers || []);
        setTopBrowsers(data.topBrowsers || []);
        setDeviceTypes(data.deviceTypes || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/subscribers', {
      headers: { Authorization: `Bearer ${password}` },
    });
    if (res.ok) {
      localStorage.setItem('adminToken', password);
      setIsAuthenticated(true);
      fetchData(password);
    } else {
      alert('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md">
          <h1 className="text-2xl mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-2 border rounded mb-4"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
      </div>
    );
  }

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
              <p>Enhanced analytics are available in your Cloudflare dashboard:</p>
              <ul className="mt-2 space-y-1">
                <li>• Real-time visitor data</li>
                <li>• Geographic insights</li>
                <li>• Session duration</li>
                <li>• Bounce rates</li>
                <li>• Top pages & referrers</li>
              </ul>
              <p className="mt-2 text-xs">
                Set <code>CLOUDFLARE_ANALYTICS_TOKEN</code> in production for automatic tracking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};