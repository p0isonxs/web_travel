import { Helmet } from 'react-helmet-async'
import { useSettings } from '../contexts/SettingsContext'
import { SITE_NAME, SITE_URL } from '../lib/siteConfig'

export default function SiteBrandingHead() {
  const settings = useSettings()
  const brandName = settings.siteName || SITE_NAME
  const defaultMetaTitle = settings.metaTitle || `${brandName} - Paket Wisata Open Trip & Private Trip Terbaik`
  const defaultMetaDescription =
    settings.metaDescription ||
    `${brandName} menyediakan paket wisata open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia. Harga terjangkau, pemandu profesional, aman & terpercaya.`
  const favicon = settings.favicon || '/favicon.svg'
  const ogImage = settings.ogImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=80'

  return (
    <Helmet>
      <title>{defaultMetaTitle}</title>
      <meta name="description" content={defaultMetaDescription} />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:title" content={defaultMetaTitle} />
      <meta property="og:description" content={defaultMetaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={defaultMetaTitle} />
      <meta name="twitter:description" content={defaultMetaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="apple-mobile-web-app-title" content={brandName} />
      <link rel="icon" href={favicon} />
      <link rel="shortcut icon" href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />
    </Helmet>
  )
}
