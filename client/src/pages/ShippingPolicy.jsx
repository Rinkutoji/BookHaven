// client/src/pages/ShippingPolicy.jsx
import { Truck, Package, RefreshCw, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const shippingRates = [
  { method: 'Standard Shipping',  time: '5–7 business days',  price: '$3.99',  free: 'Free over $35' },
  { method: 'Express Shipping',   time: '2–3 business days',  price: '$8.99',  free: 'Free over $75' },
  { method: 'Overnight Shipping', time: '1 business day',     price: '$19.99', free: null            },
];

const sections = [
  {
    icon: Clock,
    title: 'Processing Time',
    content: [
      'Orders are processed within 1–2 business days after payment confirmation.',
      'Orders placed on weekends or holidays are processed the next business day.',
      'You will receive a confirmation email with tracking information once shipped.',
      'Pre-order items ship on their release date or within 2 days of release.',
    ],
  },
  {
    icon: MapPin,
    title: 'Shipping Destinations',
    content: [
      'We currently ship to all 50 US states and US territories.',
      'International shipping is available to over 30 countries worldwide.',
      'International orders may be subject to customs duties and import taxes.',
      'PO Boxes and APO/FPO military addresses are supported for standard shipping.',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Returns & Exchanges',
    content: [
      'We accept returns within 30 days of delivery for unused, undamaged books.',
      'Digital/eBook purchases are non-refundable once downloaded.',
      'To initiate a return, contact our support team with your order number.',
      'Refunds are processed within 5–7 business days after we receive the return.',
    ],
  },
  {
    icon: Package,
    title: 'Damaged or Lost Orders',
    content: [
      'If your order arrives damaged, contact us within 7 days with photos.',
      'We will send a replacement or issue a full refund at no additional cost.',
      'For lost packages, we will investigate with the carrier within 5 business days.',
      'We recommend keeping your tracking number until the order is received.',
    ],
  },
];

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <div className="bg-warm-900 text-cream-100 py-16">
        <div className="page-container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-cream-400 mb-6">
            <Link to="/" className="hover:text-brand-400 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-cream-200">Shipping Policy</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center">
              <Truck size={24} className="text-white" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Shipping Policy</h1>
          </div>
          <p className="text-cream-400 max-w-2xl">
            Everything you need to know about shipping, delivery times,
            and returns at BookHaven.
          </p>
          <p className="text-sm text-cream-500 mt-4">Last updated: January 1, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-14">
        <div className="max-w-3xl mx-auto">

          {/* Shipping Rates Table */}
          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-100">
              <h2 className="font-display text-lg font-semibold text-warm-900 flex items-center gap-2">
                <Truck size={18} className="text-brand-500" />
                Shipping Rates
              </h2>
            </div>
            <div className="divide-y divide-cream-100">
              {shippingRates.map(({ method, time, price, free }) => (
                <div key={method} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-warm-900 text-sm">{method}</p>
                    <p className="text-xs text-warm-500 mt-0.5">{time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-warm-900 text-sm">{price}</p>
                    {free && (
                      <p className="text-xs text-brand-600 mt-0.5">{free}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

          {/* Help */}
          <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Package size={20} className="text-brand-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-warm-900 mb-1">Need help with your order?</h3>
                <p className="text-sm text-warm-600 mb-3">
                  Our support team is available Monday–Friday, 9am–6pm EST.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-600
                             hover:text-brand-700 transition-colors"
                >
                  Contact Support <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}