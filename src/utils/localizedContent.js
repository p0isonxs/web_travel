export function hasLocalizedShape(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && ('id' in value || 'en' in value)
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return value !== null && value !== undefined && value !== ''
}

export function resolveLocalizedValue(value, language = 'id', fallbackLanguage = 'id') {
  if (!hasLocalizedShape(value)) return value

  if (isFilled(value[language])) return value[language]
  if (isFilled(value[fallbackLanguage])) return value[fallbackLanguage]

  const alternateLanguage = language === 'id' ? 'en' : 'id'
  if (isFilled(value[alternateLanguage])) return value[alternateLanguage]

  return Array.isArray(value[language]) || Array.isArray(value[fallbackLanguage]) ? [] : ''
}

export function toLocalizedField(value, normalizer = (input) => input, emptyValue = '') {
  if (hasLocalizedShape(value)) {
    return {
      id: normalizer(value.id),
      en: normalizer(value.en),
    }
  }

  return {
    id: normalizer(value),
    en: emptyValue,
  }
}
