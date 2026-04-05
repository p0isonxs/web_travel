import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FiSearch, FiDownload, FiCheck, FiX, FiClock } from 'react-icons/fi'

const dummyPayments = [
  { id: 'PAY001', bookingId: 'BK001', bookerName: 'Ahmad Ridho', packageTitle: 'Sailing Komodo', amount: 5500000, method: 'BCA Virtual Account', status: 'paid', paidAt: '2026-04-01 10:23' },
  { id: 'PAY002', bookingId: 'BK002', bookerName: 'Siti Rahmawati', packageTitle: 'Raja Ampat', amount: 13500000, method: '-', status: 'unpaid', paidAt: null },
  { id: 'PAY003', bookingId: 'BK003', bookerName: 'Budi Santoso', packageTitle: 'Bromo Sunrise', amount: 1380000, method: 'GoPay', status: 'paid', paidAt: '2026-03-31 15:45' },
  { id: 'PAY004', bookingId: 'BK004', bookerName: 'Maya Indah', packageTitle: 'Bali Nusa Penida', amount: 3600000, method: '-', status: 'unpaid', paidAt: null },
  { id: 'PAY005', bookingId: 'BK005', bookerName: 'Deni Kurniawan', packageTitle: 'Wakatobi', amount: 5500000, method: 'OVO', status: 'paid', paidAt: '2026-03-30 09:12' },
  { id: 'PAY006', bookingId: 'BK006', bookerName: 'Rini Astuti', packageTitle: 'Dieng Plateau', amount: 3750000, method: 'DANA', status: 'refunded', paidAt: '2026-03-29 14:30' },
]

export default function AdminPayments() {
  const [payments, setPayments] = useState(dummyPayments)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalUnpaid = payments.filter(p => p.status === 'unpaid').reduce((sum, p) => sum + p.amount, 0)
  
  const statusIcon = (status) => {
    if (status === 'paid') return <FiCheck className="text-green-500" />
    if (status === 'unpaid') return <FiClock className="text-yellow-500" />
    return <FiX className="text-red-500" />
  }
  
  const statusClass = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-yellow-100 text-yellow-700', refunded: 'bg-blue-100 text-blue-700' }

  const filtered = payments.filter(p => {
    const s = p.bookerName?.toLowerCase().includes(search.toLowerCase()) || p.packageTitle?.toLowerCase().includes(search.toLowerCase())
    const f = filter === 'Semua' || p.status === filter.toLowerCase()
    return s && f
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kelola Pembayaran</h2>
          <p className="text-gray-500 text-sm">{payments.length} transaksi</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          <FiDownload size={14} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Total Lunas</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(totalPaid)}</p>
          <p className="text-xs text-gray-400">{payments.filter(p => p.status === 'paid').length} transaksi</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 mb-1">Belum Bayar</p>
          <p className="text-2xl font-bold text-yellow-600">{formatPrice(totalUnpaid)}</p>
          <p className="text-xs text-gray-400">{payments.filter(p => p.status === 'unpaid').length} transaksi</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">Direfund</p>
          <p className="text-2xl font-bold text-blue-600">{formatPrice(payments.filter(p => p.status === 'refunded').reduce((s,p) => s+p.amount,0))}</p>
          <p className="text-xs text-gray-400">{payments.filter(p => p.status === 'refunded').length} transaksi</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white rounded-xl shadow-sm p-3 flex items-center gap-2">
          <FiSearch className="text-gray-400" size={18} />
          <input type="text" placeholder="Cari nama, paket..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none flex-1 text-sm" />
        </div>
        <div className="flex gap-2">
          {['Semua', 'Paid', 'Unpaid', 'Refunded'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (filter === s ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 shadow-sm')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID Transaksi</th>
                <th className="px-4 py-3 text-left">Pemesan</th>
                <th className="px-4 py-3 text-left">Paket</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Metode</th>
                <th className="px-4 py-3 text-left">Tanggal Bayar</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-primary-500">#{p.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.bookerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-36 truncate">{p.packageTitle}</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-500">{formatPrice(p.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.method || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{p.paidAt || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={"flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit " + (statusClass[p.status] || '')}>
                      {statusIcon(p.status)} {p.status === 'paid' ? 'Lunas' : p.status === 'unpaid' ? 'Belum Bayar' : 'Refund'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Tidak ada pembayaran</div>}
        </div>
      </div>
    </div>
  )
}
