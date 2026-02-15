import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { dishAPI } from '../lib/apiClient'
import { PLATE_SIZES } from '../lib/arUtils'

export default function DishCapture() {
  const [step, setStep] = useState('info') // info, capture, processing
  const [dishName, setDishName] = useState('')
  const [plateSize, setPlateSize] = useState('medium')
  const [capturedImage, setCapturedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream

        // Ensure video plays after stream is set
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err)
          })
        }
      }

      setStep('capture')
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Could not access camera. Please check permissions.')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      const context = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      canvas.toBlob((blob) => {
        setCapturedImage(blob)
        stopCamera()
      }, 'image/jpeg', 0.9)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const saveDish = async () => {
    if (!dishName.trim()) {
      setError('Please enter a dish name')
      return
    }

    if (!capturedImage) {
      setError('Please capture an image')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await dishAPI.create(
        { name: dishName, plateSize },
        capturedImage
      )

      navigate('/dashboard')
    } catch (err) {
      console.error('Error saving dish:', err)
      setError(err.message || 'Failed to save dish')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    stopCamera()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-2xl text-slate-600 hover:text-slate-800 transition-colors"
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-heading-3 text-slate-800">Add New Dish</h1>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert-error mb-4">
          {error}
        </div>
      )}

      {/* Step: Info */}
      {step === 'info' && (
        <div className="card space-y-4">
          <div>
            <label className="label">Dish Name</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="input-field"
              placeholder="e.g., Spicy Ramen"
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">Plate Size</label>
            <select
              value={plateSize}
              onChange={(e) => setPlateSize(e.target.value)}
              className="input-field"
            >
              {Object.entries(PLATE_SIZES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="alert-info">
            <p className="text-sm">
              <strong>Tip:</strong> Position the dish fully on the plate within the camera frame.
              Ensure good lighting for best results.
            </p>
          </div>

          <button onClick={startCamera} className="btn-primary w-full">
            Start Camera
          </button>
        </div>
      )}

      {/* Step: Capture */}
      {step === 'capture' && (
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="relative bg-black" style={{ minHeight: '400px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: '400px' }}
              />

              {/* AR Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-white/50 border-dashed rounded-full w-64 h-64"></div>
              </div>
            </div>
          </div>

          <button onClick={capturePhoto} className="btn-primary w-full">
            Capture Photo
          </button>
        </div>
      )}

      {/* Step: Review */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden">
            <img
              src={URL.createObjectURL(capturedImage)}
              alt="Captured dish"
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={retakePhoto}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Retake
            </button>
            <button
              onClick={saveDish}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner h-5 w-5 border-2"></div>
                  Saving...
                </span>
              ) : (
                'Save Dish'
              )}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}