import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FiSearch, FiFilter, FiEye, FiCheck, FiX, FiCalendar, FiUsers, FiDownload, FiPhone, FiMail } from 'react-icons/fi'

const dummyBookings = [
  { id: 'BK001', bookerName: 'Ahmad Ridho', bookerEmail: 'ahmad@gmail.com', bookerPhone: '08112345678', packageTitle: 'Sailing Komodo Labuan Bajo', travelDate: '2026-04-10', persons: 2, totalPrice: 5500000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'BK002', bookerName: 'Siti Rahmawati', bookerEmail: 'siti@gmail.com', bookerPhone: '08223456789', packageTitle: 'Raja Ampat Piaynemo 4D3N', travelDate: '2026-04-17', persons: 3, totalPrice: 13500000, status: 'pending', paymentStatus: 'unpaid' },
  { id: 'BK003', bookerName: 'Budi Santoso', bookerEmail: 'budi@gmail.com', bookerPhone: '08334567890', packageTitle: 'Bromo Midnight Sunrise', travelDate: '2026-04-05', persons: 4, totalPrice: 1380000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'BK004', bookerName: 'Maya Indah', bookerEmail: 'maya@gmail.com', bookerPhone: '08445678901', packageTitle: 'Bali Nusa Penida 3D2N', travelDate: '2026-04-20', persons: 2, totalPrice: 3600000, status: 'pending', paymentStatus: 'unpaid' },
  { id: 'BK005', bookerName: 'Deni Kurniawan', bookerEmail: 'deni@gmail.com', bookerPhone: '08556789012', packageTitle: 'Wakatobi Diving Paradise', travelDate: '2026-05-01', persons: 1, totalPrice: 5500000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'BK006', bookerName: 'Rini Astuti', bookerEmail: 'rini@gmail.com', bookerPhone: '08667890123', packageTitle: 'Dieng Plateau Culture', travelDate: '2026-04-12', persons: 5, totalPrice: 3750000, status: 'cancelled', paymentStatus: 'refunded' },
]

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setBookings(data.length > 0 ? data : dummyBookings)
      } catch {
        setBookings(dummyBookings)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const updateStatus = async (id, field, value) => {
    try {
      if (!id.startsWith('BK')) {
        await updateDoc(doc(db, 'bookings', id), { [field]: value })
      }
      setBookings(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
    } catch {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  
  const statusColors = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-700' }
  const payColors = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-red-100 text-red-700', refunded: 'bg-blue-100 text-blue-700' }

  const filtered = bookings.filter(b => {
    const matchSearch = b.bookerName?.toLowerCase().includes(search.toLowerCase()) || b.packageTitle?.toLowerCase().includes(search.toLowerCase()) || b.id?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Semua' || b.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kelola Booking</h2>
          <p className="text-gray-500 text-sm">{bookings.length} total booking | Revenue: {formatPrice(totalRevenue)}</p>
        </div>
        <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white rounded-xl shadow-sm p-3 flex items-center gap-2">
          <FiSearch className="text-gray-400" size={18} />
          <input type="text" placeholder="Cari nama, paket, ID booking..." value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none flex-1 text-sm" />
        </div>
        <div className="flex gap-2">
          {['Semua', 'Confirmed', 'Pending', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (statusFilter === s ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50')}>
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
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Pemesan</th>
                <th className="px-4 py-3 text-left">Paket</th>
                <th className="px-4 py-3 text-left">Tgl Trip</th>
                <th className="px-4 py-3 text-left">Peserta</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Bayar</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-primary-500">#{b.id?.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-gray-800">{b.bookerName}</p>
                    <p className="text-xs text-gray-400">{b.bookerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-36 truncate">{b.packageTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.travelDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.persons} orang</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-500">{formatPrice(b.totalPrice || 0)}</td>
                  <td className="px-4 py-3">
                    <select value={b.status} onChange={(e) => updateStatus(b.id, 'status', e.target.value)} className={"px-2 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer " + (statusColors[b.status] || 'bg-gray-100')}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Dikonfirmasi</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={b.paymentStatus} onChange={(e) => updateStatus(b.id, 'paymentStatus', e.target.value)} className={"px-2 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer " + (payColors[b.paymentStatus] || 'bg-gray-100')}>
                      <option value="unpaid">Belum Bayar</option>
                      <option value="paid">Lunas</option>
                      <option value="refunded">Refund</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedBooking(b)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg"><FiEye size={16} /></button>
                      <a href={"https://wa.me/" + b.bookerPhone?.replace(/[^0-9]/g, '')} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg"><FiPhone size={16} /></a>
                      <a href={"mailto:" + b.bookerEmail} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><FiMail size={16} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Tidak ada booking ditemukan</div>}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Detail Booking #{selectedBooking.id?.slice(0, 8)}</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400 block">Pemesan</span><span className="font-medium">{selectedBooking.bookerName}</span></div>
                <div><span className="text-gray-400 block">Email</span><span className="font-medium">{selectedBooking.bookerEmail}</span></div>
                <div><span className="text-gray-400 block">WhatsApp</span><span className="font-medium">{selectedBooking.bookerPhone}</span></div>
                <div><span className="text-gray-400 block">Kota Asal</span><span className="font-medium">{selectedBooking.bookerCity || '-'}</span></div>
                <div className="col-span-2"><span className="text-gray-400 block">Paket</span><span className="font-medium">{selectedBooking.packageTitle}</span></div>
                <div><span className="text-gray-400 block">Tanggal Trip</span><span className="font-medium">{selectedBooking.travelDate}</span></div>
                <div><span className="text-gray-400 block">Peserta</span><span className="font-medium">{selectedBooking.persons} orang</span></div>
                <div><span className="text-gray-400 block">Total</span><span className="font-bold text-primary-500">{formatPrice(selectedBooking.totalPrice || 0)}</span></div>
                <div><span className="text-gray-400 block">Status Booking</span><span className={"px-2 py-1 rounded-full text-xs font-medium " + (statusColors[selectedBooking.status] || '')}>{selectedBooking.status}</span></div>
              </div>
              {selectedBooking.specialRequest && (
                <div><span className="text-gray-400 text-sm block mb-1">Permintaan Khusus</span><p className="text-sm bg-gray-50 p-3 rounded-xl">{selectedBooking.specialRequest}</p></div>
              )}
              <div className="flex gap-3 pt-2">
                <a href={"https://wa.me/" + selectedBooking.bookerPhone?.replace(/[^0-9]/g, '') + "?text=Halo " + selectedBooking.bookerName + ", booking Anda untuk paket " + selectedBooking.packageTitle + " telah dikonfirmasi!"} target="_blank" rel="noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-sm font-semibold text-center transition-colors">
                  WhatsApp Pemesan
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
