import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Award, Users, MapPin } from 'lucide-react';

export default function About() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

  const team = [
    { name: 'Budi Santoso', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Sari Dewi', role: 'Tour Manager', emoji: '👩‍💼' },
    { name: 'Reza Pratama', role: 'Head Guide', emoji: '🧗' },
    { name: 'Mira Kusuma', role: 'Customer Service', emoji: '👩‍💻' },
      ];

  const milestones = [
    { year: '2019', event: 'Liburan Terus didirikan dengan 5 destinasi pertama' },
    { year: '2020', event: 'Ekspansi ke 20 destinasi, bergabung 500 wisatawan' },
    { year: '2021', event: 'Meluncurkan layanan Private Trip eksklusif' },
    { year: '2022', event: 'Meraih penghargaan Travel Agent Terbaik se-Regional' },
    { year: '2023', event: 'Lebih dari 2.000 wisatawan puas bergabung bersama kami' },
    { year: '2024', event: 'Ekspansi ke 50+ destinasi, hadir di seluruh Indonesia' },
      ];

  return (
        <>
              <Helmet>
                      <title>Tentang Kami - Liburan Terus | Agen Wisata Terpercaya</title>
                      <meta name="description" content="Kenali Liburan Terus, agen wisata terpercaya yang telah melayani ribuan wisatawan dengan paket open trip dan private trip ke berbagai destinasi Indonesia." />
              </Helmet>
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 mt-16">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-5xl font-bold text-white mb-4">Tentang Liburan Terus</h1>
                                <p className="text-emerald-100 text-xl">Lebih dari sekadar perjalanan — kami menciptakan kenangan</p>
                      </div>
              </div>
        
          {/* Story */}
              <section className="py-20 bg-white">
                      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                            <div>
                                                          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Cerita Kami</span>
                                                          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">Berawal dari Semangat Menjelajah</h2>
                                                          <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                                                          Liburan Terus lahir dari kecintaan kami terhadap keindahan alam dan budaya Indonesia. Berawal dari sekelompok pencinta travel yang ingin berbagi pengalaman, kini kami telah berkembang menjadi salah satu agen wisata terpercaya.
                                                          </p>
                                                          <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                                                          Kami percaya bahwa setiap perjalanan adalah petualangan baru yang memperkaya wawasan dan mempererat hubungan antar manusia. Itulah mengapa kami merancang setiap paket wisata dengan penuh dedikasi dan detail.
                                                          </p>
                                                          <p className="text-gray-600 text-lg leading-relaxed">
                                                                          Dengan pengalaman lebih dari 5 tahun dan ribuan wisatawan yang telah kami layani, kami terus berinovasi untuk memberikan pengalaman terbaik dalam setiap perjalanan.
                                                          </p>
                                            </div>
                                            <div className="relative">
                                                          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 text-center">
                                                                          <div className="grid grid-cols-2 gap-6">
                                                                            {[
          { value: '5+', label: 'Tahun Pengalaman', icon: '📅' },
          { value: '3.000+', label: 'Wisatawan Puas', icon: '😊' },
          { value: '50+', label: 'Destinasi', icon: '🗺️' },
          { value: '4.9', label: 'Rating Rata-rata', icon: '⭐' },
                            ].map((s, i) => (
                                                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                                                                        <div className="text-3xl mb-2">{s.icon}</div>
                                                                        <div className="text-3xl font-bold text-emerald-600">{s.value}</div>
                                                                        <div className="text-sm text-gray-500">{s.label}</div>
                                                  </div>
                                                ))}
                                                                          </div>
                                                          </div>
                                            </div>
                                </div>
                      </div>
              </section>
        
          {/* Vision Mission */}
              <section className="py-20 bg-gray-50">
                      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-14">
                                            <h2 className="text-4xl font-bold text-gray-900">Visi & Misi Kami</h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                                          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                                          <Eye className="w-8 h-8 text-emerald-600" />
                                                          </div>
                                                          <h3 className="text-xl font-bold text-gray-900 mb-3">Visi</h3>
                                                          <p className="text-gray-600">Menjadi agen wisata terpercaya dan terdepan yang menginspirasi masyarakat Indonesia untuk mengenal dan mencintai keindahan tanah airnya.</p>
                                            </div>
                                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                                          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                                          <Target className="w-8 h-8 text-teal-600" />
                                                          </div>
                                                          <h3 className="text-xl font-bold text-gray-900 mb-3">Misi</h3>
                                                          <p className="text-gray-600">Menyediakan paket wisata berkualitas dengan harga terjangkau, pelayanan profesional, dan pengalaman yang tak terlupakan untuk setiap wisatawan.</p>
                                            </div>
                                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                                          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                                          <Heart className="w-8 h-8 text-purple-600" />
                                                          </div>
                                                          <h3 className="text-xl font-bold text-gray-900 mb-3">Nilai</h3>
                                                          <p className="text-gray-600">Kepercayaan, Integritas, Keramahan, dan Kecintaan terhadap alam adalah nilai-nilai yang selalu kami pegang dalam setiap langkah perjalanan.</p>
                                            </div>
                                </div>
                      </div>
              </section>
        
          {/* Timeline */}
              <section className="py-20 bg-white">
                      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-14">
                                            <h2 className="text-4xl font-bold text-gray-900">Perjalanan Kami</h2>
                                </div>
                                <div className="relative">
                                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-emerald-200" />
                                            <div className="space-y-8">
                                              {milestones.map((m, i) => (
                          <div key={i} className="flex gap-6">
                                            <div className="relative flex-shrink-0">
                                                                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 relative">{m.year}</div>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-5 flex-1">
                                                                <p className="text-gray-700 text-lg">{m.event}</p>
                                            </div>
                          </div>
                        ))}
                                            </div>
                                </div>
                      </div>
              </section>
        
          {/* Team */}
              <section className="py-20 bg-gray-50">
                      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-14">
                                            <h2 className="text-4xl font-bold text-gray-900">Tim Kami</h2>
                                            <p className="text-gray-500 mt-2">Orang-orang berdedikasi di balik setiap perjalanan</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                  {team.map((member, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                                        <div className="text-6xl mb-3">{member.emoji}</div>
                                        <h3 className="font-bold text-gray-900">{member.name}</h3>
                                        <p className="text-emerald-600 text-sm">{member.role}</p>
                        </div>
                      ))}
                                </div>
                      </div>
              </section>
        
          {/* CTA */}
              <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700">
                      <div className="max-w-3xl mx-auto px-4 text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">Mari Mulai Petualangan Bersama Kami</h2>
                                <p className="text-emerald-100 mb-8">Temukan paket wisata impian Anda dan biarkan kami yang mengurus sisanya</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Link to="/open-trip" className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors">
                                                          Lihat Open Trip
                                            </Link>
                                            <Link to="/private-trip" className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 border border-emerald-400 transition-colors">
                                                          Private Trip
                                            </Link>
                                </div>
                      </div>
              </section>
        </>
      );
}</>
