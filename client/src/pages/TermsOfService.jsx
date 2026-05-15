// client/src/pages/TermsOfService.jsx
import { FileText, ShoppingCart, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    icon: BookOpen,
    title: 'Use of Service',
    content: [
      'You must be at least 13 years old to create an account and use BookHaven.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You agree not to use the service for any unlawful or prohibited activities.',
      'We reserve the right to terminate accounts that violate our terms.',
    ],
  },
  {
    icon: ShoppingCart,
    title: 'Orders & Payments',
    content: [
      'All prices are listed in USD and are subject to change without notice.',
      'Orders are confirmed only after successful payment processing.',
      'We reserve the right to cancel orders due to pricing errors or stock unavailability.',
      'Payment is processed securely through our trusted payment partners.',
    ],
  },
  {
    icon: FileText,
    title: 'Intellectual Property',
    content: [
      'All content on BookHaven, including text, images, and logos, is our property.',
      'Book content is protected by copyright and owned by respective authors/publishers.',
      'You may not reproduce, distribute, or create derivative works without permission.',
      'User-submitted reviews may be used by BookHaven for promotional purposes.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Limitation of Liability',
    content: [
      'BookHaven is not liable for indirect, incidental, or consequential damages.',
      'We do not guarantee uninterrupted or error-free access to our services.',
      'Our liability is limited to the amount paid for the specific order in question.',
      'We are not responsible for third-party links or content on our platform.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <div className="bg-warm-900 text-cream-100 py-16">
        <div className="page-container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-cream-400 mb-6">
            <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-cream-200">Terms of Service</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Please read these terms carefully before using BookHaven. By accessing
            our services, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-cream-500 mt-4">Last updated: January 19, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-14">
        <div className="max-w-3xl mx-auto">

          {/* Intro */}
          <div className="bg-white rounded-2xl p-6 border border-cream-200 mb-8 shadow-sm">
            <p className="text-warm-700 leading-relaxed">
              Welcome to <strong>BookHaven</strong>. These Terms of Service govern your
              use of our website and services. By creating an account or making a purchase,
              you acknowledge that you have read, understood, and agree to be bound by
              these terms.
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

          {/* Agreement note */}
          <div className="mt-8 bg-warm-50 border border-warm-200 rounded-2xl p-6">
            <p className="text-sm text-warm-600 leading-relaxed">
              By continuing to use BookHaven, you acknowledge that you have read and
              understood these Terms of Service. We reserve the right to modify these
              terms at any time. Continued use of our services constitutes acceptance
              of any changes.
            </p>
            <div className="flex gap-4 mt-4">
              <Link
                to="/privacy-policy"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Privacy Policy →
              </Link>
              <Link
                to="/shipping-policy"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Shipping Policy →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}