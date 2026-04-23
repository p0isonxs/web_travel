import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getPackages, getApprovedTestimonials, getBlogPosts } from '../lib/database';
import { generateSlug } from '../utils/slug';
import { MapPin, Users, Star, ChevronRight, Phone, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

export default function Home() {
    const [openPackages, setOpenPackages] = useState([]);
    const [privatePackages, setPrivatePackages] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [slideIdx, setSlideIdx] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);
    const timerRef = useRef(null);
    const { t, language, localize } = useLanguage();
    const settings = useSettings();

  useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
  }, []);

  // Track visible count for responsive carousel
  useEffect(() => {
        const update = () => {
                  const w = window.innerWidth;
                  setVisibleCount(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
  }, []);

  const fetchData = async () => {
        try {
                const [openPkgs, privatePkgs, testimonialsList, blogList] = await Promise.all([
                  getPackages('open-trip'),
                  getPackages('private-trip'),
                  getApprovedTestimonials(10),
                  getBlogPosts(),
                ]);
                setOpenPackages(openPkgs.slice(0, 6));
                setPrivatePackages(privatePkgs.slice(0, 3));
                setTestimonials(testimonialsList);
                setBlogs(blogList.filter(b => b.published).slice(0, 3));
        } catch (e) {
                console.error(e);
        }
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const formatDate = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Carousel logic
  const maxSlideIdx = Math.max(0, testimonials.length - visibleCount);

  const startTimer = useCallback(() => {
        clearInterval(timerRef.current);
        if (testimonials.length > visibleCount) {
                  timerRef.current = setInterval(() => {
                            setSlideIdx(prev => (prev >= maxSlideIdx ? 0 : prev + 1));
                  }, 4000);
        }
  }, [testimonials.length, visibleCount, maxSlideIdx]);

  useEffect(() => {
        startTimer();
        return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goToSlide = (idx) => {
        setSlideIdx(Math.min(idx, maxSlideIdx));
        startTimer();
  };


  const cardWidth = 100 / visibleCount;

  const HERO_BG = settings.heroBackground || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80';
  const PRIVATE_BG = settings.privateTripBackground || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80';
  const TESTI_BG = settings.testimonialBackground || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80';

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
              <section className="relative min-h-screen flex items-center overflow-hidden">

                {/* Background photo */}
                <div className="absolute inset-0">
                  <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 grid lg:grid-cols-2 gap-12 items-center">

                  {/* LEFT — text */}
                  <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 backdrop-blur-sm px-4 py-2 text-sm text-emerald-300 mb-6">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span>{t('home.heroBadge')}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                      {t('home.heroTitleLine1')}
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mt-1">
                        {t('home.heroTitleLine2')}
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-lg">
                      {t('home.heroDescription')}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-10">
                      <Link to="/open-trip"
                        className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 text-base">
                        {t('home.heroPrimaryCta')} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link to="/private-trip"
                        className="inline-flex items-center justify-center gap-2 border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all text-base">
                        {t('home.heroSecondaryCta')}
                      </Link>
                    </div>

                    {/* Mini stats */}
                    <div className="flex items-center gap-6">
                      {[
                        { val: '500+',   label: language === 'en' ? 'Trips' : 'Trip' },
                        { val: '3.000+', label: language === 'en' ? 'Travelers' : 'Wisatawan' },
                        { val: '4.9★',   label: language === 'en' ? 'Rating' : 'Rating' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-5">
                          {i > 0 && <div className="w-px h-8 bg-white/20" />}
                          <div>
                            <div className="text-xl font-bold text-white">{s.val}</div>
                            <div className="text-white/50 text-xs">{s.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT — floating destination cards */}
                  <div className="hidden lg:flex items-center justify-center relative h-[500px]">

                    {/* Card 3 — back */}
                    {openPackages[2] && (() => {
                      const pkg = openPackages[2];
                      return (
                        <Link to={`/${pkg.type}/${pkg.slug?.id || generateSlug(pkg.title?.id || '')}`}
                          className="absolute right-0 top-16 w-52 rounded-2xl overflow-hidden shadow-2xl rotate-6 hover:rotate-3 transition-transform duration-300 group">
                          <img src={pkg.images?.[0]} alt={localize(pkg.title)} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3">
                            <p className="text-white text-xs font-semibold line-clamp-1">{localize(pkg.title)}</p>
                            <p className="text-emerald-300 text-xs mt-0.5">{formatPrice(pkg.price)}</p>
                          </div>
                        </Link>
                      );
                    })()}

                    {/* Card 2 — middle */}
                    {openPackages[1] && (() => {
                      const pkg = openPackages[1];
                      return (
                        <Link to={`/${pkg.type}/${pkg.slug?.id || generateSlug(pkg.title?.id || '')}`}
                          className="absolute right-20 top-28 w-56 rounded-2xl overflow-hidden shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-300 z-10 group">
                          <img src={pkg.images?.[0]} alt={localize(pkg.title)} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="bg-white/15 backdrop-blur-md border border-white/25 p-3">
                            <p className="text-white text-xs font-semibold line-clamp-1">{localize(pkg.title)}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-emerald-300 text-xs">{formatPrice(pkg.price)}</p>
                              <span className="text-yellow-400 text-xs">★ {pkg.rating || '4.9'}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })()}

                    {/* Card 1 — front */}
                    {openPackages[0] && (() => {
                      const pkg = openPackages[0];
                      return (
                        <Link to={`/${pkg.type}/${pkg.slug?.id || generateSlug(pkg.title?.id || '')}`}
                          className="absolute left-0 bottom-12 w-64 rounded-2xl overflow-hidden shadow-2xl rotate-1 hover:-rotate-1 transition-transform duration-300 z-20 group">
                          <img src={pkg.images?.[0]} alt={localize(pkg.title)} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="bg-white/15 backdrop-blur-md border border-white/25 p-4">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span className="text-white/70 text-xs">{localize(pkg.location) || 'Indonesia'}</span>
                            </div>
                            <p className="text-white text-sm font-bold line-clamp-1">{localize(pkg.title)}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-emerald-300 text-sm font-semibold">{formatPrice(pkg.price)}</p>
                              <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">Open Trip</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })()}

                    {/* Fallback decorative when no packages */}
                    {openPackages.length === 0 && (
                      <div className="w-64 h-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse" />
                    )}

                    {/* Floating badge — popular */}
                    <div className="absolute top-4 left-8 z-30 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-sm leading-none">4.9 / 5</p>
                        <p className="text-gray-400 text-xs mt-0.5">{language === 'en' ? 'Traveler rating' : 'Rating wisatawan'}</p>
                      </div>
                    </div>

                    {/* Floating badge — trips */}
                    <div className="absolute bottom-4 right-4 z-30 bg-emerald-500 rounded-2xl shadow-xl px-4 py-3">
                      <p className="text-white font-bold text-sm">500+ Trip</p>
                      <p className="text-emerald-100 text-xs">{language === 'en' ? 'Completed' : 'Berhasil'}</p>
                    </div>
                  </div>

                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/40 hidden md:block">
                  <div className="w-5 h-9 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
                    <div className="w-1 h-2.5 bg-white/50 rounded-full" />
                  </div>
                </div>
              </section>

          {/* Stats Strip */}
              <section className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
                  {[
                    { val: '500+',   label: language === 'en' ? 'Trips Done'      : 'Trip Selesai',     icon: <MapPin className="w-5 h-5" /> },
                    { val: '3.000+', label: language === 'en' ? 'Happy Travelers' : 'Wisatawan Puas',   icon: <Users className="w-5 h-5" /> },
                    { val: '50+',    label: language === 'en' ? 'Destinations'    : 'Destinasi',        icon: <Calendar className="w-5 h-5" /> },
                    { val: '4.9★',   label: language === 'en' ? 'Rating'          : 'Rating',           icon: <Star className="w-5 h-5" /> },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 py-8 px-4">
                      <span className="text-emerald-500">{s.icon}</span>
                      <span className="text-2xl font-black text-gray-900">{s.val}</span>
                      <span className="text-gray-400 text-xs">{s.label}</span>
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
                                                                                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{t('openTrip.discount')}</span>
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
                                                                                                                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                                                                        <p className="text-xs text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</p>
                                                                                                                      )}
                                                                                                                      <p className="text-emerald-600 font-bold text-xl leading-none">{formatPrice(pkg.price)}</p>
                                                                                                                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mt-0.5">{t('openTrip.perPerson')}</p>
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

          {/* Private Trip */}
              <section className="relative overflow-hidden py-24">
                {/* Full photo background */}
                <div className="absolute inset-0">
                  <img src={PRIVATE_BG} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-950/95 via-purple-900/90 to-purple-800/75" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left — text */}
                    <div>
                      <span className="inline-block text-purple-300 font-semibold text-sm uppercase tracking-[0.2em] mb-4">{t('home.privateEyebrow')}</span>
                      <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">{t('home.privateTitle')}</h2>
                      <p className="text-purple-100/80 text-lg leading-relaxed mb-8">{t('home.privateDescription')}</p>

                      {/* Benefits — glass cards 2×2 */}
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {[t('home.privateBullet1'), t('home.privateBullet2'), t('home.privateBullet3'), t('home.privateBullet4')].map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3">
                            <CheckCircle className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                            <span className="text-white text-sm leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-6 mb-8">
                        {[
                          { val: '100%', label: language === 'en' ? 'Custom' : 'Custom' },
                          { val: '500+', label: language === 'en' ? 'Trips' : 'Trip' },
                          { val: '24/7', label: language === 'en' ? 'Support' : 'Support' },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-6">
                            {i > 0 && <div className="w-px h-8 bg-white/20" />}
                            <div>
                              <p className="text-2xl font-bold text-white leading-none">{s.val}</p>
                              <p className="text-purple-300 text-xs mt-1">{s.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Link to="/private-trip" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-all hover:scale-105 shadow-xl shadow-purple-950/40">
                        {t('home.viewPrivatePackages')} <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>

                    {/* Right — package photo grid */}
                    <div className="hidden lg:grid grid-cols-2 gap-4 h-[440px]">
                      {/* Big card */}
                      {privatePackages[0] && (() => {
                        const pkg = privatePackages[0];
                        const title = localize(pkg.title);
                        return (
                          <Link to={`/${pkg.type}/${pkg.slug?.id || generateSlug(pkg.title?.id || pkg.title || '')}`}
                                className="relative rounded-3xl overflow-hidden row-span-2 group">
                            <img src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'}
                                 alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute bottom-5 left-5 right-5">
                              <span className="inline-block bg-purple-500/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">Private Trip</span>
                              <p className="text-white font-bold text-base leading-snug">{title}</p>
                            </div>
                          </Link>
                        );
                      })()}
                      {/* Two small cards */}
                      {privatePackages.slice(1, 3).map((pkg) => {
                        const title = localize(pkg.title);
                        return (
                          <Link key={pkg.id} to={`/${pkg.type}/${pkg.slug?.id || generateSlug(pkg.title?.id || pkg.title || '')}`}
                                className="relative rounded-3xl overflow-hidden group">
                            <img src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80'}
                                 alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <p className="absolute bottom-4 left-4 right-4 text-white font-semibold text-sm leading-snug">{title}</p>
                          </Link>
                        );
                      })}
                      {/* Placeholders */}
                      {privatePackages.length === 0 && (
                        <>
                          <div className="row-span-2 rounded-3xl bg-purple-600/30 animate-pulse" />
                          <div className="rounded-3xl bg-purple-600/30 animate-pulse" />
                          <div className="rounded-3xl bg-purple-600/30 animate-pulse" />
                        </>
                      )}
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

          {/* Testimonials Carousel */}
          {testimonials.length > 0 && (
            <section className="py-24 relative overflow-hidden">
              {/* Background photo + overlay */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url("${TESTI_BG}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/85 to-emerald-950/90" />
              </div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="text-center mb-14">
                  <span className="inline-block text-emerald-300 font-semibold text-sm uppercase tracking-[0.2em] mb-3">
                    {t('home.testimonialsEyebrow')}
                  </span>
                  <h2 className="text-4xl font-bold text-white">{t('home.testimonialsTitle')}</h2>
                  <p className="text-emerald-200/70 mt-3 text-base">
                    {language === 'en' ? 'Real stories from our happy travelers' : 'Cerita nyata dari wisatawan yang sudah bersama kami'}
                  </p>
                </div>

                {/* Carousel track */}
                <div
                  onMouseEnter={() => clearInterval(timerRef.current)}
                  onMouseLeave={startTimer}
                >
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-600 ease-in-out"
                      style={{ transform: `translateX(-${slideIdx * cardWidth}%)` }}
                    >
                      {testimonials.map(testimonial => (
                        <div
                          key={testimonial.id}
                          style={{ flex: `0 0 ${cardWidth}%` }}
                          className="px-3"
                        >
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 h-full flex flex-col hover:bg-white/15 transition-colors duration-300">
                            {/* Big quote mark */}
                            <div className="text-6xl leading-none font-serif text-emerald-300/60 mb-1 select-none">"</div>

                            {/* Comment */}
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-4 flex-1 mb-5">
                              {testimonial.comment}
                            </p>

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/20'}`} />
                              ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/15">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg">
                                {testimonial.name?.[0]?.toUpperCase() || 'A'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white text-sm truncate">{testimonial.name || t('home.anonymous')}</p>
                                <p className="text-emerald-300 text-xs truncate flex items-center gap-1">
                                  <span>✈</span> {testimonial.packageName || t('home.traveler')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dots */}
                {testimonials.length > visibleCount && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: maxSlideIdx + 1 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === slideIdx ? 'bg-white w-7' : 'bg-white/30 w-2 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Blog Section */}
          {blogs.length > 0 && (
                  <section className="py-20 bg-white">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="flex items-end justify-between mb-10">
                                                      <div>
                                                                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                                                                      {language === 'en' ? 'Tips & Inspiration' : 'Tips & Inspirasi'}
                                                                    </span>
                                                                    <h2 className="text-4xl font-bold text-gray-900 mt-1">
                                                                      {language === 'en' ? 'Travel Articles' : 'Artikel Wisata'}
                                                                    </h2>
                                                                    <p className="text-gray-500 mt-2">
                                                                      {language === 'en' ? 'Tips, inspiration, and guides for your trip' : 'Tips, inspirasi, dan panduan untuk perjalananmu'}
                                                                    </p>
                                                      </div>
                                                      <Link to="/blog" className="hidden md:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold">
                                                                    {t('common.viewAll')} <ChevronRight className="w-5 h-5" />
                                                      </Link>
                                        </div>

                                        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0">
                                          {blogs.map((blog, i) => {
                            const title = localize(blog.title) || blog.title?.id || '';
                            const excerpt = localize(blog.excerpt) || blog.excerpt?.id || '';
                            return (
                              <Link key={blog.id} to={`/blog/${blog.slug}`} className="group flex flex-col snap-start shrink-0 w-[78vw] sm:w-[55vw] md:w-auto">
                                <article className="flex flex-col h-full bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)] hover:shadow-[0_26px_60px_-32px_rgba(16,185,129,0.28)] transition-all duration-300 hover:-translate-y-1">
                                  {/* Image */}
                                  <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                      src={blog.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80'}
                                      alt={title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {i === 0 && (
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    )}
                                    {blog.category && (
                                      <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                        {blog.category}
                                      </span>
                                    )}
                                  </div>
                                  {/* Content */}
                                  <div className="flex flex-col flex-1 p-5">
                                    <p className="text-xs text-gray-400 mb-2">{formatDate(blog.createdAt)}</p>
                                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors flex-1">
                                      {title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                                      {excerpt}
                                    </p>
                                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold mt-auto">
                                      <span>{language === 'en' ? 'Read More' : 'Baca Selengkapnya'}</span>
                                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                  </div>
                                </article>
                              </Link>
                            );
                          })}
                                        </div>

                                        <div className="text-center mt-8 md:hidden">
                                                      <Link to="/blog" className="inline-flex items-center gap-2 text-emerald-600 font-semibold border border-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50">
                                                                    {language === 'en' ? 'View All Articles' : 'Lihat Semua Artikel'} <ArrowRight className="w-4 h-4" />
                                                      </Link>
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
