import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getRecentBookings, getRecentPayments, getSettings, addPackage, deletePackage, getPackages, getBookings } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { SITE_NAME } from '../../lib/siteConfig';
import { Package, CalendarCheck, CreditCard, ArrowRight, Clock, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const DIAG_TIMEOUT_MS = 15000;

function withTimeout(promise, message, ms = DIAG_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export default function Dashboard() {
    const [stats, setStats] = useState({ packages: 0, bookings: 0, payments: 0, pendingPayments: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [diagLoading, setDiagLoading] = useState(false);
    const [diagResult, setDiagResult] = useState(null);
    const { currentUser } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
        try {
                const [statsData, recentBookingsData, recentPaymentsData] = await Promise.all([
                  getDashboardStats(),
                  getRecentBookings(5),
                  getRecentPayments(5),
                ]);
                setStats(statsData);
                setRecentBookings(recentBookingsData);
                setRecentPayments(recentPaymentsData);
        } catch (e) { console.error(e); }
        setLoading(false);
  };

  const formatDate = (ts) => {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatPrice = (p) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : '-';

  const exportPackagesJSON = async () => {
    try {
      const pkgs = await getPackages(null, false);
      const blob = new Blob([JSON.stringify(pkgs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `packages-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup paket berhasil didownload!');
    } catch { toast.error('Gagal export paket'); }
  };

  const exportBookingsCSV = async () => {
    try {
      const XLSX = await import('xlsx');
      const bookings = await getBookings();
      const rows = bookings.map(b => ({
        ID: b.id, Nama: b.name, Email: b.email, Telepon: b.phone || '-',
        Paket: b.packageName || '-', Tanggal: b.date || b.tripDate || '-',
        Peserta: b.participants || 1, Status: b.status, 'Dibuat': b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID') : '-',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [20,20,25,15,30,15,10,12,15].map(w => ({ wch: w }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
      XLSX.writeFile(wb, `bookings-${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success('Export booking berhasil!');
    } catch { toast.error('Gagal export booking'); }
  };

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

  const runSupabaseDiagnostics = async () => {
        setDiagLoading(true);
        setDiagResult(null);

        try {
                const settings = await withTimeout(getSettings(), 'Read Supabase timeout');

                const tempPkg = await withTimeout(
                  addPackage({
                    title: { id: 'DIAGNOSTIC_TEMP', en: '' },
                    type: 'open-trip',
                    location: { id: 'localhost', en: '' },
                    price: 0,
                    maxParticipants: 1,
                    images: [],
                    active: false,
                    featured: false,
                    description: { id: 'temporary diagnostic', en: '' },
                  }),
                  'Write Supabase timeout'
                );

                await withTimeout(deletePackage(tempPkg.id), 'Delete Supabase timeout');

                setDiagResult({
                  ok: true,
                  message: `Read OK, write OK, delete OK. Settings exists: ${Object.keys(settings).length > 0 ? 'yes' : 'no'}`,
                });
                toast.success('Tes Supabase berhasil');
        } catch (error) {
                setDiagResult({
                  ok: false,
                  message: error?.message || 'Unknown Supabase error',
                  code: error?.code || null,
                });
                toast.error('Tes Supabase gagal');
        } finally {
                setDiagLoading(false);
        }
  };

  return (
        <div className="space-y-8">
              <div>
                      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                      <p className="text-gray-500">Selamat datang kembali di panel admin {SITE_NAME}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                          <h2 className="font-semibold text-gray-900">Diagnosis Supabase</h2>
                                          <p className="text-sm text-gray-500">Tes koneksi login admin dan Supabase langsung dari browser.</p>
                                </div>
                                <button
                                          onClick={runSupabaseDiagnostics}
                                          disabled={diagLoading}
                                          className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-sm font-medium"
                                >
                                          {diagLoading ? 'Menjalankan tes...' : 'Tes Supabase'}
                                </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 text-sm">
                                <div className="rounded-xl border border-gray-200 p-4">
                                          <p className="text-gray-500 mb-1">User login Supabase</p>
                                          <p className="font-medium text-gray-900">{currentUser?.email || 'Tidak ada sesi login'}</p>
                                </div>
                                <div className="rounded-xl border border-gray-200 p-4">
                                          <p className="text-gray-500 mb-1">UID</p>
                                          <p className="font-medium text-gray-900 break-all">{currentUser?.id || currentUser?.sub || '-'}</p>
                                </div>
                      </div>
                      {diagResult && (
                        <div className={`rounded-xl border p-4 text-sm ${diagResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                                  <p className="font-medium">{diagResult.ok ? 'Hasil tes berhasil' : 'Hasil tes gagal'}</p>
                                  <p>{diagResult.message}</p>
                                  {diagResult.code && <p>Kode: {diagResult.code}</p>}
                        </div>
                      )}
              </div>
        
          {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <Link key={i} to={card.to} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                              <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center text-${card.color}-600`}>
                                                {card.icon}
                                              </div>
                                              <ArrowRight className="w-5 h-5 text-gray-300" />
                                </div>
                                <div className={`text-3xl font-bold text-${card.color}-600 mb-1`}>
                                  {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" /> : card.value}
                                </div>
                                <p className="text-gray-500 text-sm">{card.label}</p>
                    </Link>
                  ))}
              </div>
        
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h2 className="font-semibold text-gray-900">Booking Terbaru</h2>
                                            <Link to="/admin/bookings" className="text-emerald-600 text-sm hover:underline">Lihat Semua</Link>
                                </div>
                                <div className="divide-y divide-gray-50">
                                  {recentBookings.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada booking</p>
                      ) : recentBookings.map(b => (
                        <div key={b.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                                          <div>
                                                                              <p className="font-medium text-gray-900">{b.name || 'Anonymous'}</p>
                                                                              <p className="text-sm text-gray-500">{b.packageName || 'Paket wisata'}</p>
                                                                              <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>
                                                          </div>
                                                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadge(b.status)}`}>
                                                            {b.status || 'pending'}
                                                          </span>
                                        </div>
                        </div>
                      ))}
                                </div>
                      </div>
              
                {/* Recent Payments */}
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h2 className="font-semibold text-gray-900">Pembayaran Terbaru</h2>
                                            <Link to="/admin/payments" className="text-emerald-600 text-sm hover:underline">Lihat Semua</Link>
                                </div>
                                <div className="divide-y divide-gray-50">
                                  {recentPayments.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Belum ada pembayaran</p>
                      ) : recentPayments.map(p => (
                        <div key={p.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                                          <div>
                                                                              <p className="font-medium text-gray-900">{p.bookingName || 'Pembayaran'}</p>
                                                                              <p className="text-sm text-emerald-600 font-semibold">{formatPrice(p.amount)}</p>
                                                                              <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
                                                          </div>
                                                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusBadge(p.status)}`}>
                                                            {p.status || 'pending'}
                                                          </span>
                                        </div>
                        </div>
                      ))}
                                </div>
                      </div>
              </div>
        
          {/* Export & Backup */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-semibold text-gray-900">Export & Backup Data</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={exportPackagesJSON} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Backup Paket Wisata</p>
                      <p className="text-xs text-gray-500">Download semua data paket (.json)</p>
                    </div>
                  </button>
                  <button onClick={exportBookingsCSV} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Export Data Booking</p>
                      <p className="text-xs text-gray-500">Download semua booking (.xlsx)</p>
                    </div>
                  </button>
                </div>
              </div>

          {/* Quick Links */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                      <h2 className="font-bold text-xl mb-4">Aksi Cepat</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
          { to: '/admin/packages', label: 'Tambah Paket', emoji: '✈️' },
          { to: '/admin/blog', label: 'Tulis Artikel', emoji: '✍️' },
          { to: '/admin/payments', label: 'Verifikasi Bayar', emoji: '✅' },
          { to: '/admin/contacts', label: 'Pesan Masuk', emoji: '💬' },
                    ].map((item, i) => (
                                  <Link key={i} to={item.to}
                                                  className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                                                <div className="text-3xl mb-2">{item.emoji}</div>
                                                <p className="text-sm font-medium">{item.label}</p>
                                  </Link>
                                ))}
                      </div>
              </div>
        </div>
      );
}
