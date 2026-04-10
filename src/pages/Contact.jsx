import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
                await addDoc(collection(db, 'contacts'), { ...form, createdAt: serverTimestamp(), status: 'unread' });
                toast.success('Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.');
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch {
                toast.error('Gagal mengirim pesan. Silakan coba lagi.');
        }
        setSubmitting(false);
  };

  const contactInfo = [
    { icon: <MapPin className="w-6 h-6" />, label: 'Alamat', value: 'Jl. Wisata Indah No. 123, Jakarta Selatan, 12345', color: 'emerald' },
    { icon: <Phone className="w-6 h-6" />, label: 'Telepon / WhatsApp', value: '+62 812-3456-7890', color: 'teal', link: 'https://wa.me/6281234567890' },
    { icon: <Mail className="w-6 h-6" />, label: 'Email', value: 'info@liburanterus.com', color: 'blue', link: 'mailto:info@liburanterus.com' },
    { icon: <Clock className="w-6 h-6" />, label: 'Jam Operasional', value: 'Senin - Sabtu: 08.00 - 20.00 WIB\nMinggu: 09.00 - 17.00 WIB', color: 'purple' },
      ];

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';

  return (
        <>
              <Helmet>
                      <title>Kontak Kami - Liburan Terus</title>
                      <meta name="description" content="Hubungi Liburan Terus untuk informasi paket wisata, booking, atau pertanyaan lainnya. Kami siap membantu Anda merencanakan liburan impian." />
              </Helmet>
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 mt-16">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-5xl font-bold text-white mb-4">Hubungi Kami</h1>
                                <p className="text-emerald-100 text-xl">Kami siap membantu Anda merencanakan perjalanan impian</p>
                      </div>
              </div>
        
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                      <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                                <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Informasi Kontak</h2>
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
                                                          <h3 className="font-bold text-green-800 text-lg mb-2">Butuh Respon Cepat?</h3>
                                                          <p className="text-green-700 mb-4">Chat langsung via WhatsApp untuk mendapatkan balasan lebih cepat dari tim kami!</p>
                                                          <a
                                                                            href="https://wa.me/6281234567890?text=Halo Liburan Terus! Saya ingin bertanya mengenai paket wisata."
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                                                                          >
                                                                          <MessageCircle className="w-5 h-5" />
                                                                          Chat WhatsApp Sekarang
                                                          </a>
                                            </div>
                                </div>
                      
                        {/* Contact Form */}
                                <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Kirim Pesan</h2>
                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                          <div className="grid grid-cols-2 gap-4">
                                                                          <div>
                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                                                                                            <input
                                                                                                                  type="text" required value={form.name}
                                                                                                                  onChange={e => setForm({...form, name: e.target.value})}
                                                                                                                  placeholder="John Doe"
                                                                                                                  className={inputClass}
                                                                                                                />
                                                                          </div>
                                                                          <div>
                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp *</label>
                                                                                            <input
                                                                                                                  type="tel" required value={form.phone}
                                                                                                                  onChange={e => setForm({...form, phone: e.target.value})}
                                                                                                                  placeholder="0812xxxxxxxx"
                                                                                                                  className={inputClass}
                                                                                                                />
                                                                          </div>
                                                          </div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                                                          <input
                                                                                              type="email" required value={form.email}
                                                                                              onChange={e => setForm({...form, email: e.target.value})}
                                                                                              placeholder="email@example.com"
                                                                                              className={inputClass}
                                                                                            />
                                                          </div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700 mb-1">Subjek *</label>
                                                                          <select
                                                                                              required value={form.subject}
                                                                                              onChange={e => setForm({...form, subject: e.target.value})}
                                                                                              className={inputClass}
                                                                                            >
                                                                                            <option value="">-- Pilih Subjek --</option>
                                                                                            <option value="Informasi Open Trip">Informasi Open Trip</option>
                                                                                            <option value="Informasi Private Trip">Informasi Private Trip</option>
                                                                                            <option value="Pertanyaan Booking">Pertanyaan Booking</option>
                                                                                            <option value="Pertanyaan Pembayaran">Pertanyaan Pembayaran</option>
                                                                                            <option value="Keluhan / Saran">Keluhan / Saran</option>
                                                                                            <option value="Lainnya">Lainnya</option>
                                                                          </select>
                                                          </div>
                                                          <div>
                                                                          <label className="block text-sm font-medium text-gray-700 mb-1">Pesan *</label>
                                                                          <textarea
                                                                                              required rows={5} value={form.message}
                                                                                              onChange={e => setForm({...form, message: e.target.value})}
                                                                                              placeholder="Tuliskan pesan atau pertanyaan Anda..."
                                                                                              className={inputClass}
                                                                                            />
                                                          </div>
                                                          <button
                                                                            type="submit" disabled={submitting}
                                                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-colors text-lg"
                                                                          >
                                                            {submitting ? (
                                                                                              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengirim...</>
                                                                                            ) : (
                                                                                              <><Send className="w-5 h-5" /> Kirim Pesan</>
                                                                                            )}
                                                          </button>
                                            </form>
                                </div>
                      </div>
              </div>
        </>
      );
}</></></>
