import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FiSearch, FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi'

const dummyPosts = [
  { id: '1', title: 'Petualangan Epik di Derawan Labuan Cermin: Snorkeling & Menyelam Bersama Whaleshark', slug: 'derawan-labuan-cermin', excerpt: 'Mengungkap pesona tersembunyi Derawan dan Labuan Cermin yang memukau dengan kejernihan airnya yang bagai kaca...', category: 'Informasi', author: 'Umar Dary', date: '2024-09-11', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', tags: ['derawan', 'diving'] },
  { id: '2', title: '10 Tips Hemat Traveling ke Raja Ampat dengan Budget Minimal', slug: 'tips-hemat-raja-ampat', excerpt: 'Raja Ampat identik dengan destinasi mahal. Namun dengan tips ini, kamu bisa menikmati keindahannya dengan budget terbatas...', category: 'Tips', author: 'Admin', date: '2024-08-20', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', tags: ['tips', 'budget'] },
  { id: '3', title: 'Curug Luhur Air Terjun Unik di Bogor Lengkap dengan Harga Tiketnya', slug: 'curug-luhur-bogor', excerpt: 'Temukan keindahan Curug Luhur, air terjun tersembunyi di Bogor yang cocok untuk weekend getaway dari hiruk pikuk kota...', category: 'Destinasi', author: 'Admin', date: '2023-11-09', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600', tags: ['bogor', 'curug'] },
  { id: '4', title: 'Panduan Lengkap Open Trip vs Private Trip: Mana Yang Cocok Untukmu?', slug: 'open-trip-vs-private', excerpt: 'Bingung memilih antara open trip dan private trip? Artikel ini membantu kamu memilih jenis perjalanan yang paling sesuai...', category: 'Tips', author: 'Admin', date: '2025-01-15', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600', tags: ['tips', 'perjalanan'] },
  { id: '5', title: 'Mengenal Budaya Unik Suku Baduy yang Hidup Tanpa Teknologi', slug: 'budaya-suku-baduy', excerpt: 'Suku Baduy di Banten adalah salah satu komunitas yang masih mempertahankan gaya hidup tradisional di era modern...', category: 'Budaya', author: 'Umar Dary', date: '2025-02-10', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600', tags: ['budaya', 'baduy'] },
  { id: '6', title: '5 Destinasi Wisata Bawah Laut Terbaik Indonesia 2026', slug: 'destinasi-bawah-laut-2026', excerpt: 'Indonesia memiliki kekayaan laut yang luar biasa. Berikut 5 destinasi bawah laut terbaik yang wajib dikunjungi...', category: 'Destinasi', author: 'Admin', date: '2026-01-05', image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600', tags: ['diving', 'bahari'] },
]

const categories = ['Semua', 'Informasi', 'Tips', 'Destinasi', 'Budaya', 'Adventure']

export default function Blog() {
  const [posts, setPosts] = useState(dummyPosts)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')

  const filtered = posts.filter(p => {
    const s = p.title.toLowerCase().includes(search.toLowerCase())
    const c = category === 'Semua' || p.category === category
    return s && c
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-teal-700 text-white pt-32 pb-16 text-center">
        <h1 className="text-4xl font-bold font-display mb-3">Blog & Artikel</h1>
        <p className="text-lg opacity-90">Tips wisata, destinasi pilihan, dan cerita perjalanan inspiratif</p>
        <div className="max-w-xl mx-auto mt-6 flex items-center gap-3 bg-white rounded-full px-5 py-3">
          <FiSearch className="text-gray-400" size={20}/>
          <input type="text" placeholder="Cari artikel..." value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 text-gray-700 outline-none"/>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={()=>setCategory(cat)} className={"whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors " + (category === cat ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 shadow-sm hover:bg-primary-50')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {filtered.length > 0 && (
          <div className="mb-10">
            <Link to={"/blog/" + filtered[0].slug} className="group grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="overflow-hidden h-64 md:h-auto">
                <img src={filtered[0].image} alt={filtered[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="badge bg-primary-100 text-primary-600 w-fit mb-3">{filtered[0].category}</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary-500 transition-colors leading-snug">{filtered[0].title}</h2>
                <p className="text-gray-500 leading-relaxed mb-4 line-clamp-3">{filtered[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiUser size={12}/> {filtered[0].author}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={12}/> {filtered[0].date}</span>
                  </div>
                  <span className="flex items-center gap-1 text-primary-500 text-sm font-semibold group-hover:gap-2 transition-all">Baca <FiArrowRight size={14}/></span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(1).map(post => (
            <Link key={post.id} to={"/blog/" + post.slug} className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
              <div className="overflow-hidden h-52">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <div className="p-5">
                <span className="badge bg-gray-100 text-gray-600 mb-3 w-fit">{post.category}</span>
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><FiUser size={12}/> {post.author}</span>
                  <span className="flex items-center gap-1"><FiCalendar size={12}/> {post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Artikel tidak ditemukan</h3>
            <p className="text-gray-500">Coba ubah kata pencarian atau kategori</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
