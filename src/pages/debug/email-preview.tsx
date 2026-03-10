import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function EmailPreviewPage() {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    setPreviewKey(Date.now());
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPreviewKey(Date.now());
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const previewUrl = `/api/debug/weekly-report?preview=1${token ? `&token=${encodeURIComponent(token)}` : ''}&_=${previewKey}`;

  return (
    <>
      <Head>
        <title>Email Preview</title>
      </Head>
      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #eef4f8 0%, #e3edf4 100%)',
          padding: '24px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#102437',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gap: '16px',
          }}
        >
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #d4e2eb',
              borderRadius: '20px',
              padding: '18px 20px',
              boxShadow: '0 12px 28px rgba(16,36,55,0.08)',
            }}
          >
            <div style={{ fontSize: '12px', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#5a7389', fontWeight: 700, marginBottom: '8px' }}>
              Weekly Report Preview
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: '28px', lineHeight: 1.15 }}>Live Email Template Preview</h1>
            <p style={{ margin: '0 0 14px', color: '#5a7389', lineHeight: 1.7 }}>
              This page reloads the weekly email HTML every few seconds while you edit the template. In production, add the monitoring token as a query string.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPreviewKey(Date.now())}
                style={{
                  border: '1px solid #0a5fb4',
                  background: '#0a5fb4',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '10px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Refresh now
              </button>
              <button
                type="button"
                onClick={() => setAutoRefresh((value) => !value)}
                style={{
                  border: '1px solid #c7d7e2',
                  background: '#ffffff',
                  color: '#102437',
                  borderRadius: '999px',
                  padding: '10px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
              </button>
              <div style={{ color: '#5a7389', fontSize: '13px' }}>Preview URL: {previewUrl}</div>
            </div>
          </section>

          <section
            style={{
              background: '#ffffff',
              border: '1px solid #d4e2eb',
              borderRadius: '20px',
              padding: '12px',
              boxShadow: '0 12px 28px rgba(16,36,55,0.08)',
            }}
          >
            <iframe
              key={previewKey}
              title="Weekly email preview"
              src={previewUrl}
              style={{
                width: '100%',
                minHeight: '1800px',
                border: '0',
                borderRadius: '14px',
                background: '#eef4f8',
              }}
            />
          </section>
        </div>
      </main>
    </>
  );
}