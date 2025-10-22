import Layout from '@/components/Layout';

export default function CommunityPage() {
  return (
    <Layout>
  <section className="section-padding bg-white">
        <h1 className="text-4xl font-bold mb-6">Community Stories</h1>
    <p className="max-w-2xl text-navy/80 mb-12">Real impact from real people. Share your journey and help others find strength in theirs.</p>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[1,2,3,4,5,6].map(s => (
            <div key={s} className="card">
              <p className="text-sm italic mb-4">“This platform helped me reconnect with my purpose and give back in ways I never imagined.”</p>
              <p className="text-xs text-white/60">Story Contributor {s}</p>
            </div>
          ))}
        </div>
        <form className="max-w-3xl">
          <div className="bg-white border border-black/10 rounded-xl shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Share Your Story</h2>
              <p className="text-sm text-navy/70 mt-1">Your words may encourage someone who needs it today. Fields marked with <span className="text-red-600">*</span> are required.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">Name <span className="text-red-600">*</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full rounded-md border border-black/10 bg-white px-4 py-2 text-navy placeholder:text-navy/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-brandBlue focus:border-brandBlue"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">Email <span className="text-red-600">*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-black/10 bg-white px-4 py-2 text-navy placeholder:text-navy/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-brandBlue focus:border-brandBlue"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="story" className="block text-sm font-medium text-navy mb-1">Your story <span className="text-red-600">*</span></label>
              <textarea
                id="story"
                name="story"
                rows={7}
                required
                className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-navy placeholder:text-navy/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-brandBlue focus:border-brandBlue"
                placeholder="Share what you’ve overcome, what you learned, or a message for others."
              />
              <p className="mt-2 text-xs text-navy/60">Please avoid sharing sensitive personal details or names you don’t have permission to include.</p>
            </div>

            <div className="mt-6 flex items-start gap-3">
              <input id="consent" name="consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-black/30 text-brandOrange focus:ring-brandOrange" />
              <label htmlFor="consent" className="text-sm text-navy/80">I’m okay with my story (or an excerpt) being shared anonymously on the site and social channels.</label>
            </div>

            <div className="mt-6">
              <button className="btn-primary" type="submit">Submit Story</button>
            </div>
          </div>
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
