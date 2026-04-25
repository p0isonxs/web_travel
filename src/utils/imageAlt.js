function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function joinParts(parts) {
  return parts.map(compact).filter(Boolean).join(' - ');
}

function getLocalizedValue(value, preferred = 'id') {
  if (typeof value === 'string') return compact(value);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return compact(value[preferred] || value.id || value.en || '');
  }
  return '';
}

export function getPackageImageAlt(pkg, preferredLanguage = 'id', imageIndex = 0) {
  const manualAlt = Array.isArray(pkg?.imageAlts) ? compact(pkg.imageAlts[imageIndex]) : '';
  if (manualAlt) return manualAlt;

  const title = getLocalizedValue(pkg?.title, preferredLanguage);
  const location = getLocalizedValue(pkg?.location, preferredLanguage);
  const packageType = compact(pkg?.type === 'private-trip'
    ? preferredLanguage === 'en' ? 'Private Trip' : 'Private Trip'
    : preferredLanguage === 'en' ? 'Open Trip' : 'Open Trip');

  const base = joinParts([title, location, packageType]);
  if (!base) {
    return preferredLanguage === 'en'
      ? `Travel package image ${imageIndex + 1}`
      : `Foto paket wisata ${imageIndex + 1}`;
  }

  return imageIndex > 0 ? `${base} - ${preferredLanguage === 'en' ? 'photo' : 'foto'} ${imageIndex + 1}` : base;
}

export function getBlogImageAlt(post, preferredLanguage = 'id') {
  const manualAlt = compact(post?.coverAlt);
  if (manualAlt) return manualAlt;

  const title = getLocalizedValue(post?.title, preferredLanguage);
  const category = compact(post?.category);
  const excerpt = getLocalizedValue(post?.excerpt, preferredLanguage);

  return joinParts([title, category]) || excerpt || (preferredLanguage === 'en' ? 'Blog cover image' : 'Gambar cover artikel');
}

