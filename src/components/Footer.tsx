import Link from 'next/link';
import Image from 'next/image';
import B3ULogo from '@/images/logos/B3U3D.png';

export default function Footer() {
  return (
    <footer className="bg-navy text-white border-t border-white/10 mt-32">
      <div className="section-padding grid md:grid-cols-4 gap-12">
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
        <div>
          <h4 className="font-semibold mb-3 text-brandOrange">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="text-white/80 hover:text-brandOrange" href="https://www.youtube.com/channel/UCSrtA1gGlgo4cQUzoSlzZ5w" target="_blank" rel="noopener">YouTube</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="#" target="_blank">Instagram</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="#" target="_blank">Facebook</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="#" target="_blank">TikTok</a></li>
            <li><a className="text-white/80 hover:text-brandOrange" href="#" target="_blank">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-brandOrange">The Take Back Weekly</h4>
          <p className="text-sm text-white/70 mb-3">Get new episodes, inspiration, and community opportunities delivered to your inbox.</p>
          <form className="space-y-3">
            <input type="email" placeholder="Email address" className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
            <button className="btn-primary w-full" type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="text-center py-6 text-xs text-white/50">© {new Date().getFullYear()} B3U. All rights reserved.</div>
    </footer>
  );
}
