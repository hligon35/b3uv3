import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroBg from '@/images/content/about2.jpeg';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={HeroBg}
          alt="Bree Charles hero background"
          fill
          priority
          className="object-cover object-[center_50%] opacity-30"
          sizes="100vw"
        />
      </div>
      <div className="section-padding relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-display font-bold mb-6"
        >
          You don't have to stay where life left you — <span className="text-brandOrange">you can rise, rebuild, and become unstoppable.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-6"
        >
          Transformational Speaker | Author | U.S. Army Veteran | Creator of the B3U Podcast
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl mx-auto text-base md:text-lg text-white/80 mb-10 italic"
        >
          Breaking Cycles. Building Legacies.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/podcast" className="btn-primary">Listen to The B3U Podcast</Link>
          <Link href="/contact" className="btn-outline">Book Bree to Speak</Link>
        </motion.div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest">SCROLL</div>
    </section>
  );
}
