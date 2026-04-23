import { supabase } from './supabase'
import { toLocalizedField } from '../utils/localizedContent'

// ─── Key converters ───────────────────────────────────────────────────────────
const toSnake = (k) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

const rowToDoc = (row) => {
  if (!row) return null
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]))
}

const docToRow = (data) => {
  const { id, createdAt, updatedAt, ...rest } = data
  return Object.fromEntries(
    Object.entries(rest)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [toSnake(k), v])
  )
}

// ─── Package normalization (same logic as before) ────────────────────────────
const splitList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split(/\r?\n|,/).map((i) => i.trim()).filter(Boolean)
}

const cleanTimeLabel = (value) => {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\s*[–—]\s*/g, ' - ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/:\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const parseItineraryLine = (line, index) => {
  const trimmed = line.trim()
  if (!trimmed) return null
  const timeRangeMatch = trimmed.match(
    /^(\d{1,2}[:.]\d{2}\s*[-–]\s*(?:\d{1,2}[:.]\d{2}|[A-Za-zÀ-ÿ]+))(?:\s*[:|\-]\s*|\s+)(.+)$/
  )
  if (timeRangeMatch) return { time: cleanTimeLabel(timeRangeMatch[1]), activity: timeRangeMatch[2].trim() }
  const labelMatch = trimmed.match(/^([^:]+):\s+(.+)$/)
  if (labelMatch) return { time: cleanTimeLabel(labelMatch[1]), activity: labelMatch[2].trim() }
  return { time: `Kegiatan ${index + 1}`, activity: trimmed }
}

const normalizeItinerary = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === 'string') return { time: `Kegiatan ${index + 1}`, activity: item.trim() }
        return { time: cleanTimeLabel(item?.time || `Kegiatan ${index + 1}`), activity: item?.activity || item?.title || '' }
      })
      .filter((item) => item.activity)
  }
  if (typeof value !== 'string') return []
  return value.split(/\r?\n/).map(parseItineraryLine).filter(Boolean)
}

const normalizeLocalizedText = (value) => {
  const localized = toLocalizedField(value, (item) => (typeof item === 'string' ? item.trim() : ''))
  return { id: localized.id || '', en: localized.en || '' }
}

const normalizeLocalizedList = (value, legacyValue) =>
  toLocalizedField(value ?? legacyValue, splitList, [])

const normalizeLocalizedItinerary = (value) => toLocalizedField(value, normalizeItinerary, [])

const normalizePackage = (data) => {
  if (!data) return data
  const departureDates = Array.isArray(data.departureDates)
    ? data.departureDates
    : splitList(data.departureDates)
  return {
    ...data,
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : data.image ? [data.image] : [],
    title: normalizeLocalizedText(data.title),
    location: normalizeLocalizedText(data.location),
    duration: normalizeLocalizedText(data.duration),
    description: normalizeLocalizedText(data.description),
    itinerary: normalizeLocalizedItinerary(data.itinerary),
    includes: normalizeLocalizedList(data.includes, data.include),
    excludes: normalizeLocalizedList(data.excludes, data.exclude),
    slug: normalizeLocalizedText(data.slug),
    departureDates: departureDates
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .sort(),
  }
}

// ─── PACKAGES ────────────────────────────────────────────────────────────────
export const getPackages = async (type = null) => {
  let q = supabase.from('packages').select('*').order('created_at', { ascending: false })
  if (type) q = q.eq('type', type)
  const { data, error } = await q
  if (error) throw error
  return (data || [])
    .map((row) => normalizePackage(rowToDoc(row)))
    .filter((item) => item.active !== false)
}

export const getPackageById = async (id) => {
  const { data, error } = await supabase.from('packages').select('*').eq('id', id).single()
  if (error) return null
  return normalizePackage(rowToDoc(data))
}

export const addPackage = async (data) => {
  const { data: row, error } = await supabase
    .from('packages')
    .insert(docToRow(data))
    .select('id')
    .single()
  if (error) throw error
  return { id: row.id }
}

export const updatePackage = async (id, data) => {
  const row = { ...docToRow(data), updated_at: new Date().toISOString() }
  const { error } = await supabase.from('packages').update(row).eq('id', id)
  if (error) throw error
}

export const deletePackage = async (id) => {
  const { error } = await supabase.from('packages').delete().eq('id', id)
  if (error) throw error
}

export const getPackageBySlug = async (type, slug) => {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('type', type)
    .filter('slug->>id', 'eq', slug)
    .single()
  if (error) return null
  return normalizePackage(rowToDoc(data))
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────
export const getBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const getBookingById = async (id) => {
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single()
  if (error) return null
  return rowToDoc(data)
}

export const getOpenTripSlotUsage = async (packageId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('date, trip_date, participants, status')
    .eq('package_id', packageId)
  if (error) throw error
  return (data || []).reduce((acc, booking) => {
    const bookingDate = booking.date || booking.trip_date
    if (!bookingDate || booking.status === 'cancelled') return acc
    acc[bookingDate] = (acc[bookingDate] || 0) + (Number(booking.participants) || 1)
    return acc
  }, {})
}

export const addBooking = async (data) => {
  const { data: row, error } = await supabase
    .from('bookings')
    .insert({ ...docToRow(data), status: data.status || 'pending' })
    .select('id')
    .single()
  if (error) throw error
  return { id: row.id }
}

export const updateBooking = async (id, data) => {
  const row = { ...docToRow(data), updated_at: new Date().toISOString() }
  const { error } = await supabase.from('bookings').update(row).eq('id', id)
  if (error) throw error
}

export const deleteBooking = async (id) => {
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw error
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const getPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const getPaymentByBookingId = async (bookingId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .limit(1)
    .maybeSingle()
  if (error) return null
  return rowToDoc(data)
}

export const addPayment = async (data) => {
  const { data: row, error } = await supabase
    .from('payments')
    .insert({ ...docToRow(data), status: data.status || 'pending' })
    .select('id')
    .single()
  if (error) throw error
  return { id: row.id }
}

export const upsertPaymentByBookingId = async (bookingId, data) => {
  const existing = await getPaymentByBookingId(bookingId)
  if (existing) {
    await updatePayment(existing.id, data)
    return existing.id
  }
  const newDoc = await addPayment({ bookingId, ...data })
  return newDoc.id
}

export const updatePayment = async (id, data) => {
  const row = { ...docToRow(data), updated_at: new Date().toISOString() }
  const { error } = await supabase.from('payments').update(row).eq('id', id)
  if (error) throw error
}

// ─── BLOG ────────────────────────────────────────────────────────────────────
export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const getBlogBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) return null
  return rowToDoc(data)
}

export const addBlogPost = async (data) => {
  const { data: row, error } = await supabase
    .from('blog')
    .insert(docToRow(data))
    .select('id')
    .single()
  if (error) throw error
  return { id: row.id }
}

export const updateBlogPost = async (id, data) => {
  const row = { ...docToRow(data), updated_at: new Date().toISOString() }
  const { error } = await supabase.from('blog').update(row).eq('id', id)
  if (error) throw error
}

export const deleteBlogPost = async (id) => {
  const { error } = await supabase.from('blog').delete().eq('id', id)
  if (error) throw error
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
export const getGallery = async () => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const addGalleryItem = async (data) => {
  const { data: row, error } = await supabase
    .from('gallery')
    .insert(docToRow(data))
    .select('id')
    .single()
  if (error) throw error
  return { id: row.id }
}

export const deleteGalleryItem = async (id) => {
  const { error } = await supabase.from('gallery').delete().eq('id', id)
  if (error) throw error
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
export const getTestimonials = async () => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const getApprovedTestimonials = async (limitCount = 6) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(limitCount)
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const addTestimonial = async (data) => {
  const { data: row, error } = await supabase
    .from('testimonials')
    .insert(docToRow(data))
    .select('id')
    .single()
  if (error) throw error
  return { id: row.id }
}

export const updateTestimonial = async (id, data) => {
  const row = { ...docToRow(data), updated_at: new Date().toISOString() }
  const { error } = await supabase.from('testimonials').update(row).eq('id', id)
  if (error) throw error
}

export const deleteTestimonial = async (id) => {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('data')
    .eq('id', 'general')
    .maybeSingle()
  if (error || !data) return {}
  return data.data || {}
}

export const updateSettings = async (settingsData) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'general', data: settingsData, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ─── CONTACTS ────────────────────────────────────────────────────────────────
export const addContact = async (data) => {
  const { error } = await supabase
    .from('contacts')
    .insert({ ...docToRow(data), status: 'unread' })
  if (error) throw error
}

export const getContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const updateContact = async (id, data) => {
  const { error } = await supabase.from('contacts').update(docToRow(data)).eq('id', id)
  if (error) throw error
}

export const deleteContact = async (id) => {
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw error
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [pkgRes, bookRes, verifiedRes, pendingRes] = await Promise.all([
    supabase.from('packages').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  return {
    packages: pkgRes.count || 0,
    bookings: bookRes.count || 0,
    payments: verifiedRes.count || 0,
    pendingPayments: pendingRes.count || 0,
  }
}

export const getRecentBookings = async (limitCount = 5) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limitCount)
  if (error) throw error
  return (data || []).map(rowToDoc)
}

export const getRecentPayments = async (limitCount = 5) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limitCount)
  if (error) throw error
  return (data || []).map(rowToDoc)
}
