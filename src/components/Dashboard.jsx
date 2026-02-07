import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DishCard from './DishCard'

export default function Dashboard() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDishes(data || [])
    } catch (error) {
      console.error('Error fetching dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleDelete = async (dishId) => {
    if (!confirm('Delete this dish?')) return

    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)

      if (error) throw error
      setDishes(dishes.filter(d => d.id !== dishId))
    } catch (error) {
      console.error('Error deleting dish:', error)
      alert('Failed to delete dish')
    }
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Menu</h1>
            <p className="text-gray-600 text-sm">{dishes.length} dishes</p>
          </div>
          <button onClick={handleSignOut} className="text-red-600 font-medium">
            Sign Out
          </button>
        </div>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : dishes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No dishes yet</p>
          <p className="text-sm text-gray-400">Tap the + button to add your first dish</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dishes.map(dish => (
            <DishCard key={dish.id} dish={dish} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/capture')}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform duration-200"
      >
        +
      </button>
    </div>
  )
}