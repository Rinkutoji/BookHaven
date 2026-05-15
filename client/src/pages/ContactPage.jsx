// client/src/pages/ContactPage.jsx
import { useState } from 'react';
import { Mail, MessageCircle, Clock, MapPin, Send, CheckCircle } from 'lucide-react';
import api from '../lib/api';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'bookhaven77677@gmail.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Clock,
    title: 'Support Hours',
    detail: 'Mon – Fri, 9am – 6pm',
    sub: 'Cambodia Standard Time (ICT)',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    detail: 'Available on weekdays',
    sub: 'Look for the chat icon below',
  },
  {
    icon: MapPin,
    title: 'Based In',
    detail: 'Phnom Penh, Cambodia',
    sub: 'Serving readers worldwide',
  },
];

const topics = [
  'Order Issue',
  'Payment Problem',
  'Book Recommendation',
  'Return / Refund',
  'Account Help',
  'Other',
];

const FAQ = [
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 3-7 business days. Express options are available at checkout.',
  },
  {
    q: 'Can I return a book?',
    a: 'Yes — within 14 days of delivery for undamaged items. Contact us to start a return.',
  },
  {
    q: 'My payment failed. What do I do?',
    a: 'Double-check your card details or try a different payment method. Still stuck? Email us.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'We currently ship within Cambodia and to select Southeast Asian countries.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // If you have a contact endpoint, call it here.
      // For now simulate a short delay then success.
      await new Promise((r) => setTimeout(r, 1200));
      // await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', topic: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-warm-900 text-cream-100 py-20 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30
                          text-brand-400 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <Mail size={14} />
            Get In Touch
          </div>
          <h1 className="font-display text-5xl font-bold text-cream-100 mb-4">
            We'd Love to <span className="text-brand-400">Hear From You</span>
          </h1>
          <p className="text-cream-300 text-lg max-w-xl mx-auto">
            Questions about your order, book recommendations, or just want to say hi?
            Our team is here for you.
          </p>
        </div>
      </section>

      {/* ── Info Cards ───────────────────────────────────────── */}
      <section className="page-container -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contactInfo.map((c) => (
            <div key={c.title}
                 className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <c.icon size={18} className="text-brand-500" />
              </div>
              <p className="font-display font-semibold text-gray-800 text-sm mb-1">{c.title}</p>
              <p className="text-sm text-gray-700 font-medium">{c.detail}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form + FAQ ───────────────────────────────────────── */}
      <section className="page-container py-20">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* Contact Form — 3 cols */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-3xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
            <p className="text-gray-500 mb-8 text-sm">We read every message and reply within one business day.</p>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => setStatus('idle')}
                        className="btn-primary text-sm">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="name" value={form.name}
                      onChange={handleChange} required
                      placeholder="Name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email" name="email" value={form.email}
                      onChange={handleChange} required
                      placeholder="Email"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                  <select name="topic" value={form.topic} onChange={handleChange}
                          className="input-field">
                    <option value="">Select a topic…</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message" value={form.message}
                    onChange={handleChange} required rows={6}
                    placeholder="Tell us how we can help…"
                    className="input-field resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <button type="submit" disabled={status === 'loading'}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  {status === 'loading' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                      rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ — 2 cols */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl font-bold text-gray-800 mb-2">FAQs</h2>
            <p className="text-gray-500 mb-8 text-sm">Quick answers to common questions.</p>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div key={i}
                    className="bg-white border border-orange-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                  >
                    <span className="font-medium text-gray-800 text-sm">{item.q}</span>
                    <span className={`text-brand-500 text-lg font-bold transition-transform duration-200
                                    flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-orange-50">
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Direct email fallback */}
            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-700 mb-1">Still need help?</p>
              <p className="text-sm text-gray-500 mb-3">
                Email us directly and we'll sort it out.
              </p>
              <a href="mailto:support@bookhaven.com"
                className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600
                            font-medium text-sm transition-colors">
                <Mail size={14} />
                bookhaven77677@gmail.com
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}