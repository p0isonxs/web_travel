import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPackages } from '../firebase/firestore'
import { FaSearch, FaMapMarkerAlt, FaClock, FaUserFriends, FaStar, FaFilter, FaCheck } from 'react-icons/fa'

const PrivateTrip = () => {
    const [packages, setPackages] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('newest')

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
                            p.title?.toLowerCase().includes(search.toLowerCase()) ||
                            p.location?.toLowerCase().includes(search.toLowerCase())
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
          'Jadwal perjalanan sesuai keinginan Anda',
          'Tidak bergabung dengan peserta lain',
          'Harga menyesuaikan jumlah peserta',
          'Pemandu wisata profesional & berpengalaman',
          'Akomodasi premium pilihan Anda',
          'Layanan jemputan dari lokasi Anda',
        ]

    return (
          <>
                <Helmet>
                        <title>Private Trip - Liburan Terus | Wisata Eksklusif Rombongan</title>
                        <meta name="description" content="Nikmati wisata eksklusif bersama keluarga atau rombongan Anda dengan paket private trip Liburan Terus. Jadwal fleksibel, harga terjangkau." />
                        <meta name="keywords" content="private trip, wisata keluarga, wisata rombongan, paket wisata eksklusif" />
                        <meta property="og:title" content="Private Trip - Liburan Terus" />
                        <meta property="og:description" content="Wisata eksklusif bersama orang-orang tersayang." />
                </Helmet>
                <Navbar />
          
            {/* Hero */}
                <section className="relative pt-20 pb-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                                  <div className="absolute top-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
                                  <div className="absolute bottom-0 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                        </div>
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-4">
                                              <FaUserFriends size={12} />
                                              <span>Eksklusif untuk Anda & Rombongan</span>
                                  </div>
                                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                              Private Trip <span className="text-purple-200">Eksklusif & Fleksibel</span>
                                  </h1>
                                  <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-8">
                                              Nikmati pengalaman wisata premium bersama keluarga atau rombongan Anda. Jadwal, destinasi, dan fasilitas sesuai keinginan.
                                  </p>
                                  <div className="max-w-2xl mx-auto">
                                              <div className="relative bg-white rounded-2xl shadow-xl p-2 flex gap-2">
                                                            <div className="flex-1 relative">
                                                                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                            <input
                                                                                                type="text"
                                                                                                value={search}
                                                                                                onChange={e => setSearch(e.target.value)}
                                                                                                placeholder="Cari paket private trip..."
                                                                                                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-700 focus:outline-none text-sm"
                                                                                              />
                                                            </div>
                                                            <button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm">
                                                                            Cari
                                                            </button>
                                              </div>
                                  </div>
                        </div>
                </section>
          
            {/* Benefits */}
                <section className="py-12 bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                  <h2 className="text-center text-xl font-bold text-gray-800 mb-8">Keunggulan Private Trip</h2>
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
                                                              {loading ? 'Memuat...' : `${filtered.length} Paket Private Trip`}
                                                            </h2>
                                                            <p className="text-gray-500 text-sm">Harga dapat disesuaikan dengan jumlah peserta</p>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                            <FaFilter className="text-gray-400" />
                                                            <select
                                                                              value={sortBy}
                                                                              onChange={e => setSortBy(e.target.value)}
                                                                              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                                                            >
                                                                            <option value="newest">Terbaru</option>
                                                                            <option value="price-asc">Harga: Terendah</option>
                                                                            <option value="price-desc">Harga: Tertinggi</option>
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
                                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Paket tidak ditemukan</h3>
                                      <p className="text-gray-500">Coba kata kunci lain atau hubungi kami untuk paket custom</p>
                                      <Link to="/kontak" className="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                                                      Hubungi Kami
                                      </Link>
                        </div>
                                  )}
                        
                          {!loading && filtered.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filtered.map((pkg) => (
                                          <Link key={pkg.id} to={`/paket/${pkg.id}`} className="group">
                                                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                                                <div className="relative h-52 overflow-hidden">
                                                                                                      <img
                                                                                                                                src={pkg.image || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600'}
                                                                                                                                alt={pkg.title}
                                                                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                                                              />
                                                                                                      <div className="absolute top-3 left-3">
                                                                                                                              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                                                                                                                        Private Trip
                                                                                                                                </span>
                                                                                                        </div>
                                                                                  </div>
                                                                                <div className="p-5">
                                                                                                      <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                                                                        {pkg.title}
                                                                                                        </h3>
                                                                                                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                                                                                                                              <FaMapMarkerAlt className="text-purple-500" size={12} />
                                                                                                                              <span>{pkg.location || 'Indonesia'}</span>
                                                                                                        </div>
                                                                                                      <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                                                                                                                              <span className="flex items-center gap-1">
                                                                                                                                                        <FaClock className="text-purple-400" size={11} />
                                                                                                                                {pkg.duration || '1 Hari'}
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
                                                                                                                                                        <p className="text-xs text-gray-400">Mulai dari</p>
                                                                                                                                                        <p className="text-purple-600 font-bold text-lg">{formatPrice(pkg.price)}</p>
                                                                                                                                                        <p className="text-gray-400 text-xs">harga nego</p>
                                                                                                                                </div>
                                                                                                                              <span className="bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-purple-600 hover:text-white transition-colors">
                                                                                                                                                        Lihat Detail
                                                                                                                                </span>
                                                                                                        </div>
                                                                                  </div>
                                                            </div>
                                          </Link>
                                        ))}
                        </div>
                                  )}
                        </div>
                </section>
          
            {/* CTA Custom */}
                <section className="py-16 bg-gradient-to-r from-violet-600 to-purple-700">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Tidak menemukan paket yang cocok?</h2>
                                  <p className="text-purple-200 mb-8">Kami siap membuat itinerary custom sesuai keinginan Anda!</p>
                                  <Link to="/kontak" className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all">
                                              Hubungi Kami Sekarang
                                  </Link>
                        </div>
                </section>
          
                <Footer />
          </>
        )
}
  
  export default PrivateTrip</>
