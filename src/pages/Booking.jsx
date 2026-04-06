import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPackageById, addBooking } from '../firebase/firestore'
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaUsers, FaArrowLeft } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Booking = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [pkg, setPkg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const preDate = searchParams.get('date') || ''
    const preParticipants = parseInt(searchParams.get('participants')) || 1

    const [form, setForm] = useState({
          name: '',
          email: '',
          phone: '',
          date: preDate,
          participants: preParticipants,
          notes: '',
          emergencyContact: '',
          emergencyPhone: '',
    })

    useEffect(() => {
          const fetchPackage = async () => {
                  try {
                            const data = await getPackageById(id)
                            setPkg(data)
                  } catch (error) {
                            console.error('Error:', error)
                  } finally {
                            setLoading(false)
                  }
          }
          fetchPackage()
    }, [id])

    const formatPrice = (price) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    const handleChange = (e) => {
          const { name, value } = e.target
          setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
          e.preventDefault()
          if (!form.name || !form.email || !form.phone || !form.date) {
                  toast.error('Mohon lengkapi semua field yang wajib diisi!')
                  return
          }
          setSubmitting(true)
          try {
                  const bookingData = {
                            packageId: id,
                            packageTitle: pkg.title,
                            packageType: pkg.type,
                            packageImage: pkg.image || '',
                            pricePerPerson: pkg.price,
                            totalPrice: pkg.price * form.participants,
                            ...form,
                            participants: Number(form.participants),
                            status: 'pending',
                  }
                  const docRef = await addBooking(bookingData)
                  toast.success('Booking berhasil! Lanjutkan ke pembayaran.')
                  navigate(`/payment/${docRef.id}`)
          } catch (error) {
                  console.error('Error:', error)
                  toast.error('Gagal membuat booking. Coba lagi.')
          } finally {
                  setSubmitting(false)
          }
    }

    if (loading) {
          return (
                  <>
                          <Navbar />
                          <div className="min-h-screen flex items-center justify-center pt-20">
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>div>
                          </div>div>
                          <Footer />
                  </>>
                )
    }
  
    if (!pkg) {
          return (
                  <>
                          <Navbar />
                          <div className="min-h-screen flex items-center justify-center pt-20 text-center">
                                    <div>
                                                <p className="text-gray-500 mb-4">Paket tidak ditemukan</p>p>
                                                <Link to="/open-trip" className="text-emerald-600 hover:underline">Kembali</Link>Link>
                                    </div>div>
                          </div>div>
                          <Footer />
                  </>>
                )
    }
  
    const totalPrice = pkg.price * form.participants
      
        return (
              <>
                    <Helmet>
                            <title>Form Booking - {pkg.title} | Liburan Terus</title>title>
                            <meta name="robots" content="noindex" />
                    </Helmet>Helmet>
                    <Navbar />
              
                    <div className="pt-20 min-h-screen bg-gray-50">
                      {/* Header */}
                            <div className="bg-white border-b">
                                      <div className="max-w-5xl mx-auto px-4 py-4">
                                                  <Link to={`/paket/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors text-sm">
                                                                <FaArrowLeft size={12} />
                                                                Kembali ke detail paket
                                                  </Link>Link>
                                      </div>div>
                            </div>div>
                    
                      {/* Progress Steps */}
                            <div className="bg-white border-b">
                                      <div className="max-w-5xl mx-auto px-4 py-4">
                                                  <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>div>
                                                                                <span className="text-sm font-medium text-emerald-600">Data Peserta</span>span>
                                                                </div>div>
                                                                <div className="flex-1 h-0.5 bg-gray-200"></div>div>
                                                                <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>div>
                                                                                <span className="text-sm text-gray-500">Pembayaran</span>span>
                                                                </div>div>
                                                                <div className="flex-1 h-0.5 bg-gray-200"></div>div>
                                                                <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>div>
                                                                                <span className="text-sm text-gray-500">Konfirmasi</span>span>
                                                                </div>div>
                                                  </div>div>
                                      </div>div>
                            </div>div>
                    
                            <div className="max-w-5xl mx-auto px-4 py-8">
                                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Form */}
                                                  <div className="lg:col-span-2">
                                                                <form onSubmit={handleSubmit} className="space-y-6">
                                                                  {/* Data Pribadi */}
                                                                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                                  <h2 className="text-lg font-bold text-gray-800 mb-5">Data Peserta Utama</h2>h2>
                                                                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                                                                                      <div className="sm:col-span-2">
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Nama Lengkap <span className="text-red-500">*</span>span>
                                                                                                                                              </label>label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                                                                                                                                                                                                placeholder="Masukkan nama lengkap"
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>div>
                                                                                                                        </div>div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Email <span className="text-red-500">*</span>span>
                                                                                                                                              </label>label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                                                                                                                                                                                                placeholder="email@contoh.com"
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>div>
                                                                                                                        </div>div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    No. WhatsApp <span className="text-red-500">*</span>span>
                                                                                                                                              </label>label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
                                                                                                                                                                                                placeholder="081234567890"
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>div>
                                                                                                                        </div>div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Tanggal Berangkat <span className="text-red-500">*</span>span>
                                                                                                                                              </label>label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="date" name="date" value={form.date} onChange={handleChange} required
                                                                                                                                                                                                min={new Date().toISOString().split('T')[0]}
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>div>
                                                                                                                        </div>div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Jumlah Peserta <span className="text-red-500">*</span>span>
                                                                                                                                              </label>label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="number" name="participants" value={form.participants} onChange={handleChange}
                                                                                                                                                                                                min="1" max={pkg.maxParticipants || 99} required
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>div>
                                                                                                                        </div>div>
                                                                                                    </div>div>
                                                                                </div>div>
                                                                
                                                                  {/* Kontak Darurat */}
                                                                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                                  <h2 className="text-lg font-bold text-gray-800 mb-5">Kontak Darurat</h2>h2>
                                                                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kontak Darurat</label>label>
                                                                                                                                            <input type="text" name="emergencyContact" value={form.emergencyContact} onChange={handleChange}
                                                                                                                                                                      placeholder="Nama lengkap"
                                                                                                                                                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                        </div>div>
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. HP Kontak Darurat</label>label>
                                                                                                                                            <input type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange}
                                                                                                                                                                      placeholder="081234567890"
                                                                                                                                                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                        </div>div>
                                                                                                    </div>div>
                                                                                </div>div>
                                                                
                                                                  {/* Catatan */}
                                                                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                                  <h2 className="text-lg font-bold text-gray-800 mb-5">Catatan Tambahan</h2>h2>
                                                                                                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                                                                                                                        placeholder="Alergi makanan, kebutuhan khusus, atau pertanyaan lainnya..."
                                                                                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 resize-none" />
                                                                                </div>div>
                                                                
                                                                                <button type="submit" disabled={submitting}
                                                                                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                                                  {submitting ? (
                                                                                                                          <>
                                                                                                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>div>
                                                                                                                                                Memproses...
                                                                                                                            </>>
                                                                                                                        ) : (
                                                                                                                          'Lanjutkan ke Pembayaran'
                                                                                                                        )}
                                                                                </button>button>
                                                                </form>form>
                                                  </div>div>
                                      
                                        {/* Order Summary */}
                                                  <div className="lg:col-span-1">
                                                                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                                                                                <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>h3>
                                                                                <div className="flex gap-3 mb-4">
                                                                                                  <img src={pkg.image || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200'}
                                                                                                                        alt={pkg.title}
                                                                                                                        className="w-20 h-16 object-cover rounded-xl shrink-0" />
                                                                                                  <div>
                                                                                                                      <p className="font-semibold text-gray-800 text-sm line-clamp-2">{pkg.title}</p>p>
                                                                                                                      <p className="text-gray-500 text-xs mt-1">{pkg.location}</p>p>
                                                                                                                      <span className={`text-xs px-2 py-0.5 rounded-full ${pkg.type === 'open-trip' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                                                                                                                        {pkg.type === 'open-trip' ? 'Open Trip' : 'Private Trip'}
                                                                                                                        </span>span>
                                                                                                    </div>div>
                                                                                </div>div>
                                                                
                                                                                <div className="border-t pt-4 space-y-2.5 text-sm">
                                                                                  {form.date && (
                                    <div className="flex justify-between text-gray-600">
                                                          <span>Tanggal</span>span>
                                                          <span className="font-medium">{new Date(form.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>span>
                                    </div>div>
                                                                                                  )}
                                                                                                  <div className="flex justify-between text-gray-600">
                                                                                                                      <span>Peserta</span>span>
                                                                                                                      <span className="font-medium">{form.participants} orang</span>span>
                                                                                                    </div>div>
                                                                                                  <div className="flex justify-between text-gray-600">
                                                                                                                      <span>Harga/orang</span>span>
                                                                                                                      <span className="font-medium">{formatPrice(pkg.price)}</span>span>
                                                                                                    </div>div>
                                                                                                  <div className="border-t pt-2.5 flex justify-between font-bold text-gray-800">
                                                                                                                      <span>Total</span>span>
                                                                                                                      <span className="text-emerald-600">{formatPrice(totalPrice)}</span>span>
                                                                                                    </div>div>
                                                                                </div>div>
                                                                </div>div>
                                                  </div>div>
                                      </div>div>
                            </div>div>
                    </div>div>
              
                    <Footer />
              </>>
            )
}
  
  export default Booking</></></></>
