import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import B3ULogo from '@/images/logos/B3U3D.png';

export default function Footer() {
  const FORMS_API = (process.env.NEXT_PUBLIC_FORMS_API || '').replace(/\/$/, '');
  const [footSubbed, setFootSubbed] = useState(false);
  const [footPending, setFootPending] = useState(false);
  const footIframeRef = useRef<HTMLIFrameElement | null>(null);
  const onFootSubmit = () => {
    setFootPending(true);
    setTimeout(() => {
      setFootSubbed(true);
      setFootPending(false);
    }, 1200);
  };
  return (
    <footer className="bg-navy text-white border-t border-white/10 mt-32">
      <div className="section-padding grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-30 w-30 relative">
              <Image 
                src={B3ULogo} 
                alt="B3U Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="mb-4">
            <p className="text-lg font-script text-brandOrange mb-2">Bree Charles</p>
            <p className="text-sm text-white/70 italic">Breaking Cycles. Building Legacies.</p>
          </div>
          <p className="text-sm text-white/70 max-w-xs">Burn, Break, Become Unstoppable. Transforming pain into purpose through authentic storytelling and community.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-brandOrange">Explore</h4>
          <ul className="space-y-2 text-sm">
            {['Home','About','Podcast','Community','Shop','Contact'].map(item => (
              <li key={item}><Link className="text-white/80 hover:text-brandOrange" href={`/${item === 'Home' ? '' : item.toLowerCase()}`}>{item}</Link></li>
            ))}
          </ul>
        </div>
        {/* New dedicated Contact column */}
        <div>
          <h4 className="font-semibold mb-3 text-brandOrange">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="text-white/80 hover:text-brandOrange" href="tel:+18043852512">
                (804) 385-2512
              </a>
            </li>
            <li>
              <a
                className="text-white/80 hover:text-brandOrange"
                href="https://www.google.com/maps?q=9221+Forest+Hill+Ave+Suite+1+PMB+1021,+Richmond,+VA+23235"
                target="_blank"
                rel="noopener noreferrer"
              >
                9221 Forest Hill Ave Suite 1 PMB 1021, Richmond, VA 23235
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-brandOrange">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="text-white/80 hover:text-brandOrange" href="https://www.youtube.com/channel/UCSrtA1gGlgo4cQUzoSlzZ5w" target="_blank" rel="noopener">YouTube</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="https://www.instagram.com/burnbreakbecomeunstoppable/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="https://www.facebook.com/bree.b3u" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="https://www.tiktok.com/@bree_charles" target="_blank" rel="noopener noreferrer">TikTok</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="https://www.linkedin.com/in/bridget-charles-375534169?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-brandOrange">The Take Back Weekly</h4>
          <p className="text-sm text-white/70 mb-3">Get new episodes, inspiration, and community opportunities delivered to your inbox.</p>
          <form
            action={FORMS_API ? `${FORMS_API}/newsletter` : undefined}
            method="POST"
            className="space-y-3"
            target="footer_news_iframe"
            onSubmit={onFootSubmit}
          >
            <input name="email" type="email" required placeholder="Email address" className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
            <button className="btn-primary w-full disabled:opacity-50" type="submit" disabled={footPending}>
              {footPending ? 'Subscribing…' : 'Subscribe'}
            </button>
            {footSubbed && (
              <div className="text-green-200 bg-green-900/30 border border-green-700/50 rounded-md px-3 py-2 text-xs">Thanks! You’re subscribed.</div>
            )}
          </form>
          <iframe name="footer_news_iframe" ref={footIframeRef} className="hidden" title="footer_news_iframe" />
        </div>
      </div>
      <div className="text-center py-6 text-xs text-white/50">© {new Date().getFullYear()} B3U. All rights reserved.</div>
    </footer>
  );
}
