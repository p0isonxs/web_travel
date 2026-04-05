import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  FiHome, FiPackage, FiCalendar, FiCreditCard, FiFileText, 
  FiImage, FiStar, FiSettings, FiLogOut, FiMenu, FiX, FiBell,
  FiUser, FiChevronDown, FiCompass
} from 'react-icons/fi'

const sidebarLinks = [
  { icon: FiHome, label: 'Dashboard', path: '/admin' },
  { icon: FiPackage, label: 'Paket Wisata', path: '/admin/paket' },
  { icon: FiCalendar, label: 'Kelola Booking', path: '/admin/booking' },
  { icon: FiCreditCard, label: 'Pembayaran', path: '/admin/pembayaran' },
  { icon: FiFileText, label: 'Blog & Artikel', path: '/admin/blog' },
  { icon: FiImage, label: 'Galeri', path: '/admin/galeri' },
  { icon: FiStar, label: 'Testimoni', path: '/admin/testimoni' },
  { icon: FiSettings, label: 'Pengaturan', path: '/admin/pengaturan' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {}
  }

  const currentPage = sidebarLinks.find(l => l.path === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={"fixed lg:relative z-40 h-full flex flex-col bg-gray-900 text-white transition-all duration-300 " + (sidebarOpen ? 'w-64' : 'w-16')}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
            <FiCompass className="text-white text-xl" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="font-bold text-lg">NusaTrip</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarLinks.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path
            return (
              <Link key={path} to={path} title={!sidebarOpen ? label : ''}
                className={"flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all " + (isActive ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')}>
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
                {isActive && sidebarOpen && <div className="ml-auto w-2 h-2 bg-white rounded-full" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors w-full px-2 py-2">
            <FiLogOut size={20} className="shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm z-30 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div>
              <p className="text-xs text-gray-400">Admin Panel</p>
              <h1 className="font-bold text-gray-800">{currentPage}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <FiBell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <FiUser className="text-white" size={16} />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{currentUser?.displayName || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email}</p>
                </div>
                <FiChevronDown size={16} className="text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold text-sm">{currentUser?.email}</p>
                  </div>
                  <Link to="/admin/pengaturan" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiSettings size={14} /> Pengaturan
                  </Link>
                  <Link to="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiCompass size={14} /> Lihat Website
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
