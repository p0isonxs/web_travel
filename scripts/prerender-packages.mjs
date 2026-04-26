/**
 * Build-time pre-renderer for package detail pages.
 *
 * For each published package it creates:
 *   dist/{type}/{slug}/index.html
 *
 * Each file:
 *  - Adds <link rel="preload" as="image"> for the hero image so the browser
 *    can fetch it in parallel with the JS bundles (fixes LCP "not discoverable").
 *  - Embeds the fully-normalised package data as JSON so PackageDetail.jsx can
 *    skip the Supabase round-trip entirely on the initial page load.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..')
const DIST = path.join(ROOT, 'dist')

// ─── Read env ─────────────────────────────────────────────────────────────────
async function readEnv() {
  try {
    const raw = await fs.readFile(path.join(ROOT, '.env'), 'utf8')
    return Object.fromEntries(
      raw.split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
    )
  } catch { return {} }
}

// ─── Cloudinary helpers (mirrors src/utils/cloudinary.js) ────────────────────
function optimizeImageUrl(url, { width, quality = 'auto', format = 'auto', crop = 'fill' } = {}) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url
  const t = [
    format && `f_${format}`,
    quality && `q_${quality}`,
    crop && `c_${crop}`,
    width && `w_${width}`,
  ].filter(Boolean).join(',')
  return url.replace('/image/upload/', `/image/upload/${t}/`)
}

function buildSrcset(url, widths = [480, 750, 960, 1280]) {
  return widths.map(w => `${optimizeImageUrl(url, { width: w })} ${w}w`).join(', ')
}

// ─── Normalization (mirrors database.js normalizePackage) ────────────────────
const toCamel = k => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

function rowToDoc(row) {
  if (!row) return null
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]))
}

function hasLocalizedShape(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v) && ('id' in v || 'en' in v)
}

function toLocalizedField(value, normalizer = x => x, emptyValue = '') {
  if (hasLocalizedShape(value)) return { id: normalizer(value.id), en: normalizer(value.en) }
  return { id: normalizer(value), en: emptyValue }
}

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split(/\r?\n|,/).map(i => i.trim()).filter(Boolean)
}

function cleanTimeLabel(v) {
  if (typeof v !== 'string') return ''
  return v.replace(/\s*[–—]\s*/g, ' - ').replace(/\s*-\s*/g, ' - ').replace(/:\s*$/, '').replace(/\s{2,}/g, ' ').trim()
}

function parseItineraryLine(line, index) {
  const t = line.trim()
  if (!t) return null
  const tr = t.match(/^(\d{1,2}[:.]\d{2}\s*[-–]\s*(?:\d{1,2}[:.]\d{2}|[A-Za-zÀ-ÿ]+))(?:\s*[:|\-]\s*|\s+)(.+)$/)
  if (tr) return { time: cleanTimeLabel(tr[1]), activity: tr[2].trim() }
  const lb = t.match(/^([^:]+):\s+(.+)$/)
  if (lb) return { time: cleanTimeLabel(lb[1]), activity: lb[2].trim() }
  return { time: `Kegiatan ${index + 1}`, activity: t }
}

function normalizeItinerary(value) {
  if (Array.isArray(value)) {
    return value
      .map((item, i) => {
        if (typeof item === 'string') return { time: `Kegiatan ${i + 1}`, activity: item.trim() }
        return { time: cleanTimeLabel(item?.time || `Kegiatan ${i + 1}`), activity: item?.activity || item?.title || '' }
      })
      .filter(item => item.activity)
  }
  if (typeof value !== 'string') return []
  return value.split(/\r?\n/).map(parseItineraryLine).filter(Boolean)
}

function normalizePackage(data) {
  if (!data) return data
  const departureDates = Array.isArray(data.departureDates)
    ? data.departureDates
    : splitList(data.departureDates)

  const rawDesc = data.description || {}
  const faq = Array.isArray(rawDesc._faq) ? rawDesc._faq : []
  const metaTitle = rawDesc._metaTitle || ''
  const metaDescription = rawDesc._metaDescription || ''
  const cleanDesc = { id: rawDesc.id || '', en: rawDesc.en || '' }

  return {
    ...data,
    faq,
    metaTitle,
    metaDescription,
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : data.image ? [data.image] : [],
    title: toLocalizedField(data.title, v => (typeof v === 'string' ? v.trim() : '')),
    location: toLocalizedField(data.location, v => (typeof v === 'string' ? v.trim() : '')),
    duration: toLocalizedField(data.duration, v => (typeof v === 'string' ? v.trim() : '')),
    description: toLocalizedField(cleanDesc, v => (typeof v === 'string' ? v.trim() : '')),
    itinerary: toLocalizedField(data.itinerary, normalizeItinerary, []),
    includes: toLocalizedField(data.includes ?? data.include, splitList, []),
    excludes: toLocalizedField(data.excludes ?? data.exclude, splitList, []),
    slug: toLocalizedField(data.slug, v => (typeof v === 'string' ? v.trim() : '')),
    departureDates: departureDates
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .sort(),
  }
}

// ─── Safe JSON embed (prevents </script> injection) ─────────────────────────
function safeJson(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const env = await readEnv()
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠  prerender-packages: credentials missing, skipping')
    return
  }

  const baseHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8')

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
  }

  let rows = []
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/packages?select=*&active=eq.true`, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    rows = await res.json()
  } catch (err) {
    console.warn(`⚠  prerender-packages: fetch failed (${err.message}), skipping`)
    return
  }

  let count = 0
  await Promise.all(rows.map(async (rawRow) => {
    const doc = rowToDoc(rawRow)
    const pkg = normalizePackage(doc)

    const slugId = rawRow.slug?.id || (typeof rawRow.slug === 'string' ? rawRow.slug : '')
    const type = rawRow.type
    if (!slugId || !['open-trip', 'private-trip'].includes(type)) return

    const heroUrl = pkg.images?.[0]
    if (!heroUrl) return

    // Build preload tag for LCP image
    const optimized750 = optimizeImageUrl(heroUrl, { width: 750 })
    const srcset = buildSrcset(heroUrl)
    const sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 66vw'
    const preloadTag = heroUrl.includes('res.cloudinary.com')
      ? `<link rel="preload" as="image" href="${optimized750}" imagesrcset="${srcset}" imagesizes="${sizes}" crossorigin>`
      : `<link rel="preload" as="image" href="${heroUrl}">`

    // Update OG image for this specific page
    const ogImageTag = `<meta property="og:image" content="${optimizeImageUrl(heroUrl, { width: 1200, height: 630 }) || heroUrl}" />`

    // Inject into HTML
    let html = baseHtml
      // Add preload + data script before </head>
      .replace(
        '</head>',
        `  ${preloadTag}\n  <script id="__PKG_DATA__" type="application/json">${safeJson(pkg)}</script>\n</head>`
      )
      // Replace generic OG image with package-specific one
      .replace(
        /<meta property="og:image" content="[^"]*"[^>]*>/,
        ogImageTag
      )

    const dir = path.join(DIST, type, slugId)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8')
    count++
  }))

  console.log(`✓  prerender-packages: generated ${count} page(s)`)
}

main().catch(err => {
  console.error('prerender-packages error:', err.message)
  // Do not fail the build — pre-rendering is an enhancement
})
