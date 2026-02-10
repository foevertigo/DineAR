import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCodeGenerator from './QRCodeGenerator'
import { PLATE_SIZES } from '../lib/arUtils'

export default function DishCard({ dish, onDelete }) {
  const [showQR, setShowQR] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const arUrl = `${window.location.origin}/ar/${dish._id}`

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dish?')) return

    setDeleting(true)
    try {
      await onDelete(dish._id)
    } catch (error) {
      console.error('Delete failed:', error)
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="card-hover overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
          {dish.thumbnailUrl ? (
            <img
              src={dish.thumbnailUrl}
              alt={dish.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-6xl">🍽️</span>
          )}
        </div>

        {/* Info */}
        <h3 className="font-semibold text-lg text-slate-800 mb-1">{dish.name}</h3>
        <p className="text-sm text-slate-500 mb-4">
          {PLATE_SIZES[dish.plateSize]?.label || 'Standard'}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/ar/${dish._id}`)}
            className="flex-1 bg-teal-700 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-teal-600 transition-colors"
          >
            View AR
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="bg-slate-100 text-slate-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors"
          >
            QR
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-50 text-red-600 py-2 px-4 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
            aria-label="Delete dish"
          >
            {deleting ? '...' : 'Delete'}
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