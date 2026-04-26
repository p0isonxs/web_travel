import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from '../lib/siteConfig';

const DEFAULT_TITLE = `${SITE_NAME} - Wisata Open Trip & Private Trip`;
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
  const brandName = settings.siteName || SITE_NAME;
  const replaceBrand = (value) => {
    if (typeof value !== 'string') return value;
    return settings.siteName ? value.replaceAll(SITE_NAME, settings.siteName) : value;
  };
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const url = `${SITE_URL}${normalizedPath}`;
  const resolvedTitle = replaceBrand(title || settings.metaTitle || DEFAULT_TITLE);
  const resolvedDescription = replaceBrand(description || settings.metaDescription || DEFAULT_DESCRIPTION);
  const ogImage = image || settings.ogImage || '';
  const imageAlt = resolvedTitle || brandName;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large';

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={robotsContent} />

      {/* Open Graph */}
      <meta property="og:site_name" content={brandName} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:secure_url" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={imageAlt} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      <meta property="og:locale" content="id_ID" />

      {/* Twitter / X */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image:alt" content={imageAlt} />}
    </Helmet>
  );
}
