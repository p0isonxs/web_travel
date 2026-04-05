import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, limit, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PackageCard from '../components/PackageCard'
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiStar, FiArrowRight, FiShield, FiAward, FiHeadphones } from 'react-icons/fi'
import { FaWater, FaMountain, FaLandmark, FaGlobe, FaHotel, FaCamera } from 'react-icons/fa'

const heroSlides = [
  { image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920', title: 'Jelajahi Raja Ampat', subtitle: 'Surga Bawah Laut Terbaik di Dunia', location: 'Papua Barat' },
  { image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1920', title: 'Labuan Bajo & Komodo', subtitle: 'Petualangan Tak Terlupakan', location: 'NTT' },
  { image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1920', title: 'Keindahan Bali', subtitle: 'Pulau Dewata yang Memukau', location: 'Bali' },
  { image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1920', title: 'Bromo Tengger Semeru', subtitle: 'Keajaiban Alam Jawa Timur', location: 'Jawa Timur' },
]

const categories = [
  { name: 'Wisata Bahari', icon: FaWater, color: 'bg-blue-500', count: '150+ Paket', path: '?category=bahari' },
  { name: 'Wisata Gunung', icon: FaMountain, color: 'bg-emerald-500', count: '80+ Paket', path: '?category=gunung' },
  { name: 'Wisata Budaya', icon: FaLandmark, color: 'bg-amber-500', count: '60+ Paket', path: '?category=budaya' },
  { name: 'Mancanegara', icon: FaGlobe, color: 'bg-purple-500', count: '40+ Paket', path: '?category=mancanegara' },
  { name: 'Hotel & Resort', icon: FaHotel, color: 'bg-pink-500', count: '200+ Pilihan', path: '?category=hotel' },
  { name: 'Fotografi Tour', icon: FaCamera, color: 'bg-rose-500', count: '30+ Paket', path: '?category=foto' },
]

const testimonials = [
  { name: 'Rina Dewi', city: 'Jakarta', rating: 5, text: 'Paket Komodo-nya luar biasa! Pelayanan sangat profesional, guide ramah dan informatif. Highly recommended!', avatar: 'https://i.pravatar.cc/80?img=1', trip: 'Sailing Komodo Labuan Bajo' },
  { name: 'Budi Santoso', city: 'Surabaya', rating: 5, text: 'Raja Ampat trip terbaik sepanjang hidup saya. Snorkeling dengan manta ray! Akan datang lagi tahun depan.', avatar: 'https://i.pravatar.cc/80?img=3', trip: 'Raja Ampat 4D3N' },
  { name: 'Siti Rahma', city: 'Bandung', rating: 5, text: 'Open trip Bromo sangat berkesan. Harga terjangkau, fasilitas lengkap. Teman-teman trip-nya juga seru!', avatar: 'https://i.pravatar.cc/80?img=5', trip: 'Bromo Midnight Sunrise' },
]

const destinations = [
  { name: 'Raja Ampat', location: 'Papua Barat', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', packages: 12 },
  { name: 'Labuan Bajo', location: 'NTT', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', packages: 18 },
  { name: 'Bali', location: 'Bali', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400', packages: 35 },
  { name: 'Lombok', location: 'NTB', image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400', packages: 22 },
  { name: 'Wakatobi', location: 'Sulawesi Tenggara', image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400', packages: 8 },
  { name: 'Derawan', location: 'Kalimantan Timur', image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400', packages: 10 },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const q = query(collection(db, 'packages'), where('featured', '==', true), orderBy('createdAt', 'desc'), limit(8))
        const snap = await getDocs(q)
        setPackages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        // Fallback dummy data
        setPackages(dummyPackages)
      }
      setLoading(false)
    }
    fetchPackages()
  }, [])

  const dummyPackages = [
    { id: '1', title: 'Sailing Komodo Labuan Bajo', location: 'Nusa Tenggara Timur', duration: '3 Hari 2 Malam', price: 2750000, originalPrice: 3200000, type: 'Open Trip', category: 'bahari', rating: 5.0, reviews: 721, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', featured: true },
    { id: '2', title: 'Raja Ampat Piaynemo', location: 'Papua Barat', duration: '4 Hari 3 Malam', price: 4500000, originalPrice: 5000000, type: 'Open Trip', category: 'bahari', rating: 5.0, reviews: 456, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', featured: true },
    { id: '3', title: 'Bromo Midnight Sunrise', location: 'Jawa Timur', duration: '2 Hari 1 Malam', price: 345000, originalPrice: 400000, type: 'Open Trip', category: 'gunung', rating: 5.0, reviews: 551, image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600', featured: true },
    { id: '4', title: 'Dieng Plateau Culture Trip', location: 'Jawa Tengah', duration: '2 Hari 1 Malam', price: 750000, originalPrice: 900000, type: 'Open Trip', category: 'budaya', rating: 5.0, reviews: 246, image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600', featured: true },
    { id: '5', title: 'Wakatobi Diving Paradise', location: 'Sulawesi Tenggara', duration: '5 Hari 4 Malam', price: 5500000, originalPrice: 6500000, type: 'Private Trip', category: 'bahari', rating: 5.0, reviews: 189, image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600', featured: true },
    { id: '6', title: 'Pulau Derawan Labuan Cermin', location: 'Kalimantan Timur', duration: '4 Hari 3 Malam', price: 4050000, originalPrice: 4500000, type: 'Open Trip', category: 'bahari', rating: 5.0, reviews: 672, image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600', featured: true },
    { id: '7', title: 'Trekking Gunung Prau', location: 'Jawa Tengah', duration: '2 Hari 1 Malam', price: 450000, originalPrice: 550000, type: 'Open Trip', category: 'gunung', rating: 4.9, reviews: 334, image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600', featured: true },
    { id: '8', title: 'Bali Nusa Penida Adventure', location: 'Bali', duration: '3 Hari 2 Malam', price: 1800000, originalPrice: 2200000, type: 'Open Trip', category: 'bahari', rating: 5.0, reviews: 890, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600', featured: true },
  ]

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div key={index} className={"absolute inset-0 transition-opacity duration-1000 " + (index === currentSlide ? 'opacity-100' : 'opacity-0')}>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>
        ))}
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              <FiMapPin size={14} />
              <span>{heroSlides[currentSlide]?.location}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-3 text-shadow leading-tight">
              {heroSlides[currentSlide]?.title}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">{heroSlides[currentSlide]?.subtitle}</p>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                <FiSearch className="text-primary-400 shrink-0" size={20} />
                <input type="text" placeholder="Cari destinasi, paket wisata..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-gray-700 outline-none w-full text-sm" />
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                <FiCalendar className="text-primary-400 shrink-0" size={20} />
                <input type="date" className="text-gray-700 outline-none w-full text-sm" />
              </div>
              <Link to={"/paket-wisata" + (searchQuery ? "?q=" + searchQuery : "")} className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 font-semibold transition-colors">
                <FiSearch size={18} /> Cari
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Raja Ampat', 'Komodo', 'Bromo', 'Bali', 'Dieng'].map(tag => (
                <button key={tag} className="text-xs text-gray-500 hover:text-primary-500 border border-gray-200 hover:border-primary-300 px-3 py-1 rounded-full transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-8">
            {heroSlides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={"h-2 rounded-full transition-all " + (index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2')} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-8 shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '500+', label: 'Paket Wisata' },
              { number: '50K+', label: 'Pelanggan Puas' },
              { number: '100+', label: 'Destinasi' },
              { number: '10+', label: 'Tahun Pengalaman' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary-500 font-display">{stat.number}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Kategori Wisata</h2>
            <p className="section-subtitle">Pilih jenis wisata sesuai dengan selera dan petualangan Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link key={cat.name} to={"/paket-wisata" + cat.path} className="group text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className={"w-14 h-14 " + cat.color + " rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md"}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.count}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title">Paket Wisata Populer</h2>
              <p className="text-gray-500">Paket terlaris dengan ulasan terbaik dari pelanggan kami</p>
            </div>
            <Link to="/paket-wisata" className="hidden md:flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all">
              Lihat Semua <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(packages.length > 0 ? packages : dummyPackages).map(pkg => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/paket-wisata" className="btn-primary inline-flex items-center gap-2">
              Lihat Semua Paket <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Destinasi Favorit</h2>
            <p className="section-subtitle">Jelajahi destinasi wisata paling populer di Indonesia</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <Link key={dest.name} to={"/paket-wisata?destination=" + dest.name} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all">
                <img src={dest.image} alt={dest.name} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm opacity-80"><FiMapPin size={12} /> {dest.location}</span>
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs">{dest.packages} Paket</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Mengapa Pilih NusaTrip?</h2>
            <p className="section-subtitle">Kami berkomitmen memberikan pengalaman wisata terbaik untuk Anda</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FiShield, title: 'Terpercaya & Aman', desc: 'Lebih dari 50.000 pelanggan puas dengan rating 5 bintang. Transaksi aman dengan sistem pembayaran terpercaya.', color: 'text-blue-500 bg-blue-50' },
              { icon: FiAward, title: 'Guide Berpengalaman', desc: 'Tim guide profesional bersertifikat dengan pengalaman bertahun-tahun memandu wisatawan ke berbagai destinasi.', color: 'text-primary-500 bg-primary-50' },
              { icon: FiHeadphones, title: 'Support 24/7', desc: 'Layanan pelanggan siap membantu Anda 24 jam sehari, 7 hari seminggu melalui WhatsApp, telepon, atau email.', color: 'text-emerald-500 bg-emerald-50' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.title} className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className={"w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 " + item.color}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Apa Kata Mereka?</h2>
            <p className="section-subtitle">Ribuan pelanggan telah merasakan pengalaman wisata bersama NusaTrip</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={16} />)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city} • {t.trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold font-display mb-4">Siap Memulai Petualangan?</h2>
          <p className="text-xl opacity-90 mb-8">Hubungi kami sekarang dan dapatkan konsultasi gratis untuk perjalanan impian Anda</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/paket-wisata" className="bg-white text-primary-500 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg">
              Lihat Paket Wisata
            </Link>
            <a href="https://wa.me/6281234567890?text=Halo NusaTrip, saya ingin konsultasi paket wisata" target="_blank" rel="noreferrer" className="border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-primary-500 transition-colors text-lg">
              WhatsApp Kami
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
