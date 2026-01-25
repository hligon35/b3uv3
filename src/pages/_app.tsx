import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const trackPageView = () => {
      try {
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
      } catch (error) {
        // Silently fail if browser APIs aren't available
      }
    };

    trackPageView();
    router.events.on('routeChangeComplete', trackPageView);

    return () => {
      router.events.off('routeChangeComplete', trackPageView);
    };
  }, [router, mounted]);

  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>

      {/* Cloudflare Web Analytics */}
      <Script
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "7f4a9455e5fc4982adc1c01b0ada3b1d"}'
        strategy="afterInteractive"
      />

      <Component {...pageProps} />
    </>
  );
}
