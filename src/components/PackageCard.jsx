import { Link } from 'react-router-dom'
import { FiStar, FiMapPin, FiClock, FiUsers, FiHeart } from 'react-icons/fi'
import { useState } from 'react'

export default function PackageCard({ package: pkg }) {
  const [wishlisted, setWishlisted] = useState(false)
  
  const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(price)

  const discount = pkg.originalPrice ? Math.round((1 - pkg.price / pkg.originalPrice) * 100) : 0

  return (
    <div className="card-package group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img src={pkg.image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600'} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={"badge " + (pkg.type === 'Open Trip' ? 'badge-open' : 'badge-private')}>
            {pkg.type}
          </span>
          {discount > 0 && (
            <span className="badge bg-red-100 text-red-600">-{discount}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={() => setWishlisted(!wishlisted)} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
          <FiHeart className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} size={16} />
        </button>

        {/* Category badge */}
        {pkg.category && (
          <div className="absolute bottom-3 right-3">
            <span className="badge bg-white/90 text-gray-700 shadow-sm capitalize">{pkg.category}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <FiMapPin size={12} />
          <span>{pkg.location}</span>
        </div>
        
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors leading-snug">
          {pkg.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><FiClock size={12} /> {pkg.duration}</span>
          {pkg.minPersons && <span className="flex items-center gap-1"><FiUsers size={12} /> Min {pkg.minPersons} orang</span>}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={12} className={i < Math.floor(pkg.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700">{pkg.rating || '5.0'}</span>
          <span className="text-xs text-gray-400">({pkg.reviews || 0} ulasan)</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</p>
            )}
            <p className="text-primary-500 font-bold text-lg">
              {formatPrice(pkg.price)}
            </p>
            <p className="text-xs text-gray-400">/orang</p>
          </div>
          <Link to={"/paket/" + pkg.id} className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm">
            Pesan
          </Link>
        </div>
      </div>
    </div>
  )
}
