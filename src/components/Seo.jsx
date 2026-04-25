import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

const SITE_NAME = 'Liburan Terus';
const SITE_URL = (import.meta.env.VITE_APP_URL || import.meta.env.VITE_SITE_URL || 'https://web-travel-pi.vercel.app').replace(/\/$/, '');
const DEFAULT_TITLE = 'Liburan Terus - Wisata Open Trip & Private Trip';
const DEFAULT_DESCRIPTION = 'Paket wisata open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia. Harga terjangkau, pemandu profesional, aman & terpercaya.';

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  type = 'website',
  noindex = false,
}) {
  const { pathname } = useLocation();
  const settings = useSettings();
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const url = `${SITE_URL}${normalizedPath}`;
  const ogImage = image || settings.ogImage || '';
  const imageAlt = title || SITE_NAME;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={robotsContent} />
      <link rel="alternate" hreflang="id" href={url} />
      <link rel="alternate" hreflang="en" href={url} />
      <link rel="alternate" hreflang="x-default" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:secure_url" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={imageAlt} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      <meta property="og:locale" content="id_ID" />

      {/* Twitter / X */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:site" content="@liburanterus" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image:alt" content={imageAlt} />}
    </Helmet>
  );
}
