import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';

const statusBadge = (s) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [detail, setDetail] = useState(null);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
        setLoading(true);
        const snap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
  };

  const updateStatus = async (id, status) => {
        await updateDoc(doc(db, 'payments', id), { status, verifiedAt: status === 'verified' ? new Date() : null });
        toast.success(status === 'verified' ? 'Pembayaran diverifikasi!' : 'Pembayaran ditolak');
        fetchPayments();
        if (detail?.id === id) setDetail({ ...detail, status });
  };

  const formatDate = (ts) => {
        if (!ts) return '-';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (p) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : '-';

  const filtered = payments.filter(p => {
        const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
        const matchSearch = p.bookingName?.toLowerCase().includes(search.toLowerCase()) ||
                p.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
                p.method?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
  });

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
        <div className="space-y-6">
              <div className="flex items-center justify-between">
                      <div>
                                <h1 className="text-2xl font-bold text-gray-900">Kelola Pembayaran</h1>h1>
                        {pendingCount > 0 && (
                      <p className="text-amber-600 font-medium text-sm">{pendingCount} pembayaran menunggu verifikasi</p>p>
                                )}
                      </div>div>
              </div>div>
        
          {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
          { label: 'Menunggu', count: payments.filter(p => p.status === 'pending').length, color: 'amber' },
          { label: 'Terverifikasi', count: payments.filter(p => p.status === 'verified').length, color: 'green' },
          { label: 'Ditolak', count: payments.filter(p => p.status === 'rejected').length, color: 'red' },
                  ].map((s, i) => (
                              <div key={i} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-xl p-4 text-center`}>
                                          <div className={`text-3xl font-bold text-${s.color}-600`}>{s.count}</div>div>
                                          <p className={`text-${s.color}-700 text-sm`}>{s.label}</p>p>
                              </div>div>
                            ))}
              </div>div>
        
          {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, ID booking, metode..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>div>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="semua">Semua Status</option>option>
                                <option value="pending">Menunggu</option>option>
                                <option value="verified">Terverifikasi</option>option>
                                <option value="rejected">Ditolak</option>option>
                      </select>select>
              </div>div>
        
          {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Memuat data...</div>div>
                  ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Tidak ada pembayaran ditemukan</div>div>
                  ) : (
                    <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                              <thead className="bg-gray-50 border-b border-gray-100">
                                                              <tr>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Pemesan</th>th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Jumlah</th>th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Metode</th>th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tanggal</th>th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>th>
                                                                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>th>
                                                              </tr>tr>
                                              </thead>thead>
                                              <tbody className="divide-y divide-gray-50">
                                                {filtered.map(p => (
                                        <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                                                            <td className="px-4 py-3">
                                                                                  <p className="font-medium text-gray-900">{p.bookingName || '-'}</p>p>
                                                                                  <p className="text-xs text-gray-500 font-mono">{p.bookingId?.slice(0, 12)}...</p>p>
                                                            </td>td>
                                                            <td className="px-4 py-3 font-semibold text-emerald-600">{formatPrice(p.amount)}</td>td>
                                                            <td className="px-4 py-3">
                                                                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">{p.method || 'transfer'}</span>span>
                                                            </td>td>
                                                            <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(p.createdAt)}</td>td>
                                                            <td className="px-4 py-3">
                                                                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusBadge(p.status)}`}>{p.status}</span>span>
                                                            </td>td>
                                                            <td className="px-4 py-3">
                                                                                  <div className="flex items-center gap-1">
                                                                                                          <button onClick={() => setDetail(p)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Eye className="w-4 h-4" /></button>button>
                                                                                    {p.status === 'pending' && (
                                                                    <>
                                                                                                <button onClick={() => updateStatus(p.id, 'verified')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Verifikasi"><CheckCircle className="w-4 h-4" /></button>button>
                                                                                                <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Tolak"><XCircle className="w-4 h-4" /></button>button>
                                                                    </>>
                                                                  )}
                                                                                    </div>div>
                                                            </td>td>
                                        </tr>tr>
                                      ))}
                                              </tbody>tbody>
                                </table>table>
                    </div>div>
                      )}
              </div>div>
        
          {/* Detail Modal */}
          {detail && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                                                      <h2 className="text-xl font-bold text-gray-900">Detail Pembayaran</h2>h2>
                                                      <button onClick={() => setDetail(null)}><X className="w-6 h-6 text-gray-400" /></button>button>
                                        </div>div>
                                        <div className="p-6 space-y-4">
                                                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(detail.status)}`}>
                                                        {detail.status === 'verified' && <CheckCircle className="w-4 h-4" />}
                                                        {detail.status === 'rejected' && <XCircle className="w-4 h-4" />}
                                                        {detail.status?.charAt(0).toUpperCase() + detail.status?.slice(1)}
                                                      </div>div>
                                        
                                                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                                                      <p><span className="font-medium">ID Pembayaran:</span>span> <span className="font-mono text-xs">{detail.id}</span>span></p>p>
                                                                      <p><span className="font-medium">ID Booking:</span>span> <span className="font-mono text-xs">{detail.bookingId}</span>span></p>p>
                                                                      <p><span className="font-medium">Nama Pemesan:</span>span> {detail.bookingName}</p>p>
                                                                      <p><span className="font-medium">Jumlah:</span>span> <span className="text-emerald-600 font-bold">{formatPrice(detail.amount)}</span>span></p>p>
                                                                      <p><span className="font-medium">Metode:</span>span> {detail.method || 'Transfer Bank'}</p>p>
                                                        {detail.bank && <p><span className="font-medium">Bank:</span>span> {detail.bank}</p>p>}
                                                        {detail.accountName && <p><span className="font-medium">Nama Rekening:</span>span> {detail.accountName}</p>p>}
                                                                      <p><span className="font-medium">Tanggal Bayar:</span>span> {formatDate(detail.createdAt)}</p>p>
                                                      </div>div>
                                        
                                          {/* Bukti Transfer */}
                                          {detail.proofUrl && (
                                    <div>
                                                      <p className="font-medium text-sm mb-2">Bukti Pembayaran:</p>p>
                                                      <a href={detail.proofUrl} target="_blank" rel="noopener noreferrer">
                                                                          <img src={detail.proofUrl} alt="Bukti Transfer" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                                                      </a>a>
                                                      <a href={detail.proofUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs hover:underline mt-1 block">Lihat gambar penuh</a>a>
                                    </div>div>
                                                      )}
                                        
                                          {/* Action Buttons */}
                                          {detail.status === 'pending' && (
                                    <div className="flex gap-3">
                                                      <button onClick={() => { updateStatus(detail.id, 'verified'); setDetail(null); }}
                                                                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition-colors">
                                                                          <CheckCircle className="w-4 h-4" /> Verifikasi
                                                      </button>button>
                                                      <button onClick={() => { updateStatus(detail.id, 'rejected'); setDetail(null); }}
                                                                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition-colors">
                                                                          <XCircle className="w-4 h-4" /> Tolak
                                                      </button>button>
                                    </div>div>
                                                      )}
                                        </div>div>
                            </div>div>
                  </div>div>
              )}
        </div>div>
      );
}</></div>
