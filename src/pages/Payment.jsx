import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getBookingById, updateBooking, upsertPaymentByBookingId, getPaymentByBookingId } from '../lib/database'
import { uploadToCloudinary } from '../utils/cloudinary'
import { FaUniversity, FaCheckCircle, FaUpload, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useSettings } from '../contexts/SettingsContext'
import { useLanguage } from '../contexts/LanguageContext'

const Payment = () => {
    const { bookingId } = useParams()
    const navigate = useNavigate()
    const settings = useSettings()
    const { t, language } = useLanguage()
    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [proofFile, setProofFile] = useState(null)
    const [proofPreview, setProofPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [paymentRecord, setPaymentRecord] = useState(null)

    useEffect(() => {
          const fetchData = async () => {
                  try {
                            const [data, payment] = await Promise.all([
                              getBookingById(bookingId),
                              getPaymentByBookingId(bookingId),
                            ])
                            setBooking(data)
                            setPaymentRecord(payment)
                            if (data?.status === 'paid' || data?.status === 'confirmed') {
                              navigateToSuccess(data)
                            }
                  } catch (error) {
                            console.error('Error:', error)
                  } finally {
                            setLoading(false)
                  }
          }
          fetchData()
    }, [bookingId])

    const formatPrice = (price) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    const navigateToSuccess = (data = booking) => {
          navigate('/pembayaran-berhasil', {
                  replace: true,
                  state: {
                            booking: {
                                      ...data,
                                      id: bookingId,
                                      packageName: data?.packageName || data?.packageTitle,
                            },
                  },
          })
    }

    const createPaymentRecord = async ({ status, method, proofUrl = '', midtransOrderId = '' }) => {
          await upsertPaymentByBookingId(bookingId, {
                    bookingName: booking.name,
                    packageName: booking.packageName || booking.packageTitle,
                    amount: booking.totalPrice,
                    method,
                    status,
                    proofUrl,
                    midtransOrderId,
          })
    }

    const handleFileChange = (e) => {
          const file = e.target.files[0]
          if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                            toast.error(t('payment.maxFileSize'))
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
                  toast.error(t('payment.chooseProofFirst'))
                  return
          }
          setUploading(true)
          let url = ''
          try {
                  url = await uploadToCloudinary(proofFile, 'payments')
          } catch (error) {
                  console.error('Cloudinary upload error:', error)
                  toast.error('Gagal upload foto: ' + (error.message || error))
                  setUploading(false)
                  return
          }
          try {
                  await createPaymentRecord({
                            status: 'pending',
                            method: 'transfer',
                            proofUrl: url,
                  })
          } catch (error) {
                  console.error('Payment record error:', error)
                  toast.error('Gagal simpan data pembayaran: ' + (error.message || error))
                  setUploading(false)
                  return
          }
          try {
                  await updateBooking(bookingId, {
                            status: 'waiting_confirmation',
                            paymentMethod: 'transfer',
                            paymentProofUrl: url,
                            paidAt: new Date().toISOString(),
                  })
                  setPaymentRecord(prev => ({ ...prev, status: 'pending' }))
                  toast.success(t('payment.proofUploaded'))
                  navigateToSuccess()
          } catch (error) {
                  console.error('Update booking error:', error)
                  toast.error('Gagal update status booking: ' + (error.message || error))
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
                                    <p className="text-gray-500">{t('payment.bookingNotFound')}</p>
                          </div>
                  </>
                )
    }
  
    return (
          <>
                <Helmet>
                        <title>{t('payment.title')} - Liburan Terus</title>
                        <meta name="robots" content="noindex" />
                </Helmet>
          
                <div className="pt-20 min-h-screen bg-gray-50">
                  {/* Header */}
                        <div className="bg-white border-b">
                                  <div className="max-w-5xl mx-auto px-4 py-4">
                                              <Link to={`/booking/${booking.packageId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm">
                                                            <FaArrowLeft size={12} />
                                                            {t('payment.back')}
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
                                                                            <span className="text-sm font-medium text-emerald-600">{t('payment.stepTraveler')}</span>
                                                            </div>
                                                            <div className="flex-1 h-0.5 bg-emerald-500"></div>
                                                            <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                                                            <span className="text-sm font-medium text-emerald-600">{t('payment.stepPayment')}</span>
                                                            </div>
                                                            <div className="flex-1 h-0.5 bg-gray-200"></div>
                                                            <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                                                            <span className="text-sm text-gray-500">{t('payment.stepConfirmation')}</span>
                                                            </div>
                                              </div>
                                  </div>
                        </div>
                
                        <div className="max-w-5xl mx-auto px-4 py-8">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Payment Methods */}
                                              <div className="lg:col-span-2 space-y-6">
                                                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                            <h2 className="text-lg font-bold text-gray-800 mb-5">{t('payment.bankTransfer')}</h2>

                                                              {/* Transfer Bank */}
                                                              <div className="space-y-4">

                                                  {/* Rejection notice */}
                                                  {paymentRecord?.status === 'rejected' && (
                                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                                      <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
                                                      <div>
                                                        <p className="text-sm font-semibold text-red-700">Bukti pembayaran ditolak</p>
                                                        <p className="text-xs text-red-600 mt-1">
                                                          Bukti transfer sebelumnya tidak valid. Silakan upload ulang bukti pembayaran yang benar di bawah ini.
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}

                                                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                                        <p className="text-sm font-semibold text-amber-800 mb-3">{t('payment.bankInfo')}</p>
                                                                        <div className="space-y-2 text-sm">
                                                                                                <div className="flex justify-between">
                                                                                                                          <span className="text-gray-500">{t('payment.bank')}</span>
                                                                                                                          <span className="font-semibold text-gray-800">{settings.bankName}</span>
                                                                                                  </div>
                                                                                                <div className="flex justify-between">
                                                                                                                          <span className="text-gray-500">{t('payment.accountNumber')}</span>
                                                                                                                          <span className="font-semibold text-gray-800 font-mono">{settings.bankAccount}</span>
                                                                                                  </div>
                                                                                                <div className="flex justify-between">
                                                                                                                          <span className="text-gray-500">{t('payment.accountName')}</span>
                                                                                                                          <span className="font-semibold text-gray-800">{settings.bankAccountName}</span>
                                                                                                  </div>
                                                                                                <div className="flex justify-between border-t pt-2 mt-2">
                                                                                                                          <span className="text-gray-500 font-semibold">{t('payment.transferAmount')}</span>
                                                                                                                          <span className="font-bold text-emerald-600">{formatPrice(booking.totalPrice)}</span>
                                                                                                  </div>
                                                                        </div>
                                                  </div>
                              
                                                  <div>
                                                                        <p className="text-sm font-medium text-gray-700 mb-2">{t('payment.uploadProof')}</p>
                                                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors">
                                                                                                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange}
                                                                                                                            className="hidden" id="proof-upload" />
                                                                          {proofPreview ? (
                                                          <div>
                                                                                      <img src={proofPreview} alt="Bukti" className="max-h-40 mx-auto rounded-lg mb-2 object-contain" />
                                                                                      <label htmlFor="proof-upload" className="text-emerald-600 text-sm cursor-pointer hover:underline">
                                                                                            {t('payment.changeImage')}
                                                                                        </label>
                                                          </div>
                                                        ) : (
                                                          <label htmlFor="proof-upload" className="cursor-pointer block">
                                                                                      <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                                                                                      <p className="text-sm text-gray-500">{t('payment.clickUpload')}</p>
                                                                                      <p className="text-xs text-gray-400 mt-1">{t('payment.uploadTypes')}</p>
                                                          </label>
                                                                                                )}
                                                                        </div>
                                                  </div>
                              
                                                  <button onClick={handleUploadProof} disabled={!proofFile || uploading}
                                                                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                                    {uploading ? (
                                                                                                    <>
                                                                                                                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                                              {t('payment.uploading')}
                                                                                                      </>
                                                                                                  ) : (
                                                                                                    <>
                                                                                                                              <FaUpload />
                                                                                                                              {t('payment.sendProof')}
                                                                                                      </>
                                                                                                  )}
                                                  </button>
                              </div>
                                                            </div>
                                              </div>
                                  
                                    {/* Summary */}
                                              <div className="lg:col-span-1">
                                                            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                                                                            <h3 className="font-bold text-gray-800 mb-4">{t('payment.bookingDetail')}</h3>
                                                                            <div className="space-y-3 text-sm">
                                                                                              <div>
                                                                                                                  <p className="text-gray-500 text-xs mb-1">{t('payment.package')}</p>
                                                                                                                  <p className="font-semibold text-gray-800">{booking.packageTitle}</p>
                                                                                                </div>
                                                                                              <div className="grid grid-cols-2 gap-3">
                                                                                                                  <div>
                                                                                                                                        <p className="text-gray-500 text-xs mb-0.5">{t('payment.name')}</p>
                                                                                                                                        <p className="font-medium text-gray-700">{booking.name}</p>
                                                                                                                    </div>
                                                                                                                  <div>
                                                                                                                                        <p className="text-gray-500 text-xs mb-0.5">{t('payment.participants')}</p>
                                                                                                                                        <p className="font-medium text-gray-700">{booking.participants} {t('payment.participantUnit')}</p>
                                                                                                                    </div>
                                                                                                                  <div>
                                                                                                                                        <p className="text-gray-500 text-xs mb-0.5">{t('payment.date')}</p>
                                                                                                                                        <p className="font-medium text-gray-700">
                                                                                                                                          {booking.date ? new Date(booking.date).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                                                                                                          </p>
                                                                                                                    </div>
                                                                                                </div>
                                                                                              <div className="border-t pt-3 flex justify-between font-bold text-base">
                                                                                                                  <span>{t('payment.totalPay')}</span>
                                                                                                                  <span className="text-emerald-600">{formatPrice(booking.totalPrice)}</span>
                                                                                                </div>
                                                                                              <div className="flex justify-between text-xs text-gray-400">
                                                                                                                  <span>{t('payment.bookingId')}</span>
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
