export const SITE_URL = (
  import.meta.env.VITE_APP_URL ||
  'https://example.com'
).trim().replace(/\/$/, '')

export const SITE_NAME = (import.meta.env.VITE_APP_NAME || 'Vakansi Trip').trim()

// Format: @handle (dengan @). Kosongkan kalau belum punya Twitter.
export const TWITTER_HANDLE = import.meta.env.VITE_TWITTER_HANDLE || ''
