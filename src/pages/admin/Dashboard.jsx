import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FiPackage, FiCalendar, FiCreditCard, FiUsers, FiTrendingUp, FiArrowUp, FiArrowRight, FiEye, FiCheck, FiClock, FiX } from 'react-icons/fi'

const StatCard = ({ icon: Icon, label, value, change, color, bg }) => (
  <div className={"bg-white rounded-2xl p-6 shadow-sm border-l-4 " + color}>
    <div className="flex items-center justify-between mb-4">
      <div className={"w-12 h-12 rounded-xl flex items-center justify-center " + bg}>
        <Icon size={22} className="text-white" />
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
          <FiArrowUp size={14} /> {change}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-gray-500 text-sm">{label}</div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState({ packages: 0, bookings: 0, revenue: 0, customers: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const dummyBookings = [
    { id: 'BK001', bookerName: 'Ahmad Ridho', packageTitle: 'Sailing Komodo Labuan Bajo', travelDate: '2026-04-10', persons: 2, totalPrice: 5500000, status: 'confirmed', paymentStatus: 'paid', createdAt: { toDate: () => new Date() } },
    { id: 'BK002', bookerName: 'Siti Rahmawati', packageTitle: 'Raja Ampat Piaynemo 4D3N', travelDate: '2026-04-17', persons: 3, totalPrice: 13500000, status: 'pending', paymentStatus: 'unpaid', createdAt: { toDate: () => new Date(Date.now() - 86400000) } },
    { id: 'BK003', bookerName: 'Budi Santoso', packageTitle: 'Bromo Midnight Sunrise', travelDate: '2026-04-05', persons: 4, totalPrice: 1380000, status: 'confirmed', paymentStatus: 'paid', createdAt: { toDate: () => new Date(Date.now() - 172800000) } },
    { id: 'BK004', bookerName: 'Maya Indah', packageTitle: 'Bali Nusa Penida 3D2N', travelDate: '2026-04-20', persons: 2, totalPrice: 3600000, status: 'pending', paymentStatus: 'unpaid', createdAt: { toDate: () => new Date(Date.now() - 259200000) } },
    { id: 'BK005', bookerName: 'Deni Kurniawan', packageTitle: 'Wakatobi Diving Paradise', travelDate: '2026-05-01', persons: 1, totalPrice: 5500000, status: 'confirmed', paymentStatus: 'paid', createdAt: { toDate: () => new Date(Date.now() - 345600000) } },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgSnap, bookingSnap] = await Promise.all([
          getDocs(collection(db, 'packages')),
          getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(10)))
        ])
        
        const bookings = bookingSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const revenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.totalPrice || 0), 0)
        const customers = new Set(bookings.map(b => b.bookerEmail)).size
        
        setStats({ packages: pkgSnap.size, bookings: bookingSnap.size, revenue, customers })
        setRecentBookings(bookings.length > 0 ? bookings : dummyBookings)
      } catch {
        setStats({ packages: 24, bookings: 156, revenue: 89750000, customers: 142 })
        setRecentBookings(dummyBookings)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
  
  const statusBadge = (status) => {
    const map = { confirmed: { label: 'Dikonfirmasi', class: 'bg-green-100 text-green-700' }, pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' }, cancelled: { label: 'Dibatalkan', class: 'bg-red-100 text-red-700' } }
    return map[status] || { label: status, class: 'bg-gray-100 text-gray-600' }
  }

  const paymentBadge = (status) => {
    const map = { paid: { label: 'Lunas', class: 'bg-green-100 text-green-700' }, unpaid: { label: 'Belum Bayar', class: 'bg-red-100 text-red-700' }, partial: { label: 'Parsial', class: 'bg-blue-100 text-blue-700' } }
    return map[status] || { label: status, class: 'bg-gray-100 text-gray-600' }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-500 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Selamat Datang, Admin! 👋</h2>
        <p className="opacity-90">Berikut ringkasan aktivitas NusaTrip hari ini</p>
        <div className="mt-4 flex gap-3">
          <Link to="/admin/paket" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors">+ Tambah Paket</Link>
          <Link to="/admin/booking" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors">Lihat Booking</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiPackage} label="Total Paket Wisata" value={stats.packages} change={8} color="border-primary-500" bg="bg-primary-500" />
        <StatCard icon={FiCalendar} label="Total Booking" value={stats.bookings} change={12} color="border-blue-500" bg="bg-blue-500" />
        <StatCard icon={FiCreditCard} label="Total Pendapatan" value={formatPrice(stats.revenue)} change={23} color="border-green-500" bg="bg-green-500" />
        <StatCard icon={FiUsers} label="Total Pelanggan" value={stats.customers} change={15} color="border-purple-500" bg="bg-purple-500" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tambah Paket', path: '/admin/paket', icon: FiPackage, color: 'bg-primary-50 text-primary-600 hover:bg-primary-100' },
          { label: 'Lihat Booking', path: '/admin/booking', icon: FiCalendar, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
          { label: 'Kelola Pembayaran', path: '/admin/pembayaran', icon: FiCreditCard, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
          { label: 'Kelola Blog', path: '/admin/blog', icon: FiPackage, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.label} to={item.path} className={"p-4 rounded-xl flex flex-col items-center text-center gap-2 transition-colors " + item.color}>
              <Icon size={24} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">Booking Terbaru</h3>
          <Link to="/admin/booking" className="text-primary-500 hover:underline text-sm flex items-center gap-1">
            Lihat Semua <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Booking ID</th>
                  <th className="px-6 py-3 text-left">Pemesan</th>
                  <th className="px-6 py-3 text-left">Paket</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Bayar</th>
                  <th className="px-6 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.slice(0, 5).map(booking => {
                  const status = statusBadge(booking.status)
                  const payment = paymentBadge(booking.paymentStatus)
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-primary-500">#{booking.id?.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{booking.bookerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-40 truncate">{booking.packageTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{booking.travelDate}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{formatPrice(booking.totalPrice || 0)}</td>
                      <td className="px-6 py-4">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + status.class}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + payment.class}>{payment.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to="/admin/booking" className="text-primary-500 hover:underline text-sm flex items-center gap-1">
                          <FiEye size={14} /> Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
