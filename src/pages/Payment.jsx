import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getBookingById, updateBooking } from '../firebase/firestore'
import { uploadToCloudinary } from '../utils/cloudinary'
import { FaCreditCard, FaUniversity, FaCheckCircle, FaUpload, FaArrowLeft } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useSettings } from '../contexts/SettingsContext'

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''

const Payment = () => {
    const { bookingId } = useParams()
    const navigate = useNavigate()
    const settings = useSettings()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paymentMethod, setPaymentMethod] = useState('midtrans')
    const [proofFile, setProofFile] = useState(null)
    const [proofPreview, setProofPreview] = useState(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
          const fetchBooking = async () => {
                  try {
                            const data = await getBookingById(bookingId)
                            setBooking(data)
                            if (data?.status === 'paid') {
                                        navigate('/payment/success', { replace: true })
                            }
                  } catch (error) {
                            console.error('Error:', error)
                  } finally {
                            setLoading(false)
                  }
          }
          fetchBooking()
    }, [bookingId])

    const formatPrice = (price) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    const handleMidtrans = () => {
          if (typeof window.snap === 'undefined') {
                  const script = document.createElement('script')
                  script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
                  script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY)
                  script.onload = () => openSnap()
                  document.head.appendChild(script)
          } else {
                  openSnap()
          }
    }

    const openSnap = async () => {
          try {
                  const response = await fetch('/api/create-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                        bookingId,
                                        amount: booking.totalPrice,
                                        customerName: booking.name,
                                        customerEmail: booking.email,
                                        customerPhone: booking.phone,
                                        itemName: booking.packageTitle,
                            }),
                  })
                  const { token } = await response.json()

            window.snap.pay(token, {
                      onSuccess: async (result) => {
                                  await updateBooking(bookingId, {
                                                status: 'paid',
                                                paymentMethod: 'midtrans',
                                                midtransOrderId: result.order_id,
                                                paidAt: new Date().toISOString(),
                                  })
                                  navigate('/payment/success')
                      },
                      onPending: (result) => {
                                  toast.info('Pembayaran sedang diproses...')
                      },
                      onError: (result) => {
                                  toast.error('Pembayaran gagal. Coba lagi.')
                      },
                      onClose: () => {
                                  toast.warning('Pembayaran dibatalkan')
                      }
            })
          } catch (error) {
                  toast.error('Gagal memulai pembayaran')
          }
    }

    const handleFileChange = (e) => {
          const file = e.target.files[0]
          if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                            toast.error('Ukuran file maksimal 5MB')
                            return
                  }
                  setProofFile(file)
                  const reader = new FileReader()
                  reader.onload = (e) => setProofPreview(e.target.result)
                  reader.readAsDataURL(file)
          }
    }

    const handleUploadProof = async () => {
          if (!proofFile) {
                  toast.error('Pilih file bukti pembayaran terlebih dahulu!')
                  return
          }
          setUploading(true)
          try {
                  const url = await uploadToCloudinary(proofFile, 'payments')
                  await updateBooking(bookingId, {
                            status: 'waiting_confirmation',
                            paymentMethod: 'transfer',
                            paymentProofUrl: url,
                            paidAt: new Date().toISOString(),
                  })
                  toast.success('Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.')
                  navigate('/payment/success')
          } catch (error) {
                  console.error('Error:', error)
                  toast.error('Gagal mengunggah bukti pembayaran')
          } finally {
                  setUploading(false)
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
  
    if (!booking) {
          return (
                  <>
                          <div className="min-h-screen flex items-center justify-center pt-20 text-center">
                                    <p className="text-gray-500">Booking tidak ditemukan</p>
                          </div>
                  </>
                )
    }
  
    return (
          <>
                <Helmet>
                        <title>Pembayaran - Liburan Terus</title>
                        <meta name="robots" content="noindex" />
                </Helmet>
          
                <div className="pt-20 min-h-screen bg-gray-50">
                  {/* Header */}
                        <div className="bg-white border-b">
                                  <div className="max-w-5xl mx-auto px-4 py-4">
                                              <Link to={`/booking/${booking.packageId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm">
                                                            <FaArrowLeft size={12} />
                                                            Kembali
                                              </Link>
                                  </div>
                        </div>
                
                  {/* Progress Steps */}
                        <div className="bg-white border-b">
                                  <div className="max-w-5xl mx-auto px-4 py-4">
                                              <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">
                                                                                              <FaCheckCircle />
                                                                            </div>
                                                                            <span className="text-sm font-medium text-emerald-600">Data Peserta</span>
                                                            </div>
                                                            <div className="flex-1 h-0.5 bg-emerald-500"></div>
                                                            <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                                                            <span className="text-sm font-medium text-emerald-600">Pembayaran</span>
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
                                    {/* Payment Methods */}
                                              <div className="lg:col-span-2 space-y-6">
                                                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                            <h2 className="text-lg font-bold text-gray-800 mb-5">Pilih Metode Pembayaran</h2>
                                                            
                                                              {/* Method Selector */}
                                                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                                                              <button onClick={() => setPaymentMethod('midtrans')}
                                                                                                                    className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'midtrans' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                                                                                  <FaCreditCard className={`mx-auto mb-2 text-2xl ${paymentMethod === 'midtrans' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                                                                                  <p className={`text-sm font-semibold ${paymentMethod === 'midtrans' ? 'text-emerald-700' : 'text-gray-600'}`}>Bayar Online</p>
                                                                                                                  <p className="text-xs text-gray-400 mt-0.5">via Midtrans</p>
                                                                                                </button>
                                                                                              <button onClick={() => setPaymentMethod('transfer')}
                                                                                                                    className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'transfer' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                                                                                  <FaUniversity className={`mx-auto mb-2 text-2xl ${paymentMethod === 'transfer' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                                                                                  <p className={`text-sm font-semibold ${paymentMethod === 'transfer' ? 'text-emerald-700' : 'text-gray-600'}`}>Transfer Bank</p>
                                                                                                                  <p className="text-xs text-gray-400 mt-0.5">Manual</p>
                                                                                                </button>
                                                                            </div>
                                                            
                                                              {/* Midtrans Payment */}
                                                              {paymentMethod === 'midtrans' && (
                              <div className="space-y-4">
                                                  <div className="bg-blue-50 rounded-xl p-4">
                                                                        <p className="text-sm text-blue-700 font-medium mb-2">Pembayaran via Midtrans</p>
                                                                        <p className="text-xs text-blue-600">Tersedia: Kartu Kredit/Debit, Transfer Bank, E-Wallet (GoPay, OVO, DANA, dll), QRIS, Indomaret/Alfamart</p>
                                                  </div>
                                                  <button onClick={handleMidtrans}
                                                                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                                                        <FaCreditCard />
                                                                        Bayar {formatPrice(booking.totalPrice)} via Midtrans
                                                  </button>
                              </div>
                                                                            )}
                                                            
                                                              {/* Transfer Bank */}
                                                              {paymentMethod === 'transfer' && (
                              <div className="space-y-4">
                                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                                        <p className="text-sm font-semibold text-amber-800 mb-3">Informasi Rekening</p>
                                                                        <div className="space-y-2 text-sm">
                                                                                                <div className="flex justify-between">
                                                                                                                          <span className="text-gray-500">Bank</span>
                                                                                                                          <span className="font-semibold text-gray-800">{settings.bankName}</span>
                                                                                                  </div>
                                                                                                <div className="flex justify-between">
                                                                                                                          <span className="text-gray-500">No. Rekening</span>
                                                                                                                          <span className="font-semibold text-gray-800 font-mono">{settings.bankAccount}</span>
                                                                                                  </div>
                                                                                                <div className="flex justify-between">
                                                                                                                          <span className="text-gray-500">Atas Nama</span>
                                                                                                                          <span className="font-semibold text-gray-800">{settings.bankAccountName}</span>
                                                                                                  </div>
                                                                                                <div className="flex justify-between border-t pt-2 mt-2">
                                                                                                                          <span className="text-gray-500 font-semibold">Jumlah Transfer</span>
                                                                                                                          <span className="font-bold text-emerald-600">{formatPrice(booking.totalPrice)}</span>
                                                                                                  </div>
                                                                        </div>
                                                  </div>
                              
                                                  <div>
                                                                        <p className="text-sm font-medium text-gray-700 mb-2">Upload Bukti Transfer</p>
                                                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors">
                                                                                                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange}
                                                                                                                            className="hidden" id="proof-upload" />
                                                                          {proofPreview ? (
                                                          <div>
                                                                                      <img src={proofPreview} alt="Bukti" className="max-h-40 mx-auto rounded-lg mb-2 object-contain" />
                                                                                      <label htmlFor="proof-upload" className="text-emerald-600 text-sm cursor-pointer hover:underline">
                                                                                                                    Ganti gambar
                                                                                        </label>
                                                          </div>
                                                        ) : (
                                                          <label htmlFor="proof-upload" className="cursor-pointer block">
                                                                                      <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                                                                                      <p className="text-sm text-gray-500">Klik untuk upload bukti transfer</p>
                                                                                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau PDF (maks. 5MB)</p>
                                                          </label>
                                                                                                )}
                                                                        </div>
                                                  </div>
                              
                                                  <button onClick={handleUploadProof} disabled={!proofFile || uploading}
                                                                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                    {uploading ? (
                                                                                                    <>
                                                                                                                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                                              Mengunggah...
                                                                                                      </>
                                                                                                  ) : (
                                                                                                    <>
                                                                                                                              <FaUpload />
                                                                                                                              Kirim Bukti Pembayaran
                                                                                                      </>
                                                                                                  )}
                                                  </button>
                              </div>
                                                                            )}
                                                            </div>
                                              </div>
                                  
                                    {/* Summary */}
                                              <div className="lg:col-span-1">
                                                            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                                                                            <h3 className="font-bold text-gray-800 mb-4">Detail Pemesanan</h3>
                                                                            <div className="space-y-3 text-sm">
                                                                                              <div>
                                                                                                                  <p className="text-gray-500 text-xs mb-1">Paket</p>
                                                                                                                  <p className="font-semibold text-gray-800">{booking.packageTitle}</p>
                                                                                                </div>
                                                                                              <div className="grid grid-cols-2 gap-3">
                                                                                                                  <div>
                                                                                                                                        <p className="text-gray-500 text-xs mb-0.5">Nama</p>
                                                                                                                                        <p className="font-medium text-gray-700">{booking.name}</p>
                                                                                                                    </div>
                                                                                                                  <div>
                                                                                                                                        <p className="text-gray-500 text-xs mb-0.5">Peserta</p>
                                                                                                                                        <p className="font-medium text-gray-700">{booking.participants} orang</p>
                                                                                                                    </div>
                                                                                                                  <div>
                                                                                                                                        <p className="text-gray-500 text-xs mb-0.5">Tanggal</p>
                                                                                                                                        <p className="font-medium text-gray-700">
                                                                                                                                          {booking.date ? new Date(booking.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                                                                                                          </p>
                                                                                                                    </div>
                                                                                                </div>
                                                                                              <div className="border-t pt-3 flex justify-between font-bold text-base">
                                                                                                                  <span>Total Bayar</span>
                                                                                                                  <span className="text-emerald-600">{formatPrice(booking.totalPrice)}</span>
                                                                                                </div>
                                                                                              <div className="flex justify-between text-xs text-gray-400">
                                                                                                                  <span>Booking ID</span>
                                                                                                                  <span className="font-mono">{bookingId?.substring(0, 8)}</span>
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
  
  export default Payment
