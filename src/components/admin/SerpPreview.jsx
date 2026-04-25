import { SITE_URL } from '../../lib/siteConfig'

const MAX_TITLE = 60
const MAX_DESC = 160

const DEFAULT_BASE = SITE_URL.replace(/^https?:\/\//, '')

export default function SerpPreview({ title, description, slug, baseUrl = DEFAULT_BASE }) {
  const displayTitle = title ? (title.length > MAX_TITLE ? title.slice(0, MAX_TITLE) + '…' : title) : 'Judul halaman...'
  const displayDesc = description ? (description.length > MAX_DESC ? description.slice(0, MAX_DESC) + '…' : description) : 'Meta description akan muncul di sini...'
  const displayUrl = slug ? `${baseUrl}/${slug}` : `${baseUrl}/...`

  const titleLen = title?.length || 0
  const descLen = description?.length || 0

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full" />
        Preview Google Search
      </p>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 max-w-xl">
        <p className="text-xs text-gray-500 mb-0.5 truncate">{displayUrl}</p>
        <p className="text-blue-600 text-lg leading-tight mb-1 hover:underline cursor-default">{displayTitle}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{displayDesc}</p>
      </div>
      <div className="flex gap-6 mt-2.5 text-xs">
        <span className={titleLen > MAX_TITLE ? 'text-red-500 font-semibold' : titleLen > 50 ? 'text-amber-500' : 'text-gray-400'}>
          Judul: {titleLen}/{MAX_TITLE}
        </span>
        <span className={descLen > MAX_DESC ? 'text-red-500 font-semibold' : descLen > 140 ? 'text-amber-500' : 'text-gray-400'}>
          Deskripsi: {descLen}/{MAX_DESC}
        </span>
      </div>
    </div>
  )
}
