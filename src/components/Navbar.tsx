import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/community', label: 'Community' },
  { href: '/shop', label: 'Shop' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { pathname } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  
  // Check if we're on the homepage to determine initial styling
  const isHomePage = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // For homepage: start transparent with white text, become white bg with dark text on scroll
  // For other pages: always white bg with dark text
  const bgClass = scrolled || !isHomePage ? 'bg-white/95 shadow-lg' : 'bg-transparent';
  const textClass = scrolled || !isHomePage ? 'text-navy' : 'text-white';
  
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition backdrop-blur ${bgClass}`}>
      <nav className={`max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-20 ${textClass}`}>
        <Link href="/" className={`flex items-center gap-2 font-display text-2xl tracking-wide ${textClass}`}>
          <span className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-brandBlue to-brandOrange"></span>
          <span>B3U</span>
        </Link>
        <ul className="hidden md:flex items-center gap-8 font-semibold">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative py-2 transition-colors duration-200 hover:text-brandOrange after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-brandOrange after:transition-all after:duration-300 ${
                  pathname === item.href 
                    ? 'text-brandOrange after:w-full' 
                    : `${textClass} after:w-0 hover:after:w-full`
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="md:hidden">
          {/* Mobile menu placeholder - implement drawer later */}
          <button className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
            scrolled || !isHomePage 
              ? 'bg-brandBlue text-white hover:bg-brandBlue-dark' 
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
          }`}>
            Menu
          </button>
        </div>
      </nav>
    </header>
  );
}
