import React, { useState } from 'react'
import { authAPI } from '../lib/apiClient'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let response
      if (isSignUp) {
        response = await authAPI.signup(email, password)
        alert('Account created successfully!')
      } else {
        response = await authAPI.login(email, password)
      }

      // Update parent component with user data
      onLogin(response.user)
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <h1 className="text-heading-1 text-teal-700 mb-2">
            dineAR
          </h1>
          <p className="text-slate-600">AR Menu Visualization Platform</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={isSignUp ? "Min. 8 characters, 1 letter, 1 number" : "Your password"}
              required
              disabled={loading}
              minLength={8}
            />
            {isSignUp && (
              <p className="text-xs text-slate-500 mt-1">
                Password must be at least 8 characters with 1 letter and 1 number
              </p>
            )}
          </div>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner h-5 w-5 border-2"></div>
                Processing...
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-teal-600 font-medium hover:underline"
          disabled={loading}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  )
}