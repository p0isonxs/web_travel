import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getPackageById, getPackageBySlug, getOpenTripSlotUsage } from '../lib/database'
import { FaMapMarkerAlt, FaClock, FaUsers, FaStar, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaWhatsapp, FaCalendar } from 'react-icons/fa'
import { MapPinned } from 'lucide-react'
import Seo from '../components/Seo'
import { useLanguage } from '../contexts/LanguageContext'
import { useSettings } from '../contexts/SettingsContext'
import { getPackageImageAlt } from '../utils/imageAlt'
import { buildResponsiveImageProps, optimizeImageUrl } from '../utils/cloudinary'

import { SITE_URL } from '../lib/siteConfig'

function resolveMapSource(pkg, packageLocation, fallbackLocation) {
  const rawLink = typeof pkg.mapLink === 'string' ? pkg.mapLink.trim() : ''
  if (rawLink) {
    try {
      const url = new URL(rawLink)
      const queryParam = url.searchParams.get('q') || url.searchParams.get('query')
      if (queryParam) {
        return {
          embedQuery: queryParam,
          openUrl: rawLink,
        }
      }

      const coordsMatch = rawLink.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
      if (coordsMatch) {
        return {
          embedQuery: `${coordsMatch[1]},${coordsMatch[2]}`,
          openUrl: rawLink,
        }
      }

      const pathMatch = url.pathname.match(/\/place\/([^/]+)/)
      if (pathMatch) {
        return {
          embedQuery: decodeURIComponent(pathMatch[1]).replace(/\+/g, ' '),
          openUrl: rawLink,
        }
      }

      return {
        embedQuery: `${packageLocation || fallbackLocation}, Indonesia`,
        openUrl: rawLink,
      }
    } catch {
      return {
        embedQuery: rawLink,
        openUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawLink)}`,
      }
    }
  }

  const latitude = Number(pkg.mapLatitude)
  const longitude = Number(pkg.mapLongitude)
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return {
      embedQuery: `${latitude},${longitude}`,
      openUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`,
    }
  }

  return {
    embedQuery: `${packageLocation || fallbackLocation}, Indonesia`,
    openUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${packageLocation || fallbackLocation}, Indonesia`)}`,
  }
}

function FaqSection({ faqs, title, accent }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {faqs.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className={`font-medium text-sm text-gray-800 ${openIdx === i ? accent.text : ''}`}>{item.q}</span>
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${openIdx === i ? `bg-gradient-to-br ${accent.text.replace('text-', 'bg-').replace('-600', '-500')} bg-emerald-500` : 'bg-gray-200 text-gray-500'}`}>
                {openIdx === i ? '−' : '+'}
              </span>
            </button>
            {openIdx === i && (
              <div className="px-6 pb-5">
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const PackageDetail = () => {
    const { id, slug } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [pkg, setPkg] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('deskripsi')
    const [activeImage, setActiveImage] = useState(0)
    const [selectedDate, setSelectedDate] = useState('')
    const [participants, setParticipants] = useState(1)
    const [slotUsage, setSlotUsage] = useState({})
    const [slotUsageLoading, setSlotUsageLoading] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
    const scheduleScrollerRef = useRef(null)
    const scheduleDragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0, moved: false })
    const { t, language, localize } = useLanguage()
    const settings = useSettings()

    useEffect(() => {
          const handleResize = () => setIsMobile(window.innerWidth < 768)
          window.addEventListener('resize', handleResize)
          return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
          const fetchPackage = async () => {
                  // On a direct page load, the pre-render script may have embedded package
                  // data in the HTML so we can skip the Supabase round-trip entirely.
                  const prerendered = document.getElementById('__PKG_DATA__')
                  if (prerendered) {
                          try {
                                    const data = JSON.parse(prerendered.textContent)
                                    if (data && data.id) {
                                            setPkg(data)
                                            if (data.departureDates?.length > 0) {
                                                    setSelectedDate(data.departureDates[0])
                                            }
                                            setLoading(false)
                                            return
                                    }
                          } catch {}
                  }

                  try {
                            let data = null
                            if (slug) {
                                    const type = location.pathname.startsWith('/open-trip') ? 'open-trip' : 'private-trip'
                                    data = await getPackageBySlug(type, slug)
                            } else {
                                    data = await getPackageById(id)
                            }
                            setPkg(data)
                            if (data?.departureDates?.length > 0) {
                                    setSelectedDate(data.departureDates[0])
                            }
                  } catch (error) {
                            if (import.meta.env.DEV) console.error('Error fetching package:', error)
                  } finally {
                            setLoading(false)
                  }
          }
          fetchPackage()
    }, [id, slug, location.pathname])

    useEffect(() => {
          const pkgId = pkg?.id
          if (!pkgId || pkg?.type !== 'open-trip') return

          let cancelled = false
          const fetchSlotUsage = async () => {
                  setSlotUsageLoading(true)
                  try {
                            const usage = await getOpenTripSlotUsage(pkgId)
                            if (cancelled) return
                            setSlotUsage(usage)
                            if (pkg.departureDates?.length > 0) {
                                    const capacity = Number(pkg.maxParticipants) || 15
                                    const firstAvailableDate = pkg.departureDates.find((date) => Math.max(0, capacity - (usage[date] || 0)) > 0)
                                    setSelectedDate((current) => {
                                      if (!current) return firstAvailableDate || pkg.departureDates[0]
                                      const currentRemaining = Math.max(0, capacity - (usage[current] || 0))
                                      return currentRemaining > 0 ? current : (firstAvailableDate || current)
                                    })
                            }
                  } catch (error) {
                            if (import.meta.env.DEV) console.error('Error fetching slot usage:', error)
                  } finally {
                            if (!cancelled) setSlotUsageLoading(false)
                  }
          }

          // Defer until browser is idle so slot fetch doesn't compete with LCP render
          let timerId
          if (typeof requestIdleCallback !== 'undefined') {
                  timerId = requestIdleCallback(fetchSlotUsage, { timeout: 3000 })
          } else {
                  timerId = setTimeout(fetchSlotUsage, 300)
          }

          return () => {
                  cancelled = true
                  if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(timerId)
                  else clearTimeout(timerId)
          }
    }, [pkg?.id, pkg?.type, pkg?.departureDates, pkg?.maxParticipants])

    const formatPrice = (price) => {
          return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
    }

    const isGeneratedScheduleLabel = (value) => /^Kegiatan\s+\d+$/i.test((value || '').trim())
    const formatDepartureDate = (value) => {
          if (!value) return '-'
          const parsed = new Date(`${value}T00:00:00`)
          if (Number.isNaN(parsed.getTime())) return value
          return parsed.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    const formatDepartureDay = (value) => {
          if (!value) return ''
          const parsed = new Date(`${value}T00:00:00`)
          if (Number.isNaN(parsed.getTime())) return value
          return parsed.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { weekday: 'long' })
    }

    const handleBooking = () => {
          if (isOpenTrip && slotUsageLoading) {
                  return
          }
          if (isOpenTrip && !selectedDate) {
                  alert(t('packageDetail.chooseDateAlert'))
                  return
          }
          if (isOpenTrip && selectedRemainingSlots < participants) {
                  alert(selectedRemainingSlots > 0 ? t('packageDetail.slotsLeftAlert', { count: selectedRemainingSlots }) : t('packageDetail.scheduleFullAlert'))
                  return
          }
          const params = new URLSearchParams({ participants: String(participants) })
          if (selectedDate) {
                  params.set('date', selectedDate)
          }
          navigate(`/booking/${pkg.id}?${params.toString()}`)
    }

    const handleScheduleMouseDown = (event) => {
          const scroller = scheduleScrollerRef.current
          if (!scroller) return
          scheduleDragRef.current = {
            isDragging: true,
            startX: event.pageX,
            scrollLeft: scroller.scrollLeft,
            moved: false,
          }
    }

    const handleScheduleMouseMove = (event) => {
          const scroller = scheduleScrollerRef.current
          const dragState = scheduleDragRef.current
          if (!scroller || !dragState.isDragging) return

          const delta = event.pageX - dragState.startX
          if (Math.abs(delta) > 4) {
            dragState.moved = true
          }

          scroller.scrollLeft = dragState.scrollLeft - delta
    }

    const stopScheduleDragging = () => {
          scheduleDragRef.current.isDragging = false
    }

    if (loading) {
          return (
                  <>
                          <div className="min-h-screen flex items-center justify-center pt-20">
                                    <div className="text-center">
                                                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-gray-500">{t('packageDetail.loading')}</p>
                                    </div>
                          </div>
                  </>
                )
    }
  
    if (!pkg) {
          return (
                  <>
                          <div className="min-h-screen flex items-center justify-center pt-20">
                                    <div className="text-center">
                                                <div className="text-6xl mb-4">😕</div>
                                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('packageDetail.packageNotFound')}</h2>
                                                <Link to="/open-trip" className="text-emerald-600 hover:underline">{t('packageDetail.backToOpenTrip')}</Link>
                                    </div>
                          </div>
                  </>
                )
    }
  
    const images = pkg.images?.length > 0 ? pkg.images : [pkg.image || 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800']
        const isOpenTrip = pkg.type === 'open-trip'
            const accent = isOpenTrip
              ? { icon: 'text-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600', ring: 'focus:ring-emerald-500', tabActive: 'text-emerald-600 border-b-2 border-emerald-500', bg50: 'bg-emerald-50', bg100: 'bg-emerald-100', bg200: 'bg-emerald-200' }
              : { icon: 'text-purple-500',  border: 'border-purple-500',  text: 'text-purple-600',  ring: 'focus:ring-purple-500',  tabActive: 'text-purple-600 border-b-2 border-purple-500',  bg50: 'bg-purple-50',  bg100: 'bg-purple-100',  bg200: 'bg-purple-200'  }
            const capacityPerDate = Number(pkg.maxParticipants) || 15
            const selectedRemainingSlots = selectedDate ? Math.max(0, capacityPerDate - (slotUsage[selectedDate] || 0)) : capacityPerDate
            const packageTitle = localize(pkg.title)
            const packageLocation = localize(pkg.location)
            const packageDuration = localize(pkg.duration)
            const packageDescription = localize(pkg.description)
            const packageItinerary = localize(pkg.itinerary) || []
            const packageIncludes = localize(pkg.includes) || []
            const packageExcludes = localize(pkg.excludes) || []
            const packageWhatsappMessage = encodeURIComponent(
              t('packageDetail.whatsappTemplate', { packageTitle })
            )
            const mapSource = resolveMapSource(pkg, packageLocation, t('packageDetail.locationFallback'))
            const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapSource.embedQuery)}&z=12&output=embed`
            const mapOpenUrl = mapSource.openUrl
            const bookingReasons = [
              isOpenTrip ? t('packageDetail.whyBookReason1OpenTrip') : t('packageDetail.whyBookReason1PrivateTrip'),
              t('packageDetail.whyBookReason2'),
              t('packageDetail.whyBookReason3'),
            ]
            const deferredBlockStyle = {
              contentVisibility: 'auto',
              containIntrinsicSize: '460px',
            }
            const heroImage = buildResponsiveImageProps(images[activeImage], {
              widths: [480, 750, 960, 1280],
              quality: 'auto',
              format: 'auto',
              sizes: '(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 66vw',
            })
            const scheduleReady = !isOpenTrip || !slotUsageLoading
            const selectedSlotsAvailable = !isOpenTrip || selectedRemainingSlots > 0
            const canonicalUrl = `${SITE_URL}/${pkg.type}/${pkg.slug?.id || ''}`
            const metaTitleFallback = `${packageTitle} | ${isOpenTrip ? 'Open Trip' : 'Private Trip'}${packageLocation ? ` di ${packageLocation}` : ''} - ${settings.siteName}`
            const metaDescFallback = packageDescription
              ? packageDescription.replace(/<[^>]*>/g, '').substring(0, 155).replace(/\s\S*$/, '') + '...'
              : [
                  `${isOpenTrip ? 'Open Trip' : 'Private Trip'} ${packageTitle}`,
                  packageLocation && `di ${packageLocation}`,
                  packageDuration && `durasi ${packageDuration}`,
                  pkg.price && `mulai Rp ${new Intl.NumberFormat('id-ID').format(pkg.price)}/orang`,
                ].filter(Boolean).join(' ')
            const faqSchema = Array.isArray(pkg.faq) && pkg.faq.length > 0
              ? {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: pkg.faq.map(item => ({
                    '@type': 'Question',
                    name: item.q,
                    acceptedAnswer: { '@type': 'Answer', text: item.a },
                  })),
                }
              : null

                return (
                      <>
                            <Seo
                              title={pkg.metaTitle || metaTitleFallback}
                              description={pkg.metaDescription || metaDescFallback}
                              image={optimizeImageUrl(images[0], { width: 1200, height: 630 })}
                            />
                            <Helmet>
                                    <script type="application/ld+json">{JSON.stringify({
                                  '@context': 'https://schema.org',
                                  '@type': 'TouristTrip',
                                  name: packageTitle,
                                  description: packageDescription,
                                  url: canonicalUrl,
                                  touristType: isOpenTrip ? 'Open Trip' : 'Private Trip',
                                  image: images,
                                  provider: { '@type': 'TravelAgency', name: settings.siteName, url: SITE_URL },
                                  ...(packageLocation && { location: { '@type': 'Place', name: packageLocation, address: { '@type': 'PostalAddress', addressCountry: 'ID' } } }),
                                  offers: {
                                    '@type': 'Offer',
                                    price: pkg.price,
                                    priceCurrency: 'IDR',
                                    availability: 'https://schema.org/InStock',
                                    priceSpecification: {
                                      '@type': 'UnitPriceSpecification',
                                      price: pkg.price,
                                      priceCurrency: 'IDR',
                                      unitText: 'per orang',
                                    },
                                  },
                      })}</script>
                                    <script type="application/ld+json">{JSON.stringify({
                                  '@context': 'https://schema.org',
                                  '@type': 'BreadcrumbList',
                                  itemListElement: [
                                    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                                    { '@type': 'ListItem', position: 2, name: isOpenTrip ? 'Open Trip' : 'Private Trip', item: `${SITE_URL}/${isOpenTrip ? 'open-trip' : 'private-trip'}` },
                                    { '@type': 'ListItem', position: 3, name: packageTitle, item: canonicalUrl },
                                  ],
                      })}</script>
                                    {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
                            </Helmet>
                      
                            <div className="pt-20 min-h-screen bg-gray-50">
                              {/* Breadcrumb */}
                                    <div className="bg-white border-b">
                                              <div className="max-w-7xl mx-auto px-4 py-3">
                                                          <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                        <Link to="/" className="hover:text-emerald-600">{t('packageDetail.home')}</Link>
                                                                        <span>/</span>
                                                                        <Link to={isOpenTrip ? '/open-trip' : '/private-trip'} className="hover:text-emerald-600">
                                                                          {t(isOpenTrip ? 'packageDetail.openTrip' : 'packageDetail.privateTrip')}
                                                                        </Link>
                                                                        <span>/</span>
                                                                        <span className="text-gray-800 truncate max-w-xs">{packageTitle}</span>
                                                          </div>
                                              </div>
                                    </div>
                            
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                {/* Left - Main Content */}
                                                          <div className="lg:col-span-2 space-y-6">
                                                            {/* Image Gallery */}
                                                                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                                                                        <div className="relative aspect-[16/9] overflow-hidden">
                                                                                                          <img
                                                                                                                                src={heroImage.src || optimizeImageUrl(images[activeImage], { width: 1400, height: 790 }) || images[activeImage]}
                                                                                                                                srcSet={heroImage.srcSet}
                                                                                                                                alt={getPackageImageAlt(pkg, language, activeImage)}
                                                                                                                                fetchpriority={activeImage === 0 ? 'high' : 'auto'}
                                                                                                                                loading={activeImage === 0 ? 'eager' : 'lazy'}
                                                                                                                                sizes={heroImage.sizes}
                                                                                                                                decoding="async"
                                                                                                                                className="w-full h-full object-cover"
                                                                                                                              />
                                                                                          {images.length > 1 && (
                                            <>
                                                                  <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                                                                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full md:hover:bg-black/70 transition-colors">
                                                                                          <FaChevronLeft />
                                                                  </button>
                                                                  <button onClick={() => setActiveImage(i => (i + 1) % images.length)}
                                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full md:hover:bg-black/70 transition-colors">
                                                                                          <FaChevronRight />
                                                                  </button>
                                            </>
                                          )}
                                                                                                          <div className={`absolute top-4 left-4 ${isOpenTrip ? 'bg-emerald-500' : 'bg-purple-600'} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                                                                                                            {t(isOpenTrip ? 'packageDetail.openTrip' : 'packageDetail.privateTrip')}
                                                                                                            </div>
                                                                                          </div>
                                                                          {images.length > 1 && (
                                          <div className="flex gap-2 p-3 overflow-x-auto">
                                            {images.map((img, i) => (
                                                                  <button key={i} onClick={() => setActiveImage(i)}
                                                                                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? `${accent.border}` : 'border-transparent'}`}>
                                                                                          <img src={optimizeImageUrl(img, { width: 160, height: 160 }) || img} alt={getPackageImageAlt(pkg, language, i)} className="w-full h-full object-cover" loading="lazy" sizes="64px" decoding="async" />
                                                                  </button>
                                                                ))}
                                          </div>
                                                                                        )}
                                                                        </div>
                                                          
                                                            {/* Title & Info */}
                                                                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                                                                                        <h1 className="text-2xl font-bold text-gray-800 mb-3">{packageTitle}</h1>
                                                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                                                                                                          <span className="flex items-center gap-1.5">
                                                                                                                              <FaMapMarkerAlt className={`${accent.icon}`} />
                                                                                                            {packageLocation || t('packageDetail.locationFallback')}
                                                                                                            </span>
                                                                                                          <span className="flex items-center gap-1.5">
                                                                                                                              <FaClock className={`${accent.icon}`} />
                                                                                                            {packageDuration || t('packageDetail.durationFallback')}
                                                                                                            </span>
                                                                                          {isOpenTrip && (
                                            <span className="flex items-center gap-1.5">
                                                                  <FaUsers className={`${accent.icon}`} />
                                                                  {t('packageDetail.maxParticipants')} {pkg.maxParticipants || 15} {t('packageDetail.participantUnit')}
                                            </span>
                                                                                                          )}
                                                                                          {pkg.rating && (
                                            <span className="flex items-center gap-1.5">
                                                                  <FaStar className="text-yellow-400" />
                                              {pkg.rating} ({pkg.reviewCount || 0} {t('packageDetail.reviews')})
                                            </span>
                                                                                                          )}
                                                                                          </div>
                                                                        </div>
                                                          
                                                            {/* Tabs */}
                                                                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={deferredBlockStyle}>
                                                                                        <div className="flex border-b">
                                                                                          {['deskripsi', 'jadwal', 'fasilitas'].map(tab => (
                                            <button key={tab} onClick={() => setActiveTab(tab)}
                                                                    className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? `${accent.text} border-b-2 ${accent.border}` : 'text-gray-500 hover:text-gray-700'}`}>
                                              {tab === 'deskripsi' ? t('packageDetail.descriptionTab') : tab === 'jadwal' ? t('packageDetail.itineraryTab') : t('packageDetail.facilitiesTab')}
                                            </button>
                                          ))}
                                                                                          </div>
                                                                        
                                                                                        <div className="p-6">
                                                                                          {activeTab === 'deskripsi' && (
                                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                                                                  <p>{packageDescription || t('packageDetail.descriptionFallback')}</p>
                                            </div>
                                                                                                          )}
                                                                                        
                                                                                          {activeTab === 'jadwal' && (
                                            <div className="space-y-5">
                                              {packageItinerary.length > 0 ? packageItinerary.map((item, i) => (
                                                                      <div key={i} className="relative flex gap-4 pl-2">
                                                                                                <div className="relative flex flex-col items-center shrink-0">
                                                                                                                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${isOpenTrip ? 'bg-emerald-500' : 'bg-purple-600'}`} />
                                                                                                  {i !== packageItinerary.length - 1 && (
                                                                                                    <div className="mt-2 w-px flex-1 bg-gradient-to-b from-gray-300 to-gray-100" />
                                                                                                  )}
                                                                                                </div>
                                                                                                <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50/80 px-5 py-4 shadow-sm">
                                                                                                                  {!isGeneratedScheduleLabel(item.time) && (
                                                                                                                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isOpenTrip ? 'text-emerald-600' : 'text-purple-600'}`}>
                                                                                                                      {item.time}
                                                                                                                    </p>
                                                                                                                  )}
                                                                                                                            <p className={`${isGeneratedScheduleLabel(item.time) ? '' : 'mt-2 '}text-sm leading-6 text-gray-700`}>{item.activity}</p>
                                                                                                  </div>
                                                                      </div>
                                                                    )) : (
                                                                      <p className="text-gray-500 text-sm">{t('packageDetail.itineraryFallback')}</p>
                                                                  )}
                                            </div>
                                                                                                          )}
                                                                                        
                                                                                          {activeTab === 'fasilitas' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.18)]">
                                                                                          <div className="mb-4 flex items-start gap-3">
                                                                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                                                                                              <FaCheck className="text-xs" />
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                              <h3 className="text-base font-semibold tracking-[0.01em] text-gray-900">{t('packageDetail.includedTitle')}</h3>
                                                                                                                              <p className="mt-1 text-sm leading-6 text-gray-500">{t('packageDetail.includedDescription')}</p>
                                                                                                            </div>
                                                                                          </div>
                                                                                          <ul className="space-y-3">
                                                                                            {packageIncludes.length > 0 ? packageIncludes.map((item, i) => (
                                                                          <li key={i} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3.5 text-sm leading-6 text-gray-700">
                                                                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 ring-1 ring-emerald-100">
                                                                                                          <FaCheck className="text-[9px]" />
                                                                                                        </span>
                                                                            <span>{item}</span>
                                                                            </li>
                                                                        )) : <li className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">{t('packageDetail.includedFallback')}</li>}
                                                                                            </ul>
                                                                  </div>
                                                                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.18)]">
                                                                                          <div className="mb-4 flex items-start gap-3">
                                                                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                                                                                                              <FaTimes className="text-xs" />
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                              <h3 className="text-base font-semibold tracking-[0.01em] text-gray-900">{t('packageDetail.excludedTitle')}</h3>
                                                                                                                              <p className="mt-1 text-sm leading-6 text-gray-500">{t('packageDetail.excludedDescription')}</p>
                                                                                                            </div>
                                                                                          </div>
                                                                                          <ul className="space-y-3">
                                                                                            {packageExcludes.length > 0 ? packageExcludes.map((item, i) => (
                                                                          <li key={i} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3.5 text-sm leading-6 text-gray-700">
                                                                                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-rose-500 ring-1 ring-rose-100">
                                                                                                          <FaTimes className="text-[9px]" />
                                                                                                        </span>
                                                                            <span>{item}</span>
                                                                            </li>
                                                                        )) : <li className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">{t('packageDetail.excludedFallback')}</li>}
                                                                                            </ul>
                                                                  </div>
                                            </div>
                                                                                                          )}
                                                                                          </div>
                                                                        </div>

                                                            {/* FAQ — pakai data dari admin jika ada, fallback ke translations */}
                                                                        <FaqSection
                                                                          faqs={Array.isArray(pkg.faq) && pkg.faq.length > 0
                                                                            ? pkg.faq
                                                                            : (isOpenTrip ? t('packageDetail.faqOpenTrip') : t('packageDetail.faqPrivateTrip'))}
                                                                          title={t('packageDetail.faqTitle')}
                                                                          accent={accent}
                                                                        />

                                                            {/* Location Map */}
                                                                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={deferredBlockStyle}>
                                                                                          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                                                                                                            <div>
                                                                                                                              <h2 className="text-lg font-bold text-gray-800">{t('packageDetail.locationMapTitle')}</h2>
                                                                                                                              <p className="mt-1 text-sm text-gray-500">{t('packageDetail.locationMapDescription')}</p>
                                                                                                            </div>
                                                                                                            <a
                                                                                                              href={mapOpenUrl}
                                                                                                              target="_blank"
                                                                                                              rel="noopener noreferrer"
                                                                                                              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${isOpenTrip ? 'border-emerald-200 text-emerald-700 md:hover:bg-emerald-50' : 'border-purple-200 text-purple-700 md:hover:bg-purple-50'}`}
                                                                                                            >
                                                                                                              {t('packageDetail.openMap')}
                                                                                                            </a>
                                                                                          </div>
                                                                                          <div className="relative aspect-[16/9] bg-gray-100">
                                                                                            {mapLoaded ? (
                                                                                              <iframe
                                                                                                title={`${t('packageDetail.locationMapTitle')} - ${packageTitle}`}
                                                                                                src={mapEmbedUrl}
                                                                                                loading="lazy"
                                                                                                importance={isMobile ? 'low' : 'auto'}
                                                                                                referrerPolicy="no-referrer-when-downgrade"
                                                                                                className="h-full w-full border-0"
                                                                                              />
                                                                                            ) : (
                                                                                              <button
                                                                                                type="button"
                                                                                                onClick={() => setMapLoaded(true)}
                                                                                                className="absolute inset-0 flex h-full w-full items-center justify-center bg-gray-100 text-left"
                                                                                              >
                                                                                                <div className="absolute inset-0">
                                                                                                  <img
                                                                                                    src={optimizeImageUrl(images[0], { width: 480, height: 270 }) || images[0]}
                                                                                                    alt=""
                                                                                                    className="h-full w-full object-cover opacity-20 blur-[2px]"
                                                                                                    loading="lazy"
                                                                                                    decoding="async"
                                                                                                  />
                                                                                                </div>
                                                                                                <div className="relative z-10 flex max-w-sm flex-col items-center rounded-2xl border border-white/80 bg-white/90 px-6 py-5 text-center shadow-lg backdrop-blur-sm">
                                                                                                  <MapPinned className={`h-8 w-8 ${isOpenTrip ? 'text-emerald-600' : 'text-purple-600'}`} />
                                                                                                  <p className="mt-3 text-sm font-semibold text-gray-900">{t('packageDetail.locationMapTitle')}</p>
                                                                                                  <p className="mt-1 text-xs text-gray-500">Klik untuk memuat peta interaktif</p>
                                                                                                </div>
                                                                                              </button>
                                                                                            )}
                                                                                          </div>
                                                                        </div>
                                                          </div>
                                              
                                                {/* Right - Booking Card */}
                                                          <div className="lg:col-span-1">
                                                                        <div className="space-y-4 sticky top-24">
                                                                          <div className={`rounded-3xl bg-gradient-to-br ${isOpenTrip ? 'from-emerald-600 via-teal-600 to-cyan-500' : 'from-violet-600 via-purple-600 to-fuchsia-500'} p-6 text-white shadow-lg`} style={deferredBlockStyle}>
                                                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                                                                              {isOpenTrip ? t('packageDetail.openTrip') : t('packageDetail.privateTrip')}
                                                                            </p>
                                                                            <h2 className="mt-2 text-2xl font-bold leading-tight">{packageTitle}</h2>
                                                                            <p className="mt-2 text-sm text-white/80">{packageLocation || t('packageDetail.locationFallback')}</p>
                                                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                                              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                                                                <p className="text-[11px] uppercase tracking-wide text-white/60">{t('packageDetail.durationFallback')}</p>
                                                                                <p className="mt-1 text-sm font-semibold">{packageDuration || '-'}</p>
                                                                              </div>
                                                                              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                                                                <p className="text-[11px] uppercase tracking-wide text-white/60">{t('packageDetail.total')}</p>
                                                                                <p className="mt-1 text-sm font-semibold">{formatPrice(pkg.price * participants)}</p>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                        <div className="bg-white rounded-2xl shadow-sm p-6" style={deferredBlockStyle}>
                                                                          {/* Price */}
                                                                                        <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                                                                                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                                                            <p className="text-sm text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</p>
                                                                                          )}
                                                                                          <div className="mt-1 flex items-end gap-2">
                                                                                            <p className={`text-3xl font-bold leading-none ${accent.text}`}>{formatPrice(pkg.price)}</p>
                                                                                            <span className="pb-0.5 text-sm text-gray-500">{t('packageDetail.perPax')}</span>
                                                                                          </div>
                                                                                        </div>
                                                                        
                                                                          {/* Select Date */}
                                                                                        <div className="mb-4">
                                                                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                              <FaCalendar className={`inline mr-1.5 ${accent.icon}`} />
                                                                                                                              {isOpenTrip ? t('packageDetail.selectOpenTripSchedule') : t('packageDetail.departureDate')}
                                                                                                            </label>
                                                                                                          {isOpenTrip ? (
                                                                                                            pkg.departureDates?.length > 0 ? (
                                                                                                              <div className="space-y-3">
                                                                                                                {slotUsageLoading && (
                                                                                                                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                                                                                                                    Memuat ketersediaan slot terbaru...
                                                                                                                  </div>
                                                                                                                )}
                                                                                                                <div
                                                                                                                  ref={scheduleScrollerRef}
                                                                                                                  onMouseDown={handleScheduleMouseDown}
                                                                                                                  onMouseMove={handleScheduleMouseMove}
                                                                                                                  onMouseUp={stopScheduleDragging}
                                                                                                                  onMouseLeave={stopScheduleDragging}
                                                                                                                  className="flex gap-2 overflow-x-auto pb-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                                                                                                                >
                                                                                                                  {pkg.departureDates.map((date) => {
                                                                                                                    const isSelected = selectedDate === date
                                                                                                                    const booked = slotUsage[date] || 0
                                                                                                                    const remaining = Math.max(0, capacityPerDate - booked)
                                                                                                                    const isFull = remaining <= 0
                                                                                                                    return (
                                                                                                                      <button
                                                                                                                        key={date}
                                                                                                                        type="button"
                                                                                                                        onClick={() => {
                                                                                                                          if (scheduleDragRef.current.moved || slotUsageLoading || isFull) return
                                                                                                                          setSelectedDate(date)
                                                                                                                        }}
                                                                                                                        disabled={slotUsageLoading || isFull}
                                                                                                                        className={`min-w-[168px] shrink-0 rounded-2xl border px-4 py-3 text-left transition-all ${
                                                                                                                          slotUsageLoading
                                                                                                                            ? 'border-gray-200 bg-white'
                                                                                                                            : isFull
                                                                                                                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-70'
                                                                                                                            : isSelected
                                                                                                                            ? isOpenTrip
                                                                                                                              ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100'
                                                                                                                              : 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-100'
                                                                                                                            : 'border-gray-200 bg-white md:hover:border-gray-300 md:hover:bg-gray-50'
                                                                                                                        }`}
                                                                                                                      >
                                                                                                                        <div className="flex items-start justify-between gap-3">
                                                                                                                          <div>
                                                                                                                            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isOpenTrip ? 'text-emerald-600' : 'text-purple-600'}`}>
                                                                                                                              {formatDepartureDay(date)}
                                                                                                                            </p>
                                                                                                                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                                                                                                              {formatDepartureDate(date)}
                                                                                                                            </p>
                                                                                                                            <p className={`mt-2 text-xs font-medium ${slotUsageLoading ? 'text-gray-500' : isFull ? 'text-red-500' : isOpenTrip ? 'text-emerald-600' : 'text-purple-600'}`}>
                                                                                                                              {slotUsageLoading ? 'Memuat slot...' : isFull ? t('packageDetail.scheduleFull') : `${remaining} ${t('packageDetail.slotsLeft')}`}
                                                                                                                            </p>
                                                                                                                          </div>
                                                                                                                          <span className={`mt-0.5 h-5 w-5 rounded-full border-2 transition-colors ${
                                                                                                                            isFull
                                                                                                                              ? 'border-gray-300 bg-gray-200'
                                                                                                                              : isSelected
                                                                                                                              ? isOpenTrip
                                                                                                                                ? 'border-emerald-500 bg-emerald-500'
                                                                                                                                : 'border-purple-500 bg-purple-500'
                                                                                                                              : 'border-gray-300 bg-white'
                                                                                                                          }`} />
                                                                                                                        </div>
                                                                                                                      </button>
                                                                                                                    )
                                                                                                                  })}
                                                                                                                </div>
                                                                                                                <div className={`rounded-2xl px-4 py-3 text-sm ${isOpenTrip ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'}`}>
                                                                                                                  {t('packageDetail.scheduleSwipeHint')}
                                                                                                                </div>
                                                                                                              </div>
                                                                                                            ) : (
                                                                                                              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                                                                                                                {t('packageDetail.scheduleUnavailable')}
                                                                                                              </div>
                                                                                                            )
                                                                                                          ) : (
                                                                                                            <input
                                                                                                              type="date"
                                                                                                              value={selectedDate}
                                                                                                              onChange={e => setSelectedDate(e.target.value)}
                                                                                                              min={new Date().toISOString().split('T')[0]}
                                                                                                              className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
                                                                                                            />
                                                                                                          )}
                                                                                          </div>
                                                                        
                                                                          {/* Participants */}
                                                                                        <div className="mb-6">
                                                                                                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                                                                                              <FaUsers className={`inline mr-1.5 ${accent.icon}`} />
                                                                                                                              {t('packageDetail.participantsLabel')}
                                                                                                            </label>
                                                                                                          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                                                                                                                              <button onClick={() => setParticipants(p => Math.max(1, p - 1))}
                                                                                                                                                      className={`w-7 h-7 ${accent.bg100} ${accent.text} rounded-full flex items-center justify-center font-bold text-lg hover:${accent.bg200} transition-colors`}>
                                                                                                                                                    -
                                                                                                                                </button>
                                                                                                                              <span className="flex-1 text-center font-semibold text-gray-800">{participants}</span>
                                                                                                                              <button onClick={() => setParticipants(p => Math.min(isOpenTrip ? Math.max(1, selectedRemainingSlots) : (pkg.maxParticipants || 99), p + 1))}
                                                                                                                                                      className={`w-7 h-7 ${accent.bg100} ${accent.text} rounded-full flex items-center justify-center font-bold text-lg hover:${accent.bg200} transition-colors`}>
                                                                                                                                                    +
                                                                                                                                </button>
                                                                                                            </div>
                                                                                                          {isOpenTrip && selectedDate && scheduleReady && (
                                                                                                            <p className={`mt-2 text-xs ${selectedRemainingSlots > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                                                                                                              {selectedRemainingSlots > 0 ? t('packageDetail.slotsLeftForDate', { count: selectedRemainingSlots }) : t('packageDetail.dateFullChooseOther')}
                                                                                                            </p>
                                                                                                          )}
                                                                                          </div>
                                                                        
                                                                          {/* Total */}
                                                                                        <div className={`${accent.bg50} rounded-xl p-4 mb-5`}>
                                                                                                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                                                                              <span>{formatPrice(pkg.price)} x {participants} {t('packageDetail.personUnit')}</span>
                                                                                                            </div>
                                                                                                          <div className="flex justify-between font-bold text-gray-800">
                                                                                                                              <span>{t('packageDetail.total')}</span>
                                                                                                                              <span className={`${accent.text}`}>{formatPrice(pkg.price * participants)}</span>
                                                                                                            </div>
                                                                                          </div>
                                                                        
                                                                          {/* Book Button */}
                                                                                        <button onClick={handleBooking}
                                                                                                            disabled={!scheduleReady || !selectedSlotsAvailable}
                                                                                                            className={`w-full bg-gradient-to-r ${isOpenTrip ? 'from-emerald-500 to-teal-600' : 'from-violet-500 to-purple-600'} text-white py-4 rounded-xl font-bold md:hover:shadow-lg md:hover:scale-[1.02] transition-all duration-200 mb-3`}>
                                                                                                          {!scheduleReady ? 'Memuat jadwal...' : isOpenTrip && selectedRemainingSlots <= 0 ? t('packageDetail.scheduleFullButton') : t('packageDetail.bookNow')}
                                                                                          </button>
                                                                        
                                                                          {/* WhatsApp */}
                                                                                        <a href={`https://wa.me/${settings.phone}?text=${packageWhatsappMessage}`}
                                                                                                            target="_blank" rel="noopener noreferrer"
                                                                                                            className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 border border-green-200 py-3 rounded-xl font-semibold md:hover:bg-green-100 transition-colors text-sm">
                                                                                                          <FaWhatsapp size={16} />
                                                                                                          {t('packageDetail.askWhatsapp')}
                                                                                          </a>
                                                                        </div>
                                                                        <div className="bg-white rounded-2xl shadow-sm p-6" style={deferredBlockStyle}>
                                                                          <h3 className="text-lg font-bold text-gray-800">{t('packageDetail.whyBookTitle')}</h3>
                                                                          <div className="mt-4 space-y-3">
                                                                            {bookingReasons.map((reason) => (
                                                                              <div key={reason} className="flex gap-3 text-sm text-gray-600">
                                                                                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isOpenTrip ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                                                                                <span>{reason}</span>
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        </div>
                                                                        </div>
                                                          </div>
                                              </div>
                                    </div>
                            </div>
                      
                      </>
                    )
}
  
  export default PackageDetail
