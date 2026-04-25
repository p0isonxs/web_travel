import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaPlane } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import { useSettings } from '../contexts/SettingsContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const { language, setLanguage, t } = useLanguage()
    const settings = useSettings()

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
      { to: '/open-trip', label: t('common.openTrip') },
      { to: '/private-trip', label: t('common.privateTrip') },
      { to: '/blog', label: t('common.blog') },
      { to: '/tentang-kami', label: t('common.about') },
      { to: '/kontak', label: t('common.contact') },
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
          }`}>{settings.siteName}</span>
                                                              <span className={`text-xs leading-tight block ${
                            scrolled || !isHomePage ? 'text-emerald-600' : 'text-emerald-300'
          }`}>{t('common.brandTagline')}</span>
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
                                                <div className={`flex items-center rounded-full border px-1 py-1 ${scrolled || !isHomePage ? 'border-gray-200 bg-gray-50' : 'border-white/30 bg-white/10 backdrop-blur-sm'}`}>
                                                              {['id', 'en'].map((lang) => (
                                                                <button
                                                                  key={lang}
                                                                  type="button"
                                                                  onClick={() => setLanguage(lang)}
                                                                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                                                                    language === lang
                                                                      ? 'bg-emerald-500 text-white'
                                                                      : scrolled || !isHomePage
                                                                        ? 'text-gray-600 hover:text-emerald-600'
                                                                        : 'text-white/80 hover:text-white'
                                                                  }`}
                                                                >
                                                                  {lang}
                                                                </button>
                                                              ))}
                                                </div>
                                                <Link
                                                                to="/open-trip"
                                                                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                                                              >
                                                              {t('common.bookNow')}
                                                </Link>
                                    </div>
                          
                            {/* Mobile Menu Button */}
                                    <button
                                                  onClick={() => setIsOpen(!isOpen)}
                                                  aria-expanded={isOpen}
                                                  aria-controls="mobile-menu"
                                                  aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
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
                <div id="mobile-menu" className={`lg:hidden transition-all duration-300 overflow-hidden ${
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
                                              {t('common.bookNow')}
                                  </Link>
                                  <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                                <span className="text-sm font-medium text-gray-600">{t('navbar.languageLabel')}</span>
                                                <div className="flex items-center gap-2">
                                                              {['id', 'en'].map((lang) => (
                                                                <button
                                                                  key={lang}
                                                                  type="button"
                                                                  onClick={() => setLanguage(lang)}
                                                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                                                                    language === lang
                                                                      ? 'bg-emerald-500 text-white'
                                                                      : 'bg-white text-gray-600'
                                                                  }`}
                                                                >
                                                                  {lang}
                                                                </button>
                                                              ))}
                                                </div>
                                  </div>
                        </div>
                </div>
          </nav>
        )
}
  
  export default Navbar
