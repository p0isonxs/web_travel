import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPackageById } from '../firebase/firestore'
import { FaMapMarkerAlt, FaClock, FaUsers, FaStar, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaWhatsapp, FaCalendar } from 'react-icons/fa'

const PackageDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [pkg, setPkg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('deskripsi')
    const [activeImage, setActiveImage] = useState(0)
    const [selectedDate, setSelectedDate] = useState('')
    const [participants, setParticipants] = useState(1)

    useEffect(() => {
          const fetchPackage = async () => {
                  try {
                            const data = await getPackageById(id)
                            setPkg(data)
                  } catch (error) {
                            console.error('Error fetching package:', error)
                  } finally {
                            setLoading(false)
                  }
          }
          fetchPackage()
    }, [id])

    const formatPrice = (price) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    const handleBooking = () => {
          if (!selectedDate) {
                  alert('Pilih tanggal keberangkatan terlebih dahulu!')
                  return
          }
          navigate(`/booking/${id}?date=${selectedDate}&participants=${participants}`)
    }

    if (loading) {
          return (
                  <>
                          <Navbar />
                          <div className="min-h-screen flex items-center justify-center pt-20">
                                    <div className="text-center">
                                                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>div>
                                                <p className="text-gray-500">Memuat detail paket...</p>p>
                                    </div>div>
                          </div>div>
                          <Footer />
                  </>>
                )
    }
  
    if (!pkg) {
          return (
                  <>
                          <Navbar />
                          <div className="min-h-screen flex items-center justify-center pt-20">
                                    <div className="text-center">
                                                <div className="text-6xl mb-4">😕</div>div>
                                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Paket tidak ditemukan</h2>h2>
                                                <Link to="/open-trip" className="text-emerald-600 hover:underline">Kembali ke Open Trip</Link>Link>
                                    </div>div>
                          </div>div>
                          <Footer />
                  </>>
                )
    }
  
    const images = pkg.images?.length > 0 ? pkg.images : [pkg.image || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800']
        const isOpenTrip = pkg.type === 'open-trip'
            const accentColor = isOpenTrip ? 'emerald' : 'purple'
              
                return (
                      <>
                            <Helmet>
                                    <title>{pkg.title} - Liburan Terus</title>title>
                                    <meta name="description" content={pkg.description?.substring(0, 160) || `Paket ${pkg.type} ${pkg.title} di ${pkg.location}`} />
                                    <meta name="keywords" content={`${pkg.title}, ${pkg.location}, ${pkg.type}, wisata Indonesia`} />
                                    <meta property="og:title" content={`${pkg.title} - Liburan Terus`} />
                                    <meta property="og:description" content={pkg.description?.substring(0, 160)} />
                                    <meta property="og:image" content={images[0]} />
                                    <script type="application/ld+json">{JSON.stringify({
                                  "@context": "https://schema.org",
                                  "@type": "TouristTrip",
                                  "name": pkg.title,
                                  "description": pkg.description,
                                  "touristType": pkg.type,
                                  "image": images[0],
                                  "offers": {
                                                "@type": "Offer",
                                                "price": pkg.price,
                                                "priceCurrency": "IDR"
                                  }
                      })}</script>script>
                            </Helmet>Helmet>
                            <Navbar />
                      
                            <div className="pt-20 min-h-screen bg-gray-50">
                              {/* Breadcrumb */}
                                    <div className="bg-white border-b">
                                              <div className="max-w-7xl mx-auto px-4 py-3">
                                                          <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                        <Link to="/" className="hover:text-emerald-600">Home</Link>Link>
                                                                        <span>/</span>span>
                                                                        <Link to={isOpenTrip ? '/open-trip' : '/private-trip'} className="hover:text-emerald-600">
                                                                          {isOpenTrip ? 'Open Trip' : 'Private Trip'}
                                                                        </Link>Link>
                                                                        <span>/</span>span>
                                                                        <span className="text-gray-800 truncate max-w-xs">{pkg.title}</span>span>
                                                          </div>div>
                                              </div>div>
                                    </div>div>
                            
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                {/* Left - Main Content */}
                                                          <div className="lg:col-span-2 space-y-6">
                                                            {/* Image Gallery */}
                                                                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                                                                        <div className="relative aspect-[16/9] overflow-hidden">
                                                                                                          <img
                                                                                                                                src={images[activeImage]}
                                                                                                                                alt={pkg.title}
                                                                                                                                className="w-full h-full object-cover"
                                                                                                                              />
                                                                                          {images.length > 1 && (
                                            <>
                                                                  <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                                                                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                                                                                          <FaChevronLeft />
                                                                  </button>button>
                                                                  <button onClick={() => setActiveImage(i => (i + 1) % images.length)}
                                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                                                                                          <FaChevronRight />
                                                                  </button>button>
                                            </>>
                                          )}
                                                                                                          <div className={`absolute top-4 left-4 ${isOpenTrip ? 'bg-emerald-500' : 'bg-purple-600'} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                                                                                                            {isOpenTrip ? 'Open Trip' : 'Private Trip'}
                                                                                                            </div>div>
                                                                                          </div>div>
                                                                          {images.length > 1 && (
                                          <div className="flex gap-2 p-3 overflow-x-auto">
                                            {images.map((img, i) => (
                                                                  <button key={i} onClick={() => setActiveImage(i)}
                                                                                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? `border-${accentColor}-500` : 'border-transparent'}`}>
                                                                                          <img src={img} alt="" className="w-full h-full object-cover" />
                                                                  </button>button>
                                                                ))}
                                          </div>div>
                                                                                        )}
                                                                        </div>div>
                                                          
                                                            {/* Title & Info */}
                                                                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                        <h1 className="text-2xl font-bold text-gray-800 mb-3">{pkg.title}</h1>h1>
                                                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                                                                                          <span className="flex items-center gap-1.5">
                                                                                                                              <FaMapMarkerAlt className={`text-${accentColor}-500`} />
                                                                                                            {pkg.location || 'Indonesia'}
                                                                                                            </span>span>
                                                                                                          <span className="flex items-center gap-1.5">
                                                                                                                              <FaClock className={`text-${accentColor}-500`} />
                                                                                                            {pkg.duration || '1 Hari'}
                                                                                                            </span>span>
                                                                                          {isOpenTrip && (
                                            <span className="flex items-center gap-1.5">
                                                                  <FaUsers className={`text-${accentColor}-500`} />
                                                                  Maks. {pkg.maxParticipants || 15} peserta
                                            </span>span>
                                                                                                          )}
                                                                                          {pkg.rating && (
                                            <span className="flex items-center gap-1.5">
                                                                  <FaStar className="text-yellow-400" />
                                              {pkg.rating} ({pkg.reviewCount || 0} ulasan)
                                            </span>span>
                                                                                                          )}
                                                                                          </div>div>
                                                                        </div>div>
                                                          
                                                            {/* Tabs */}
                                                                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                                                                        <div className="flex border-b">
                                                                                          {['deskripsi', 'jadwal', 'fasilitas'].map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab)}
                                                                    className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? `text-${accentColor}-600 border-b-2 border-${accentColor}-500` : 'text-gray-500 hover:text-gray-700'}`}>
                                              {tab === 'deskripsi' ? 'Deskripsi' : tab === 'jadwal' ? 'Jadwal Kegiatan' : 'Fasilitas'}
                                            </button>button>
                                          ))}
                                                                                          </div>div>
                                                                        
                                                                                        <div className="p-6">
                                                                                          {activeTab === 'deskripsi' && (
                                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                                                  <p>{pkg.description || 'Deskripsi paket akan segera tersedia.'}</p>p>
                                            </div>div>
                                                                                                          )}
                                                                                        
                                                                                          {activeTab === 'jadwal' && (
                                            <div className="space-y-4">
                                              {pkg.itinerary?.length > 0 ? pkg.itinerary.map((item, i) => (
                                                                      <div key={i} className="flex gap-4">
                                                                                                <div className={`shrink-0 w-8 h-8 bg-${accentColor}-100 text-${accentColor}-600 rounded-full flex items-center justify-center text-sm font-bold`}>
                                                                                                  {i + 1}
                                                                                                  </div>div>
                                                                                                <div>
                                                                                                                            <p className="font-semibold text-gray-800 text-sm">{item.time}</p>p>
                                                                                                                            <p className="text-gray-600 text-sm">{item.activity}</p>p>
                                                                                                  </div>div>
                                                                      </div>div>
                                                                    )) : (
                                                                      <p className="text-gray-500 text-sm">Jadwal kegiatan akan segera tersedia.</p>p>
                                                                  )}
                                            </div>div>
                                                                                                          )}
                                                                                        
                                                                                          {activeTab === 'fasilitas' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                  <div>
                                                                                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                                                                                    <FaCheck className="text-green-500" /> Sudah Termasuk
                                                                                            </h3>h3>
                                                                                          <ul className="space-y-2">
                                                                                            {pkg.includes?.length > 0 ? pkg.includes.map((item, i) => (
                                                                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                                                                        <FaCheck className="text-green-500 mt-0.5 shrink-0 text-xs" />
                                                                            {item}
                                                                            </li>li>
                                                                        )) : <li className="text-gray-400 text-sm">-</li>li>}
                                                                                            </ul>ul>
                                                                  </div>div>
                                                                  <div>
                                                                                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                                                                                    <FaTimes className="text-red-500" /> Tidak Termasuk
                                                                                            </h3>h3>
                                                                                          <ul className="space-y-2">
                                                                                            {pkg.excludes?.length > 0 ? pkg.excludes.map((item, i) => (
                                                                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                                                                        <FaTimes className="text-red-400 mt-0.5 shrink-0 text-xs" />
                                                                            {item}
                                                                            </li>li>
                                                                        )) : <li className="text-gray-400 text-sm">-</li>li>}
                                                                                            </ul>ul>
                                                                  </div>div>
                                            </div>div>
                                                                                                          )}
                                                                                          </div>div>
                                                                        </div>div>
                                                          </div>div>
                                              
                                                {/* Right - Booking Card */}
                                                          <div className="lg:col-span-1">
                                                                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                                                                          {/* Price */}
                                                                                        <div className="mb-6">
                                                                                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                            <p className="text-gray-400 line-through text-sm">{formatPrice(pkg.originalPrice)}</p>p>
                                                                                                          )}
                                                                                                          <p className={`text-3xl font-bold text-${accentColor}-600`}>{formatPrice(pkg.price)}</p>p>
                                                                                                          <p className="text-gray-400 text-sm">per orang</p>p>
                                                                                          </div>div>
                                                                        
                                                                          {/* Select Date */}
                                                                                        <div className="mb-4">
                                                                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                              <FaCalendar className={`inline mr-1.5 text-${accentColor}-500`} />
                                                                                                                              Tanggal Keberangkatan
                                                                                                            </label>label>
                                                                                                          <input
                                                                                                                                type="date"
                                                                                                                                value={selectedDate}
                                                                                                                                onChange={e => setSelectedDate(e.target.value)}
                                                                                                                                min={new Date().toISOString().split('T')[0]}
                                                                                                                                className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-${accentColor}-500`}
                                                                                                                              />
                                                                                          </div>div>
                                                                        
                                                                          {/* Participants */}
                                                                                        <div className="mb-6">
                                                                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                              <FaUsers className={`inline mr-1.5 text-${accentColor}-500`} />
                                                                                                                              Jumlah Peserta
                                                                                                            </label>label>
                                                                                                          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                                                                                                                              <button onClick={() => setParticipants(p => Math.max(1, p - 1))}
                                                                                                                                                      className={`w-7 h-7 bg-${accentColor}-100 text-${accentColor}-600 rounded-full flex items-center justify-center font-bold text-lg hover:bg-${accentColor}-200 transition-colors`}>
                                                                                                                                                    -
                                                                                                                                </button>button>
                                                                                                                              <span className="flex-1 text-center font-semibold text-gray-800">{participants}</span>span>
                                                                                                                              <button onClick={() => setParticipants(p => Math.min(pkg.maxParticipants || 99, p + 1))}
                                                                                                                                                      className={`w-7 h-7 bg-${accentColor}-100 text-${accentColor}-600 rounded-full flex items-center justify-center font-bold text-lg hover:bg-${accentColor}-200 transition-colors`}>
                                                                                                                                                    +
                                                                                                                                </button>button>
                                                                                                            </div>div>
                                                                                          </div>div>
                                                                        
                                                                          {/* Total */}
                                                                                        <div className={`bg-${accentColor}-50 rounded-xl p-4 mb-5`}>
                                                                                                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                                                                              <span>{formatPrice(pkg.price)} x {participants} orang</span>span>
                                                                                                            </div>div>
                                                                                                          <div className="flex justify-between font-bold text-gray-800">
                                                                                                                              <span>Total</span>span>
                                                                                                                              <span className={`text-${accentColor}-600`}>{formatPrice(pkg.price * participants)}</span>span>
                                                                                                            </div>div>
                                                                                          </div>div>
                                                                        
                                                                          {/* Book Button */}
                                                                                        <button onClick={handleBooking}
                                                                                                            className={`w-full bg-gradient-to-r ${isOpenTrip ? 'from-emerald-500 to-teal-600' : 'from-violet-500 to-purple-600'} text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mb-3`}>
                                                                                                          Pesan Sekarang
                                                                                          </button>button>
                                                                        
                                                                          {/* WhatsApp */}
                                                                                        <a href={`https://wa.me/6281234567890?text=Halo, saya ingin bertanya tentang paket ${pkg.title}`}
                                                                                                            target="_blank" rel="noopener noreferrer"
                                                                                                            className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 border border-green-200 py-3 rounded-xl font-semibold hover:bg-green-100 transition-colors text-sm">
                                                                                                          <FaWhatsapp size={16} />
                                                                                                          Tanya via WhatsApp
                                                                                          </a>a>
                                                                        </div>div>
                                                          </div>div>
                                              </div>div>
                                    </div>div>
                            </div>div>
                      
                            <Footer />
                      </>>
                    )
}
  
  export default PackageDetail</></></></>
