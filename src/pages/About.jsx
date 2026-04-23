import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, ArrowRight, MapPin, Users, Star, Calendar } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80';
const STORY_IMG = 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80';

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const { t } = useLanguage();

  const team = [
    { name: 'Budi Santoso', role: 'Founder & CEO', initials: 'BS', color: 'from-emerald-400 to-teal-500' },
    { name: 'Sari Dewi', role: 'Tour Manager', initials: 'SD', color: 'from-teal-400 to-cyan-500' },
    { name: 'Reza Pratama', role: 'Head Guide', initials: 'RP', color: 'from-cyan-400 to-blue-500' },
    { name: 'Mira Kusuma', role: 'Customer Service', initials: 'MK', color: 'from-violet-400 to-purple-500' },
  ];

  const milestones = t('about.milestones');

  const stats = [
    { value: '5+', label: t('about.stat1'), icon: <Calendar className="w-5 h-5" /> },
    { value: '3.000+', label: t('about.stat2'), icon: <Users className="w-5 h-5" /> },
    { value: '50+', label: t('about.stat3'), icon: <MapPin className="w-5 h-5" /> },
    { value: '4.9★', label: t('about.stat4'), icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <>
      <Seo
        title={t('about.seoTitle')}
        description={t('about.seoDescription')}
        image={HERO_IMG}
      />

      {/* Hero */}
      <div className="relative min-h-[55vh] flex items-center justify-center overflow-hidden mt-16">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            🌿 {t('about.storyEyebrow')}
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            {t('about.heroTitle')}
          </h1>
          <p className="text-white/75 text-xl leading-relaxed">{t('about.heroDescription')}</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-emerald-600">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className={`py-6 px-4 text-center ${i < 3 ? 'md:border-r border-emerald-500' : ''}`}>
              <div className="flex items-center justify-center gap-2 text-emerald-200 mb-1">
                {s.icon}
              </div>
              <div className="text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-emerald-200 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">{t('about.storyEyebrow')}</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6 leading-tight">{t('about.storyTitle')}</h2>
              <div className="space-y-4">
                {[t('about.storyParagraph1'), t('about.storyParagraph2'), t('about.storyParagraph3')].map((p, i) => (
                  <p key={i} className="text-gray-600 text-lg leading-relaxed">{p}</p>
                ))}
              </div>
              <Link to="/open-trip" className="inline-flex items-center gap-2 mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                {t('about.seeOpenTrip')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="absolute -top-4 -left-4 w-full h-full bg-emerald-100 rounded-3xl" />
              <img src={STORY_IMG} alt="Tim Liburan Terus" className="relative rounded-3xl w-full h-80 md:h-[480px] object-cover shadow-2xl" />
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-600 fill-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm leading-none">4.9 / 5</p>
                  <p className="text-gray-400 text-xs mt-0.5">{t('about.stat4')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Mission Values */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Fondasi Kami</span>
            <h2 className="text-4xl font-extrabold text-white mt-3">{t('about.visionMissionTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Eye className="w-7 h-7" />, title: t('about.visionTitle'), desc: t('about.visionDescription'), gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: <Target className="w-7 h-7" />, title: t('about.missionTitle'), desc: t('about.missionDescription'), gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-500/10 border-teal-500/20' },
              { icon: <Heart className="w-7 h-7" />, title: t('about.valuesTitle'), desc: t('about.valuesDescription'), gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10 border-violet-500/20' },
            ].map((card, i) => (
              <div key={i} className={`border rounded-2xl p-8 ${card.bg}`}>
                <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Perjalanan Kami</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3">{t('about.journeyTitle')}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className={`flex items-center gap-6 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 shadow-sm`}>
                      <p className="text-gray-700 font-medium">{m.event}</p>
                    </div>
                  </div>
                  <div className="relative z-10 shrink-0">
                    <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-lg shadow-emerald-200 ring-4 ring-white">
                      {m.year}
                    </div>
                  </div>
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Tim Kami</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-3">{t('about.teamTitle')}</h2>
            <p className="text-gray-500 mt-3 text-lg">{t('about.teamDescription')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className={`h-32 bg-gradient-to-br ${member.color} flex items-center justify-center`}>
                  <span className="text-4xl font-extrabold text-white opacity-90">{member.initials}</span>
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-emerald-600 text-sm mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">{t('about.ctaTitle')}</h2>
          <p className="text-emerald-100 text-lg mb-10 leading-relaxed">{t('about.ctaDescription')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/open-trip"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
              {t('about.seeOpenTrip')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/private-trip"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-colors">
              {t('about.privateTrip')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
