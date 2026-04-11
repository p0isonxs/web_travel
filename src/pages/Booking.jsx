import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getPackageById, addBooking, getOpenTripSlotUsage } from '../firebase/firestore'
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaUsers, FaArrowLeft } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Booking = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [pkg, setPkg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [slotUsage, setSlotUsage] = useState({})

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
                            if (data?.type === 'open-trip') {
                                    const usage = await getOpenTripSlotUsage(id)
                                    setSlotUsage(usage)
                                    if (!preDate && data.departureDates?.length > 0) {
                                            const firstAvailableDate = data.departureDates.find((date) => {
                                                      const capacity = Number(data.maxParticipants) || 15
                                                      return Math.max(0, capacity - (usage[date] || 0)) > 0
                                            })
                                            if (firstAvailableDate) {
                                                      setForm(prev => ({ ...prev, date: firstAvailableDate }))
                                            }
                                    }
                            }
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

    const formatDisplayDate = (value) => {
          if (!value) return '-'
          const parsed = new Date(`${value}T00:00:00`)
          if (Number.isNaN(parsed.getTime())) return value
          return parsed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const formatDisplayDay = (value) => {
          if (!value) return ''
          const parsed = new Date(`${value}T00:00:00`)
          if (Number.isNaN(parsed.getTime())) return value
          return parsed.toLocaleDateString('id-ID', { weekday: 'long' })
    }

    const isOpenTrip = pkg?.type === 'open-trip'
    const requiresUserDate = pkg?.type === 'private-trip'
    const availableDepartureDates = Array.isArray(pkg?.departureDates) ? pkg.departureDates : []
    const capacityPerDate = Number(pkg?.maxParticipants) || 15
    const selectedRemainingSlots = form.date ? Math.max(0, capacityPerDate - (slotUsage[form.date] || 0)) : capacityPerDate

    const handleChange = (e) => {
          const { name, value } = e.target
          setForm(prev => {
                if (name === 'participants') {
                        const maxParticipants = isOpenTrip ? Math.max(1, selectedRemainingSlots) : (pkg?.maxParticipants || 99)
                        return { ...prev, [name]: String(Math.min(maxParticipants, Math.max(1, Number(value) || 1))) }
                }
                return { ...prev, [name]: value }
          })
    }

    const handleSubmit = async (e) => {
          e.preventDefault()
          if (!form.name || !form.email || !form.phone || (requiresUserDate && !form.date) || (isOpenTrip && !form.date)) {
                  toast.error('Mohon lengkapi semua field yang wajib diisi!')
                  return
          }
          if (isOpenTrip && selectedRemainingSlots < Number(form.participants)) {
                  toast.error(selectedRemainingSlots > 0 ? `Slot tersisa hanya ${selectedRemainingSlots} peserta untuk tanggal ini.` : 'Jadwal yang dipilih sudah penuh.')
                  return
          }
          setSubmitting(true)
          try {
                  const bookingData = {
                            packageId: id,
                            packageTitle: pkg.title,
                            packageName: pkg.title,
                            packageType: pkg.type,
                            packageImage: pkg.images?.[0] || pkg.image || '',
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
                          <div className="min-h-screen flex items-center justify-center pt-20">
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                  </>
                )
    }
  
    if (!pkg) {
          return (
                  <>
                          <div className="min-h-screen flex items-center justify-center pt-20 text-center">
                                    <div>
                                                <p className="text-gray-500 mb-4">Paket tidak ditemukan</p>
                                                <Link to="/open-trip" className="text-emerald-600 hover:underline">Kembali</Link>
                                    </div>
                          </div>
                  </>
                )
    }
  
    const totalPrice = pkg.price * form.participants
      
        return (
              <>
                    <Helmet>
                            <title>Form Booking - {pkg.title} | Liburan Terus</title>
                            <meta name="robots" content="noindex" />
                    </Helmet>
              
                    <div className="pt-20 min-h-screen bg-gray-50">
                      {/* Header */}
                            <div className="bg-white border-b">
                                      <div className="max-w-5xl mx-auto px-4 py-4">
                                                  <Link to={`/paket/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors text-sm">
                                                                <FaArrowLeft size={12} />
                                                                Kembali ke detail paket
                                                  </Link>
                                      </div>
                            </div>
                    
                      {/* Progress Steps */}
                            <div className="bg-white border-b">
                                      <div className="max-w-5xl mx-auto px-4 py-4">
                                                  <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                                                                <span className="text-sm font-medium text-emerald-600">Data Peserta</span>
                                                                </div>
                                                                <div className="flex-1 h-0.5 bg-gray-200"></div>
                                                                <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                                                                <span className="text-sm text-gray-500">Pembayaran</span>
                                                                </div>
                                                                <div className="flex-1 h-0.5 bg-gray-200"></div>
                                                                <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                                                                <span className="text-sm text-gray-500">Konfirmasi</span>
                                                                </div>
                                                  </div>
                                      </div>
                            </div>
                    
                            <div className="max-w-5xl mx-auto px-4 py-8">
                                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Form */}
                                                  <div className="lg:col-span-2">
                                                                <form onSubmit={handleSubmit} className="space-y-6">
                                                                  {/* Data Pribadi */}
                                                                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                                  <h2 className="text-lg font-bold text-gray-800 mb-5">Data Peserta Utama</h2>
                                                                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                                                                                      <div className="sm:col-span-2">
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Nama Lengkap <span className="text-red-500">*</span>
                                                                                                                                              </label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                                                                                                                                                                                                placeholder="Masukkan nama lengkap"
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>
                                                                                                                        </div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Email <span className="text-red-500">*</span>
                                                                                                                                              </label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                                                                                                                                                                                                placeholder="email@contoh.com"
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>
                                                                                                                        </div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    No. WhatsApp <span className="text-red-500">*</span>
                                                                                                                                              </label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
                                                                                                                                                                                                placeholder="081234567890"
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>
                                                                                                                        </div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    {isOpenTrip ? 'Jadwal Open Trip' : 'Tanggal Berangkat'} <span className="text-red-500">*</span>
                                                                                                                                              </label>
                                                                                                                                            {isOpenTrip ? (
                                                                                                                                              <div className="space-y-2">
                                                                                                                                                                    {availableDepartureDates.length > 0 ? (
                                                                                                                                                                      <div className="booking-schedule-scroll max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2 pr-1">
                                                                                                                                                                      {availableDepartureDates.map((date) => {
                                                                                                                                                                          const isSelected = form.date === date
                                                                                                                                                                          const booked = slotUsage[date] || 0
                                                                                                                                                                          const remaining = Math.max(0, capacityPerDate - booked)
                                                                                                                                                                          const isFull = remaining <= 0
                                                                                                                                                                          return (
                                                                                                                                                                            <button
                                                                                                                                                                              key={date}
                                                                                                                                                                              type="button"
                                                                                                                                                                              onClick={() => !isFull && setForm(prev => ({ ...prev, date }))}
                                                                                                                                                                              disabled={isFull}
                                                                                                                                                                              className={`w-full rounded-lg border px-3 py-3 text-left transition-all ${
                                                                                                                                                                                isFull
                                                                                                                                                                                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-70'
                                                                                                                                                                                  : isSelected
                                                                                                                                                                                  ? 'border-emerald-500 bg-white'
                                                                                                                                                                                  : 'border-transparent bg-white hover:border-gray-200'
                                                                                                                                                                              }`}
                                                                                                                                                                            >
                                                                                                                                                                              <div className="flex items-start justify-between gap-3">
                                                                                                                                                                                <div>
                                                                                                                                                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                                                                                                                                                                    {formatDisplayDay(date)}
                                                                                                                                                                                  </p>
                                                                                                                                                                                  <p className="mt-1 text-sm font-semibold text-gray-800">
                                                                                                                                                                                    {formatDisplayDate(date)}
                                                                                                                                                                                  </p>
                                                                                                                                                                                  <p className={`mt-1.5 text-xs font-medium ${isFull ? 'text-red-500' : 'text-gray-500'}`}>
                                                                                                                                                                                    {isFull ? 'Slot penuh' : `${remaining} slot tersisa`}
                                                                                                                                                                                  </p>
                                                                                                                                                                                </div>
                                                                                                                                                                                <span className={`mt-0.5 h-4 w-4 rounded-full border-2 transition-colors ${isFull ? 'border-gray-300 bg-gray-200' : isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'}`} />
                                                                                                                                                                              </div>
                                                                                                                                                                            </button>
                                                                                                                                                                          )
                                                                                                                                                                        })}
                                                                                                                                                                      </div>
                                                                                                                                                                    ) : (
                                                                                                                                                                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                                                                                                                                                                        Jadwal open trip belum tersedia. Hubungi admin untuk info keberangkatan terbaru.
                                                                                                                                                                      </div>
                                                                                                                                                                    )}
                                                                                                                                                                    <p className="text-xs text-gray-500">Tanggal open trip ditentukan admin pengelola paket. Pilih salah satu jadwal yang tersedia.</p>
                                                                                                                                              </div>
                                                                                                                                           ) : (
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="date" name="date" value={form.date} onChange={handleChange} required={requiresUserDate}
                                                                                                                                                                                                min={new Date().toISOString().split('T')[0]}
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>
                                                                                                                                            )}
                                                                                                                        </div>
                                                                                                  
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                                                                    Jumlah Peserta <span className="text-red-500">*</span>
                                                                                                                                              </label>
                                                                                                                                            <div className="relative">
                                                                                                                                                                    <FaUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                                                                                                    <input type="number" name="participants" value={form.participants} onChange={handleChange}
                                                                                                                                                                                                min="1" max={isOpenTrip ? Math.max(1, selectedRemainingSlots) : (pkg.maxParticipants || 99)} required
                                                                                                                                                                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                                              </div>
                                                                                                                                              {isOpenTrip && form.date && (
                                                                                                                                                <p className={`mt-2 text-xs ${selectedRemainingSlots > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                                                                                                                                                  {selectedRemainingSlots > 0 ? `Tersisa ${selectedRemainingSlots} slot pada tanggal ini.` : 'Tanggal ini sudah penuh. Pilih jadwal lain.'}
                                                                                                                                                </p>
                                                                                                                                              )}
                                                                                                                        </div>
                                                                                                    </div>
                                                                                </div>
                                                                
                                                                  {/* Kontak Darurat */}
                                                                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                                  <h2 className="text-lg font-bold text-gray-800 mb-5">Kontak Darurat</h2>
                                                                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kontak Darurat</label>
                                                                                                                                            <input type="text" name="emergencyContact" value={form.emergencyContact} onChange={handleChange}
                                                                                                                                                                      placeholder="Nama lengkap"
                                                                                                                                                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                        </div>
                                                                                                                      <div>
                                                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">No. HP Kontak Darurat</label>
                                                                                                                                            <input type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange}
                                                                                                                                                                      placeholder="081234567890"
                                                                                                                                                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50" />
                                                                                                                        </div>
                                                                                                    </div>
                                                                                </div>
                                                                
                                                                  {/* Catatan */}
                                                                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                                  <h2 className="text-lg font-bold text-gray-800 mb-5">Catatan Tambahan</h2>
                                                                                                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                                                                                                                        placeholder="Alergi makanan, kebutuhan khusus, atau pertanyaan lainnya..."
                                                                                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-gray-50 resize-none" />
                                                                                </div>
                                                                
                                                                                <button type="submit" disabled={submitting}
                                                                                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                                                  {submitting ? (
                                                                                                                          <>
                                                                                                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                                                                Memproses...
                                                                                                                            </>
                                                                                                                        ) : (
                                                                                                                          'Lanjutkan ke Pembayaran'
                                                                                                                        )}
                                                                                </button>
                                                                </form>
                                                  </div>
                                      
                                        {/* Order Summary */}
                                                  <div className="lg:col-span-1">
                                                                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                                                                                <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
                                                                                <div className="flex gap-3 mb-4">
                                                                                                  <img src={pkg.image || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=200'}
                                                                                                                        alt={pkg.title}
                                                                                                                        className="w-20 h-16 object-cover rounded-xl shrink-0" />
                                                                                                  <div>
                                                                                                                      <p className="font-semibold text-gray-800 text-sm line-clamp-2">{pkg.title}</p>
                                                                                                                      <p className="text-gray-500 text-xs mt-1">{pkg.location}</p>
                                                                                                                      <span className={`text-xs px-2 py-0.5 rounded-full ${pkg.type === 'open-trip' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                                                                                                                        {pkg.type === 'open-trip' ? 'Open Trip' : 'Private Trip'}
                                                                                                                        </span>
                                                                                                    </div>
                                                                                </div>
                                                                
                                                                                <div className="border-t pt-4 space-y-2.5 text-sm">
                                                                                  {form.date && (
                                    <div className="flex justify-between text-gray-600">
                                                          <span>Tanggal</span>
                                                          <span className="font-medium">{formatDisplayDate(form.date)}</span>
                                    </div>
                                                                                                  )}
                                                                                                  <div className="flex justify-between text-gray-600">
                                                                                                                      <span>Peserta</span>
                                                                                                                      <span className="font-medium">{form.participants} orang</span>
                                                                                                    </div>
                                                                                                  <div className="flex justify-between text-gray-600">
                                                                                                                      <span>Harga/orang</span>
                                                                                                                      <span className="font-medium">{formatPrice(pkg.price)}</span>
                                                                                                    </div>
                                                                                                  <div className="border-t pt-2.5 flex justify-between font-bold text-gray-800">
                                                                                                                      <span>Total</span>
                                                                                                                      <span className="text-emerald-600">{formatPrice(totalPrice)}</span>
                                                                                                    </div>
                                                                                </div>
                                                                </div>
                                                  </div>
                                      </div>
                            </div>
                    </div>
              
              </>
            )
}
  
  export default Booking
