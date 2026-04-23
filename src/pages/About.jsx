import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Award, Users, MapPin } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const { t } = useLanguage();

  const team = [
    { name: 'Budi Santoso', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Sari Dewi', role: 'Tour Manager', emoji: '👩‍💼' },
    { name: 'Reza Pratama', role: 'Head Guide', emoji: '🧗' },
    { name: 'Mira Kusuma', role: 'Customer Service', emoji: '👩‍💻' },
      ];

  const milestones = t('about.milestones');

  return (
        <>
              <Seo
                title={t('about.seoTitle')}
                description={t('about.seoDescription')}
                image="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&h=630&fit=crop&q=80"
              />
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 mt-16">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-5xl font-bold text-white mb-4">{t('about.heroTitle')}</h1>
                                <p className="text-emerald-100 text-xl">{t('about.heroDescription')}</p>
                      </div>
              </div>
        
          {/* Story */}
              <section className="py-20 bg-white">
                      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                            <div>
                                                          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">{t('about.storyEyebrow')}</span>
                                                          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">{t('about.storyTitle')}</h2>
                                                          <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                                                          {t('about.storyParagraph1')}
                                                          </p>
                                                          <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                                                          {t('about.storyParagraph2')}
                                                          </p>
                                                          <p className="text-gray-600 text-lg leading-relaxed">
                                                                          {t('about.storyParagraph3')}
                                                          </p>
                                            </div>
                                            <div className="relative">
                                                          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 text-center">
                                                                          <div className="grid grid-cols-2 gap-6">
                                                                            {[
          { value: '5+', label: t('about.stat1'), icon: '📅' },
          { value: '3.000+', label: t('about.stat2'), icon: '😊' },
          { value: '50+', label: t('about.stat3'), icon: '🗺️' },
          { value: '4.9', label: t('about.stat4'), icon: '⭐' },
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
                                            <h2 className="text-4xl font-bold text-gray-900">{t('about.visionMissionTitle')}</h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                                          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                                          <Eye className="w-8 h-8 text-emerald-600" />
                                                          </div>
                                                          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.visionTitle')}</h3>
                                                          <p className="text-gray-600">{t('about.visionDescription')}</p>
                                            </div>
                                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                                          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                                          <Target className="w-8 h-8 text-teal-600" />
                                                          </div>
                                                          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.missionTitle')}</h3>
                                                          <p className="text-gray-600">{t('about.missionDescription')}</p>
                                            </div>
                                            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                                                          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                                                          <Heart className="w-8 h-8 text-purple-600" />
                                                          </div>
                                                          <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.valuesTitle')}</h3>
                                                          <p className="text-gray-600">{t('about.valuesDescription')}</p>
                                            </div>
                                </div>
                      </div>
              </section>
        
          {/* Timeline */}
              <section className="py-20 bg-white">
                      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-14">
                                            <h2 className="text-4xl font-bold text-gray-900">{t('about.journeyTitle')}</h2>
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
                                            <h2 className="text-4xl font-bold text-gray-900">{t('about.teamTitle')}</h2>
                                            <p className="text-gray-500 mt-2">{t('about.teamDescription')}</p>
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
                                <h2 className="text-3xl font-bold text-white mb-4">{t('about.ctaTitle')}</h2>
                                <p className="text-emerald-100 mb-8">{t('about.ctaDescription')}</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <Link to="/open-trip" className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors">
                                                          {t('about.seeOpenTrip')}
                                            </Link>
                                            <Link to="/private-trip" className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 border border-emerald-400 transition-colors">
                                                          {t('about.privateTrip')}
                                            </Link>
                                </div>
                      </div>
              </section>
        </>
      );
}
