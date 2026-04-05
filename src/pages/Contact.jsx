import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await addDoc(collection(db, 'contacts'), { ...form, createdAt: serverTimestamp() })
    } catch {}
    setSent(true)
    setSending(false)
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-700 text-white pt-32 pb-16 text-center">
        <h1 className="text-4xl font-bold font-display mb-3">Hubungi Kami</h1>
        <p className="text-lg opacity-90">Tim kami siap membantu Anda 7 hari seminggu</p>
      </div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Informasi Kontak</h2>
              
              {[
                { icon: FiMapPin, title: 'Kantor Pusat', info: 'Jl. Wisata Nusantara No. 123
Jakarta Selatan 12345
DKI Jakarta, Indonesia', color: 'text-primary-500 bg-primary-50' },
                { icon: FiPhone, title: 'Telepon', info: '+62 812-3456-7890
+62 21-9876-5432', color: 'text-blue-500 bg-blue-50' },
                { icon: FiMail, title: 'Email', info: 'info@nusatrip.com
booking@nusatrip.com', color: 'text-teal-500 bg-teal-50' },
                { icon: FiClock, title: 'Jam Operasional', info: 'Senin - Sabtu: 08.00 - 18.00 WIB
Minggu: 09.00 - 15.00 WIB', color: 'text-purple-500 bg-purple-50' },
              ].map(({ icon: Icon, title, info, color }) => (
                <div key={title} className="flex gap-4">
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center shrink-0 " + color}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                    {info.split('
').map((line, i) => <p key={i} className="text-gray-500 text-sm">{line}</p>)}
                  </div>
                </div>
              ))}

              <div className="bg-green-50 rounded-2xl p-5">
                <h3 className="font-bold text-green-700 mb-3">Chat via WhatsApp</h3>
                <p className="text-green-600 text-sm mb-3">Untuk respons lebih cepat, hubungi kami via WhatsApp</p>
                <a href="https://wa.me/6281234567890?text=Halo NusaTrip, saya ingin bertanya..." target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full font-semibold transition-colors">
                  <FaWhatsapp size={20} /> Mulai Chat WhatsApp
                </a>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-3">Follow Kami</h3>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors"><FaInstagram size={18}/></a>
                  <a href="#" className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"><FaFacebook size={18}/></a>
                  <a href="#" className="w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"><FaWhatsapp size={18}/></a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>
                
                {sent && (
                  <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-4 mb-6">
                    ✅ Pesan berhasil terkirim! Kami akan menghubungi Anda segera.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                      <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nama Anda" className="form-input" required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@example.com" className="form-input" required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">No. WhatsApp</label>
                      <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="08xxxxxxxxxx" className="form-input"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subjek *</label>
                      <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="form-input" required>
                        <option value="">Pilih subjek...</option>
                        {['Pertanyaan Paket', 'Booking & Pembayaran', 'Pengaduan', 'Kerjasama', 'Lainnya'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pesan *</label>
                    <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={6} placeholder="Tuliskan pesan Anda di sini..." className="form-input" required/>
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                    {sending ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <><FiSend size={18}/> Kirim Pesan</>}
                  </button>
                </form>
              </div>

              {/* Map placeholder */}
              <div className="mt-6 bg-gray-200 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
                <iframe src="https://maps.google.com/maps?q=Jakarta+Selatan&output=embed" width="100%" height="100%" style={{border:0}} loading="lazy" className="rounded-2xl" title="Lokasi Kantor NusaTrip" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
