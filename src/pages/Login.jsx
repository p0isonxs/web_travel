import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Helmet } from 'react-helmet-async'
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useSettings } from '../contexts/SettingsContext'
import BrandLogo from '../components/BrandLogo'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { currentUser, login } = useAuth()
    const settings = useSettings()
    const navigate = useNavigate()

    if (currentUser) return <Navigate to="/admin" replace />

    const handleSubmit = async (e) => {
          e.preventDefault()
          setLoading(true)
          try {
                  await login(email, password)
                  toast.success('Login berhasil!')
                  navigate('/admin')
          } catch (error) {
                  const message = String(error?.message || '').toLowerCase()
                  if (message.includes('invalid login credentials') || message.includes('email not confirmed')) {
                    toast.error('Email atau password salah!')
                  } else if (message.includes('too many requests') || message.includes('rate limit')) {
                    toast.error('Terlalu banyak percobaan. Coba lagi nanti.')
                  } else {
                    toast.error('Login gagal: ' + (error?.message || 'Unknown error'))
                  }
          } finally {
                  setLoading(false)
          }
    }

    return (
          <>
                <Helmet>
                        <title>Login Admin - {settings.siteName}</title>
                        <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md">
                          {/* Card */}
                                  <div className="bg-white rounded-3xl shadow-2xl p-8">
                                    {/* Logo */}
                                              <div className="text-center mb-8">
                                                <div className="mb-4 flex justify-center">
                                                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                                                    <div className="flex items-center justify-center gap-3">
                                                      <BrandLogo
                                                        showTagline={false}
                                                        titleClassName="text-gray-800"
                                                        logoClassName="h-14 w-auto max-w-[180px] object-contain"
                                                        iconWrapperClassName="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg"
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                                            <p className="text-gray-500 text-sm mt-1">Panel Admin</p>
                                              </div>
                                  
                                              <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">Masuk ke Dashboard</h2>
                                  
                                              <form onSubmit={handleSubmit} className="space-y-5">
                                                {/* Email */}
                                                            <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                                                            <div className="relative">
                                                                                              <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                              <input
                                                                                                                    type="email"
                                                                                                                    value={email}
                                                                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                                                                    placeholder="admin@example.com"
                                                                                                                    required
                                                                                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 text-sm"
                                                                                                                  />
                                                                            </div>
                                                            </div>
                                              
                                                {/* Password */}
                                                            <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                                                            <div className="relative">
                                                                                              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                                              <input
                                                                                                                    type={showPassword ? 'text' : 'password'}
                                                                                                                    value={password}
                                                                                                                    onChange={(e) => setPassword(e.target.value)}
                                                                                                                    placeholder="••••••••"
                                                                                                                    required
                                                                                                                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 text-sm"
                                                                                                                  />
                                                                                              <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                                                                  >
                                                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                                                                </button>
                                                                            </div>
                                                            </div>
                                              
                                                {/* Submit */}
                                                            <button
                                                                              type="submit"
                                                                              disabled={loading}
                                                                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                                                                            >
                                                              {loading ? (
                                                                                                <>
                                                                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                                    Masuk...
                                                                                                  </>
                                                                                              ) : (
                                                                                                'Masuk'
                                                                                              )}
                                                            </button>
                                              </form>
                                  
                                              <p className="text-center text-xs text-gray-400 mt-6">
                                                            Hanya untuk administrator {settings.siteName}
                                              </p>
                                  </div>
                        </div>
                </div>
          </>
        )
}
  
  export default Login
