import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Package, CalendarCheck, CreditCard, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({ packages: 0, bookings: 0, payments: 0, pendingPayments: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
        try {
                const [pkgSnap, bookSnap, paySnap, pendingSnap, recentBookSnap, recentPaySnap] = await Promise.all([
                          getDocs(collection(db, 'packages')),
                          getDocs(collection(db, 'bookings')),
                          getDocs(query(collection(db, 'payments'), where('status', '==', 'verified'))),
                          getDocs(query(collection(db, 'payments'), where('status', '==', 'pending'))),
                          getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(5))),
                          getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(5))),
                        ]);
                setStats({
                          packages: pkgSnap.size,
                          bookings: bookSnap.size,
                          payments: paySnap.size,
                          pendingPayments: pendingSnap.size,
                });
                setRecentBookings(recentBookSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setRecentPayments(recentPaySnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        setLoading(false);
  };

  const formatDate = (ts) => {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatPrice = (p) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : '-';

  const statCards = [
    { label: 'Total Paket', value: stats.packages, icon: <Package className="w-7 h-7" />, color: 'emerald', to: '/admin/packages' },
    { label: 'Total Booking', value: stats.bookings, icon: <CalendarCheck className="w-7 h-7" />, color: 'blue', to: '/admin/bookings' },
    { label: 'Pembayaran Lunas', value: stats.payments, icon: <CreditCard className="w-7 h-7" />, color: 'teal', to: '/admin/payments' },
    { label: 'Menunggu Verifikasi', value: stats.pendingPayments, icon: <Clock className="w-7 h-7" />, color: 'amber', to: '/admin/payments' },
      ];

  const statusBadge = (status) => {
        const map = {
                pending: 'bg-yellow-100 text-yellow-700',
                verified: 'bg-green-100 text-green-700',
                rejected: 'bg-red-100 text-red-700',
                confirmed: 'bg-emerald-100 text-emerald-700',
                cancelled: 'bg-gray-100 text-gray-600',
        };
        return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
        <div className="space-y-8">
              <div>
                      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>h1>
                      <p className="text-gray-500">Selamat datang kembali di panel admin Liburan Terus</p>p>
              </div>div>
        
          {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <Link key={i} to={card.to} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                              <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center text-${card.color}-600`}>
                                                {card.icon}
                                              </div>div>
                                              <ArrowRight className="w-5 h-5 text-gray-300" />
                                </div>div>
                                <div className={`text-3xl font-bold text-${card.color}-600 mb-1`}>
                                  {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" /> : card.value}
                                </div>div>
                                <p className="text-gray-500 text-sm">{card.label}</p>p>
                    </Link>Link>
                  ))}
              </div>div>
        
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h2 className="font-semibold text-gray-900">Booking Terbaru</h2>h2>
                                            <Link to="/admin/bookings" className="text-emerald-600 text-sm hover:underline">Lihat Semua</Link>Link>
                                </div>div>
                                <div className="divide-y divide-gray-50">
                                  {recentBookings.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada booking</p>p>
                      ) : recentBookings.map(b => (
                        <div key={b.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                                          <div>
                                                                              <p className="font-medium text-gray-900">{b.name || 'Anonymous'}</p>p>
                                                                              <p className="text-sm text-gray-500">{b.packageName || 'Paket wisata'}</p>p>
                                                                              <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>p>
                                                          </div>div>
                                                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadge(b.status)}`}>
                                                            {b.status || 'pending'}
                                                          </span>span>
                                        </div>div>
                        </div>div>
                      ))}
                                </div>div>
                      </div>div>
              
                {/* Recent Payments */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h2 className="font-semibold text-gray-900">Pembayaran Terbaru</h2>h2>
                                            <Link to="/admin/payments" className="text-emerald-600 text-sm hover:underline">Lihat Semua</Link>Link>
                                </div>div>
                                <div className="divide-y divide-gray-50">
                                  {recentPayments.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada pembayaran</p>p>
                      ) : recentPayments.map(p => (
                        <div key={p.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                                          <div>
                                                                              <p className="font-medium text-gray-900">{p.bookingName || 'Pembayaran'}</p>p>
                                                                              <p className="text-sm text-emerald-600 font-semibold">{formatPrice(p.amount)}</p>p>
                                                                              <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>p>
                                                          </div>div>
                                                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadge(p.status)}`}>
                                                            {p.status || 'pending'}
                                                          </span>span>
                                        </div>div>
                        </div>div>
                      ))}
                                </div>div>
                      </div>div>
              </div>div>
        
          {/* Quick Links */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                      <h2 className="font-bold text-xl mb-4">Aksi Cepat</h2>h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
          { to: '/admin/packages', label: 'Tambah Paket', emoji: '✈️' },
          { to: '/admin/blog', label: 'Tulis Artikel', emoji: '✍️' },
          { to: '/admin/gallery', label: 'Upload Foto', emoji: '📸' },
          { to: '/admin/payments', label: 'Verifikasi Bayar', emoji: '✅' },
                    ].map((item, i) => (
                                  <Link key={i} to={item.to}
                                                  className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                                                <div className="text-3xl mb-2">{item.emoji}</div>div>
                                                <p className="text-sm font-medium">{item.label}</p>p>
                                  </Link>Link>
                                ))}
                      </div>div>
              </div>div>
        </div>div>
      );
}</div>
