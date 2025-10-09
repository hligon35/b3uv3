import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Link from 'next/link';

export default function HomePage() {
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
          <div className="w-full md:w-[420px] aspect-video bg-black/40 rounded-lg flex items-center justify-center text-white/40 text-sm">B3U Podcast Player</div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="card">
              <div className="h-40 rounded-md bg-[url('https://picsum.photos/400/300?podcast=')] bg-cover bg-center mb-4" />
              <h3 className="font-semibold mb-2">Breaking Through Episode {n}</h3>
              <p className="text-sm text-navy/70 mb-4">Stories of courage, faith, and transformation that inspire others to take back their power.</p>
              <Link href="/podcast" className="text-brandOrange hover:underline text-sm font-medium">Listen </Link>
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
            {[1,2,3,4].map(p => (
              <div key={p} className="relative group h-48 rounded-lg overflow-hidden bg-[url('https://picsum.photos/400/400?product=')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-sm font-semibold tracking-wide">View</span>
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
