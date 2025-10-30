import Layout from '@/components/Layout';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BookImage from '@/images/content/book.png';
import { useFormsApi } from '@/lib/useFormsApi';
import { submitFormToEndpoint } from '@/lib/formsSubmit';

type Story = {
  id: string;
  name: string;
  email?: string;
  story: string;
  createdAt?: string;
};

export default function CommunityPage() {
  const { formsApi, debugEnabled } = useFormsApi();
  const [stories, setStories] = useState<Story[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [t0, setT0] = useState('');
  const [editorMode, setEditorMode] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [placeholdersOnly, setPlaceholdersOnly] = useState(false);

  // JSONP loader with cache-busting; returns a cleanup function
  const loadStories = useCallback(() => {
    if (!formsApi) return () => {};
    let cleaned = false;
    let loaded = false;
    const cleanupFns: Array<() => void> = [];

    const attachJsonp = (url: string) => {
      const cbName = `__b3uStories_${Math.random().toString(36).slice(2)}`;
      (window as any)[cbName] = (data: any) => {
        try {
          if (Array.isArray(data?.stories)) {
            loaded = true;
            setStories(data.stories as Story[]);
          }
        } catch {}
        try { delete (window as any)[cbName]; } catch {}
      };
      const s = document.createElement('script');
      s.src = `${url}${url.includes('?') ? '&' : '?'}callback=${cbName}&_ts=${Date.now()}`;
      s.async = true;
      document.body.appendChild(s);
      const c = () => {
        try { document.body.removeChild(s); } catch {}
        try { delete (window as any)[cbName]; } catch {}
      };
      cleanupFns.push(c);
    };

    // Primary: query-string endpoint routing (more reliable in Apps Script)
    attachJsonp(`${formsApi}?endpoint=stories`);

    // Fallback shortly after if the first didn’t load
    const timer = window.setTimeout(() => {
      if (!loaded) attachJsonp(`${formsApi}/stories`);
    }, 700);

    return () => {
      if (cleaned) return;
      cleaned = true;
      try { window.clearTimeout(timer); } catch {}
      cleanupFns.forEach(fn => { try { fn(); } catch {} });
    };
  }, [formsApi]);

  // Load on mount and whenever formsApi changes
  useEffect(() => {
    const cleanup = loadStories();
    return () => { try { cleanup && cleanup(); } catch {} };
  }, [loadStories]);

  // Refresh on tab visibility change (useful right after approving)
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') loadStories(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadStories]);

  useEffect(() => {
    try { setT0(String(Date.now())); } catch {}
  }, []);
  useEffect(() => {
    // Editor mode and hidden ids from URL/localStorage for dev-only local deletions
    try {
      const params = new URLSearchParams(window.location.search);
      const ed = params.get('editor');
      if (ed === '1' || ed === 'true') {
        setEditorMode(true);
        try { window.localStorage?.setItem('b3u.editor', '1'); } catch {}
      } else {
        try { if (window.localStorage?.getItem('b3u.editor') === '1') setEditorMode(true); } catch {}
      }
      const ph = params.get('placeholders');
      if (ph === '1' || ph === 'true') {
        setPlaceholdersOnly(true);
        try { window.localStorage?.setItem('b3u.placeholdersOnly', '1'); } catch {}
      } else {
        try { setPlaceholdersOnly(window.localStorage?.getItem('b3u.placeholdersOnly') === '1'); } catch {}
      }
      try {
        const raw = window.localStorage?.getItem('b3u.hiddenStories');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setHiddenIds(new Set(arr.filter((x: any) => typeof x === 'string')));
        }
      } catch {}
    } catch {}
  }, []);
  // debugEnabled now comes from useFormsApi; runtime override centralized

  const displayCount = 6; // number of cards to show at minimum
  const filteredStories = useMemo(() => {
    if (placeholdersOnly) return [] as Story[];
    return stories.filter(st => !hiddenIds.has(st.id));
  }, [stories, hiddenIds, placeholdersOnly]);
  const visibleStories = useMemo(() => filteredStories.slice(0, displayCount), [filteredStories]);

  const hideStory = (id: string) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try { window.localStorage?.setItem('b3u.hiddenStories', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };
  const unhideAll = () => {
    setHiddenIds(new Set());
    try { window.localStorage?.removeItem('b3u.hiddenStories'); } catch {}
  };
  const hideAllFetched = () => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      for (const st of stories) next.add(st.id);
      try { window.localStorage?.setItem('b3u.hiddenStories', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };
  const togglePlaceholdersOnly = () => {
    setPlaceholdersOnly(prev => {
      const val = !prev;
      try {
        if (val) window.localStorage?.setItem('b3u.placeholdersOnly', '1');
        else window.localStorage?.removeItem('b3u.placeholdersOnly');
      } catch {}
      return val;
    });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return; // guard against double submissions
    if (!formsApi) {
      setError('Submissions are temporarily unavailable. Please try again shortly.');
      // eslint-disable-next-line no-console
      console.warn('B3U Forms: NEXT_PUBLIC_FORMS_API is not configured; blocking story submit.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitFormToEndpoint(formRef.current!, `${formsApi}?endpoint=submit`);
      setSubmitted(true);
      try { formRef.current?.reset(); } catch {}
      try { setT0(String(Date.now())); } catch {}
    } catch {
      setError('Submission failed. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  // Iframe postMessage debug removed.
  return (
    <Layout>
  <section className="section-padding bg-white">
        <h1 className="text-4xl font-bold mb-6">Community Stories</h1>
    <p className="max-w-2xl text-navy/80 mb-12">Real impact from real people. Share your journey and help others find strength in theirs.</p>
        {/* Share Your Story form moved directly under title and subtext */}
        {editorMode && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button type="button" className="btn-outline" onClick={() => loadStories()}>Refresh stories</button>
            <button type="button" className="btn-outline" onClick={unhideAll}>Clear local hides</button>
            <button type="button" className="btn-outline" onClick={hideAllFetched}>Hide all fetched</button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={placeholdersOnly} onChange={togglePlaceholdersOnly} />
              Show placeholders only
            </label>
            <span className="text-xs text-navy/60">Editor mode</span>
          </div>
        )}
        <form
          className="max-w-3xl mb-16"
          onSubmit={onSubmit}
          ref={formRef}
        >
          {/* bot protection: honeypot + timestamp */}
          <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <input type="hidden" name="t0" value={t0} />
          {debugEnabled && <input type="hidden" name="debug" value="1" />}
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

            <fieldset className="mt-6">
              <legend className="block text-sm font-medium text-navy mb-2">Authorize name usage</legend>
              <p className="text-xs text-navy/60 mb-2">Choose whether we can display your name with your story.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-navy/80">
                  <input type="radio" name="useName" value="yes" required className="h-4 w-4 text-brandOrange focus:ring-brandOrange" />
                  Yes — use my name in the story post
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-navy/80">
                  <input type="radio" name="useName" value="no" className="h-4 w-4 text-brandOrange focus:ring-brandOrange" />
                  No — keep me anonymous
                </label>
              </div>
            </fieldset>

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
  {/* Iframe removed: switched to fetch-based submission with no-cors fallback */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Render approved stories if available; otherwise show placeholders. If fewer than placeholders, fill remaining with placeholders. */}
          {visibleStories.map((st) => (
            <div key={st.id} className="card">
              <p className="text-sm italic mb-4">“{st.story}”</p>
              <p className="text-xs text-white/60">{st.name}</p>
              {editorMode && (
                <div className="mt-3">
                  <button type="button" className="text-xs text-red-200 underline" onClick={() => hideStory(st.id)}>Hide locally</button>
                </div>
              )}
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
