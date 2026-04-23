import { useState, useEffect, useMemo } from 'react';
import { getPayments, updatePayment, updateBooking } from '../../lib/database';
import { Search, CheckCircle, XCircle, Eye, X, BarChart2, Download, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const statusBadge = (s) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600');

const formatPrice = (p) => p ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p) : 'Rp 0';

const toDate = (ts) => {
  if (!ts) return null;
  return ts.toDate ? ts.toDate() : new Date(ts);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekRange(year, week) {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay() || 7;
  const startOfWeek1 = new Date(jan1);
  startOfWeek1.setDate(jan1.getDate() + (dayOfWeek <= 4 ? 2 - dayOfWeek : 9 - dayOfWeek));
  const start = new Date(startOfWeek1);
  start.setDate(startOfWeek1.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [detail, setDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('kelola');

  // Report state
  const [reportMode, setReportMode] = useState('bulanan');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setPayments(await getPayments());
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await updatePayment(id, { status, verifiedAt: status === 'verified' ? new Date().toISOString() : null });
    const payment = payments.find(p => p.id === id);
    if (payment?.bookingId) {
      if (status === 'rejected') await updateBooking(payment.bookingId, { status: 'rejected' });
      else if (status === 'verified') await updateBooking(payment.bookingId, { status: 'confirmed' });
    }
    toast.success(status === 'verified' ? 'Pembayaran diverifikasi!' : 'Pembayaran ditolak');
    fetchPayments();
    if (detail?.id === id) setDetail({ ...detail, status });
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = toDate(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = payments.filter(p => {
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const matchSearch = p.bookingName?.toLowerCase().includes(search.toLowerCase()) ||
      p.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      p.method?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const verifiedPayments = payments.filter(p => p.status === 'verified');

  // Available years from data
  const availableYears = useMemo(() => {
    const years = new Set(verifiedPayments.map(p => {
      const d = toDate(p.createdAt);
      return d ? d.getFullYear() : null;
    }).filter(Boolean));
    if (years.size === 0) years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [verifiedPayments]);

  // Monthly report data
  const monthlyData = useMemo(() => {
    return MONTHS.map((label, idx) => {
      const items = verifiedPayments.filter(p => {
        const d = toDate(p.createdAt);
        return d && d.getFullYear() === reportYear && d.getMonth() === idx;
      });
      return {
        period: `${MONTHS_FULL[idx]} ${reportYear}`,
        label: `${label} ${reportYear}`,
        count: items.length,
        total: items.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        items,
      };
    });
  }, [verifiedPayments, reportYear]);

  // Weekly report data (within selected month)
  const weeklyData = useMemo(() => {
    const monthPayments = verifiedPayments.filter(p => {
      const d = toDate(p.createdAt);
      return d && d.getFullYear() === reportYear && d.getMonth() === reportMonth;
    });
    const grouped = {};
    monthPayments.forEach(p => {
      const d = toDate(p.createdAt);
      if (!d) return;
      const week = getWeekNumber(d);
      const key = `${reportYear}-W${week}`;
      if (!grouped[key]) grouped[key] = { week, items: [] };
      grouped[key].items.push(p);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, { week, items }]) => ({
        period: `Minggu ke-${week} ${MONTHS_FULL[reportMonth]} ${reportYear}`,
        label: getWeekRange(reportYear, week),
        count: items.length,
        total: items.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        items,
      }));
  }, [verifiedPayments, reportYear, reportMonth]);

  const reportData = reportMode === 'bulanan' ? monthlyData : weeklyData;
  const grandTotal = reportData.reduce((s, r) => s + r.total, 0);
  const grandCount = reportData.reduce((s, r) => s + r.count, 0);

  const exportExcel = () => {
    const rows = reportData
      .filter(r => r.count > 0)
      .flatMap(r => [
        // Section header row
        { Periode: r.period, Nama: '', 'ID Booking': '', Metode: '', 'Jumlah (IDR)': '' },
        // Detail rows
        ...r.items.map(p => ({
          Periode: '',
          Nama: p.bookingName || '-',
          'ID Booking': p.bookingId || '-',
          Metode: p.method || 'Transfer',
          'Jumlah (IDR)': Number(p.amount) || 0,
        })),
        // Subtotal
        { Periode: `Subtotal ${r.period}`, Nama: `${r.count} transaksi`, 'ID Booking': '', Metode: '', 'Jumlah (IDR)': r.total },
        { Periode: '', Nama: '', 'ID Booking': '', Metode: '', 'Jumlah (IDR)': '' },
      ]);

    // Grand total
    rows.push({ Periode: 'TOTAL KESELURUHAN', Nama: `${grandCount} transaksi`, 'ID Booking': '', Metode: '', 'Jumlah (IDR)': grandTotal });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 32 }, { wch: 22 }, { wch: 20 }, { wch: 16 }, { wch: 18 }];

    const wb = XLSX.utils.book_new();
    const sheetName = reportMode === 'bulanan'
      ? `Bulanan ${reportYear}`
      : `Mingguan ${MONTHS_FULL[reportMonth]} ${reportYear}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const filename = reportMode === 'bulanan'
      ? `laporan-bulanan-${reportYear}.xlsx`
      : `laporan-mingguan-${MONTHS_FULL[reportMonth].toLowerCase()}-${reportYear}.xlsx`;

    XLSX.writeFile(wb, filename);
    toast.success('Laporan berhasil diexport!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          {pendingCount > 0 && (
            <p className="text-amber-600 font-medium text-sm">{pendingCount} pembayaran menunggu verifikasi</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { val: 'kelola', label: 'Kelola Pembayaran', icon: <CheckCircle className="w-4 h-4" /> },
          { val: 'laporan', label: 'Laporan Pemasukan', icon: <BarChart2 className="w-4 h-4" /> },
        ].map(tab => (
          <button key={tab.val} onClick={() => setActiveTab(tab.val)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.val ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'kelola' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Menunggu', count: payments.filter(p => p.status === 'pending').length, color: 'amber' },
              { label: 'Terverifikasi', count: payments.filter(p => p.status === 'verified').length, color: 'green' },
              { label: 'Ditolak', count: payments.filter(p => p.status === 'rejected').length, color: 'red' },
            ].map((s, i) => (
              <div key={i} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-xl p-4 text-center`}>
                <div className={`text-3xl font-bold text-${s.color}-600`}>{s.count}</div>
                <p className={`text-${s.color}-700 text-sm`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, ID booking, metode..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="semua">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Memuat data...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Tidak ada pembayaran ditemukan</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Pemesan</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Jumlah</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Metode</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(p => (
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{p.bookingName || '-'}</p>
                          <p className="text-xs text-gray-500 font-mono">{p.bookingId?.slice(0, 12)}...</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">{formatPrice(p.amount)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">{p.method || 'transfer'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusBadge(p.status)}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDetail(p)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                            {p.status === 'pending' && (
                              <>
                                <button onClick={() => updateStatus(p.id, 'verified')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Verifikasi"><CheckCircle className="w-4 h-4" /></button>
                                <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Tolak"><XCircle className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── LAPORAN TAB ── */
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-4">
              {/* Mode */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { val: 'bulanan', label: 'Bulanan', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                  { val: 'mingguan', label: 'Mingguan', icon: <Calendar className="w-3.5 h-3.5" /> },
                ].map(m => (
                  <button key={m.val} onClick={() => setReportMode(m.val)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      reportMode === m.val ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'
                    }`}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              {/* Year */}
              <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Month (weekly only) */}
              {reportMode === 'mingguan' && (
                <select value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {MONTHS_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              )}

              <button onClick={exportExcel}
                className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                <Download className="w-4 h-4" /> Export Excel
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-600 text-white rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1 opacity-80 text-sm">
                <TrendingUp className="w-4 h-4" /> Total Pemasukan
              </div>
              <div className="text-2xl font-bold">{formatPrice(grandTotal)}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-500 text-sm mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{grandCount}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-500 text-sm mb-1">Rata-rata per {reportMode === 'bulanan' ? 'Bulan' : 'Minggu'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(grandCount > 0 ? grandTotal / reportData.filter(r => r.count > 0).length : 0)}
              </p>
            </div>
          </div>

          {/* Report Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {reportMode === 'bulanan' ? `Laporan Bulanan ${reportYear}` : `Laporan Mingguan — ${MONTHS_FULL[reportMonth]} ${reportYear}`}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-700">{reportMode === 'bulanan' ? 'Bulan' : 'Minggu'}</th>
                    <th className="text-center px-5 py-3 font-semibold text-gray-700">Transaksi</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700">Total Pemasukan</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData.map((row, i) => (
                    <tr key={i} className={`transition-colors ${row.count > 0 ? 'hover:bg-emerald-50/30' : 'opacity-40'}`}>
                      <td className="px-5 py-3 font-medium text-gray-800">{row.label}</td>
                      <td className="px-5 py-3 text-center">
                        {row.count > 0
                          ? <span className="bg-emerald-100 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-full">{row.count}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                        {row.count > 0 ? formatPrice(row.total) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {grandTotal > 0 && row.total > 0 ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(row.total / grandTotal * 100).toFixed(0)}%` }} />
                            </div>
                            <span className="text-gray-600 text-xs w-10 text-right">{(row.total / grandTotal * 100).toFixed(1)}%</span>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-5 py-3 font-bold text-gray-900">Total</td>
                    <td className="px-5 py-3 text-center font-bold text-gray-900">{grandCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-700 text-base">{formatPrice(grandTotal)}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Detail Pembayaran</h2>
              <button onClick={() => setDetail(null)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(detail.status)}`}>
                {detail.status === 'verified' && <CheckCircle className="w-4 h-4" />}
                {detail.status === 'rejected' && <XCircle className="w-4 h-4" />}
                {detail.status?.charAt(0).toUpperCase() + detail.status?.slice(1)}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p><span className="font-medium">ID Pembayaran:</span> <span className="font-mono text-xs">{detail.id}</span></p>
                <p><span className="font-medium">ID Booking:</span> <span className="font-mono text-xs">{detail.bookingId}</span></p>
                <p><span className="font-medium">Nama Pemesan:</span> {detail.bookingName}</p>
                <p><span className="font-medium">Jumlah:</span> <span className="text-emerald-600 font-bold">{formatPrice(detail.amount)}</span></p>
                <p><span className="font-medium">Metode:</span> {detail.method || 'Transfer Bank'}</p>
                {detail.bank && <p><span className="font-medium">Bank:</span> {detail.bank}</p>}
                {detail.accountName && <p><span className="font-medium">Nama Rekening:</span> {detail.accountName}</p>}
                <p><span className="font-medium">Tanggal Bayar:</span> {formatDate(detail.createdAt)}</p>
              </div>
              {detail.proofUrl && (
                <div>
                  <p className="font-medium text-sm mb-2">Bukti Pembayaran:</p>
                  <a href={detail.proofUrl} target="_blank" rel="noopener noreferrer">
                    <img src={detail.proofUrl} alt="Bukti Transfer" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                  <a href={detail.proofUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs hover:underline mt-1 block">Lihat gambar penuh</a>
                </div>
              )}
              {detail.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => { updateStatus(detail.id, 'verified'); setDetail(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition-colors">
                    <CheckCircle className="w-4 h-4" /> Verifikasi
                  </button>
                  <button onClick={() => { updateStatus(detail.id, 'rejected'); setDetail(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition-colors">
                    <XCircle className="w-4 h-4" /> Tolak
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
