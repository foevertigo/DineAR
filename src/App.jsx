import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authAPI } from './lib/apiClient'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import DishCapture from './components/DishCapture'
import ARViewer from './components/ARViewer'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const response = await authAPI.getMe()
        setUser(response.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Token might be expired, clear it
      authAPI.logout()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login onLogin={setUser} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard onLogout={() => setUser(null)} /> : <Navigate to="/login" />}
        />
        <Route
          path="/capture"
          element={user ? <DishCapture /> : <Navigate to="/login" />}
        />
        <Route path="/ar/:dishId" element={<ARViewer />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App