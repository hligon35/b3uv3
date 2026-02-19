import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
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
