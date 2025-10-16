import Layout from '@/components/Layout';

export default function CommunityPage() {
  return (
    <Layout>
  <section className="section-padding bg-white">
        <h1 className="text-4xl font-bold mb-6">Community Stories</h1>
        <p className="max-w-2xl text-white/80 mb-12">Real impact from real people. Share your journey and help others find strength in theirs.</p>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[1,2,3,4,5,6].map(s => (
            <div key={s} className="card">
              <p className="text-sm italic mb-4">“This platform helped me reconnect with my purpose and give back in ways I never imagined.”</p>
              <p className="text-xs text-white/60">Story Contributor {s}</p>
            </div>
          ))}
        </div>
        <form className="max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold">Share Your Story</h2>
          <input required placeholder="Name" className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
          <input required placeholder="Email" type="email" className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
          <textarea required placeholder="Your story..." rows={6} className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
          <button className="btn-primary" type="submit">Submit Story</button>
        </form>
      </section>
  <section className="section-padding bg-[#F4F8FB]">
        <h2 className="text-3xl font-bold mb-8">Event Gallery</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Event Card */}
          <div className="card p-0 overflow-hidden">
            <div className="relative h-56">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/600/400?book')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute top-3 left-3 bg-brandOrange text-white text-xs font-semibold px-3 py-1 rounded-full">Coming Soon</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">The Big Take Back</h3>
              <p className="text-navy/70 text-sm">Stay tuned for details on Bree's upcoming book release.</p>
            </div>
          </div>

          {/* Speaking Engagement Event Card */}
          <div className="card p-0 overflow-hidden">
            <div className="relative h-56">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/600/400?speaking')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute top-3 left-3 bg-brandOrange text-white text-xs font-semibold px-3 py-1 rounded-full">Coming Soon</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Speaking Engagement</h3>
              <p className="text-navy/70 text-sm">Dates and locations will be announced here soon.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
