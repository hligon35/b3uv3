import Layout from '@/components/Layout';

export default function ContactPage() {
  return (
    <Layout>
      <section className="section-padding bg-gradient-to-br from-brandBlue-light to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-navy">Get in Touch</h1>
            <p className="text-xl text-navy/80 max-w-2xl mx-auto">Questions, collaboration ideas, partnership inquiries, or just want to share your story? We'd love to hear from you.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="card bg-white shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-navy">Send a Message</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Full Name *</label>
                  <input 
                    required 
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brandOrange focus:outline-none transition-colors bg-gray-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Email Address *</label>
                  <input 
                    required 
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brandOrange focus:outline-none transition-colors bg-gray-50 focus:bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Subject</label>
                  <select 
                    title="Select a subject for your message"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brandOrange focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  >
                    <option value="">Select a topic</option>
                    <option value="speaking">Speaking Engagement</option>
                    <option value="podcast">Podcast Guest</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="media">Media Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">Message *</label>
                  <textarea 
                    required 
                    rows={6}
                    placeholder="Tell us about your inquiry..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-brandOrange focus:outline-none transition-colors bg-gray-50 focus:bg-white resize-none" 
                  />
                </div>
                <button className="btn-primary w-full py-3 text-lg font-semibold" type="submit">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="card bg-white border-2 border-brandOrange/20">
                <h3 className="text-xl font-bold mb-4 text-navy">Ready to Connect?</h3>
                <p className="text-navy/80 mb-4">Whether you're looking to share your story, book a speaking engagement, or explore collaboration opportunities, every message matters. We read each one personally and typically respond within 24-48 hours.</p>
                <p className="text-sm text-brandOrange font-semibold">Breaking Cycles. Building Legacies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="section-padding bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-navy">Join the Community</h2>
          <p className="text-navy/70 mb-12 max-w-2xl mx-auto">Connect with thousands of others on their journey to break cycles and build legacies. Follow for daily inspiration, exclusive content, and community updates.</p>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* YouTube */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="text-3xl font-bold text-navy mb-1">1.26M</div>
                <div className="text-sm text-gray-600 mb-4">subscribers</div>
              </div>
              <p className="text-sm text-navy/80 leading-relaxed">Subscribe for motivational videos, the B3U podcast and more!</p>
              <a href="https://www.youtube.com/channel/UCSrtA1gGlgo4cQUzoSlzZ5w" target="_blank" rel="noopener" className="inline-block mt-4 text-red-500 font-semibold hover:text-red-600 transition-colors">Subscribe Now</a>
            </div>

            {/* Instagram */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="text-3xl font-bold text-navy mb-1">2.1M</div>
                <div className="text-sm text-gray-600 mb-4">followers</div>
              </div>
              <p className="text-sm text-navy/80 leading-relaxed">Follow me here for events, promotions, exclusive content and more!</p>
              <a href="#" className="inline-block mt-4 text-pink-500 font-semibold hover:text-pink-600 transition-colors">Follow Now</a>
            </div>

            {/* Facebook */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="text-3xl font-bold text-navy mb-1">1.7M</div>
                <div className="text-sm text-gray-600 mb-4">followers</div>
              </div>
              <p className="text-sm text-navy/80 leading-relaxed">Follow me here for events, promotions, exclusive content and more!</p>
              <a href="#" className="inline-block mt-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors">Follow Now</a>
            </div>

            {/* TikTok */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
                <div className="text-3xl font-bold text-navy mb-1">453K</div>
                <div className="text-sm text-gray-600 mb-4">followers</div>
              </div>
              <p className="text-sm text-navy/80 leading-relaxed">Follow me here for bonus motivational content.</p>
              <a href="#" className="inline-block mt-4 text-black font-semibold hover:text-gray-800 transition-colors">Follow Now</a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
