import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MugImage from '@/images/shop/mug.png';
import ShirtFrontImage from '@/images/shop/shirt_front.png';
import ShirtBackImage from '@/images/shop/shirt_back.png';

export default function HomePage() {
  const [isTouch, setIsTouch] = useState(false);
  const [homeOverlay, setHomeOverlay] = useState<Record<number, boolean>>({});

  // Detect touch / non-hover devices for overlay behavior
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
  // Most recent B3U Podcast episodes from YouTube (sorted by upload date)
  const podcastEpisodes = [
    {
      id: 'fCsbrjfzLBc',
      title: 'Fireside Chat w/ Mrs Rochelle Tucker',
      duration: '1 hour, 27 minutes',
      description: 'An inspiring conversation about resilience, faith, and life\'s journey with Mrs Rochelle Tucker.',
      thumbnail: `https://img.youtube.com/vi/fCsbrjfzLBc/maxresdefault.jpg`,
      uploadDate: '2 days ago'
    },
    {
      id: 'BiL6SWnquUI',
      title: 'Reclaim Session w/ Ashley Brown',
      duration: '35 minutes',
      description: 'Ashley Brown shares her powerful story of reclaiming her voice and stepping into her purpose.',
      thumbnail: `https://img.youtube.com/vi/BiL6SWnquUI/maxresdefault.jpg`,
      uploadDate: '9 days ago'
    },
    {
      id: '8f0zkRp3VUc',
      title: 'The Altar Experience w/ Prophetess Moina Tucker',
      duration: '23 minutes',
      description: 'A transformative altar experience exploring faith, healing, and spiritual breakthrough.',
      thumbnail: `https://img.youtube.com/vi/8f0zkRp3VUc/maxresdefault.jpg`,
      uploadDate: '12 days ago'
    },
    {
      id: 'KxyISQUoBWk',
      title: 'The Altar Experience w/ Chenia Hughes',
      duration: '33 minutes',
      description: 'Chenia Hughes shares her journey of transformation and spiritual awakening at the altar.',
      thumbnail: `https://img.youtube.com/vi/KxyISQUoBWk/maxresdefault.jpg`,
      uploadDate: '2 weeks ago'
    },
    {
      id: 'LUu8ltxQuLk',
      title: 'Altar Experience w/ Dr Teresa Hegwood',
      duration: '9 minutes, 9 seconds',
      description: 'Dr Teresa Hegwood delivers a powerful message about healing and restoration.',
      thumbnail: `https://img.youtube.com/vi/LUu8ltxQuLk/maxresdefault.jpg`,
      uploadDate: '2 weeks ago'
    },
    {
      id: 'MXpm9L2yOSQ',
      title: 'Altar Experience w/ Pastor Kristie Anderson',
      duration: '24 minutes',
      description: 'Pastor Kristie Anderson shares insights on faith, perseverance, and divine purpose.',
      thumbnail: `https://img.youtube.com/vi/MXpm9L2yOSQ/maxresdefault.jpg`,
      uploadDate: '3 weeks ago'
    }
  ];

  // Shop products for homepage preview
  const shopProducts = [ShirtFrontImage, MugImage];

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
            <div className="h-40 rounded-lg bg-[url('https://picsum.photos/300/300?speaker')] bg-cover bg-center" />
            <div className="h-40 rounded-lg bg-[url('https://picsum.photos/300/300?army')] bg-cover bg-center" />
            <div className="h-40 rounded-lg bg-[url('https://picsum.photos/300/300?podcast')] bg-cover bg-center" />
            <div className="h-40 rounded-lg bg-[url('https://picsum.photos/300/300?community')] bg-cover bg-center" />
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
            <a href="https://www.youtube.com/channel/UCSrtA1gGlgo4cQUzoSlzZ5w" target="_blank" rel="noopener" className="block aspect-video bg-black/40 rounded-lg flex items-center justify-center text-white/80 text-sm hover:bg-black/60 transition-colors group">
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">▶</div>
                <div>Watch B3U on YouTube</div>
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
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {episode.duration}
                </div>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2">{episode.title}</h3>
              <p className="text-sm text-navy/70 mb-4 line-clamp-3">{episode.description}</p>
              <a 
                href={`https://www.youtube.com/watch?v=${episode.id}`}
                target="_blank"
                rel="noopener"
                className="text-brandOrange hover:underline text-sm font-medium"
              >
                Watch Episode →
              </a>
            </div>
          ))}
        </div>
      </section>
      <section id="community" className="section-padding alt-band">
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
            <p className="italic text-sm mb-4">"The Big Take Back isn't just a messageit's a movement. Bree helped me reclaim my voice and my future."</p>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-[url('https://picsum.photos/100/100?portrait=3')] bg-cover bg-center" />
              <div>
                <p className="font-semibold text-sm">Angela R.</p>
                <p className="text-xs text-white/50">Community Leader</p>
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
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input type="email" required placeholder="Email address" className="flex-1 px-5 py-3 rounded-md bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
            <button className="btn-primary" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
