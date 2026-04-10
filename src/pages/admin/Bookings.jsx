import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, Eye, Trash2, ChevronDown, X } from 'lucide-react';
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
    const [detail, setDetail] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
        setLoading(true);
        const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
  };

  const updateStatus = async (id, status) => {
        await updateDoc(doc(db, 'bookings', id), { status });
        toast.success(`Status diubah ke "${status}"`);
        fetchBookings();
        if (detail?.id === id) setDetail({ ...detail, status });
  };

  const handleDelete = async (id) => {
        if (!confirm('Hapus data booking ini?')) return;
        await deleteDoc(doc(db, 'bookings', id));
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
        const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
                b.email?.toLowerCase().includes(search.toLowerCase()) ||
                b.packageName?.toLowerCase().includes(search.toLowerCase()) ||
                b.id?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
  });

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Kelola Booking</h1>
                                <p className="text-gray-500 text-sm">{bookings.length} total booking</p>
                      </div>
              </div>
        
          {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, email, paket, atau ID..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="semua">Semua Status</option>
                        {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
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
                                                                                  <p className="text-xs text-gray-500">{b.tripDate || '-'}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">{formatDate(b.createdAt)}</td>
                                                            <td className="px-4 py-3 text-gray-600">{b.participants || 1} orang</td>
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
                                                                      <p><span className="font-medium">Tanggal Trip:</span> {detail.tripDate}</p>
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
}</div>
