// client/src/pages/PrivacyPolicy.jsx
import { Shield, Lock, Eye, Database, Mail, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: [
      'Personal information you provide when creating an account (name, email address, shipping address).',
      'Payment information processed securely through our payment providers.',
      'Order history and browsing behavior on our platform.',
      'Device information and IP address for security and analytics purposes.',
    ],
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: [
      'To process and fulfill your book orders and send order confirmations.',
      'To personalize your experience and recommend books based on your interests.',
      'To send newsletters and promotional emails (only if you opt in).',
      'To improve our website, services, and customer support.',
    ],
  },
  {
    icon: Lock,
    title: 'How We Protect Your Data',
    content: [
      'All data is encrypted using industry-standard SSL/TLS encryption.',
      'Payment information is never stored on our servers.',
      'We conduct regular security audits and vulnerability assessments.',
      'Access to personal data is restricted to authorized personnel only.',
    ],
  },
  {
    icon: Shield,
    title: 'Your Rights',
    content: [
      'You have the right to access, update, or delete your personal information at any time.',
      'You can opt out of marketing emails by clicking "Unsubscribe" in any email.',
      'You may request a copy of all data we hold about you.',
      'You can request data portability or restriction of processing.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <div className="bg-warm-900 text-cream-100 py-16">
        <div className="page-container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-cream-400 mb-6">
            <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-cream-200">Privacy Policy</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Your privacy matters to us. This policy explains how BookHaven collects,
            uses, and protects your personal information.
          </p>
          <p className="text-sm text-cream-500 mt-4">Last updated: January 1, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-14">
        <div className="max-w-3xl mx-auto">

          {/* Intro */}
          <div className="bg-white rounded-2xl p-6 border border-cream-200 mb-8 shadow-sm">
            <p className="text-warm-700 leading-relaxed">
              At <strong>BookHaven</strong>, we are committed to protecting your privacy
              and ensuring the security of your personal information. This Privacy Policy
              describes our practices regarding the collection, use, and disclosure of your
              information when you use our services.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map(({ icon: Icon, title, content }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-warm-900">{title}</h2>
                </div>
                <ul className="space-y-3">
                  {content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-warm-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-brand-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-warm-900 mb-1">Questions about your privacy?</h3>
                <p className="text-sm text-warm-600 mb-3">
                  If you have any questions or concerns about this Privacy Policy,
                  please contact our Privacy Team.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-600
                             hover:text-brand-700 transition-colors"
                >
                  Contact Us <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}