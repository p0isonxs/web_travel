import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPackages } from '../firebase/firestore'
import { FaSearch, FaMapMarkerAlt, FaClock, FaUserFriends, FaStar, FaFilter, FaCheck } from 'react-icons/fa'
import Seo from '../components/Seo'
import { useLanguage } from '../contexts/LanguageContext'

const PrivateTrip = () => {
    const [packages, setPackages] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const { t, localize } = useLanguage()

    useEffect(() => {
          const fetchPackages = async () => {
                  try {
                            const data = await getPackages('private-trip')
                            setPackages(data)
                            setFiltered(data)
                  } catch (error) {
                            console.error('Error fetching packages:', error)
                  } finally {
                            setLoading(false)
                  }
          }
          fetchPackages()
    }, [])

    useEffect(() => {
          let result = [...packages]
          if (search) {
                  result = result.filter(p =>
                            localize(p.title)?.toLowerCase().includes(search.toLowerCase()) ||
                            localize(p.location)?.toLowerCase().includes(search.toLowerCase())
                                               )
          }
          if (sortBy === 'price-asc') result.sort((a, b) => (a.price || 0) - (b.price || 0))
          else if (sortBy === 'price-desc') result.sort((a, b) => (b.price || 0) - (a.price || 0))
          setFiltered(result)
    }, [search, sortBy, packages])

    const formatPrice = (price) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    const benefits = [
          t('privateTrip.benefit1'),
          t('privateTrip.benefit2'),
          t('privateTrip.benefit3'),
          t('privateTrip.benefit4'),
          t('privateTrip.benefit5'),
          t('privateTrip.benefit6'),
        ]

    return (
          <>
                <Seo
                  title={t('privateTrip.seoTitle')}
                  description={t('privateTrip.seoDescription')}
                />
          
            {/* Hero */}
                <section className="relative pt-20 pb-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                                  <div className="absolute top-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
                                  <div className="absolute bottom-0 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-4">
                                              <FaUserFriends size={12} />
                                              <span>{t('privateTrip.heroBadge')}</span>
                                  </div>
                                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                              {t('privateTrip.heroTitle')} <span className="text-purple-200">{t('privateTrip.heroHighlight')}</span>
                                  </h1>
                                  <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-8">
                                              {t('privateTrip.heroDescription')}
                                  </p>
                                  <div className="max-w-2xl mx-auto">
                                              <div className="relative bg-white rounded-2xl shadow-xl p-2 flex gap-2">
                                                            <div className="flex-1 relative">
                                                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                            <input
                                                                                                type="text"
                                                                                                value={search}
                                                                                                onChange={e => setSearch(e.target.value)}
                                                                                                placeholder={t('privateTrip.searchPlaceholder')}
                                                                                                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-700 focus:outline-none text-sm"
                                                                                              />
                                                            </div>
                                                            <button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
                                                                            {t('privateTrip.searchButton')}
                                                            </button>
                                              </div>
                                  </div>
                        </div>
                </section>
          
            {/* Benefits */}
                <section className="py-12 bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                  <h2 className="text-center text-xl font-bold text-gray-800 mb-8">{t('privateTrip.benefitsTitle')}</h2>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                                          <div className="bg-purple-100 p-1.5 rounded-lg shrink-0">
                                                            <FaCheck className="text-purple-600 text-xs" />
                                          </div>
                                          <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                                  </div>
                        </div>
                </section>
          
            {/* Packages */}
                <section className="py-16 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                              <div>
                                                            <h2 className="text-xl font-bold text-gray-800">
                                                              {loading ? t('privateTrip.loading') : `${filtered.length} ${t('privateTrip.packagesCount')}`}
                                                            </h2>
                                                            <p className="text-gray-500 text-sm">{t('privateTrip.priceAdjustable')}</p>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                            <FaFilter className="text-gray-400" />
                                                            <select
                                                                              value={sortBy}
                                                                              onChange={e => setSortBy(e.target.value)}
                                                                              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                                                            >
                                                                            <option value="newest">{t('privateTrip.newest')}</option>
                                                                            <option value="price-asc">{t('privateTrip.lowestPrice')}</option>
                                                                            <option value="price-desc">{t('privateTrip.highestPrice')}</option>
                                                            </select>
                                              </div>
                                  </div>
                        
                          {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...Array(6)].map((_, i) => (
                                          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                                            <div className="h-52 bg-gray-200"></div>
                                                            <div className="p-5 space-y-3">
                                                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                                            </div>
                                          </div>
                                        ))}
                        </div>
                                  )}
                        
                          {!loading && filtered.length === 0 && (
                        <div className="text-center py-20">
                                      <div className="text-6xl mb-4">🏔️</div>
                                      <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('privateTrip.notFoundTitle')}</h3>
                                      <p className="text-gray-500">{t('privateTrip.notFoundDescription')}</p>
                                      <Link to="/kontak" className="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                                                      {t('privateTrip.contactUs')}
                                      </Link>
                        </div>
                                  )}
                        
                          {!loading && filtered.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filtered.map((pkg) => {
                                          const title = localize(pkg.title)
                                          const location = localize(pkg.location)
                                          const duration = localize(pkg.duration)
                                          return (
                                          <Link key={pkg.id} to={`/paket/${pkg.id}`} className="group">
                                                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                                                <div className="relative h-52 overflow-hidden">
                                                                                                      <img
                                                                                                                                src={pkg.images?.[0] || pkg.image || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600'}
                                                                                                                                alt={title}
                                                                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                                                              />
                                                                                                      <div className="absolute top-3 left-3">
                                                                                                                              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                                                                                                                        {t('privateTrip.privateBadge')}
                                                                                                                                </span>
                                                                                                        </div>
                                                                                  </div>
                                                                                <div className="p-5">
                                                                                                      <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                                                                        {title}
                                                                                                        </h3>
                                                                                                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                                                                                                                              <FaMapMarkerAlt className="text-purple-500" size={12} />
                                                                                                                              <span>{location || t('privateTrip.locationFallback')}</span>
                                                                                                        </div>
                                                                                                      <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                                                                                                                              <span className="flex items-center gap-1">
                                                                                                                                                        <FaClock className="text-purple-400" size={11} />
                                                                                                                                {duration || t('privateTrip.durationFallback')}
                                                                                                                                </span>
                                                                                                        {pkg.rating && (
                                                                      <span className="flex items-center gap-1">
                                                                                                  <FaStar className="text-yellow-400" size={11} />
                                                                        {pkg.rating}
                                                                      </span>
                                                                                                                              )}
                                                                                                        </div>
                                                                                                      <div className="flex items-end justify-between">
                                                                                                                              <div>
                                                                                                                                                        <p className="text-xs text-gray-400">{t('privateTrip.startingFrom')}</p>
                                                                                                                                                        <p className="text-purple-600 font-bold text-lg">{formatPrice(pkg.price)}</p>
                                                                                                                                                        <p className="text-gray-400 text-xs">{t('privateTrip.negotiablePrice')}</p>
                                                                                                                                </div>
                                                                                                                              <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-purple-600 hover:text-white transition-colors">
                                                                                                                                                        {t('privateTrip.viewDetail')}
                                                                                                                                </span>
                                                                                                        </div>
                                                                                  </div>
                                                            </div>
                                          </Link>
                                        )})}
                        </div>
                                  )}
                        </div>
                </section>
          
            {/* CTA Custom */}
                <section className="py-16 bg-gradient-to-r from-violet-600 to-purple-700">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('privateTrip.customTitle')}</h2>
                                  <p className="text-purple-200 mb-8">{t('privateTrip.customDescription')}</p>
                                  <Link to="/kontak" className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all">
                                              {t('privateTrip.contactNow')}
                                  </Link>
                        </div>
                </section>
          
          </>
        )
}
  
  export default PrivateTrip
