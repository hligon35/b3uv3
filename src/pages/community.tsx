import Layout from '@/components/Layout';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import BookImage from '@/images/content/book.png';

type Story = {
  id: string;
  name: string;
  email?: string;
  story: string;
  createdAt?: string;
};

const FORMS_API = (process.env.NEXT_PUBLIC_FORMS_API || '').replace(/\/$/, '');

export default function CommunityPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const storyIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [t0, setT0] = useState('');

  // Load approved stories from API if configured
  // Load approved stories via JSONP to avoid CORS issues
  useEffect(() => {
    if (!FORMS_API) return;
    const cbName = `__b3uStories_${Math.random().toString(36).slice(2)}`;
    (window as any)[cbName] = (data: any) => {
      try { if (Array.isArray(data?.stories)) setStories(data.stories as Story[]); } catch {}
      try { delete (window as any)[cbName]; } catch {}
    };
    const s = document.createElement('script');
    s.src = `${FORMS_API}/stories?callback=${cbName}`;
    s.async = true;
    document.body.appendChild(s);
    return () => {
      try { document.body.removeChild(s); } catch {}
      try { delete (window as any)[cbName]; } catch {}
    };
  }, []);

  useEffect(() => {
    try { setT0(String(Date.now())); } catch {}
  }, []);

  const displayCount = 6; // number of cards to show at minimum
  const visibleStories = useMemo(() => stories.slice(0, displayCount), [stories]);

  function onSubmit() {
    if (!FORMS_API) return;
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1400);
  }
  return (
    <Layout>
  <section className="section-padding bg-white">
        <h1 className="text-4xl font-bold mb-6">Community Stories</h1>
    <p className="max-w-2xl text-navy/80 mb-12">Real impact from real people. Share your journey and help others find strength in theirs.</p>
        {/* Share Your Story form moved directly under title and subtext */}
        <form
          className="max-w-3xl mb-16"
          onSubmit={onSubmit}
          action={FORMS_API ? `${FORMS_API}/submit` : undefined}
          method="POST"
          target="story_iframe"
        >
          {/* bot protection: honeypot + timestamp */}
          <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <input type="hidden" name="t0" value={t0} />
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button className="btn-primary disabled:opacity-50" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Story'}
                </button>
                {submitted && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    Thanks! Your story was received. Please check your email for confirmation.
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
        {/* Hidden iframe target to avoid navigation and CORS */}
        <iframe name="story_iframe" ref={storyIframeRef} className="hidden" title="story_iframe" />
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Render approved stories if available; otherwise show placeholders. If fewer than placeholders, fill remaining with placeholders. */}
          {visibleStories.map((st) => (
            <div key={st.id} className="card">
              <p className="text-sm italic mb-4">“{st.story}”</p>
              <p className="text-xs text-white/60">{st.name}</p>
            </div>
          ))}
          {visibleStories.length < displayCount &&
            Array.from({ length: displayCount - visibleStories.length }).map((_, i) => (
              <div key={`ph-${i}`} className="card">
                <p className="text-sm italic mb-4">“This platform helped me reconnect with my purpose and give back in ways I never imagined.”</p>
                <p className="text-xs text-white/60">Story Contributor</p>
              </div>
            ))}
        </div>
      </section>
  <section className="section-padding bg-[#F4F8FB]">
        <h2 className="text-3xl font-bold mb-8">Event Gallery</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Event Card */}
          <div className="card p-0 overflow-hidden">
            <div className="relative h-56 bg-white">
              <Image
                src={BookImage}
                alt="The Big Take Back book cover"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
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
            <div className="relative h-56 grid place-items-center bg-white">
              <span className="text-5xl md:text-6xl font-extrabold tracking-wide text-navy">TBA</span>
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
