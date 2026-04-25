import { useState, useEffect } from 'react';
import { getBookings, updateBooking, deleteBooking } from '../../lib/database';
import { Search, Eye, Trash2, X, CalendarCheck, Wallet, Clock3, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusBadge = (s) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [filterType, setFilterType] = useState('semua');
    const [detail, setDetail] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
        setLoading(true);
        setBookings(await getBookings());
        setLoading(false);
  };

  const updateStatus = async (id, status) => {
        await updateBooking(id, { status });
        toast.success(`Status diubah ke "${status}"`);
        fetchBookings();
        if (detail?.id === id) setDetail({ ...detail, status });
  };

  const handleDelete = async (id) => {
        if (!confirm('Hapus data booking ini?')) return;
        await deleteBooking(id);
        toast.success('Booking dihapus');
        fetchBookings();
        if (detail?.id === id) setDetail(null);
  };

  const formatDate = (ts) => {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filtered = bookings.filter(b => {
        const matchStatus = filterStatus === 'semua' || b.status === filterStatus;
        const matchType = filterType === 'semua' || b.packageType === filterType;
        const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
                b.email?.toLowerCase().includes(search.toLowerCase()) ||
                b.packageName?.toLowerCase().includes(search.toLowerCase()) ||
                b.id?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchType && matchSearch;
  });

  const tripDateLabel = (booking) => booking.date || booking.tripDate || '-';
  const formatPrice = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const stats = [
    {
      label: 'Pending',
      value: bookings.filter((booking) => booking.status === 'pending').length,
      icon: <Clock3 className="w-5 h-5" />,
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Terkonfirmasi',
      value: bookings.filter((booking) => booking.status === 'confirmed').length,
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Total Peserta',
      value: bookings.reduce((sum, booking) => sum + (Number(booking.participants) || 0), 0),
      icon: <CalendarCheck className="w-5 h-5" />,
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Nilai Booking',
      value: formatPrice(bookings.reduce((sum, booking) => sum + (Number(booking.totalPrice) || 0), 0)),
      icon: <Wallet className="w-5 h-5" />,
      iconClass: 'bg-teal-100 text-teal-700',
    },
  ];

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Kelola Booking</h1>
                                <p className="text-gray-500 text-sm">{bookings.length} total booking</p>
                      </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconClass}`}>
                      {stat.icon}
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
        
          {/* Filters */}
              <div className="flex flex-col gap-3 lg:flex-row">
                      <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, email, paket, atau ID..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[340px]">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                  <option value="semua">Semua Status</option>
                          {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                          <option value="semua">Semua Tipe</option>
                          <option value="open-trip">Open Trip</option>
                          <option value="private-trip">Private Trip</option>
                        </select>
                      </div>
              </div>
        
          {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Memuat data...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Tidak ada booking ditemukan</div>
                  ) : (
                    <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                              <thead className="bg-gray-50 border-b border-gray-100">
                                                              <tr>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Pemesan</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Paket</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tanggal Booking</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Peserta</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>
                                                              </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-50">
                                                {filtered.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                                  <p className="font-medium text-gray-900">{b.name}</p>
                                                                                  <p className="text-xs text-gray-500">{b.email}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <p className="text-gray-800 line-clamp-1">{b.packageName || '-'}</p>
                                                                                  <div className="mt-1 flex items-center gap-2">
                                                                                    <p className="text-xs text-gray-500">{tripDateLabel(b)}</p>
                                                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.packageType === 'private-trip' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                                      {b.packageType === 'private-trip' ? 'Private' : 'Open'}
                                                                                    </span>
                                                                                  </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">{formatDate(b.createdAt)}</td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                              <p>{b.participants || 1} orang</p>
                                                              <p className="text-xs text-gray-400">{formatPrice(b.totalPrice)}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <select
                                                                                                            value={b.status || 'pending'}
                                                                                                            onChange={e => updateStatus(b.id, e.target.value)}
                                                                                                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none capitalize ${statusBadge(b.status)}`}
                                                                                                          >
                                                                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                                                    </select>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                                  <div className="flex items-center gap-2">
                                                                                                          <button onClick={() => setDetail(b)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                                                                                                          <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                                                    </div>
                                                            </td>
                                        </tr>
                                      ))}
                                              </tbody>
                                </table>
                    </div>
                      )}
              </div>
        
          {/* Detail Modal */}
          {detail && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                      <h2 className="text-xl font-bold text-gray-900">Detail Booking</h2>
                                                      <button onClick={() => setDetail(null)}><X className="w-6 h-6 text-gray-400" /></button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                                                      <p><span className="font-medium">ID Booking:</span> <span className="font-mono text-xs">{detail.id}</span></p>
                                                                      <p><span className="font-medium">Nama:</span> {detail.name}</p>
                                                                      <p><span className="font-medium">Email:</span> {detail.email}</p>
                                                                      <p><span className="font-medium">No. HP:</span> {detail.phone}</p>
                                                                      <p><span className="font-medium">Paket:</span> {detail.packageName}</p>
                                                                      <p><span className="font-medium">Tanggal Trip:</span> {tripDateLabel(detail)}</p>
                                                                      <p><span className="font-medium">Jumlah Peserta:</span> {detail.participants} orang</p>
                                                        {detail.emergencyContact && <p><span className="font-medium">Kontak Darurat:</span> {detail.emergencyContact}</p>}
                                                        {detail.notes && <p><span className="font-medium">Catatan:</span> {detail.notes}</p>}
                                                                      <p><span className="font-medium">Tanggal Booking:</span> {formatDate(detail.createdAt)}</p>
                                                      </div>
                                                      <div className="flex items-center gap-3">
                                                                      <span className="font-medium text-sm">Status:</span>
                                                                      <select
                                                                                          value={detail.status || 'pending'}
                                                                                          onChange={e => updateStatus(detail.id, e.target.value)}
                                                                                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                                                                                        >
                                                                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                                      </select>
                                                      </div>
                                                      <a
                                                                        href={`https://wa.me/${detail.phone?.replace(/\D/g, '')}?text=Halo ${detail.name}, terima kasih telah memesan paket ${detail.packageName} di Liburan Terus!`}
                                                                        target="_blank" rel="noopener noreferrer"
                                                                        className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition-colors text-sm"
                                                                      >
                                                                      Chat via WhatsApp
                                                      </a>
                                        </div>
                            </div>
                  </div>
              )}
        </div>
      );
}
