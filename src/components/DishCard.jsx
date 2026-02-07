import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCodeGenerator from './QRCodeGenerator'
import { PLATE_SIZES } from '../lib/arUtils'

export default function DishCard({ dish, onDelete }) {
  const [showQR, setShowQR] = useState(false)
  const navigate = useNavigate()

  const arUrl = `${window.location.origin}/ar/${dish.id}`

  return (
    <>
      <div className="card overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
          {dish.thumbnail_url ? (
            <img src={dish.thumbnail_url} alt={dish.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-6xl">🍽️</span>
          )}
        </div>

        {/* Info */}
        <h3 className="font-bold text-lg text-gray-800 mb-1">{dish.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          {PLATE_SIZES[dish.plate_size]?.label || 'Standard'}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/ar/${dish.id}`)}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:shadow-lg transition-shadow"
          >
            View AR
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            QR
          </button>
          <button
            onClick={() => onDelete(dish.id)}
            className="bg-red-50 text-red-600 py-2 px-4 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {showQR && (
        <QRCodeGenerator
          url={arUrl}
          dishName={dish.name}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  )
}