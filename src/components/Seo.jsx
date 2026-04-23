import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Liburan Terus';
const SITE_URL = import.meta.env.VITE_APP_URL || 'https://web-travel-pi.vercel.app';
const DEFAULT_TITLE = 'Liburan Terus - Paket Wisata Open Trip & Private Trip Indonesia';
const DEFAULT_DESCRIPTION = 'Paket wisata open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia. Harga terjangkau, pemandu profesional, aman & terpercaya.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
}) {
  const { pathname } = useLocation();
  const url = `${SITE_URL}${pathname}`;
  const resolvedImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@liburanterus" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
