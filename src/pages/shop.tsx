import Layout from '@/components/Layout';
import Link from 'next/link';
import MerchComingSoon from '@/components/MerchComingSoon';

export default function ShopPage() {
  return (
    <Layout
      title="Shop | B3U Merch | Richmond, VA"
      description="Shop B3U merch and support the mission. Based in Richmond, VA and serving surrounding Central Virginia communities."
    >
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop</h1>
          <p className="max-w-2xl mx-auto text-navy/80 mb-8">The store is being refreshed right now. The next B3U merch drop is coming soon with new pieces designed to support the mission.</p>
          <MerchComingSoon />
          <div className="mt-8 flex justify-center">
            <Link href="/contact" className="btn-outline">Contact Us About Upcoming Merch</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
