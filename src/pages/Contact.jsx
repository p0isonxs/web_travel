import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { addContact } from '../lib/database';
import { toast } from 'react-toastify';
import { useSettings } from '../contexts/SettingsContext';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const settings = useSettings();
    const { t } = useLanguage();
    const whatsappMessage = encodeURIComponent(
      t('contact.whatsappTemplate', { siteName: settings.siteName })
    );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
                await addContact(form);
                toast.success(t('contact.success'));
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch {
                toast.error(t('contact.error'));
        }
        setSubmitting(false);
  };

  const contactInfo = [
    { icon: <MapPin className="w-6 h-6" />, label: t('contact.address'), value: settings.address, color: 'emerald' },
    { icon: <Phone className="w-6 h-6" />, label: t('contact.phone'), value: `+${settings.phone}`, color: 'teal', link: `https://wa.me/${settings.phone}` },
    { icon: <Mail className="w-6 h-6" />, label: t('contact.email'), value: settings.email, color: 'blue', link: `mailto:${settings.email}` },
    { icon: <Clock className="w-6 h-6" />, label: t('contact.hours'), value: t('contact.businessHours'), color: 'purple' },
      ];

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';

  return (
        <>
              <Seo
                title={t('contact.seoTitle')}
                description={t('contact.seoDescription')}
              />
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 mt-16">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-5xl font-bold text-white mb-4">{t('contact.heroTitle')}</h1>
                                <p className="text-emerald-100 text-xl">{t('contact.heroDescription')}</p>
                      </div>
              </div>
        
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                      <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                                <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('contact.contactInfoTitle')}</h2>
                                            <div className="space-y-6 mb-10">
                                              {contactInfo.map((info, i) => (
                          <div key={i} className="flex gap-4">
                                            <div className={`w-12 h-12 bg-${info.color}-100 rounded-xl flex items-center justify-center text-${info.color}-600 shrink-0`}>
                                              {info.icon}
                                            </div>
                                            <div>
                                                                <p className="font-semibold text-gray-900">{info.label}</p>
                                              {info.link ? (
                                                  <a href={info.link} className={`text-${info.color}-600 hover:underline whitespace-pre-line`}>{info.value}</a>
                                                ) : (
                                                  <p className="text-gray-600 whitespace-pre-line">{info.value}</p>
                                                                )}
                                            </div>
                          </div>
                        ))}
                                            </div>
                                
                                  {/* WhatsApp CTA */}
                                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                                          <h3 className="font-bold text-green-800 text-lg mb-2">{t('contact.whatsappTitle')}</h3>
                                                          <p className="text-green-700 mb-4">{t('contact.whatsappDescription')}</p>
                                                          <a
                                                                            href={`https://wa.me/${settings.phone}?text=${whatsappMessage}`}
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                                                                          >
                                                                          <MessageCircle className="w-5 h-5" />
                                                                          {t('contact.whatsappButton')}
                                                          </a>
                                            </div>
                                </div>
                      
                        {/* Contact Form */}
                                <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('contact.sendMessageTitle')}</h2>
                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                          <div className="grid grid-cols-2 gap-4">
                                                                          <div>
                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.fullName')} *</label>
                                                                                            <input
                                                                                                                  type="text" required value={form.name}
                                                                                                                  onChange={e => setForm({...form, name: e.target.value})}
                                                                                                                  placeholder={t('contact.fullNamePlaceholder')}
                                                                                                                  className={inputClass}
                                                                                                                />
                                                                          </div>
                                                                          <div>
                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.whatsappLabel')} *</label>
                                                                                            <input
                                                                                                                  type="tel" required value={form.phone}
                                                                                                                  onChange={e => setForm({...form, phone: e.target.value})}
                                                                                                                  placeholder={t('contact.phonePlaceholder')}
                                                                                                                  className={inputClass}
                                                                                                                />
                                                                          </div>
                                                          </div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.emailLabel')} *</label>
                                                                          <input
                                                                                              type="email" required value={form.email}
                                                                                              onChange={e => setForm({...form, email: e.target.value})}
                                                                                              placeholder={t('contact.emailPlaceholder')}
                                                                                              className={inputClass}
                                                                                            />
                                                          </div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.subject')} *</label>
                                                                          <select
                                                                                              required value={form.subject}
                                                                                              onChange={e => setForm({...form, subject: e.target.value})}
                                                                                              className={inputClass}
                                                                                            >
                                                                                            <option value="">{t('contact.subjectPlaceholder')}</option>
                                                                                            <option value={t('contact.subject1')}>{t('contact.subject1')}</option>
                                                                                            <option value={t('contact.subject2')}>{t('contact.subject2')}</option>
                                                                                            <option value={t('contact.subject3')}>{t('contact.subject3')}</option>
                                                                                            <option value={t('contact.subject4')}>{t('contact.subject4')}</option>
                                                                                            <option value={t('contact.subject5')}>{t('contact.subject5')}</option>
                                                                                            <option value={t('contact.subject6')}>{t('contact.subject6')}</option>
                                                                          </select>
                                                          </div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')} *</label>
                                                                          <textarea
                                                                                              required rows={5} value={form.message}
                                                                                              onChange={e => setForm({...form, message: e.target.value})}
                                                                                              placeholder={t('contact.messagePlaceholder')}
                                                                                              className={inputClass}
                                                                                            />
                                                          </div>
                                                          <button
                                                                            type="submit" disabled={submitting}
                                                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-colors text-lg"
                                                                          >
                                                            {submitting ? (
                                                                                              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('contact.sending')}</>
                                                                                            ) : (
                                                                                              <><Send className="w-5 h-5" /> {t('contact.send')}</>
                                                                                            )}
                                                          </button>
                                            </form>
                                </div>
                      </div>
              </div>
        </>
      );
}
