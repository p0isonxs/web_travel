import { Link } from 'react-router-dom'
import { FaPlane, FaInstagram, FaWhatsapp, FaYoutube, FaTiktok, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook } from 'react-icons/fa'
import { useSettings } from '../contexts/SettingsContext'
import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const settings = useSettings()
    const { t } = useLanguage()

    return (
          <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          {/* Brand */}
                                  <div className="lg:col-span-1">
                                              <Link to="/" className="flex items-center gap-2 mb-4">
                                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl">
                                                                            <FaPlane className="text-white text-xl" />
                                                            </div>
                                                            <div>
                                                                            <span className="font-bold text-lg text-white block">Liburan Terus</span>
                                                                            <span className="text-xs text-emerald-400 block">{t('common.brandTagline')}</span>
                                                            </div>
                                              </Link>
                                              <p className="text-sm leading-relaxed text-gray-400 mb-6">
                                                            {t('footer.description')}
                                              </p>
                                              <div className="flex gap-3">
                                                {settings.instagram && (
                                                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                                                    className="bg-gray-800 hover:bg-pink-600 p-2.5 rounded-lg transition-colors">
                                                    <FaInstagram size={16} />
                                                  </a>
                                                )}
                                                <a href={`https://wa.me/${settings.phone}`} target="_blank" rel="noopener noreferrer"
                                                  className="bg-gray-800 hover:bg-green-600 p-2.5 rounded-lg transition-colors">
                                                  <FaWhatsapp size={16} />
                                                </a>
                                                {settings.facebook && (
                                                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer"
                                                    className="bg-gray-800 hover:bg-blue-700 p-2.5 rounded-lg transition-colors">
                                                    <FaFacebook size={16} />
                                                  </a>
                                                )}
                                                {settings.youtube && (
                                                  <a href={settings.youtube} target="_blank" rel="noopener noreferrer"
                                                    className="bg-gray-800 hover:bg-red-600 p-2.5 rounded-lg transition-colors">
                                                    <FaYoutube size={16} />
                                                  </a>
                                                )}
                                                {settings.tiktok && (
                                                  <a href={settings.tiktok} target="_blank" rel="noopener noreferrer"
                                                    className="bg-gray-800 hover:bg-gray-600 p-2.5 rounded-lg transition-colors">
                                                    <FaTiktok size={16} />
                                                  </a>
                                                )}
                                              </div>
                                  </div>
                        
                          {/* Layanan */}
                                  <div>
                                              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.services')}</h3>
                                              <ul className="space-y-2.5">
                                                {[
            { to: '/open-trip', label: t('common.openTrip') },
            { to: '/private-trip', label: t('common.privateTrip') },
            { to: '/galeri', label: t('common.gallery') },
            { to: '/blog', label: t('footer.blogTips') },
                          ].map(item => (
                                            <li key={item.to}>
                                                              <Link to={item.to}
                                                                                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                                                                  <span className="text-emerald-500">›</span> {item.label}
                                                              </Link>
                                            </li>
                                          ))}
                                              </ul>
                                  </div>
                        
                          {/* Informasi */}
                                  <div>
                                              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.information')}</h3>
                                              <ul className="space-y-2.5">
                                                {[
            { to: '/tentang-kami', label: t('common.about') },
            { to: '/kontak', label: t('footer.contactUsLink') },
                          ].map(item => (
                                            <li key={item.to}>
                                                              <Link to={item.to}
                                                                                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                                                                  <span className="text-emerald-500">›</span> {item.label}
                                                              </Link>
                                            </li>
                                          ))}
                                              </ul>
                                  </div>
                        
                          {/* Kontak */}
                                  <div>
                                              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.contactUs')}</h3>
                                              <ul className="space-y-3">
                                                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                                                            <FaMapMarkerAlt className="text-emerald-500 mt-0.5 shrink-0" />
                                                                            <span>{settings.address}</span>
                                                            </li>
                                                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                                                            <FaPhone className="text-emerald-500 shrink-0" />
                                                                            <a href={`tel:+${settings.phone}`} className="hover:text-emerald-400 transition-colors">
                                                                                              +{settings.phone}
                                                                            </a>
                                                            </li>
                                                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                                                            <FaEnvelope className="text-emerald-500 shrink-0" />
                                                                            <a href={`mailto:${settings.email}`} className="hover:text-emerald-400 transition-colors">
                                                                                              {settings.email}
                                                                            </a>
                                                            </li>
                                              </ul>
                                  </div>
                        </div>
                </div>
          
            {/* Bottom Bar */}
                <div className="border-t border-gray-800">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                  <p className="text-sm text-gray-500">
                                              © {currentYear} Liburan Terus. {t('footer.rights')}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                              {t('footer.madeFor')}
                                  </p>
                        </div>
                </div>
          </footer>
        )
}
  
  export default Footer
