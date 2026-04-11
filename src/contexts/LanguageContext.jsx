import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../locales/translations'
import { resolveLocalizedValue } from '../utils/localizedContent'

const STORAGE_KEY = 'web_travel_language'
const LanguageContext = createContext(null)

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'id'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'en' ? 'en' : 'id'
  })

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
