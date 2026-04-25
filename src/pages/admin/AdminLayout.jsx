import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Package, CalendarCheck, CreditCard,
    FileText, Star, Settings, LogOut, Menu, X,
    Globe, ChevronRight, MessageSquare, Bell
} from 'lucide-react';
import { getContacts } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

const navItems = [
  { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', exact: true },
  { to: '/admin/packages', icon: <Package className="w-5 h-5" />, label: 'Paket Wisata' },
  { to: '/admin/bookings', icon: <CalendarCheck className="w-5 h-5" />, label: 'Booking' },
  { to: '/admin/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Pembayaran' },
  { to: '/admin/blog', icon: <FileText className="w-5 h-5" />, label: 'Blog / Artikel' },
  { to: '/admin/testimonials', icon: <Star className="w-5 h-5" />, label: 'Testimoni' },
  { to: '/admin/contacts', icon: <MessageSquare className="w-5 h-5" />, label: 'Pesan Masuk', badge: true },
  { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Pengaturan' },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [newBookings, setNewBookings] = useState(0);
    const { logout, currentUser } = useAuth();

  useEffect(() => {
    getContacts().then(list => setUnreadCount(list.filter(c => c.status === 'unread').length)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const name = payload.new?.name || 'pelanggan baru';
        toast.info(`🔔 Booking baru dari ${name}!`, { autoClose: 6000 });
        setNewBookings(n => n + 1);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, (payload) => {
        const sender = payload.new?.name || 'seseorang';
        toast.info(`💬 Pesan baru dari ${sender}!`, { autoClose: 6000 });
        setUnreadCount(n => n + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);
    const location = useLocation();
    const navigate = useNavigate();

  const handleLogout = async () => {
        try {
                await logout();
                navigate('/login');
        } catch (e) {
                console.error(e);
        }
  };

  const isActive = (to, exact) => {
        if (exact) return location.pathname === to;
        return location.pathname.startsWith(to);
  };

  const Sidebar = () => (
        <div className="flex flex-col h-full bg-gray-900 text-white">
          {/* Logo */}
              <div className="p-6 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl">🌴</div>
                                <div>
                                            <p className="font-bold text-lg leading-tight">Liburan Terus</p>
                                            <p className="text-xs text-gray-400">Admin Panel</p>
                                </div>
                      </div>
              </div>
        
          {/* Nav */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <Link
                                  key={item.to} to={item.to}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                  isActive(item.to, item.exact)
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                  }`}
                                >
                      {item.icon}
                                <span>{item.label}</span>
                      <span className="ml-auto flex items-center gap-1">
                        {item.badge && unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">{unreadCount}</span>
                        )}
                        {isActive(item.to, item.exact) && <ChevronRight className="w-4 h-4" />}
                      </span>
                    </Link>
                  ))}
              </nav>
        
          {/* Footer */}
              <div className="p-4 border-t border-gray-700 space-y-2">
                      <a href="/" target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all text-sm">
                                <Globe className="w-4 h-4" /> Lihat Website
                      </a>
                      <div className="flex items-center gap-3 px-4 py-2 text-gray-500 text-sm">
                                <div className="w-8 h-8 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xs">
                                  {currentUser?.email?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs truncate">{currentUser?.email}</p>
                                            <p className="text-gray-500 text-xs">Administrator</p>
                                </div>
                      </div>
                      <button onClick={handleLogout}
                                  className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all w-full text-sm">
                                <LogOut className="w-4 h-4" /> Keluar
                      </button>
              </div>
        </div>
      );
  
    return (
          <>
          <Helmet>
            <meta name="robots" content="noindex, nofollow" />
          </Helmet>
          <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar */}
                <div className="hidden lg:flex w-64 shrink-0 flex-col">
                        <Sidebar />
                </div>
          
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex">
                              <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                              <div className="relative w-72 flex-col flex">
                                          <Sidebar />
                              </div>
                    </div>
                )}
          
            {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Top bar */}
                        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                                              <Menu className="w-6 h-6" />
                                  </button>
                                  <div className="flex-1">
                                              <h1 className="font-semibold text-gray-800 text-lg">
                                                {navItems.find(n => isActive(n.to, n.exact))?.label || 'Admin Panel'}
                                              </h1>
                                  </div>
                                  {newBookings > 0 && (
                                    <Link to="/admin/bookings" onClick={() => setNewBookings(0)}
                                      className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                      <Bell className="w-3.5 h-3.5" />
                                      {newBookings} booking baru
                                    </Link>
                                  )}
                                  <div className="text-sm text-gray-500 hidden sm:block">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </header>
                
                  {/* Page Content */}
                        <main className="flex-1 overflow-y-auto p-6">
                                  <Outlet />
                        </main>
                </div>
          </div>
          </>
        );
}
