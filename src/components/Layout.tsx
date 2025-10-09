import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();
  const isHomePage = pathname === '/';
  
  return (
    <>
      <Navbar />
      <main className={isHomePage ? '' : 'pt-20'}>
        {children}
      </main>
      <Footer />
    </>
  );
}
