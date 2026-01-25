import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const trackPageView = () => {
      const data = {
        path: router.pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString(),
      };

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {}); // Ignore errors
    };

    trackPageView();
    router.events.on('routeChangeComplete', trackPageView);

    return () => {
      router.events.off('routeChangeComplete', trackPageView);
    };
  }, [router]);

  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "7f4a9455e5fc4982adc1c01b0ada3b1d"}'
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
