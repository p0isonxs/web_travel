import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const SITE_NAME = 'Liburan Terus';
const SITE_DOMAIN = 'web-travel-pi.vercel.app';
const BRAND_COLOR = '#059669';

const CTA_MAP = {
  'open-trip':    'Lihat Paket Open Trip →',
  'private-trip': 'Lihat Paket Private Trip →',
  'blog':         'Baca Artikel →',
  'website':      'Jelajahi Sekarang →',
};

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const title       = searchParams.get('title') || SITE_NAME;
  const description = searchParams.get('description') || '';
  const bgImage     = searchParams.get('image') || '';
  const type        = searchParams.get('type') || 'website';

  const cta         = CTA_MAP[type] || CTA_MAP['website'];
  const shortTitle  = truncate(title, 60);
  const shortDesc   = truncate(description, 110);
  const fontSize    = shortTitle.length > 45 ? 46 : 54;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          position: 'relative',
          backgroundColor: '#064e3b',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Background photo */}
        {bgImage && (
          <img
            src={bgImage}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}

        {/* Gradient overlay — dark bottom for text readability */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.92) 100%)',
            display: 'flex',
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '8px',
            background: `linear-gradient(to bottom, ${BRAND_COLOR}, #0d9488)`,
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 64px',
          }}
        >
          {/* Top: Brand badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                background: BRAND_COLOR,
                borderRadius: '10px',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'white', fontWeight: '700', fontSize: '18px', letterSpacing: '0.5px' }}>
                {SITE_NAME}
              </span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
              {SITE_DOMAIN}
            </span>
          </div>

          {/* Bottom: Headline + desc + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Description */}
            {shortDesc && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '20px',
                  margin: 0,
                  lineHeight: 1.45,
                  maxWidth: '820px',
                  display: 'flex',
                }}
              >
                {shortDesc}
              </p>
            )}

            {/* Headline */}
            <h1
              style={{
                color: 'white',
                fontSize: `${fontSize}px`,
                fontWeight: '800',
                margin: 0,
                lineHeight: 1.2,
                maxWidth: '1000px',
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                display: 'flex',
              }}
            >
              {shortTitle}
            </h1>

            {/* CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  background: BRAND_COLOR,
                  color: 'white',
                  padding: '14px 30px',
                  borderRadius: '12px',
                  fontSize: '19px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 4px 20px rgba(5,150,105,0.5)',
                }}
              >
                {cta}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: BRAND_COLOR,
                    display: 'flex',
                  }}
                />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
                  Wisata Indonesia Terpercaya
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
