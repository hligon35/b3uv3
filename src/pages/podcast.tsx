import Layout from '@/components/Layout';
import Link from 'next/link';

export default function PodcastPage() {
  const episodes = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Episode ${i + 1}`,
    guest: ['Leadership','Grit','Service','Wellness'][i % 4],
  }));

  const filters = ['All','Leadership','Grit','Service','Wellness'];

  return (
    <Layout>
      <section className="section-padding">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">The Podcast</h1>
            <p className="max-w-2xl text-white/80">Browse all episodes. Filter by theme and dive into powerful conversations that inspire action and purpose.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {filters.map(f => (
              <button key={f} className="btn-light text-xs md:text-sm">{f}</button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {episodes.map(ep => (
            <div key={ep.id} className="card">
              <div className="h-40 rounded-md bg-[url('https://picsum.photos/400/300?episode=${ep.id}')] bg-cover bg-center mb-4" />
              <h3 className="font-semibold mb-1">{ep.title}</h3>
              <p className="text-xs uppercase tracking-wide text-brandOrange mb-2">{ep.guest}</p>
              <p className="text-sm text-white/70 mb-4">Brief hook summary for the listener—why this episode matters.</p>
              <Link href="#" className="text-brandOrange hover:underline text-sm font-medium">Play Episode →</Link>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col sm:flex-row gap-4">
            <Link href="#" className="btn-primary">Subscribe on Spotify</Link>
            <Link href="#" className="btn-outline">Apple Podcasts</Link>
        </div>
      </section>
    </Layout>
  );
}
