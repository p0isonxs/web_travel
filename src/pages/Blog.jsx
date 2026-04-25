import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getBlogPosts } from '../lib/database';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { getBlogImageAlt } from '../utils/imageAlt';
import { optimizeImageUrl } from '../utils/cloudinary';

import { SITE_URL, SITE_NAME } from '../lib/siteConfig';

function getCategoryLabel(category, t) {
  switch ((category || '').toLowerCase()) {
    case 'tips wisata':
      return t('blog.tips');
    case 'destinasi':
      return t('blog.destination');
    case 'kuliner':
      return t('blog.culinary');
    case 'open trip':
      return t('blog.openTrip');
    case 'private trip':
      return t('blog.privateTrip');
    case 'lainnya':
      return t('common.more');
    default:
      return category;
  }
}

export default function Blog() {
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('semua');
    const { t, language, localize } = useLanguage();

  const categories = [
    { value: 'semua', label: t('blog.all') },
    { value: 'tips wisata', label: t('blog.tips') },
    { value: 'destinasi', label: t('blog.destination') },
    { value: 'kuliner', label: t('blog.culinary') },
    { value: 'open trip', label: t('blog.openTrip') },
    { value: 'private trip', label: t('blog.privateTrip') },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogPosts({ publishedOnly: true });
        setAllPosts(data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeCategory]);

  const posts = useMemo(() =>
    allPosts
      .filter(post => activeCategory === 'semua' || post.category === activeCategory)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [allPosts, activeCategory]
  );

  const filtered = posts.filter(p =>
        localize(p.title)?.toLowerCase().includes(search.toLowerCase()) ||
        localize(p.excerpt)?.toLowerCase().includes(search.toLowerCase())
                                  );

  const formatDate = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const blogListSchema = posts.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: language === 'en' ? `${SITE_NAME} Travel Blog` : `Blog Wisata ${SITE_NAME}`,
    description: t('blog.seoDescription'),
    url: `${SITE_URL}/blog`,
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: localize(post.title),
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
      image: post.coverImage || undefined,
      author: { '@type': 'Person', name: post.author || SITE_NAME },
    })),
  } : null

  return (
        <>
              <Seo
                title={t('blog.seoTitle')}
                description={t('blog.seoDescription')}
                image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop&q=80"
              />
              {blogListSchema && (
                <Helmet>
                  <script type="application/ld+json">{JSON.stringify(blogListSchema)}</script>
                </Helmet>
              )}
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-600 py-24 mt-16">
                      <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-5xl font-bold text-white mb-4">{t('blog.heroTitle')}</h1>
                                <p className="text-emerald-100 text-xl mb-8">{t('blog.heroDescription')}</p>
                        {/* Search */}
                                <div className="max-w-2xl mx-auto">
                                            <div className="relative bg-white rounded-2xl shadow-xl p-2 flex gap-2">
                                                          <div className="flex-1 relative">
                                                                          <label htmlFor="blog-search" className="sr-only">{t('blog.searchPlaceholder')}</label>
                                                                          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                                                          <input
                                                                                              id="blog-search"
                                                                                              type="text"
                                                                                              value={search}
                                                                                              onChange={e => setSearch(e.target.value)}
                                                                                              placeholder={t('blog.searchPlaceholder')}
                                                                                              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-700 focus:outline-none text-sm"
                                                                                            />
                                                          </div>
                                                          <button
                                                            type="button"
                                                            onClick={() => document.getElementById('blog-search').focus()}
                                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                                                          >
                                                                          {t('blog.searchButton')}
                                                          </button>
                                            </div>
                                </div>
                      </div>
              </div>
        
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Categories */}
                      <div className="flex flex-wrap gap-3 justify-center mb-10">
                        {categories.map(cat => (
                      <button
                                      key={cat.value} onClick={() => setActiveCategory(cat.value)}
                                      className={`px-5 py-2 rounded-full font-medium capitalize transition-all ${
                                                        activeCategory === cat.value ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                                      }`}
                                    >
                        {cat.label}
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
                                <p className="text-xl">{t('blog.empty')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filtered.map((post, i) => {
                        const title = localize(post.title);
                        const excerpt = localize(post.excerpt);
                        return (
                                    <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all group">
                                                    <div className="relative h-48 overflow-hidden">
                                                                      <img
                                                                                            src={optimizeImageUrl(post.coverImage, { width: 800, height: 480 }) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'}
                                                                                            alt={getBlogImageAlt(post, language) || title}
                                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                                            loading={i === 0 ? 'eager' : 'lazy'}
                                                                                            fetchpriority={i === 0 ? 'high' : undefined}
                                                                                            decoding="async"
                                                                                          />
                                                      {post.category && (
                                                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                                                            {getCategoryLabel(post.category, t)}
                                                          </span>
                                                                      )}
                                                    </div>
                                                    <div className="p-5">
                                                                      <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
                                                                                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.createdAt)}</span>
                                                                        {post.author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>}
                                                                      </div>
                                                                      <h2 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{title}</h2>
                                                                      <p className="text-gray-500 text-sm line-clamp-3 mb-4">{excerpt}</p>
                                                                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                                                                          {t('blog.readMore')} <ArrowRight className="w-4 h-4" />
                                                                      </span>
                                                    </div>
                                    </Link>
                                  )})}
                    </div>
                      )}
              </div>
        </>
      );
}
