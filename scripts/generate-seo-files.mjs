import { promises as fs } from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('/Users/p0isonx/web_travel');
const distDir = path.join(projectRoot, 'dist');
const envFile = path.join(projectRoot, '.env');

const DEFAULT_SITE_URL = 'https://web-travel-pi.vercel.app';
const DEFAULT_CHANGEFREQ = 'weekly';
const DEFAULT_PRIORITY = '0.7';

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/open-trip', changefreq: 'daily', priority: '0.9' },
  { path: '/private-trip', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
  { path: '/tentang-kami', changefreq: 'monthly', priority: '0.6' },
  { path: '/kontak', changefreq: 'monthly', priority: '0.6' },
];

function parseEnvFile(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        return [key, valueParts.join('=').trim()];
      })
  );
}

function normalizeSiteUrl(...values) {
  const valid = values.find((value) => {
    if (!value) return false;
    try {
      const parsed = new URL(value);
      return !['localhost', '127.0.0.1'].includes(parsed.hostname);
    } catch {
      return false;
    }
  });

  return (valid || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function readLocalEnv() {
  try {
    const content = await fs.readFile(envFile, 'utf8');
    return parseEnvFile(content);
  } catch {
    return {};
  }
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function getDynamicRoutes(siteUrl, env) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  };

  let packages = [];
  let posts = [];

  try {
    [packages, posts] = await Promise.all([
      fetchJson(
        `${supabaseUrl}/rest/v1/packages?select=type,slug,updated_at,created_at,active&active=eq.true`,
        headers
      ),
      fetchJson(
        `${supabaseUrl}/rest/v1/blog?select=slug,updated_at,created_at,published&published=eq.true`,
        headers
      ),
    ]);
  } catch (error) {
    console.warn(`Failed to fetch dynamic sitemap routes, falling back to static routes only: ${error.message}`);
    return [];
  }

  const packageRoutes = (packages || [])
    .map((item) => {
      const slug = item?.slug?.id;
      const type = item?.type;
      if (!slug || !type) return null;
      return {
        loc: `${siteUrl}/${type}/${slug}`,
        lastmod: item.updated_at || item.created_at || null,
      };
    })
    .filter(Boolean);

  const blogRoutes = (posts || [])
    .map((item) => {
      if (!item?.slug) return null;
      return {
        loc: `${siteUrl}/blog/${item.slug}`,
        lastmod: item.updated_at || item.created_at || null,
      };
    })
    .filter(Boolean);

  return [...packageRoutes, ...blogRoutes];
}

function buildSitemapXml(siteUrl, dynamicRoutes) {
  const entries = [
    ...staticRoutes.map((route) => ({
      loc: `${siteUrl}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...dynamicRoutes.map((route) => ({
      loc: route.loc,
      lastmod: route.lastmod,
      changefreq: DEFAULT_CHANGEFREQ,
      priority: DEFAULT_PRIORITY,
    })),
  ];

  const urls = entries
    .map((entry) => {
      const lines = [
        '  <url>',
        `    <loc>${xmlEscape(entry.loc)}</loc>`,
      ];

      if (entry.lastmod) {
        lines.push(`    <lastmod>${xmlEscape(new Date(entry.lastmod).toISOString())}</lastmod>`);
      }

      lines.push(`    <changefreq>${entry.changefreq || DEFAULT_CHANGEFREQ}</changefreq>`);
      lines.push(`    <priority>${entry.priority || DEFAULT_PRIORITY}</priority>`);
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobotsTxt(siteUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

async function main() {
  await fs.mkdir(distDir, { recursive: true });

  const env = await readLocalEnv();
  const siteUrl = normalizeSiteUrl(
    process.env.SITE_URL,
    process.env.VITE_SITE_URL,
    process.env.VITE_APP_URL,
    env.VITE_SITE_URL,
    env.VITE_APP_URL
  );

  const dynamicRoutes = await getDynamicRoutes(siteUrl, env);
  const sitemapXml = buildSitemapXml(siteUrl, dynamicRoutes);
  const robotsTxt = buildRobotsTxt(siteUrl);

  await Promise.all([
    fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8'),
    fs.writeFile(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8'),
  ]);

  console.log(`Generated sitemap.xml with ${dynamicRoutes.length + staticRoutes.length} URLs`);
  console.log(`Generated robots.txt for ${siteUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
