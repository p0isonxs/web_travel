export const generateSlug = (text) => {
  if (!text) return ''
  const lower = text.toLowerCase()
  const prefixes = ['open trip ', 'private trip ', 'open-trip-', 'private-trip-']
  let clean = lower
  for (const p of prefixes) {
    if (lower.startsWith(p)) { clean = lower.slice(p.length); break }
  }
  return clean
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
