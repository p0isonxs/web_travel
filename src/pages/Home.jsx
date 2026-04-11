import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { MapPin, Users, Star, ChevronRight, Phone, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import Seo from '../components/Seo';

export default function Home() {
    const [openPackages, setOpenPackages] = useState([]);
    const [privatePackages, setPrivatePackages] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [stats, setStats] = useState({ trips: 500, customers: 3000, destinations: 50, rating: 4.9 });

  useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
  }, []);

  const fetchData = async () => {
        try {
                const [openSnap, privateSnap, testiSnap] = await Promise.all([
                          getDocs(query(collection(db, 'packages'), where('type', '==', 'open-trip'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(6))),
                          getDocs(query(collection(db, 'packages'), where('type', '==', 'private-trip'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(3))),
                          getDocs(query(collection(db, 'testimonials'), where('approved', '==', true), orderBy('createdAt', 'desc'), limit(6))),
                        ]);
                setOpenPackages(openSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setPrivatePackages(privateSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setTestimonials(testiSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
                console.error(e);
        }
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const whyUs = [
    { icon: '🏆', title: 'Berpengalaman', desc: 'Lebih dari 5 tahun melayani wisatawan dengan ribuan perjalanan sukses' },
    { icon: '🛡️', title: 'Terpercaya', desc: 'Terdaftar resmi dan memiliki izin usaha pariwisata yang lengkap' },
    { icon: '💰', title: 'Harga Terbaik', desc: 'Harga kompetitif dengan kualitas layanan premium tanpa biaya tersembunyi' },
    { icon: '📞', title: 'Support 24/7', desc: 'Tim kami siap membantu Anda kapan saja selama perjalanan' },
    { icon: '🎒', title: 'All Inclusive', desc: 'Paket lengkap termasuk transportasi, penginapan, guide, dan makan' },
    { icon: '📸', title: 'Momen Berkesan', desc: 'Dokumentasi profesional untuk kenangan yang tak terlupakan' },
      ];

  return (
        <>
              <Seo
                title="Liburan Terus - Paket Wisata Open Trip & Private Trip Terbaik"
                description="Liburan Terus menyediakan paket wisata open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia. Pesan sekarang dengan harga terjangkau!"
              />
              <Helmet>
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "TravelAgency",
                    "name": "Liburan Terus",
                    "description": "Agen wisata terpercaya untuk open trip dan private trip",
                    "url": "https://liburanterus.com",
                    "telephone": "+6281234567890",
                    "address": { "@type": "PostalAddress", "addressCountry": "ID" }
                })}</script>
              </Helmet>
        
          {/* Hero Section */}
              <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700">
                                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
                      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6 border border-white/30">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span>Dipercaya lebih dari 3.000+ wisatawan</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                            Jelajahi Keindahan
                                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                                                          Indonesia Bersama Kami
                                            </span>
                                </h1>
                                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                                            Paket wisata open trip dan private trip ke destinasi-destinasi terbaik Indonesia. Pengalaman liburan tak terlupakan dengan harga terjangkau.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Link to="/open-trip" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
                                                          Lihat Open Trip
                                            </Link>
                                            <Link to="/private-trip" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all border border-white/40">
                                                          Private Trip
                                            </Link>
                                </div>
                      </div>
              
                {/* Scroll indicator */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
                                <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
                                            <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse" />
                                </div>
                      </div>
              </section>
        
          {/* Stats */}
              <section className="bg-white py-10 shadow-lg relative z-10">
                      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
          { label: 'Trip Selesai', value: '500+', icon: '✈️' },
          { label: 'Wisatawan Puas', value: '3.000+', icon: '😊' },
          { label: 'Destinasi', value: '50+', icon: '🗺️' },
          { label: 'Rating', value: '4.9/5', icon: '⭐' },
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
                                                          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Untuk Semua</span>
                                                          <h2 className="text-4xl font-bold text-gray-900 mt-1">Open Trip Populer</h2>
                                                          <p className="text-gray-500 mt-2">Bergabung dengan traveler lain dalam petualangan seru</p>
                                            </div>
                                            <Link to="/open-trip" className="hidden md:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold">
                                                          Lihat Semua <ChevronRight className="w-5 h-5" />
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
                        {openPackages.map(pkg => (
                                        <Link key={pkg.id} to={`/paket/${pkg.id}`} className="group">
                                                          <article className="h-full bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] hover:shadow-[0_26px_60px_-32px_rgba(16,185,129,0.32)] transition-all duration-300 hover:-translate-y-1">
                                                                              <div className="relative h-52 overflow-hidden">
                                                                                                    <img src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                                                                                                    <div className="absolute top-4 left-4">
                                                                                                                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm text-emerald-700 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5">
                                                                                                                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                                                                                        Open Trip
                                                                                                                      </span>
                                                                                                    </div>
                                                            {pkg.discount && (
                                                                <div className="absolute top-4 right-4">
                                                                                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{pkg.discount}%</span>
                                                                </div>
                                                                              )}
                                                          </div>
                                                          <div className="p-5">
                                                                              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                                                                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                                                                                    <span className="line-clamp-1">{pkg.location || 'Indonesia'}</span>
                                                                              </div>
                                                                              <h3 className="font-bold text-gray-900 text-lg leading-snug mb-4 line-clamp-2 group-hover:text-emerald-600 transition-colors">{pkg.title}</h3>
                                                                              <div className="flex items-center gap-2 mb-5 text-xs text-gray-500">
                                                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5">
                                                                                                                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                                                                                                      <span>{pkg.duration || '3D2N'}</span>
                                                                                                    </span>
                                                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5">
                                                                                                                      <Users className="w-3.5 h-3.5 text-teal-500" />
                                                                                                                      <span>{pkg.maxParticipants || 15} orang</span>
                                                                                                    </span>
                                                                              </div>
                                                                              <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
                                                                                                    <div>
                                                                                                                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1">Mulai dari</p>
                                                                                                                      <div className="flex items-baseline gap-1.5">
                                                                                                                                        <p className="text-emerald-600 font-bold text-xl leading-none">{formatPrice(pkg.price)}</p>
                                                                                                                                        <span className="text-xs text-gray-400">/pax</span>
                                                                                                                      </div>
                                                                                                    </div>
                                                                                                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-colors">
                                                                                                                      Lihat Detail
                                                                                                    </span>
                                                                              </div>
                                                          </div>
                                                          </article>
                                        </Link>
                                      ))}
                      </div>
                                )}
                      
                                <div className="text-center mt-8 md:hidden">
                                            <Link to="/open-trip" className="inline-flex items-center gap-2 text-emerald-600 font-semibold border border-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50">
                                                          Lihat Semua Open Trip <ArrowRight className="w-4 h-4" />
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
                                                          <span className="text-purple-200 font-semibold text-sm uppercase tracking-wider">Khusus Untuk Anda</span>
                                                          <h2 className="text-4xl font-bold text-white mt-2 mb-4">Private Trip — Perjalanan Sesuai Keinginan Anda</h2>
                                                          <p className="text-purple-100 text-lg mb-8">
                                                                          Kami merancang itinerary eksklusif sesuai kebutuhan Anda. Bebas tentukan tanggal, destinasi, dan aktivitas tanpa berbagi dengan orang lain.
                                                          </p>
                                                          <ul className="space-y-3 mb-8">
                                                            {['Jadwal fleksibel sesuai keinginan', 'Destinasi bisa dikustomisasi', 'Cocok untuk keluarga, honeymoon, corporate', 'Pemandu wisata pribadi berpengalaman'].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-white">
                                                <CheckCircle className="w-5 h-5 text-purple-300 shrink-0" />
                                                <span>{item}</span>
                            </li>
                          ))}
                                                          </ul>
                                                          <Link to="/private-trip" className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all hover:scale-105 shadow-lg">
                                                                          Lihat Paket Private Trip <ArrowRight className="w-5 h-5" />
                                                          </Link>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                              {privatePackages.slice(0, 4).map((pkg, i) => (
                          <Link key={pkg.id} to={`/paket/${pkg.id}`} className={`relative rounded-2xl overflow-hidden group ${i === 0 ? 'row-span-2' : ''}`}>
                                            <div className={`relative ${i === 0 ? 'h-72' : 'h-32'} overflow-hidden`}>
                                                                <img src={pkg.images?.[0] || `https://images.unsplash.com/photo-152${i}000000000-abc?w=400&q=80`} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                                                                <p className="absolute bottom-3 left-3 text-white font-semibold text-sm">{pkg.title}</p>
                                            </div>
                          </Link>
                        ))}
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
                                            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Keunggulan Kami</span>
                                            <h2 className="text-4xl font-bold text-gray-900 mt-2">Mengapa Memilih Liburan Terus?</h2>
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
                                                      <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Kata Mereka</span>
                                                      <h2 className="text-4xl font-bold text-gray-900 mt-2">Testimoni Wisatawan</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                          {testimonials.map(t => (
                                    <div key={t.id} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow">
                                                      <div className="flex gap-1 mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-5 h-5 ${i < (t.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                                                          ))}
                                                      </div>
                                                      <p className="text-gray-600 italic mb-4 line-clamp-4">"{t.comment}"</p>
                                                      <div className="flex items-center gap-3">
                                                                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                                                            {t.name?.[0] || 'A'}
                                                                          </div>
                                                                          <div>
                                                                                                <p className="font-semibold text-gray-900">{t.name || 'Anonymous'}</p>
                                                                                                <p className="text-sm text-gray-500">{t.packageName || 'Wisatawan'}</p>
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
                                <h2 className="text-4xl font-bold text-white mb-4">Siap Memulai Petualangan?</h2>
                                <p className="text-emerald-100 text-lg mb-8">Hubungi kami sekarang dan rencanakan liburan impian Anda bersama Liburan Terus</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <a
                                                            href="https://wa.me/6281234567890?text=Halo, saya ingin informasi paket wisata"
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
                                                          >
                                                          <Phone className="w-5 h-5" /> Chat WhatsApp
                                            </a>
                                            <Link to="/open-trip" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-all">
                                                          Lihat Semua Paket <ArrowRight className="w-5 h-5" />
                                            </Link>
                                </div>
                      </div>
              </section>
        </>
      );
}
