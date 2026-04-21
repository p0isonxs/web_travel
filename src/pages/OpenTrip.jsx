import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPackages } from '../lib/database'
import { FaSearch, FaMapMarkerAlt, FaClock, FaUsers, FaStar, FaFilter } from 'react-icons/fa'
import Seo from '../components/Seo'
import { useLanguage } from '../contexts/LanguageContext'

const OpenTrip = () => {
    const [packages, setPackages] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const { t, localize } = useLanguage()

    useEffect(() => {
          const fetchPackages = async () => {
                  try {
                            const data = await getPackages('open-trip')
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

    return (
          <>
                <Seo
                  title={t('openTrip.seoTitle')}
                  description={t('openTrip.seoDescription')}
                />
          
            {/* Hero */}
                <section className="relative pt-20 pb-16 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                                  <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                                  <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-4">
                                              <FaUsers size={12} />
                                              <span>{t('openTrip.heroBadge')}</span>
                                  </div>
                                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                              {t('openTrip.heroTitle')} <span className="text-emerald-200">{t('openTrip.heroHighlight')}</span>
                                  </h1>
                                  <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
                                              {t('openTrip.heroDescription')}
                                  </p>
                        
                          {/* Search Bar */}
                                  <div className="max-w-2xl mx-auto">
                                              <div className="relative bg-white rounded-2xl shadow-xl p-2 flex gap-2">
                                                            <div className="flex-1 relative">
                                                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                            <input
                                                                                                type="text"
                                                                                                value={search}
                                                                                                onChange={e => setSearch(e.target.value)}
                                                                                                placeholder={t('openTrip.searchPlaceholder')}
                                                                                                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-700 focus:outline-none text-sm"
                                                                                              />
                                                            </div>
                                                            <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
                                                                            {t('openTrip.searchButton')}
                                                            </button>
                                              </div>
                                  </div>
                        </div>
                </section>
          
            {/* Packages */}
                <section className="py-16 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          {/* Filter Bar */}
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                              <div>
                                                            <h2 className="text-xl font-bold text-gray-800">
                                                              {loading ? t('openTrip.loading') : `${filtered.length} ${t('openTrip.packagesCount')}`}
                                                            </h2>
                                                            <p className="text-gray-500 text-sm">{t('openTrip.availableForYou')}</p>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                            <FaFilter className="text-gray-400" />
                                                            <select
                                                                              value={sortBy}
                                                                              onChange={e => setSortBy(e.target.value)}
                                                                              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                                            >
                                                                            <option value="newest">{t('openTrip.newest')}</option>
                                                                            <option value="price-asc">{t('openTrip.lowestPrice')}</option>
                                                                            <option value="price-desc">{t('openTrip.highestPrice')}</option>
                                                            </select>
                                              </div>
                                  </div>
                        
                          {/* Loading */}
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
                        
                          {/* Empty State */}
                          {!loading && filtered.length === 0 && (
                        <div className="text-center py-20">
                                      <div className="text-6xl mb-4">🏝️</div>
                                      <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('openTrip.notFoundTitle')}</h3>
                                      <p className="text-gray-500">{t('openTrip.notFoundDescription')}</p>
                        </div>
                                  )}
                        
                          {/* Grid */}
                          {!loading && filtered.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filtered.map((pkg) => {
                                          const title = localize(pkg.title)
                                          const location = localize(pkg.location)
                                          const duration = localize(pkg.duration)
                                          return (
                                          <Link key={pkg.id} to={`/paket/${pkg.id}`} className="group">
                                                            <div className="bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] hover:shadow-[0_24px_60px_-28px_rgba(16,185,129,0.28)] transition-all duration-300 hover:-translate-y-1">
                                                              {/* Image */}
                                                                                <div className="relative h-52 overflow-hidden">
                                                                                                      <img
                                                                                                                                src={pkg.images?.[0] || pkg.image || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600'}
                                                                                                                                alt={title}
                                                                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                                                              />
                                                                                                      <div className="absolute top-3 left-3">
                                                                                                                              <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                                                                                                                        {t('common.openTrip')}
                                                                                                                                </span>
                                                                                                        </div>
                                                                                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                    <div className="absolute top-3 right-3">
                                                                                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                                                                                          {t('openTrip.discount')}
                                                                                                </span>
                                                                    </div>
                                                                                                      )}
                                                                                  </div>
                                                            
                                                              {/* Content */}
                                                                                <div className="p-5">
                                                                                                      <div className="flex items-center justify-end gap-3 mb-3">
                                                                                                        {pkg.rating && (
                                                                                                          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                                                                                                            <FaStar className="text-yellow-400" size={11} />
                                                                                                                            <span>{pkg.rating}</span>
                                                                                                          </div>
                                                                                                        )}
                                                                                                      </div>

                                                                                                      <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                                                                                        {title}
                                                                                                        </h3>
                                                                                
                                                                                                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                                                                                                              <FaMapMarkerAlt className="text-emerald-500" size={12} />
                                                                                                                              <span className="line-clamp-1">{location || t('openTrip.locationFallback')}</span>
                                                                                                        </div>
                                                                                
                                                                                                      <div className="grid grid-cols-2 gap-3 mb-5">
                                                                                                                              <div className="rounded-2xl bg-gray-50 px-3.5 py-3">
                                                                                                                                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">{t('openTrip.duration')}</p>
                                                                                                                                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                                                                                                                <FaClock className="text-teal-500" size={11} />
                                                                                                                                                <span>{duration || t('openTrip.durationFallback')}</span>
                                                                                                                                                </span>
                                                                                                                              </div>
                                                                                                                              <div className="rounded-2xl bg-gray-50 px-3.5 py-3">
                                                                                                                                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400 mb-1">{t('openTrip.participants')}</p>
                                                                                                                                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                                                                                                                <FaUsers className="text-teal-500" size={11} />
                                                                                                                                                <span>{pkg.maxParticipants || 15} {t('openTrip.participantUnit')}</span>
                                                                                                                                                </span>
                                                                                                                              </div>
                                                                                                        </div>
                                                                                
                                                                                  {/* Price */}
                                                                                                      <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                                                                                                                              <div>
                                                                                                                                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                        <p className="text-xs text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</p>
                                                                                                                                                        )}
                                                                                                                                                        <p className="text-emerald-600 font-bold text-xl">{formatPrice(pkg.price)}</p>
                                                                                                                                                        <p className="text-gray-400 text-xs uppercase tracking-[0.18em]">{t('openTrip.perPerson')}</p>
                                                                                                                                </div>
                                                                                                                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white">
                                                                                                                                                        {t('openTrip.viewDetail')}
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
          
          </>
        )
}
  
  export default OpenTrip
