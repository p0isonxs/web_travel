import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Calendar, User, Tag, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

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

export default function BlogDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, language, localize } = useLanguage();

  useEffect(() => {
        fetchPost();
        window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
        setLoading(true);
        try {
                // Try by slug first, then by ID
          let q = query(collection(db, 'blog'), where('slug', '==', slug), limit(1));
                let snap = await getDocs(q);
                if (snap.empty) {
                          q = query(collection(db, 'blog'), where('__name__', '==', slug));
                          snap = await getDocs(q);
                }
                if (!snap.empty) {
                          const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
                          setPost(data);
                          // Fetch related
                  if (data.category) {
                              const relSnap = await getDocs(collection(db, 'blog'));
                              setRelated(
                                relSnap.docs
                                  .map(d => ({ id: d.id, ...d.data() }))
                                  .filter(p => p.published === true && p.category === data.category && p.id !== data.id)
                                  .sort((a, b) => {
                                    const aTime = a.createdAt?.seconds || 0;
                                    const bTime = b.createdAt?.seconds || 0;
                                    return bTime - aTime;
                                  })
                                  .slice(0, 3)
                              );
                  }
                }
        } catch (e) {
                console.error(e);
        }
        setLoading(false);
  };

  const formatDate = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const shareUrl = window.location.href;

  if (loading) {
        return (
                <div className="min-h-screen flex items-center justify-center pt-16">
                        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              );
  }
  
    if (!post) {
          return (
                  <div className="min-h-screen flex flex-col items-center justify-center pt-16 text-gray-500">
                          <p className="text-2xl mb-4">{t('blogDetail.notFound')}</p>
                          <Link to="/blog" className="text-emerald-600 hover:underline">{t('blogDetail.backToBlog')}</Link>
                  </div>
                );
    }

    const title = localize(post.title);
    const excerpt = localize(post.excerpt);
    const content = localize(post.content);
  
    return (
          <>
                <Seo
                  title={`${title} - Liburan Terus`}
                  description={excerpt || title}
                  image={post.coverImage}
                  type="article"
                />
                <Helmet>
                        <script type="application/ld+json">{JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "BlogPosting",
                      "headline": title,
                      "description": excerpt,
                      "image": post.coverImage,
                      "author": { "@type": "Person", "name": post.author || "Liburan Terus" },
                      "publisher": { "@type": "Organization", "name": "Liburan Terus" },
                      "datePublished": post.createdAt?.toDate?.()?.toISOString(),
          })}</script>
                </Helmet>
          
                <div className="min-h-screen bg-gray-50 pt-16">
                  {/* Cover */}
                  {post.coverImage && (
                      <div className="w-full h-72 md:h-96 overflow-hidden">
                                  <img src={post.coverImage} alt={title} className="w-full h-full object-cover" />
                      </div>
                        )}
                
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                          {/* Back */}
                                  <Link to="/blog" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
                                              <ArrowLeft className="w-4 h-4" /> {t('blogDetail.backToBlog')}
                                  </Link>
                        
                          {/* Article */}
                                  <article className="bg-white rounded-3xl shadow-sm overflow-hidden">
                                              <div className="p-8 md:p-12">
                                                {post.category && post.category.toLowerCase() !== 'tips wisata' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full mb-4 capitalize">
                                              <Tag className="w-4 h-4" />{getCategoryLabel(post.category, t)}
                            </span>
                                                            )}
                                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h1>
                                              
                                                            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-8 pb-8 border-b border-gray-100">
                                                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.createdAt)}</span>
                                                              {post.author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>}
                                                              {post.readTime && <span>{post.readTime} {t('blogDetail.readTime')}</span>}
                                                            </div>
                                              
                                                {/* Content */}
                                                            <div
                                                                              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-emerald-600 prose-img:rounded-2xl"
                                                                              dangerouslySetInnerHTML={{ __html: content || '<p>' + (excerpt || '') + '</p>' }}
                                                                            />
                                              
                                                {/* Share */}
                                                            <div className="mt-12 pt-8 border-t border-gray-100">
                                                                            <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                                                              <div className="flex items-start gap-3">
                                                                                                                <div className="rounded-full bg-white p-2 shadow-sm">
                                                                                                                                  <Share2 className="w-4 h-4 text-gray-600" />
                                                                                                                </div>
                                                                                                                <div>
                                                                                                                                  <p className="text-sm font-semibold text-gray-900">{t('blogDetail.shareTitle')}</p>
                                                                                                                                  <p className="text-sm text-gray-500">{t('blogDetail.shareDescription')}</p>
                                                                                                                </div>
                                                                                              </div>
                                                                                              <div className="flex items-center gap-2">
                                                                                                                <a
                                                                                                                                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                                                                                                  target="_blank"
                                                                                                                                  rel="noopener noreferrer"
                                                                                                                                  aria-label={t('blogDetail.shareFacebook')}
                                                                                                                                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                                                                                >
                                                                                                                                  <Facebook className="w-4 h-4" />
                                                                                                                </a>
                                                                                                                <a
                                                                                                                                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                                                                                                                                  target="_blank"
                                                                                                                                  rel="noopener noreferrer"
                                                                                                                                  aria-label={t('blogDetail.shareTwitter')}
                                                                                                                                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                                                                                                                >
                                                                                                                                  <Twitter className="w-4 h-4" />
                                                                                                                </a>
                                                                                              </div>
                                                                            </div>
                                                            </div>
                                              </div>
                                  </article>
                        
                          {/* Related */}
                          {related.length > 0 && (
                        <div className="mt-12">
                                      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('blogDetail.relatedArticles')}</h2>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {related.slice(0, 2).map(p => {
                                          const relatedTitle = localize(p.title);
                                          return (
                                            <Link key={p.id} to={`/blog/${p.slug || p.id}`} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all group flex gap-4 p-4">
                                              {p.coverImage && (
                                                                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                                                                                            <img src={p.coverImage} alt={relatedTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                                      <p className="text-xs text-gray-400 mb-1">{formatDate(p.createdAt)}</p>
                                                                                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">{relatedTitle}</h3>
                                                                </div>
                                            </Link>
                                          )})}
                                      </div>
                        </div>
                                  )}
                        </div>
                </div>
          </>
        );
}
