import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import MugImage from '@/images/shop/mug.png';
import ShirtFrontImage from '@/images/shop/shirt_front.png';
import ShirtBackImage from '@/images/shop/shirt_back.png';
import about1 from '@/images/content/about1.jpeg';
import about2 from '@/images/content/about2.jpeg';
import about3 from '@/images/content/about3.jpeg';
import about4 from '@/images/content/about4.jpeg';
import B3ULogo from '@/images/logos/B3U3D.png';
import Test1 from '@/images/content/test1.JPG';
import Test2 from '@/images/content/test2.JPEG';
import { useFormsApi } from '@/lib/useFormsApi';
import { submitFormToEndpoint } from '@/lib/formsSubmit';

export default function HomePage() {

  // Shop products for homepage preview
  const shopProducts = [ShirtFrontImage, MugImage];

  // Overlay behavior for home shop tiles
  const [isTouch, setIsTouch] = useState(false);
  const [homeOverlay, setHomeOverlay] = useState<Record<number, boolean>>({});
  const [subscribed, setSubscribed] = useState(false);
  const [subPending, setSubPending] = useState(false);
  const newsletterFormRef = useRef<HTMLFormElement | null>(null);
  const [t0, setT0] = useState('');
  const { formsApi, debugEnabled } = useFormsApi();

  const [subError, setSubError] = useState<string | null>(null);
  async function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (subPending) return; // guard against double submissions
    if (!formsApi) {
      setSubError('Subscriptions are temporarily unavailable. Please try again shortly.');
      // eslint-disable-next-line no-console
      console.warn('B3U Forms: NEXT_PUBLIC_FORMS_API is not configured; blocking newsletter submit.');
      return;
    }
    setSubError(null);
    setSubPending(true);
    try {
      // Submit to Google Apps Script
      await submitFormToEndpoint(newsletterFormRef.current!, `${formsApi}?endpoint=newsletter`);

      setSubscribed(true);
      try { newsletterFormRef.current?.reset(); } catch {}
      try { setT0(String(Date.now())); } catch {}
      try { document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); } catch {}
    } catch {
      setSubError('Subscription failed. Please try again later.');
    } finally {
      setSubPending(false);
    }
  }

  useEffect(() => {
    const detect = () => {
      try {
        return window.matchMedia && window.matchMedia('(hover: none)').matches;
      } catch {
        return 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
      }
    };
    setIsTouch(detect());
  }, []);

  useEffect(() => {
    try { setT0(String(Date.now())); } catch {}
  }, []);

  // Debug postMessage via iframe removed.

  return (
    <Layout>
      <Hero />
      <section id="about" className="section-padding bg-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About <span className="text-brandOrange">Bree Charles</span></h2>
            <p className="text-navy/80 leading-relaxed mb-6">
              Transformational speaker, author, U.S. Army veteran, and creator of the B3U Podcast. Bree has turned her pain into purpose, proving that brokenness doesn't mean defeat  it means rebirth.
            </p>
            <p className="text-navy/80 leading-relaxed mb-6">
              Through courage, faith, and relentless resilience, she helps others burn away fear, break destructive patterns, and become who they were created to be.
            </p>
            <p className="text-brandOrange font-semibold mb-6 italic">Breaking Cycles. Building Legacies.</p>
            <Link href="/about" className="btn-outline">Learn More About Bree</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[about1, about4, about3, about2].map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`Highlight image ${i + 1}`}
                width={800}
                height={800}
                className={`w-full aspect-square rounded-3xl object-cover ${i === 2 ? 'object-top' : 'object-center'}`}
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={i === 0}
              />
            ))}
          </div>
        </div>
      </section>
      <section id="podcast" className="section-padding bg-[#F4F8FB]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The B3U Podcast</h2>
            <h3 className="text-xl text-brandOrange font-semibold mb-4">Burn, Break, Become Unstoppable</h3>
            <p className="text-navy/70 max-w-xl">Conversations featuring stories of resilience, transformation, and the courage to rebuild. Every episode is a reminder that your pain can become your purpose.</p>
          </div>
          <div className="w-full md:w-[420px]">
            <a
              href="https://www.youtube.com/channel/UCSrtA1gGlgo4cQUzoSlzZ5w"
              target="_blank"
              rel="noopener"
              aria-label="Watch B3U on YouTube"
              className="group relative block aspect-video overflow-hidden rounded-xl shadow-xl ring-1 ring-black/10"
            >
              {/* background gradient (light white-blue) */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-[#EEF5FF] to-[#CFE6FF]" />

              {/* subtle animated glow on hover */}
              <div className="pointer-events-none absolute -inset-8 bg-gradient-to-r from-brandOrange/25 via-transparent to-brandBlue-light/25 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* 3D logo */}
              <div className="absolute inset-0">
                <Image
                  src={B3ULogo}
                  alt="B3U logo"
                  fill
                  className="object-contain p-0 md:p-2 scale-150 md:scale-150 transition-transform duration-500 ease-out group-hover:scale-[1.6] group-hover:rotate-[1.5deg]"
                  sizes="(max-width: 768px) 100vw, 420px"
                  priority
                />
              </div>

              {/* subtle gradient overlay for readability on light bg */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/0 to-transparent" />

              {/* top-left label */}
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-navy shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-brandOrange shadow-[0_0_0_3px_rgba(204,85,0,0.15)]" />
                  B3U on YouTube
                </span>
              </div>

              {/* bottom-right caption */}
              <div className="absolute bottom-3 right-3">
                <span className="rounded-md bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  Watch now
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>
      <section id="community" className="section-padding alt-band">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Take Back Community</h2>
          <p className="text-black">Stories from listeners who have found the courage to burn away fear, break cycles, and become unstoppable.</p>
        </div>
        <div className="flex flex-col gap-10 items-center">
          <div className="card w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
                <div className="rounded-full overflow-hidden h-[120px] w-[120px]">
                  <Image
                    src={Test2}
                    alt="Dr. Monica R. Smith"
                    width={120}
                    height={120}
                    className="object-cover object-center"
                  />
                </div>
                <p className="font-semibold text-sm mt-3 text-center">Dr. Monica R. Smith</p>
              </div>
              <div className="flex-1">
                <p className="italic text-sm mb-4">"Bree is a woman whose strength speaks louder than any obstacle she has faced. She has walked through storms that would have broken the ordinary woman, yet she stands today not just surviving, but shining. Her resilience is not accidental; it is built from battles fought quietly, tears wiped privately, and faith held firmly even when the path made no sense.</p>

                <p className="italic text-sm mb-4">What makes Bree remarkable isn’t just what she has overcome, but the grace with which she continues to rise. She has carried burdens that many will never see, but she refuses to let those burdens define her. Instead, she uses her story as fuel to grow, to inspire, and to demonstrate what true courage looks like.</p>

                <p className="italic text-sm mb-4">Bree is proof that you can be tried, stretched, and tested, yet still emerge stronger, wiser, and more determined. Her journey is a testament to perseverance, heart, and the unshakeable spirit of a woman who simply refuses to be defeated. Anyone who knows Bree knows they are witnessing the kind of strength that changes lives and the kind of resilience that leaves a lasting mark.</p>

                <p className="italic text-sm mb-4">She is extraordinary, not because life has been easy, but because she has risen beautifully above everything meant to break her."</p>
              </div>
            </div>
          </div>
          <div className="card w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
                <div className="rounded-full overflow-hidden h-[120px] w-[120px]">
                  <Image
                    src={Test1}
                    alt="Brenda Johnson"
                    width={120}
                    height={120}
                    className="object-cover object-center"
                  />
                </div>
                <p className="font-semibold text-sm mt-3 text-center">Brenda Johnson</p>
              </div>
              <div className="flex-1">
                <p className="italic text-sm mb-4">"B3U has truly been a blessing in my life. Watching the show and following each episode has inspired me in ways I didn’t expect. Every story, every message, and every moment has encouraged me to keep pushing forward, stay true to my purpose, and continue sharing my own testimony with others. The transparency and strength shown on B3U remind me that growth is possible, healing is real, and God can use our stories to uplift someone else. I’m grateful for how this show pours into its viewers, including me, and I look forward to every episode that reminds us we are becoming better, braver, and bolder—one step at a time. "</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="shop" className="section-padding bg-[#FFF5EE]">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Gear Up & Give Back</h2>
            <p className="text-navy/80 mb-6">Every purchase fuels programming and community initiatives. Fresh drops and timeless essentials that support the mission.</p>
            <Link href="/shop" className="btn-primary">Visit the Shop</Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {shopProducts.map((productImage, index) => (
              <div
                key={index}
                className="relative group h-48 rounded-lg overflow-hidden bg-white"
                onClick={(e) => {
                  if (!isTouch) return; // Only toggle on touch devices
                  const target = e.target as HTMLElement;
                  if (target.closest('a')) return; // Don't toggle if clicking the link
                  setHomeOverlay(prev => ({ ...prev, [index]: !prev[index] }));
                }}
              >
                <Image
                  src={productImage}
                  alt={index === 0 ? 'B3U T-Shirt' : 'B3U Coffee Mug'}
                  fill
                  className="object-contain p-4"
                />
                <div
                  className={
                    `absolute inset-0 flex items-center justify-center transition pointer-events-none ` +
                    (isTouch
                      ? (homeOverlay[index] ? 'opacity-100 bg-black/50' : 'opacity-0 bg-black/0')
                      : 'opacity-0 bg-black/0 group-hover:opacity-100 group-hover:bg-black/50')
                  }
                >
                  <Link href="/shop" className="pointer-events-auto text-white text-sm font-semibold tracking-wide underline-offset-4 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="newsletter" className="section-padding bg-[#F4F8FB]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join "The Take Back Weekly"</h2>
          <p className="text-navy/70 mb-6">Get new episodes, inspiration, and community opportunities delivered to your inbox.</p>
          <form
            className="flex flex-col sm:flex-row gap-4 justify-center"
            onSubmit={handleNewsletterSubmit}
            ref={newsletterFormRef}
          >
            {/* bot protection: honeypot + timestamp */}
            <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <input type="hidden" name="t0" value={t0} />
            {debugEnabled && <input type="hidden" name="debug" value="1" />}
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="flex-1 px-5 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-brandBlue"
            />
            <button className="btn-primary" type="submit" disabled={subPending}>
              {subPending ? 'Subscribing…' : 'Subscribe'}
            </button>
            {subscribed && (
              <div className="w-full text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 sm:ml-4 sm:mt-0 mt-2">
                Thanks! You’re subscribed.
              </div>
            )}
            {subError && (
              <div className="w-full text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 sm:ml-4 sm:mt-0 mt-2">
                {subError}
              </div>
            )}
          </form>
          {/* Iframe removed: switched to fetch-based submission with no-cors fallback */}
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
