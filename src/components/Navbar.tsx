import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import B3ULogo from '@/images/logos/B3U3D.png';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if we're on the homepage to determine initial styling
  const isHomePage = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // For homepage: start transparent with white text, become white bg with dark text on scroll
  // For other pages: always white bg with dark text
  const bgClass = scrolled || !isHomePage ? 'bg-white/95 shadow-lg' : 'bg-transparent';
  const textClass = scrolled || !isHomePage ? 'text-navy' : 'text-white';
  
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition backdrop-blur ${bgClass}`}>
      <nav className={`max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-20 ${textClass}`}>
        <Link href="/" className={`flex items-center font-display text-2xl tracking-wide ${textClass}`}>
          <div className="h-30 w-30 relative">
            <Image 
              src={B3ULogo} 
              alt="B3U Logo"
              fill
              className="object-contain"
            />
          </div>
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
          {/* Mobile menu button */}
          <button 
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
              scrolled || !isHomePage 
                ? 'bg-brandBlue text-white hover:bg-brandBlue-dark' 
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      pathname === item.href
                        ? 'bg-brandBlue text-white'
                        : 'text-navy hover:bg-brandBlue hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
