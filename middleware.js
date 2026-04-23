const CRAWLER_RE = /facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Googlebot|bingbot|Applebot|Pinterest|Discordbot/i;

const SUPABASE_URL = 'https://yhfkurqjlfnywnakkmgf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZmt1cnFqbGZueXduYWtrbWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzY4MjksImV4cCI6MjA5MjM1MjgyOX0.T8JV3JwWAnIkprOleS1UqW_lIxq3rk6vGQefGgCler8';
const SITE_URL = 'https://web-travel-pi.vercel.app';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=80';
const SBHEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

export const config = {
  matcher: ['/open-trip/:slug+', '/private-trip/:slug+', '/blog/:slug+'],
};

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function html({ title, description, image, url }) {
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
<meta property="og:image" content="${i}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${i}">
</head><body></body></html>`;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!CRAWLER_RE.test(ua)) return; // regular user — serve React app as-is

  const { pathname } = new URL(request.url);
  const [, type, slug] = pathname.split('/');

  let title = 'Liburan Terus - Paket Wisata Indonesia';
  let description = 'Paket wisata open trip dan private trip terbaik di Indonesia.';
  let image = DEFAULT_IMAGE;

  try {
    if (type === 'blog') {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/blog?slug=eq.${encodeURIComponent(slug)}&select=title_id,excerpt_id,cover_image&limit=1`,
        { headers: SBHEADERS }
      );
      const [post] = await res.json();
      if (post) {
        if (post.title_id) title = `${post.title_id} - Liburan Terus`;
        if (post.excerpt_id) description = post.excerpt_id;
        if (post.cover_image) image = post.cover_image;
      }
    } else {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/packages?type=eq.${encodeURIComponent(type)}&slug->>id=eq.${encodeURIComponent(slug)}&select=title,description,images&limit=1`,
        { headers: SBHEADERS }
      );
      const [pkg] = await res.json();
      if (pkg) {
        const rawTitle = typeof pkg.title === 'object' ? pkg.title.id : pkg.title;
        const rawDesc = typeof pkg.description === 'object' ? pkg.description.id : pkg.description;
        if (rawTitle) title = `${rawTitle} - Liburan Terus`;
        if (rawDesc) description = rawDesc;
        if (pkg.images?.[0]) image = pkg.images[0];
      }
    }
  } catch {
    // use defaults
  }

  return new Response(html({ title, description, image, url: `${SITE_URL}${pathname}` }), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
