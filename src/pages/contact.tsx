import Layout from '@/components/Layout';

export default function ContactPage() {
  return (
    <Layout>
      <section className="section-padding">
        <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
        <p className="max-w-xl text-white/80 mb-10">Questions, collaboration ideas, partnership inquiries, or just want to share your story? Reach out below.</p>
        <form className="max-w-xl space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input required type="email" className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea required rows={6} className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brandBlue" />
          </div>
          <button className="btn-primary" type="submit">Send Message</button>
        </form>
      </section>
      <section className="section-padding bg-brandBlue-dark/25">
        <h2 className="text-2xl font-semibold mb-4">Social & Presence</h2>
        <ul className="space-y-2 text-sm">
          {['Instagram','YouTube','TikTok','LinkedIn'].map(s => (
            <li key={s}><a href="#" className="hover:text-brandOrange">{s}</a></li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
