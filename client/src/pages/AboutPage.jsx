// client/src/pages/AboutPage.jsx
import { BookOpen, Heart, Users, Star, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Team photos — filenames ត្រូវនឹង assets/team/ ពិតប្រាកដ ──────────────
import SeavMengImg from '../assets/team/Seav-Meng.png';
import PisethImg   from '../assets/team/Piseth.png';
import MengImg     from '../assets/team/Meng.png';
import NeasaImg    from '../assets/team/Neasa.png';   // ← Neadsa (មាន d)
import TeamGroupImg from '../assets/team/Kmengbatsongkom.png';

const stats = [
  { value: '10,000+', label: 'Happy Readers' },
  { value: '80+',     label: 'Curated Books' },
  { value: '15+',     label: 'Genres' },
  { value: '24h',     label: 'Support Response' },
];

const values = [
  {
    icon: Heart,
    title: 'Passion for Reading',
    desc: 'Every book in our collection is hand-picked by readers, for readers. We believe the right book can change a life.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Quality',
    desc: 'We only carry titles we stand behind — genuine editions, fair pricing, and honest descriptions.',
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    desc: "Your books are carefully packed and shipped promptly. We treat every order like it's going to a friend.",
  },
  {
    icon: Users,
    title: 'Community First',
    desc: "BookHaven is more than a store — it's a gathering place for people who love stories.",
  },
];

const team = [
  {
    name:   'Seav Meng',
    role:   'Founder & Chief Reader',
    avatar: 'SM',
    color:  'bg-orange-100 text-orange-600',
    photo:  SeavMengImg,
    bio:    'Started BookHaven after realizing great books were too hard to find in one place.',
  },
  {
    name:   'Piseth',
    role:   'Head of Curation',
    avatar: 'PS',
    color:  'bg-amber-100 text-amber-600',
    photo:  PisethImg,
    bio:    'Has read over 500 books and still counting. Obsessed with finding hidden gems.',
  },
  {
    name:   'Meng',
    role:   'Branch Supervisor',
    avatar: 'MG',
    color:  'bg-yellow-100 text-yellow-700',
    photo:  MengImg,
    bio:    'Responsible for managing daily operations at a BookHaven branch, ensuring smooth workflow and maintaining service quality.',
  },
  {
    name:   'Neasa',
    role:   'Reader Engagement Manager',
    avatar: 'NS',
    color:  'bg-lime-100 text-lime-700',
    photo:  NeasaImg,
    bio:    'Passionate about helping readers discover books that inspire, entertain, and educate.',
  },
];

function TeamAvatar({ member }) {
  return (
    <div className="relative w-20 h-20 mx-auto mb-4">
      <img
        src={member.photo}
        alt={member.name}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextSibling.style.display = 'flex';
        }}
        className="w-20 h-20 rounded-2xl object-cover object-center border-2 border-orange-100 shadow-sm"
      />
      <div
        style={{ display: 'none' }}
        className={`w-20 h-20 ${member.color} rounded-2xl items-center justify-center
                    font-display text-xl font-bold border-2 border-orange-100`}
      >
        {member.avatar}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50">

      {/* Hero */}
      <section className="relative bg-warm-900 text-cream-100 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30
                          text-brand-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <BookOpen size={14} />
            Our Story
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-cream-100 mb-6 leading-tight">
            A Cozy Corner for<br />
            <span className="text-brand-400">Book Lovers</span>
          </h1>
          <p className="text-cream-300 text-lg max-w-2xl mx-auto leading-relaxed">
            BookHaven was born from a simple belief — that every reader deserves
            a place where discovering your next favourite book feels effortless, warm, and joyful.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="page-container -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label}
                 className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 text-center">
              <p className="font-display text-3xl font-bold text-brand-500 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="page-container py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-display text-4xl font-bold text-gray-800 mb-6">
              Why We Built BookHaven
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>It started with frustration. Finding a quality bookstore that was easy to navigate, had honest reviews, and actually stocked the books you were looking for felt impossible — especially online.</p>
              <p>So we built the store we always wanted: a curated collection of books across every genre, a seamless shopping experience, and a team of real readers behind every recommendation.</p>
              <p>Whether you're a lifelong bibliophile or picking up your first novel in years, BookHaven is your home.</p>
            </div>
            <Link to="/books" className="inline-flex items-center gap-2 mt-8 btn-primary">
              <BookOpen size={16} />
              Browse Our Collection
            </Link>
          </div>
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-10">
              <Star size={32} className="text-brand-400 mb-4" />
              <blockquote className="font-display text-2xl font-semibold text-gray-800 leading-snug mb-6">
                "A reader lives a thousand lives before he dies. The man who never reads lives only one."
              </blockquote>
              <p className="text-sm text-gray-400 font-medium">— George R.R. Martin</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-500/10 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-200/60 rounded-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-gray-800 mb-3">What We Stand For</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              These aren't just words on a wall — they're the principles behind every decision we make.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title}
                   className="group bg-amber-50 hover:bg-orange-50 border border-orange-100
                              rounded-2xl p-6 transition-colors duration-200">
                <div className="w-11 h-11 bg-orange-100 group-hover:bg-brand-500
                                rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <v.icon size={20} className="text-brand-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team — with background photo */}
      <section className="relative overflow-hidden" style={{ minHeight: '580px' }}>

        {/* Background group photo */}
        <img
          src={TeamGroupImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
        />

        {/* Scrim */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 px-4 py-14 md:py-20 max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
              Meet the Team
            </h2>
            <p className="text-white/80 text-sm md:text-base drop-shadow-sm">
              Real people who love books, here to help you find your next great read.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {team.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-white/25 p-4 md:p-6 text-center
                           hover:-translate-y-1 hover:border-white/50 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div className="relative w-14 h-14 md:w-20 md:h-20 mx-auto mb-3 md:mb-4">
                  <img
                    src={m.photo}
                    alt={m.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover object-center border-2 border-white/30 shadow-sm"
                  />
                  <div
                    style={{ display: 'none' }}
                    className={`w-14 h-14 md:w-20 md:h-20 ${m.color} rounded-xl md:rounded-2xl items-center justify-center
                                font-display text-base md:text-xl font-bold border-2 border-white/30`}
                  >
                    {m.avatar}
                  </div>
                </div>
                <h3 className="font-display font-semibold text-white text-sm md:text-base drop-shadow leading-tight">{m.name}</h3>
                <p className="text-xs text-orange-300 font-medium mb-2 leading-tight">{m.role}</p>
                <p className="text-xs md:text-sm text-white/75 leading-relaxed hidden sm:block">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Trip to Angkor Wat */}
      <section className="bg-amber-50 py-14 md:py-20">
        <div className="page-container px-4">
          <div className="max-w-3xl mx-auto">

            {/* Badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🏛️</span>
              <span className="text-xs font-semibold tracking-widest text-brand-500 uppercase">
                Team Adventure
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-4xl font-bold text-gray-800 mb-4 leading-snug">
              ដំណើរកម្សាន្តទៅ<br className="md:hidden" />
              <span className="text-brand-500"> អង្គរវត្ត</span>
            </h2>

            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                កាលពីពីរឆ្នាំមុន ក្រុមការងារ BookHaven បានធ្វើដំណើរទៅកាន់ <strong className="text-gray-800">អង្គរវត្ត</strong>
                ជាមួយគ្នា — ដំណើរដ៏ពិសេសមួយដែលគ្មានអ្នកណានឹងភ្លេចឡើយ។
                ចាប់ពីព្រឹកព្រលឹម យើងបានដើរតាមផ្លូវថ្ម ឆ្ពោះទៅកាន់ប្រាសាទដ៏ធំ
                ខណៈពន្លឺព្រះអាទិត្យពណ៌មាសចាំងលើទឹកត្រពាំង។
              </p>
              <p>
                ប្រាសាទអង្គរវត្ត — ស្នាដៃស្ថាបត្យកម្មខ្មែរដ៏អស្ចារ្យ — បានធ្វើឱ្យ
                ក្រុមយើងដឹងថា ប្រវត្តិសាស្ត្រ វប្បធម៌ និងភាពស្រស់ស្អាតនៃ
                ខ្មែរ គឺជារឿងដែលត្រូវថែរក្សា ហើយចែករំលែក — ដូចរបៀបដែល
                BookHaven ចែករំលែកសៀវភៅល្អៗទៅដល់អ្នកអានដែរ។
              </p>
              <p>
                ពេលដែលក្រុមនោះឈររួមគ្នានៅចំពោះមុខប្រាសាទ ថតរូបនៅក្រោមមែកឈើ
                បូព៌ាក្រហម — យើងបានយល់ថា ការធ្វើការជាក្រុមមួយ មិនត្រឹមតែ
                ផ្តល់លទ្ធផលល្អប៉ុណ្ណោះទេ ថែមទាំងបង្កើតនូវចំណងមិត្តភាពដ៏ស្ទាបអង្គចិត្ត
                ផងដែរ។
              </p>
            </div>

            {/* Pull quote */}
            <div
              className="mt-8 rounded-2xl border-l-4 border-brand-500 pl-5 pr-5 py-5"
              style={{ background: 'rgba(234,88,12,0.06)' }}
            >
              <p className="font-display text-base md:text-lg font-semibold text-gray-800 leading-snug mb-2">
                "ការធ្វើដំណើររួមគ្នា ធ្វើឱ្យយើងស្រឡាញ់គ្នា និងស្រឡាញ់ការងារ
                ច្រើនជាងមុន។"
              </p>
              <p className="text-xs text-brand-500 font-medium">— ក្រុមការងារ BookHaven</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {['🌿 អង្គរវត្ត', '📚 Team BookHaven', '🇰🇭 កម្ពុជា', '☀️ ដំណើរកម្សាន្ត',"ស្រឡាញ់ការរាប់អាន"].map(tag => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-warm-900 py-16">
        <div className="page-container text-center">
          <h2 className="font-display text-3xl font-bold text-cream-100 mb-4">
            Ready to find your next favourite book?
          </h2>
          <p className="text-cream-300 mb-8">Join thousands of readers who call BookHaven home.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/books" className="btn-primary">Shop Now</Link>
            <Link to="/contact"
                  className="px-6 py-2.5 border border-white/30 text-cream-200 rounded-xl
                             hover:bg-white/10 transition-colors text-sm font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}