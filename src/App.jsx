import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import PrivateRoute from './components/PrivateRoute'

// Public Pages
import Home from './pages/Home'
import OpenTrip from './pages/OpenTrip'
import PrivateTrip from './pages/PrivateTrip'
import PackageDetail from './pages/PackageDetail'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminPackages from './pages/admin/Packages'
import AdminBookings from './pages/admin/Bookings'
import AdminPayments from './pages/admin/Payments'
import AdminBlog from './pages/admin/Blog'
import AdminGallery from './pages/admin/Gallery'
import AdminTestimonials from './pages/admin/Testimonials'
import AdminSettings from './pages/admin/Settings'

function App() {
    return (
          <HelmetProvider>
                <AuthProvider>
                        <Router>
                                  <Routes>
                                    {/* Public Routes */}
                                              <Route path="/" element={<Home />} />
                                              <Route path="/open-trip" element={<OpenTrip />} />
                                              <Route path="/private-trip" element={<PrivateTrip />} />
                                              <Route path="/paket/:id" element={<PackageDetail />} />
                                              <Route path="/booking/:id" element={<Booking />} />
                                              <Route path="/payment/:bookingId" element={<Payment />} />
                                              <Route path="/payment/success" element={<PaymentSuccess />} />
                                              <Route path="/galeri" element={<Gallery />} />
                                              <Route path="/tentang-kami" element={<About />} />
                                              <Route path="/kontak" element={<Contact />} />
                                              <Route path="/blog" element={<Blog />} />
                                              <Route path="/blog/:slug" element={<BlogDetail />} />
                                              <Route path="/login" element={<Login />} />
                                  
                                    {/* Admin Routes */}
                                              <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>PrivateRoute>}>
                                                            <Route index element={<AdminDashboard />} />
                                                            <Route path="paket" element={<AdminPackages />} />
                                                            <Route path="booking" element={<AdminBookings />} />
                                                            <Route path="pembayaran" element={<AdminPayments />} />
                                                            <Route path="blog" element={<AdminBlog />} />
                                                            <Route path="galeri" element={<AdminGallery />} />
                                                            <Route path="testimoni" element={<AdminTestimonials />} />
                                                            <Route path="pengaturan" element={<AdminSettings />} />
                                              </Route>Route>
                                  
                                              <Route path="*" element={<NotFound />} />
                                  </Routes>Routes>
                                  <ToastContainer position="top-right" autoClose={3000} />
                        </Router>Router>
                </AuthProvider>AuthProvider>
          </HelmetProvider>HelmetProvider>
        )
}

export default App</HelmetProvider>
