import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X, ZoomIn } from 'lucide-react';
import Seo from '../components/Seo';
import { useLanguage } from '../contexts/LanguageContext';

export default function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('semua');
    const [lightbox, setLightbox] = useState(null);
    const { t, language } = useLanguage();

  const categories = [
    { value: 'semua', label: t('gallery.all') },
    { value: 'open trip', label: t('gallery.openTrip') },
    { value: 'private trip', label: t('gallery.privateTrip') },
    { value: 'destinasi', label: t('gallery.destination') },
    { value: 'kuliner', label: t('gallery.culinary') },
  ];

  useEffect(() => {
        fetchGallery();
  }, [activeCategory]);

  const fetchGallery = async () => {
        setLoading(true);
        try {
                let q;
                if (activeCategory === 'semua') {
                          q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
                } else {
                          q = query(collection(db, 'gallery'), where('category', '==', activeCategory), orderBy('createdAt', 'desc'));
                }
                const snap = await getDocs(q);
                setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
                setPhotos([]);
        }
        setLoading(false);
  };

  const openLightbox = (photo) => {
        setLightbox(photo);
        document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
        setLightbox(null);
        document.body.style.overflow = '';
  };

  const navLightbox = (dir) => {
        const idx = photos.findIndex(p => p.id === lightbox.id);
        const next = (idx + dir + photos.length) % photos.length;
        setLightbox(photos[next]);
  };

  return (
        <>
              <Seo
                title={t('gallery.seoTitle')}
                description={t('gallery.seoDescription')}
              />
        
          {/* Hero */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-20 mt-16">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('gallery.heroTitle')}</h1>
                                <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                                            {t('gallery.heroDescription')}
                                </p>
                      </div>
              </div>
        
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Category Filter */}
                      <div className="flex flex-wrap gap-3 justify-center mb-10">
                        {categories.map(cat => (
                      <button
                                      key={cat.value}
                                      onClick={() => setActiveCategory(cat.value)}
                                      className={`px-5 py-2 rounded-full font-medium capitalize transition-all ${
                                                        activeCategory === cat.value
                                                          ? 'bg-emerald-600 text-white shadow-lg scale-105'
                                                          : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                                      }`}
                                    >
                        {cat.label}
                      </button>
                    ))}
                      </div>
              
                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[...Array(12)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                                  ))}
                    </div>
                  ) : photos.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                                <p className="text-xl">{t('gallery.empty')}</p>
                    </div>
                  ) : (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                      {photos.map(photo => (
                                    <div
                                                      key={photo.id}
                                                      className="break-inside-avoid group relative cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                                                      onClick={() => openLightbox(photo)}
                                                    >
                                                    <img
                                                                        src={photo.imageUrl}
                                                                        alt={photo.caption || t('gallery.imageAlt')}
                                                                        className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        loading="lazy"
                                                                      />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                      {photo.caption && (
                                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                                                                                            <p className="text-white text-sm font-medium">{photo.caption}</p>
                                                                        </div>
                                                    )}
                                    </div>
                                  ))}
                    </div>
                      )}
              </div>
        
          {/* Lightbox */}
          {lightbox && (
                  <div
                              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                              onClick={closeLightbox}
                            >
                            <button
                                          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                                          onClick={closeLightbox}
                                        >
                                        <X className="w-8 h-8" />
                            </button>
                  
                            <button
                                          className="absolute left-4 text-white hover:text-gray-300 z-10 text-4xl font-bold"
                                          onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
                                        >
                                        &#8249;
                            </button>
                  
                            <div onClick={e => e.stopPropagation()} className="max-w-4xl max-h-[90vh] relative">
                                        <img
                                                        src={lightbox.imageUrl}
                                                        alt={lightbox.caption || ''}
                                                        className="max-h-[80vh] max-w-full object-contain rounded-lg"
                                                      />
                              {lightbox.caption && (
                                            <p className="text-white text-center mt-3 text-lg">{lightbox.caption}</p>
                                        )}
                            </div>
                  
                            <button
                                          className="absolute right-4 text-white hover:text-gray-300 z-10 text-4xl font-bold"
                                          onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
                                        >
                                        &#8250;
                            </button>
                  </div>
              )}
        </>
      );
}
