import { FaPlane } from 'react-icons/fa'
import { useSettings } from '../contexts/SettingsContext'

export default function BrandLogo({
  titleClassName = '',
  taglineClassName = '',
  showTagline = true,
  iconWrapperClassName = '',
  logoClassName = '',
  fallbackIconClassName = '',
}) {
  const settings = useSettings()

  return (
    <>
      {settings.brandLogo ? (
        <img
          src={settings.brandLogo}
          alt={settings.siteName}
          decoding="async"
          className={logoClassName || 'h-11 w-auto max-w-[160px] object-contain'}
        />
      ) : (
        <div className={iconWrapperClassName || 'bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl'}>
          <FaPlane className={fallbackIconClassName || 'text-white text-xl'} />
        </div>
      )}
      <div>
        <span className={`font-bold text-lg leading-tight block ${titleClassName}`}>{settings.siteName}</span>
        {showTagline && (
          <span className={`text-xs leading-tight block ${taglineClassName}`}>{settings.tagline}</span>
        )}
      </div>
    </>
  )
}
