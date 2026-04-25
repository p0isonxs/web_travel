const SOCIAL_BOT_RE = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Pinterest|Discordbot/i;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = (process.env.SITE_URL || process.env.VITE_APP_URL || 'https://web-travel-pi.vercel.app').replace(/\/$/, '');
const SBHEADERS = SUPABASE_KEY ? { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } : null;

export const config = {
  matcher: ['/', '/open-trip', '/private-trip', '/blog', '/kontak', '/tentang-kami', '/open-trip/:slug+', '/private-trip/:slug+', '/blog/:slug+'],
};

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml({ title, description, image, url }) {
  const t = esc(title);
  const d = esc((description || '').substring(0, 200));
  const i = esc(image);
  const u = esc(url);
  return `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8">
<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:site_name" content="Liburan Terus">
<meta property="og:type" content="website">
<meta property="og:url" content="${u}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
${i ? `<meta property="og:image" content="${i}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${i}">` : '<meta name="twitter:card" content="summary">'}
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
</head><body></body></html>`;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!SOCIAL_BOT_RE.test(ua)) return;

  const { pathname } = new URL(request.url);
  const [, type, slug] = pathname.split('/');

  let title = 'Liburan Terus - Paket Wisata Indonesia';
  let description = 'Paket wisata open trip dan private trip terbaik di Indonesia.';
  let bgImage = '';
  let pageType = 'website';

  if (pathname === '/') {
    title = 'Liburan Terus - Paket Wisata Open Trip & Private Trip Terbaik';
    description = 'Temukan paket open trip dan private trip terbaik ke berbagai destinasi indah di Indonesia bersama Liburan Terus.';
  } else if (pathname === '/open-trip') {
    title = 'Open Trip - Liburan Terus';
    description = 'Temukan berbagai paket open trip seru dengan harga terjangkau dan jadwal keberangkatan terbaik.';
    pageType = 'open-trip';
  } else if (pathname === '/private-trip') {
    title = 'Private Trip - Liburan Terus';
    description = 'Nikmati private trip eksklusif dengan itinerary fleksibel untuk keluarga, pasangan, dan rombongan.';
    pageType = 'private-trip';
  } else if (pathname === '/blog') {
    title = 'Blog & Artikel Wisata - Liburan Terus';
    description = 'Baca tips wisata, destinasi terbaik, dan panduan perjalanan terbaru dari Liburan Terus.';
    pageType = 'blog';
  } else if (pathname === '/kontak') {
    title = 'Kontak - Liburan Terus';
    description = 'Hubungi Liburan Terus untuk informasi paket wisata, booking, dan konsultasi perjalanan.';
  } else if (pathname === '/tentang-kami') {
    title = 'Tentang Kami - Liburan Terus';
    description = 'Kenali Liburan Terus lebih dekat sebagai penyedia open trip dan private trip terpercaya di Indonesia.';
  }

  try {
    if (!SUPABASE_URL || !SBHEADERS) throw new Error('Supabase env not configured');

    // Fetch settings (ogImage) and page-specific data in parallel
    const settingsPromise = fetch(
      `${SUPABASE_URL}/rest/v1/settings?id=eq.general&select=data&limit=1`,
      { headers: SBHEADERS }
    );

    let pageDataPromise = null;
    if (type === 'blog' && slug) {
      pageDataPromise = fetch(
        `${SUPABASE_URL}/rest/v1/blog?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,cover_image&limit=1`,
        { headers: SBHEADERS }
      );
    } else if ((type === 'open-trip' || type === 'private-trip') && slug) {
      pageDataPromise = fetch(
        `${SUPABASE_URL}/rest/v1/packages?type=eq.${encodeURIComponent(type)}&slug->>id=eq.${encodeURIComponent(slug)}&select=title,description,images&limit=1`,
        { headers: SBHEADERS }
      );
    }

    const [settingsRes, pageRes] = await Promise.all([settingsPromise, pageDataPromise]);

    // Extract default OG image from settings
    const settingsData = await settingsRes.json();
    bgImage = settingsData[0]?.data?.ogImage || '';

    // Extract page-specific data (overrides default bgImage if found)
    if (pageRes) {
      const pageData = await pageRes.json();
      const item = Array.isArray(pageData) ? pageData[0] : null;
      if (item) {
        if (type === 'blog' && slug) {
          const rawTitle = typeof item.title === 'object' ? item.title.id : item.title;
          const rawExcerpt = typeof item.excerpt === 'object' ? item.excerpt.id : item.excerpt;
          if (rawTitle) title = `${rawTitle} - Liburan Terus`;
          if (rawExcerpt) description = rawExcerpt;
          if (item.cover_image) bgImage = item.cover_image;
          pageType = 'blog';
        } else {
          const rawTitle = typeof item.title === 'object' ? item.title.id : item.title;
          const rawDesc = typeof item.description === 'object' ? item.description.id : item.description;
          if (rawTitle) title = `${rawTitle} - Liburan Terus`;
          if (rawDesc) description = rawDesc;
          if (item.images?.[0]) bgImage = item.images[0];
          pageType = type;
        }
      }
    }
  } catch {
    // use defaults
  }

  // Generate OG image via /api/og (branded card with optional background photo)
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}${bgImage ? `&image=${encodeURIComponent(bgImage)}` : ''}&type=${encodeURIComponent(pageType)}`;

  return new Response(buildHtml({ title, description, image: ogImageUrl, url: `${SITE_URL}${pathname}` }), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
