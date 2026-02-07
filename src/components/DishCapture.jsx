import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PLATE_SIZES } from '../lib/arUtils'
import { nanoid } from 'nanoid'

export default function DishCapture() {
  const [step, setStep] = useState('info') // info, capture, processing
  const [dishName, setDishName] = useState('')
  const [plateSize, setPlateSize] = useState('medium')
  const [capturedImage, setCapturedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      
      setStep('capture')
    } catch (error) {
      console.error('Camera access error:', error)
      alert('Could not access camera')
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
      alert('Please enter a dish name')
      return
    }

    setLoading(true)

    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) throw new Error('Not authenticated')

      // Upload image to Supabase Storage (you can later migrate to R2)
      const fileName = `${user.data.user.id}/${nanoid()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('dishes')
        .upload(fileName, capturedImage)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('dishes')
        .getPublicUrl(fileName)

      // Save dish metadata
      const { error: dbError } = await supabase
        .from('dishes')
        .insert({
          user_id: user.data.user.id,
          name: dishName,
          plate_size: plateSize,
          thumbnail_url: publicUrl,
          model_url: publicUrl, // In MVP, use same image; later replace with 3D model
        })

      if (dbError) throw dbError

      navigate('/dashboard')
    } catch (error) {
      console.error('Error saving dish:', error)
      alert('Failed to save dish: ' + error.message)
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
          <button onClick={handleBack} className="text-2xl">←</button>
          <h1 className="text-xl font-bold text-gray-800">Add New Dish</h1>
        </div>
      </div>

      {/* Step: Info */}
      {step === 'info' && (
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dish Name</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="input-field"
              placeholder="e.g., Spicy Ramen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plate Size</label>
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

          <div className="bg-indigo-50 p-4 rounded-xl">
            <p className="text-sm text-indigo-800">
              📸 Position the dish fully on the plate within the camera frame. 
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
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full"
              />
              
              {/* AR Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-white/50 border-dashed rounded-full w-64 h-64"></div>
              </div>
            </div>
          </div>

          <button onClick={capturePhoto} className="btn-primary w-full">
            📸 Capture
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
            <button onClick={retakePhoto} className="btn-secondary flex-1">
              Retake
            </button>
            <button
              onClick={saveDish}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save Dish'}
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}