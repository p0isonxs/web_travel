import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import OpenTrip from './pages/OpenTrip';
import PrivateTrip from './pages/PrivateTrip';
import PackageDetail from './pages/PackageDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminPackages from './pages/admin/Packages';
import AdminBookings from './pages/admin/Bookings';
import AdminPayments from './pages/admin/Payments';
import AdminBlog from './pages/admin/Blog';
import AdminGallery from './pages/admin/Gallery';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminSettings from './pages/admin/Settings';

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin Routes - no navbar/footer */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Public Routes - with navbar/footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/open-trip" element={<OpenTrip />} />
              <Route path="/private-trip" element={<PrivateTrip />} />
              <Route path="/paket/:id" element={<PackageDetail />} />
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/payment/:bookingId" element={<Payment />} />
              <Route path="/pembayaran-berhasil" element={<PaymentSuccess />} />
              <Route path="/galeri" element={<Gallery />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/tentang-kami" element={<About />} />
              <Route path="/kontak" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
