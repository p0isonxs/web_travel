import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaPlane } from 'react-icons/fa'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
          const handleScroll = () => setScrolled(window.scrollY > 20)
          window.addEventListener('scroll', handleScroll)
          return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
          setIsOpen(false)
    }, [location])

    const navLinks = [
      { to: '/', label: 'Home' },
      { to: '/open-trip', label: 'Open Trip' },
      { to: '/private-trip', label: 'Private Trip' },
      { to: '/galeri', label: 'Galeri' },
      { to: '/blog', label: 'Blog' },
      { to: '/tentang-kami', label: 'Tentang Kami' },
      { to: '/kontak', label: 'Kontak' },
        ]

    const isHomePage = location.pathname === '/'

    return (
          <nav className={`fixed w-full z-50 transition-all duration-300 ${
                  scrolled || !isHomePage
                    ? 'bg-white shadow-lg'
                    : 'bg-transparent'
          }`}>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex items-center justify-between h-16 lg:h-20">
                            {/* Logo */}
                                    <Link to="/" className="flex items-center gap-2 group">
                                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                              <FaPlane className="text-white text-xl" />
                                                </div>
                                                <div>
                                                              <span className={`font-bold text-lg leading-tight block ${
                            scrolled || !isHomePage ? 'text-gray-800' : 'text-white'
          }`}>Liburan Terus</span>
                                                              <span className={`text-xs leading-tight block ${
                            scrolled || !isHomePage ? 'text-emerald-600' : 'text-emerald-300'
          }`}>Travel & Tour</span>
                                                </div>
                                    </Link>
                          
                            {/* Desktop Nav */}
                                    <div className="hidden lg:flex items-center gap-1">
                                      {navLinks.map((link) => (
                          <NavLink
                                            key={link.to}
                                            to={link.to}
                                            className={({ isActive }) =>
                                                                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                                                      isActive
                                                                                        ? 'bg-emerald-500 text-white'
                                                                                        : scrolled || !isHomePage
                                                                                          ? 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                                                                                          : 'text-white hover:bg-white/20'
                                                                }`
                                            }
                                            end={link.to === '/'}
                                          >
                            {link.label}
                          </NavLink>
                        ))}
                                    </div>
                          
                            {/* CTA Button */}
                                    <div className="hidden lg:flex items-center gap-3">
                                                <Link
                                                                to="/open-trip"
                                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                                                              >
                                                              Booking Sekarang
                                                </Link>
                                    </div>
                          
                            {/* Mobile Menu Button */}
                                    <button
                                                  onClick={() => setIsOpen(!isOpen)}
                                                  className={`lg:hidden p-2 rounded-lg transition-colors ${
                                                                  scrolled || !isHomePage
                                                                    ? 'text-gray-700 hover:bg-gray-100'
                                                                    : 'text-white hover:bg-white/20'
                                                  }`}
                                                >
                                      {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                                    </button>
                          </div>
                  </div>
          
            {/* Mobile Menu */}
                <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-screen bg-white shadow-xl' : 'max-h-0'
          }`}>
                        <div className="px-4 py-3 space-y-1">
                          {navLinks.map((link) => (
                        <NavLink
                                        key={link.to}
                                        to={link.to}
                                        className={({ isActive }) =>
                                                          `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                                                              isActive
                                                                                ? 'bg-emerald-500 text-white'
                                                                                : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                                                          }`
                                        }
                                        end={link.to === '/'}
                                      >
                          {link.label}
                        </NavLink>
                      ))}
                                  <Link
                                                to="/open-trip"
                                                className="block w-full text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-xl text-sm font-semibold mt-2"
                                              >
                                              Booking Sekarang
                                  </Link>
                        </div>
                </div>
          </nav>
        )
}
  
  export default Navbar
