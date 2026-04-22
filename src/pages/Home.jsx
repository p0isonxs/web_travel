import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPackages, getApprovedTestimonials } from '../lib/database';
import { generateSlug } from '../utils/slug';
import { MapPin, Users, Star, ChevronRight, Phone, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

export default function Home() {
    const [openPackages, setOpenPackages] = useState([]);
    const [privatePackages, setPrivatePackages] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [stats, setStats] = useState({ trips: 500, customers: 3000, destinations: 50, rating: 4.9 });
    const { t, language, localize } = useLanguage();
    const settings = useSettings();

  useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
  }, []);

  const fetchData = async () => {
        try {
                const [openPkgs, privatePkgs, testimonialsList] = await Promise.all([
                  getPackages('open-trip'),
                  getPackages('private-trip'),
                  getApprovedTestimonials(6),
                ]);
                setOpenPackages(openPkgs.slice(0, 6));
                setPrivatePackages(privatePkgs.slice(0, 3));
                setTestimonials(testimonialsList);
        } catch (e) {
                console.error(e);
        }
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const whyUs = t('home.whyUsItems');
  const homepageWhatsappMessage = encodeURIComponent(t('home.whatsappTemplate'));

  return (
        <>
              <Seo
                title={t('home.seoTitle')}
                description={t('home.seoDescription')}
              />
              <Helmet>
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "TravelAgency",
                    "name": "Liburan Terus",
                    "description": language === 'en' ? "Trusted travel agency for open trips and private trips" : "Agen wisata terpercaya untuk open trip dan private trip",
                    "url": "https://liburanterus.com",
                    "telephone": `+${settings.phone}`,
                    "address": { "@type": "PostalAddress", "addressCountry": "ID" }
                })}</script>
              </Helmet>
        
          {/* Hero Section */}
              <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700">
                                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
                      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-24 pb-16 text-center sm:pt-20 sm:pb-10">
                                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-2 text-xs text-white backdrop-blur-sm sm:px-4 sm:text-sm mb-5 sm:mb-6">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span>{t('home.heroBadge')}</span>
                                </div>
                                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl mb-5 sm:mb-6">
                                            {t('home.heroTitleLine1')}
                                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                                                          {t('home.heroTitleLine2')}
                                            </span>
                                </h1>
                                <p className="mx-auto mb-8 max-w-xl text-base text-white/90 sm:mb-10 sm:max-w-2xl sm:text-xl">
                                            {t('home.heroDescription')}
                                </p>
                                <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
                                            <Link to="/open-trip" className="flex min-h-14 items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 sm:min-h-0 sm:px-8 sm:py-4 sm:text-lg sm:hover:scale-105">
                                                          {t('home.heroPrimaryCta')}
                                            </Link>
                                            <Link to="/private-trip" className="flex min-h-14 items-center justify-center rounded-xl border border-white/40 bg-white/15 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:min-h-0 sm:px-8 sm:py-4 sm:text-lg">
                                                          {t('home.heroSecondaryCta')}
                                            </Link>
                                </div>
                      </div>
              
                {/* Scroll indicator */}
                      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/60 md:block">
                                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                                            <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse" />
                                </div>
                      </div>
              </section>
        
          {/* Stats */}
              <section className="bg-white py-10 shadow-lg relative z-10">
                      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
          { label: t('home.statsTrips'), value: '500+', icon: '✈️' },
          { label: t('home.statsCustomers'), value: '3.000+', icon: '😊' },
          { label: t('home.statsDestinations'), value: '50+', icon: '🗺️' },
          { label: t('home.statsRating'), value: '4.9/5', icon: '⭐' },
                    ].map((stat, i) => (
                                  <div key={i} className="text-center">
                                                <div className="text-3xl mb-1">{stat.icon}</div>
                                                <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                                                <div className="text-gray-500 text-sm">{stat.label}</div>
                                  </div>
                                ))}
                      </div>
              </section>
        
          {/* Open Trip Section */}
              <section className="py-20 bg-gray-50">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-end justify-between mb-10">
                                            <div>
                                                          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">{t('home.openTripEyebrow')}</span>
                                                          <h2 className="text-4xl font-bold text-gray-900 mt-1">{t('home.openTripTitle')}</h2>
                                                          <p className="text-gray-500 mt-2">{t('home.openTripDescription')}</p>
                                            </div>
                                            <Link to="/open-trip" className="hidden md:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold">
                                                          {t('common.viewAll')} <ChevronRight className="w-5 h-5" />
                                            </Link>
                                </div>
                      
                        {openPackages.length === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                                                          <div className="h-52 bg-gray-200" />
                                                          <div className="p-5 space-y-3">
                                                                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                                                                              <div className="h-4 bg-gray-200 rounded w-1/2" />
                                                                              <div className="h-8 bg-gray-200 rounded" />
                                                          </div>
                                        </div>
                                      ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {openPackages.map(pkg => {
                                        const title = localize(pkg.title);
                                        const location = localize(pkg.location);
                                        const duration = localize(pkg.duration);
                                        return (
                                        <Link key={pkg.id} to={`/${pkg.type}/${pkg.slug?.id || generateSlug(pkg.title?.id || pkg.title || '')}`} className="group">
                                                          <article className="h-full bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] hover:shadow-[0_26px_60px_-32px_rgba(16,185,129,0.32)] transition-all duration-300 hover:-translate-y-1">
                                                                              <div className="relative h-52 overflow-hidden">
                                                                                                    <img src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                                                                                                    <div className="absolute top-4 left-4">
                                                                                                                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm text-emerald-700 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5">
                                                                                                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                                                                                        Open Trip
                                                                                                                      </span>
                                                                                                    </div>
                                                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                <div className="absolute top-4 right-4">
                                                                                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%</span>
                                                                </div>
                                                                              )}
                                                          </div>
                                                          <div className="p-5">
                                                                              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                                                                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                                                                                    <span className="line-clamp-1">{location || t('home.locationFallback')}</span>
                                                                              </div>
                                                                              <h3 className="font-bold text-gray-900 text-lg leading-snug mb-4 line-clamp-2 group-hover:text-emerald-600 transition-colors">{title}</h3>
                                                                              <div className="flex items-center gap-2 mb-5 text-xs text-gray-500">
                                                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5">
                                                                                                                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                                                                                                      <span>{duration || t('home.durationFallback')}</span>
                                                                                                    </span>
                                                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5">
                                                                                                                      <Users className="w-3.5 h-3.5 text-teal-500" />
                                                                                                                      <span>{pkg.maxParticipants || 15} {t('home.participants')}</span>
                                                                                                    </span>
                                                                              </div>
                                                                              <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
                                                                                                    <div>
                                                                                                                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1">{t('home.startingFrom')}</p>
                                                                                                                      <div className="flex items-baseline gap-1.5">
                                                                                                                                        <p className="text-emerald-600 font-bold text-xl leading-none">{formatPrice(pkg.price)}</p>
                                                                                                                                        <span className="text-xs text-gray-400">/pax</span>
                                                                                                                      </div>
                                                                                                    </div>
                                                                                                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-colors">
                                                                                                                      {t('home.viewDetail')}
                                                                                                    </span>
                                                                              </div>
                                                          </div>
                                                          </article>
                                        </Link>
                                      )})}
                      </div>
                                )}
                      
                                <div className="text-center mt-8 md:hidden">
                                            <Link to="/open-trip" className="inline-flex items-center gap-2 text-emerald-600 font-semibold border border-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50">
                                                          {t('home.viewAllOpenTrips')} <ArrowRight className="w-4 h-4" />
                                            </Link>
                                </div>
                      </div>
              </section>
        
          {/* Private Trip CTA */}
              <section className="py-20 bg-gradient-to-r from-purple-700 to-violet-800 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80")', backgroundSize: 'cover'}} />
                      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                            <div>
                                                          <span className="text-purple-200 font-semibold text-sm uppercase tracking-wider">{t('home.privateEyebrow')}</span>
                                                          <h2 className="text-4xl font-bold text-white mt-2 mb-4">{t('home.privateTitle')}</h2>
                                                          <p className="text-purple-100 text-lg mb-8">
                                                                          {t('home.privateDescription')}
                                                          </p>
                                                          <ul className="space-y-3 mb-8">
                                                            {[t('home.privateBullet1'), t('home.privateBullet2'), t('home.privateBullet3'), t('home.privateBullet4')].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-white">
                                                <CheckCircle className="w-5 h-5 text-purple-300 shrink-0" />
                                                <span>{item}</span>
                            </li>
                          ))}
                                                          </ul>
                                                          <Link to="/private-trip" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all hover:scale-105 shadow-lg">
                                                                          {t('home.viewPrivatePackages')} <ArrowRight className="w-5 h-5" />
                                                          </Link>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                              {privatePackages.slice(0, 4).map((pkg, i) => {
                          const title = localize(pkg.title);
                          return (
                          <Link key={pkg.id} to={`/paket/${pkg.id}`} className={`relative rounded-2xl overflow-hidden group ${i === 0 ? 'row-span-2' : ''}`}>
                                            <div className={`relative ${i === 0 ? 'h-72' : 'h-32'} overflow-hidden`}>
                                                                <img src={pkg.images?.[0] || `https://images.unsplash.com/photo-152${i}000000000-abc?w=400&q=80`} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                                                                <p className="absolute bottom-3 left-3 text-white font-semibold text-sm">{title}</p>
                                            </div>
                          </Link>
                        )})}
                                              {privatePackages.length === 0 && [...Array(3)].map((_, i) => (
                          <div key={i} className={`bg-purple-600/30 rounded-2xl ${i === 0 ? 'row-span-2 h-72' : 'h-32'} animate-pulse`} />
                        ))}
                                            </div>
                                </div>
                      </div>
              </section>
        
          {/* Why Us */}
              <section className="py-20 bg-white">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-14">
                                            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">{t('home.whyUsEyebrow')}</span>
                                            <h2 className="text-4xl font-bold text-gray-900 mt-2">{t('home.whyUsTitle')}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                  {whyUs.map((item, i) => (
                        <div key={i} className="flex gap-4 p-6 rounded-2xl hover:bg-emerald-50 transition-colors group">
                                        <div className="text-4xl shrink-0">{item.icon}</div>
                                        <div>
                                                          <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-emerald-700">{item.title}</h3>
                                                          <p className="text-gray-500">{item.desc}</p>
                                        </div>
                        </div>
                      ))}
                                </div>
                      </div>
              </section>
        
          {/* Testimonials */}
          {testimonials.length > 0 && (
                  <section className="py-20 bg-gray-50">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="text-center mb-14">
                                                      <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">{t('home.testimonialsEyebrow')}</span>
                                                      <h2 className="text-4xl font-bold text-gray-900 mt-2">{t('home.testimonialsTitle')}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                          {testimonials.map(testimonial => (
                                    <div key={testimonial.id} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow">
                                                      <div className="flex gap-1 mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                                          ))}
                                                      </div>
                                                      <p className="text-gray-600 italic mb-4 line-clamp-4">"{testimonial.comment}"</p>
                                                      <div className="flex items-center gap-3">
                                                                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                                                            {testimonial.name?.[0] || 'A'}
                                                                          </div>
                                                                          <div>
                                                                                                <p className="font-semibold text-gray-900">{testimonial.name || t('home.anonymous')}</p>
                                                                                                <p className="text-sm text-gray-500">{testimonial.packageName || t('home.traveler')}</p>
                                                                          </div>
                                                      </div>
                                    </div>
                                  ))}
                                        </div>
                            </div>
                  </section>
              )}
        
          {/* CTA Banner */}
              <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h2 className="text-4xl font-bold text-white mb-4">{t('home.ctaTitle')}</h2>
                                <p className="text-emerald-100 text-lg mb-8">{t('home.ctaDescription')}</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <a
                                                            href={`https://wa.me/${settings.phone}?text=${homepageWhatsappMessage}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
                                                          >
                                                          <Phone className="w-5 h-5" /> {t('home.chatWhatsapp')}
                                            </a>
                                            <Link to="/open-trip" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-all">
                                                          {t('home.viewAllPackages')} <ArrowRight className="w-5 h-5" />
                                            </Link>
                                </div>
                      </div>
              </section>
        </>
      );
}
