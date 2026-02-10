import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, dishAPI } from '../lib/apiClient'
import DishCard from './DishCard'

export default function Dashboard({ onLogout }) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      setLoading(true)
      const response = await dishAPI.list()
      setDishes(response.dishes || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching dishes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    authAPI.logout()
    onLogout()
  }

  const handleDelete = async (dishId) => {
    if (!confirm('Are you sure you want to delete this dish?')) return

    try {
      await dishAPI.delete(dishId)
      setDishes(dishes.filter(d => d._id !== dishId))
    } catch (err) {
      console.error('Error deleting dish:', err)
      alert('Failed to delete dish: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="card mb-6 slide-up">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-heading-2 text-slate-800">Your Menu</h1>
            <p className="text-small text-slate-600 mt-1">
              {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-red-600 font-medium hover:text-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert-error mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-48 mb-4"></div>
              <div className="skeleton h-6 mb-2"></div>
              <div className="skeleton h-4 w-24"></div>
            </div>
          ))}
        </div>
      ) : dishes.length === 0 ? (
        /* Empty State */
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-slate-600 mb-2 font-medium">No dishes yet</p>
          <p className="text-sm text-slate-400">Tap the add button to create your first dish</p>
        </div>
      ) : (
        /* Dishes Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dishes.map(dish => (
            <DishCard key={dish._id} dish={dish} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/capture')}
        className="fixed bottom-6 right-6 w-16 h-16 bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-teal-600 hover:shadow-xl transition-all duration-200"
        style={{ transform: 'translateY(0)' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        aria-label="Add new dish"
      >
        +
      </button>
    </div>
  )
}