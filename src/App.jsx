import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PrivateRoute from './components/PrivateRoute';

const Home = lazy(() => import('./pages/Home'));
const OpenTrip = lazy(() => import('./pages/OpenTrip'));
const PrivateTrip = lazy(() => import('./pages/PrivateTrip'));
const PackageDetail = lazy(() => import('./pages/PackageDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const Payment = lazy(() => import('./pages/Payment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPackages = lazy(() => import('./pages/admin/Packages'));
const AdminBookings = lazy(() => import('./pages/admin/Bookings'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminContacts = lazy(() => import('./pages/admin/Contacts'));

function RouteLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Memuat halaman...</p>
      </div>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:shadow-lg"
      >
        Lewati ke konten utama
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
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
        <LanguageProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
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
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="contacts" element={<AdminContacts />} />
              </Route>

              {/* Public Routes - with navbar/footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/open-trip" element={<OpenTrip />} />
                <Route path="/private-trip" element={<PrivateTrip />} />
                <Route path="/open-trip/:slug" element={<PackageDetail />} />
                <Route path="/private-trip/:slug" element={<PackageDetail />} />
                <Route path="/paket/:id" element={<PackageDetail />} />
                <Route path="/booking/:id" element={<Booking />} />
                <Route path="/payment/:bookingId" element={<Payment />} />
                <Route path="/pembayaran-berhasil" element={<PaymentSuccess />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/tentang-kami" element={<About />} />
                <Route path="/kontak" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={4200}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            icon={false}
            toastClassName={(context) => `lt-toast lt-toast--${context?.type || 'default'}`}
            bodyClassName="lt-toast__body"
            progressClassName="lt-toast__progress"
            closeButton={false}
          />
        </BrowserRouter>
        </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
