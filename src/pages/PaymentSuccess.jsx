import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Home, MessageCircle, Calendar, User, Package } from 'lucide-react';

export default function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const booking = location.state?.booking || {};

  useEffect(() => {
        window.scrollTo(0, 0);
  }, []);

  const whatsappMessage = encodeURIComponent(
        `Halo Liburan Terus! Saya baru saja melakukan pemesanan paket wisata.\n\nNama: ${booking.name || '-'}\nPaket: ${booking.packageName || '-'}\nTanggal: ${booking.date || '-'}\nID Booking: ${booking.id || '-'}\n\nMohon konfirmasi pemesanan saya. Terima kasih!`
      );

  return (
        <>
              <Helmet>
                      <title>Pembayaran Berhasil - Liburan Terus</title>title>
                      <meta name="robots" content="noindex" />
              </Helmet>Helmet>
        
              <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-4 py-16">
                      <div className="max-w-lg w-full">
                        {/* Success Card */}
                                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                                  {/* Header */}
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center">
                                                          <div className="flex justify-center mb-4">
                                                                          <div className="bg-white rounded-full p-4 shadow-lg">
                                                                                            <CheckCircle className="w-16 h-16 text-emerald-500" />
                                                                          </div>div>
                                                          </div>div>
                                                          <h1 className="text-3xl font-bold text-white mb-2">Pemesanan Berhasil!</h1>h1>
                                                          <p className="text-emerald-100">Terima kasih telah memesan paket wisata dengan kami</p>p>
                                            </div>div>
                                
                                  {/* Body */}
                                            <div className="p-8">
                                              {/* Booking Info */}
                                              {booking.id && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
                                            <h2 className="font-semibold text-emerald-800 mb-4 text-lg">Detail Pemesanan</h2>h2>
                                            <div className="space-y-3">
                                              {booking.id && (
                                                  <div className="flex items-start gap-3">
                                                                          <Package className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                                                          <div>
                                                                                                    <p className="text-xs text-gray-500">ID Booking</p>p>
                                                                                                    <p className="font-mono text-sm font-semibold text-gray-800">{booking.id}</p>p>
                                                                          </div>div>
                                                  </div>div>
                                                                )}
                                              {booking.name && (
                                                  <div className="flex items-start gap-3">
                                                                          <User className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                                                          <div>
                                                                                                    <p className="text-xs text-gray-500">Nama Pemesan</p>p>
                                                                                                    <p className="font-semibold text-gray-800">{booking.name}</p>p>
                                                                          </div>div>
                                                  </div>div>
                                                                )}
                                              {booking.packageName && (
                                                  <div className="flex items-start gap-3">
                                                                          <Package className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                                                          <div>
                                                                                                    <p className="text-xs text-gray-500">Paket Wisata</p>p>
                                                                                                    <p className="font-semibold text-gray-800">{booking.packageName}</p>p>
                                                                          </div>div>
                                                  </div>div>
                                                                )}
                                              {booking.date && (
                                                  <div className="flex items-start gap-3">
                                                                          <Calendar className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                                                          <div>
                                                                                                    <p className="text-xs text-gray-500">Tanggal Perjalanan</p>p>
                                                                                                    <p className="font-semibold text-gray-800">{booking.date}</p>p>
                                                                          </div>div>
                                                  </div>div>
                                                                )}
                                            </div>div>
                          </div>div>
                                                          )}
                                            
                                              {/* Next Steps */}
                                                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                                                                          <h3 className="font-semibold text-amber-800 mb-3">Langkah Selanjutnya</h3>h3>
                                                                          <ol className="space-y-2 text-sm text-amber-700">
                                                                                            <li className="flex items-start gap-2">
                                                                                                                <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>span>
                                                                                                                <span>Tim kami akan memverifikasi pembayaran Anda dalam 1x24 jam</span>span>
                                                                                              </li>li>
                                                                                            <li className="flex items-start gap-2">
                                                                                                                <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>span>
                                                                                                                <span>Konfirmasi booking akan dikirim ke email Anda</span>span>
                                                                                              </li>li>
                                                                                            <li className="flex items-start gap-2">
                                                                                                                <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>span>
                                                                                                                <span>Detail itinerary dan persiapan perjalanan akan kami share 3 hari sebelum keberangkatan</span>span>
                                                                                              </li>li>
                                                                          </ol>ol>
                                                          </div>div>
                                            
                                              {/* CTA Buttons */}
                                                          <div className="space-y-3">
                                                                          <a
                                                                                              href={`https://wa.me/6281234567890?text=${whatsappMessage}`}
                                                                                              target="_blank"
                                                                                              rel="noopener noreferrer"
                                                                                              className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                                                                            >
                                                                                            <MessageCircle className="w-5 h-5" />
                                                                                            Konfirmasi via WhatsApp
                                                                          </a>a>
                                                                          <Link
                                                                                              to="/"
                                                                                              className="flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                                                                            >
                                                                                            <Home className="w-5 h-5" />
                                                                                            Kembali ke Beranda
                                                                          </Link>Link>
                                                          </div>div>
                                            </div>div>
                                </div>div>
                      
                        {/* Footer note */}
                                <p className="text-center text-sm text-gray-500 mt-6">
                                            Ada pertanyaan? Hubungi kami di{' '}
                                            <a href="mailto:info@liburanterus.com" className="text-emerald-600 hover:underline">
                                                          info@liburanterus.com
                                            </a>a>
                                </p>p>
                      </div>div>
              </div>div>
        </>>
      );
}</>
