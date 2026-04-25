import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { getBlogBySlug, getBlogPostsByCategory } from '../lib/database';
import { SITE_URL, SITE_NAME } from '../lib/siteConfig';
import { Calendar, User, Tag, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';
import { getBlogImageAlt } from '../utils/imageAlt';
import { optimizeImageUrl } from '../utils/cloudinary';

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
    const location = useLocation();
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
                const data = await getBlogBySlug(slug);
                if (data) {
                          setPost(data);
                          if (data.category) {
                              const relatedPosts = await getBlogPostsByCategory(data.category, data.id);
                              setRelated(relatedPosts.slice(0, 3));
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
    const publishedDate = post.createdAt ? new Date(post.createdAt).toISOString() : undefined;
    const modifiedDate = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedDate;
    const articleUrl = `${SITE_URL}${location.pathname}`;
    const articleImage = optimizeImageUrl(post.coverImage, { width: 1200, height: 630 }) || post.coverImage;
  
    return (
          <>
                <Seo
                  title={`${title} - ${SITE_NAME}`}
                  description={excerpt || title}
                  image={articleImage}
                  type="article"
                />
                <Helmet>
                        <script type="application/ld+json">{JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "BlogPosting",
                      "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": articleUrl,
                      },
                      "url": articleUrl,
                      "headline": title,
                      "description": excerpt,
                      "image": articleImage ? [articleImage] : undefined,
                      "author": { "@type": "Person", "name": post.author || SITE_NAME },
                      "publisher": {
                        "@type": "Organization",
                        "name": SITE_NAME,
                        "url": SITE_URL,
                      },
                      "datePublished": publishedDate,
                      "dateModified": modifiedDate,
          })}</script>
                </Helmet>
          
                <div className="min-h-screen bg-gray-50 pt-16">
                  {/* Cover */}
                  {post.coverImage && (
                      <div className="w-full h-72 md:h-96 overflow-hidden">
                                  <img src={optimizeImageUrl(post.coverImage, { width: 1400, height: 720 })} alt={getBlogImageAlt(post, language) || title} className="w-full h-full object-cover" fetchpriority="high" decoding="async" />
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
                                                                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '<p>' + (excerpt || '') + '</p>') }}
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
                                                                                            <img src={optimizeImageUrl(p.coverImage, { width: 320, height: 320 })} alt={getBlogImageAlt(p, language) || relatedTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" decoding="async" />
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
