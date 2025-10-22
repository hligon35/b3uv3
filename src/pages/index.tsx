import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MugImage from '@/images/shop/mug.png';
import ShirtFrontImage from '@/images/shop/shirt_front.png';
import ShirtBackImage from '@/images/shop/shirt_back.png';
import about1 from '@/images/content/about1.jpeg';
import about2 from '@/images/content/about2.jpeg';
import about3 from '@/images/content/about3.jpeg';
import about4 from '@/images/content/about4.jpeg';
import B3ULogo from '@/images/logos/B3U3D.png';
import { useMemo } from 'react';

type YtVideo = { id: string; title: string; description: string; thumbnail: string; link?: string; publishedAt?: string; uploadDate?: string };

type HomeProps = {
  videos: YtVideo[];
};

export default function HomePage({ videos }: HomeProps) {
  // Most recent B3U Podcast episodes from YouTube (sorted by upload date)
  const fallbackVideos: YtVideo[] = [
    {
      id: 'fCsbrjfzLBc',
      title: 'Fireside Chat w/ Mrs Rochelle Tucker',
      description: 'An inspiring conversation about resilience, faith, and life\'s journey with Mrs Rochelle Tucker. (1h 27m)',
      thumbnail: `https://img.youtube.com/vi/fCsbrjfzLBc/hqdefault.jpg`,
      uploadDate: '2 days ago'
    },
    {
      id: 'BiL6SWnquUI',
      title: 'Reclaim Session w/ Ashley Brown',
      description: 'Ashley Brown shares her powerful story of reclaiming her voice and stepping into her purpose. (35m)',
      thumbnail: `https://img.youtube.com/vi/BiL6SWnquUI/hqdefault.jpg`,
      uploadDate: '9 days ago'
    },
    {
      id: '8f0zkRp3VUc',
      title: 'The Altar Experience w/ Prophetess Moina Tucker',
      description: 'A transformative altar experience exploring faith, healing, and spiritual breakthrough. (23m)',
      thumbnail: `https://img.youtube.com/vi/8f0zkRp3VUc/hqdefault.jpg`,
      uploadDate: '12 days ago'
    },
    {
      id: 'KxyISQUoBWk',
      title: 'The Altar Experience w/ Chenia Hughes',
      description: 'Chenia Hughes shares her journey of transformation and spiritual awakening at the altar. (33m)',
      thumbnail: `https://img.youtube.com/vi/KxyISQUoBWk/hqdefault.jpg`,
      uploadDate: '2 weeks ago'
    },
    {
      id: 'LUu8ltxQuLk',
      title: 'Altar Experience w/ Dr Teresa Hegwood',
      description: 'Dr Teresa Hegwood delivers a powerful message about healing and restoration. (9m 9s)',
      thumbnail: `https://img.youtube.com/vi/LUu8ltxQuLk/hqdefault.jpg`,
      uploadDate: '2 weeks ago'
    },
    {
      id: 'MXpm9L2yOSQ',
      title: 'Altar Experience w/ Pastor Kristie Anderson',
      description: 'Pastor Kristie Anderson shares insights on faith, perseverance, and divine purpose. (24m)',
      thumbnail: `https://img.youtube.com/vi/MXpm9L2yOSQ/hqdefault.jpg`,
      uploadDate: '3 weeks ago'
    }
  ];
  const podcastEpisodes: YtVideo[] = useMemo(() => (videos && videos.length ? videos : fallbackVideos), [videos]);

  // Shop products for homepage preview
  const shopProducts = [ShirtFrontImage, MugImage];

  // Overlay behavior for home shop tiles
  const [isTouch, setIsTouch] = useState(false);
  const [homeOverlay, setHomeOverlay] = useState<Record<number, boolean>>({});
  const [subscribed, setSubscribed] = useState(false);

  async function handleNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      // Post directly to FormSubmit (works on static hosting) using the form's configured action.
      const res = await fetch((form.getAttribute('action') as string) || 'https://formsubmit.co/el/figabe', {
        method: 'POST',
        body: data,
        redirect: 'follow',
      });
      if (res.ok) {
        const next = (data.get('_next') as string) || '/?subscribed=1#newsletter';
        // Update URL without reloading and scroll to the newsletter section
        try { window.history.replaceState(null, '', next); } catch {}
        setSubscribed(true);
        try { document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' }); } catch {}
        try {
          const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement | null;
          if (emailInput) emailInput.value = '';
        } catch {}
        return;
      }
    } catch {}
    // No fallback submit to avoid page reload; optionally show an error.
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
        <div className="grid md:grid-cols-3 gap-8">
          {podcastEpisodes.map(episode => (
            <div key={episode.id} className="card">
              <div className="relative h-40 rounded-md overflow-hidden mb-4 group">
                <img 
                  src={episode.thumbnail} 
                  alt={episode.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <a 
                    href={`https://www.youtube.com/watch?v=${episode.id}`}
                    target="_blank"
                    rel="noopener"
                    className="text-white text-2xl hover:scale-110 transition-transform"
                  >
                    ▶
                  </a>
                </div>
                {(() => {
                  const dateLabel = episode.publishedAt || episode.uploadDate;
                  return dateLabel ? (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                      {dateLabel}
                    </div>
                  ) : null;
                })()}
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{episode.title}</h3>
              <p className="text-sm text-navy/70 mb-4 line-clamp-3">{episode.description}</p>
              <a 
                href={`https://www.youtube.com/watch?v=${episode.id}`}
                target="_blank"
                rel="noopener"
                className="text-brandOrange hover:underline text-sm font-medium"
              >
                Watch Episode
              </a>
            </div>
          ))}
        </div>
      </section>
      {/* <section id="community" className="section-padding alt-band">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Take Back Community</h2>
          <p className="text-white/90">Stories from listeners who have found the courage to burn away fear, break cycles, and become unstoppable.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <p className="italic text-sm mb-4">"Bree's story gave me permission to heal. The B3U podcast reminded me that my pain could become my purpose."</p>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-[url('https://picsum.photos/100/100?portrait=1')] bg-cover bg-center" />
              <div>
                <p className="font-semibold text-sm">Sarah M.</p>
                <p className="text-xs text-white/50">Survivor & Advocate</p>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="italic text-sm mb-4">"Every episode is a masterclass in resilience. Bree's authenticity and faith inspire me to keep pushing forward."</p>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-[url('https://picsum.photos/100/100?portrait=2')] bg-cover bg-center" />
              <div>
                <p className="font-semibold text-sm">Marcus J.</p>
                <p className="text-xs text-white/50">Veteran & Entrepreneur</p>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="italic text-sm mb-4">"The Big Take Back isn't just a message, it's a movement. Bree helped me reclaim my voice and my future."</p>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-[url('https://picsum.photos/100/100?portrait=3')] bg-cover bg-center" />
              <div>
                <p className="font-semibold text-sm">Angela R.</p>
                <p className="text-xs text-white/50">Community Leader</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}
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
            action="https://formsubmit.co/el/figabe"
            method="POST"
            className="flex flex-col sm:flex-row gap-4 justify-center"
            onSubmit={handleNewsletterSubmit}
          >
            {/* helpers */}
            <input type="hidden" name="_subject" value="B3U Website — Newsletter Subscription" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_next" value="/?subscribed=1#newsletter" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="text" name="_honey" className="hidden" aria-hidden="true" />
            <input
              type="hidden"
              name="_autoresponse"
              value="Thanks for joining The Take Back Weekly! You’re on the list. Look out for new episodes, inspiration, and community updates from B3U. — Team B3U"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="flex-1 px-5 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-brandBlue"
            />
            <button className="btn-primary" type="submit">Subscribe</button>
            {subscribed && (
              <div className="w-full text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 sm:ml-4 sm:mt-0 mt-2">
                Thanks! You7re subscribed.
              </div>
            )}
          </form>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const path = await import('node:path');
    const fs = await import('node:fs');
    const file = path.join(process.cwd(), 'public', 'data', 'youtube.json');
    const raw = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    return { props: { videos: data.videos || [] } };
  } catch (e) {
    return { props: { videos: [] } };
  }
}
