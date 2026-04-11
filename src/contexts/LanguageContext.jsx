import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../locales/translations'
import { resolveLocalizedValue } from '../utils/localizedContent'

const STORAGE_KEY = 'web_travel_language'
const LanguageContext = createContext(null)
const INDONESIAN_TIMEZONES = new Set(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'])

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function detectInitialLanguage() {
  if (typeof window === 'undefined') return 'id'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'id' || saved === 'en') return saved

  const browserLanguages = Array.isArray(window.navigator.languages) && window.navigator.languages.length > 0
    ? window.navigator.languages
    : [window.navigator.language]

  const normalizedLanguages = browserLanguages
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())

  if (normalizedLanguages.some((value) => value === 'id' || value.startsWith('id-'))) {
    return 'id'
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (INDONESIAN_TIMEZONES.has(timezone)) {
    return 'id'
  }

  return 'en'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(detectInitialLanguage)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage((prev) => prev === 'id' ? 'en' : 'id'),
    localize: (value, preferredLanguage = language) => resolveLocalizedValue(value, preferredLanguage, 'id'),
    t: (path, vars = {}) => {
      const template = getNestedValue(translations[language], path) ?? getNestedValue(translations.id, path) ?? path
      if (typeof template !== 'string') return template
      return Object.entries(vars).reduce(
        (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
        template
      )
    },
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
