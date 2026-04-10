import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, User, Tag, ArrowRight, Search } from 'lucide-react';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('semua');

  const categories = ['semua', 'tips wisata', 'destinasi', 'kuliner', 'open trip', 'private trip'];

  useEffect(() => {
        fetchPosts();
        window.scrollTo(0, 0);
  }, [activeCategory]);

  const fetchPosts = async () => {
        setLoading(true);
        try {
                let q;
                if (activeCategory === 'semua') {
                          q = query(collection(db, 'blog'), where('published', '==', true), orderBy('createdAt', 'desc'));
                } else {
                          q = query(collection(db, 'blog'), where('published', '==', true), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
                }
                const snap = await getDocs(q);
                setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
                setPosts([]);
        }
        setLoading(false);
  };

  const filtered = posts.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase())
                                  );

  const formatDate = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
        <>
              <Helmet>
                      <title>Blog & Artikel Wisata - Liburan Terus</title>
                      <meta name="description" content="Tips wisata, destinasi terbaik, dan panduan perjalanan terlengkap dari Liburan Terus. Temukan inspirasi liburan Anda di sini." />
              </Helmet>
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 mt-16">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-5xl font-bold text-white mb-4">Blog & Artikel</h1>
                                <p className="text-emerald-100 text-xl mb-8">Tips wisata, destinasi, dan inspirasi perjalanan untuk Anda</p>
                        {/* Search */}
                                <div className="relative max-w-lg mx-auto">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                                                            placeholder="Cari artikel..."
                                                            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-lg"
                                                          />
                                </div>
                      </div>
              </div>
        
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Categories */}
                      <div className="flex flex-wrap gap-3 justify-center mb-10">
                        {categories.map(cat => (
                      <button
                                      key={cat} onClick={() => setActiveCategory(cat)}
                                      className={`px-5 py-2 rounded-full font-medium capitalize transition-all ${
                                                        activeCategory === cat ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                                      }`}
                                    >
                        {cat}
                      </button>
                    ))}
                      </div>
              
                {/* Posts Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                                                    <div className="h-48 bg-gray-200" />
                                                    <div className="p-5 space-y-3">
                                                                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                                                                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                                                                      <div className="h-4 bg-gray-200 rounded" />
                                                                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                                                    </div>
                                    </div>
                                  ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                                <p className="text-xl">Belum ada artikel untuk saat ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filtered.map(post => (
                                    <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all group">
                                                    <div className="relative h-48 overflow-hidden">
                                                                      <img
                                                                                            src={post.coverImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'}
                                                                                            alt={post.title}
                                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                                          />
                                                      {post.category && (
                                                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                                                            {post.category}
                                                          </span>
                                                                      )}
                                                    </div>
                                                    <div className="p-5">
                                                                      <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
                                                                                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.createdAt)}</span>
                                                                        {post.author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>}
                                                                      </div>
                                                                      <h2 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{post.title}</h2>
                                                                      <p className="text-gray-500 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                                                                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                                                                          Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                                                                      </span>
                                                    </div>
                                    </Link>
                                  ))}
                    </div>
                      )}
              </div>
        </>
      );
}
