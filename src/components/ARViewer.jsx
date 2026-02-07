import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Canvas } from '@react-three/fiber'
import { ARButton, XR } from '@react-three/xr'
import { getScaleFactor, isARSupported } from '../lib/arUtils'
import * as THREE from 'three'

function DishModel({ imageUrl, scale }) {
  const meshRef = useRef()

  useEffect(() => {
    if (!imageUrl) return

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(imageUrl, (texture) => {
      if (meshRef.current) {
        meshRef.current.material.map = texture
        meshRef.current.material.needsUpdate = true
      }
    })
  }, [imageUrl])

  return (
    <mesh ref={meshRef} position={[0, 0, -1]} scale={[scale, scale, scale]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function ARViewer() {
  const { dishId } = useParams()
  const [dish, setDish] = useState(null)
  const [loading, setLoading] = useState(true)
  const [arSupported, setArSupported] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkARSupport()
    fetchDish()
  }, [dishId])

  const checkARSupport = async () => {
    const supported = await isARSupported()
    setArSupported(supported)
  }

  const fetchDish = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', dishId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Dish not found')
      
      setDish(data)
    } catch (error) {
      console.error('Error fetching dish:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-red-600 mb-4">❌ {error || 'Dish not found'}</p>
          <a href="/" className="text-indigo-600 font-medium">Go Home</a>
        </div>
      </div>
    )
  }

  if (!arSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">⚠️ AR Not Supported</h2>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support WebXR. Please use Chrome on Android.
          </p>
          <img
            src={dish.thumbnail_url || dish.model_url}
            alt={dish.name}
            className="w-full rounded-xl mb-4"
          />
          <p className="font-semibold text-lg">{dish.name}</p>
        </div>
      </div>
    )
  }

  const scale = getScaleFactor(dish.plate_size)

  return (
    <div className="min-h-screen relative">
      {/* Info Banner */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="card">
          <h2 className="font-bold text-lg">{dish.name}</h2>
          <p className="text-sm text-gray-600">Tap "Start AR" to view</p>
        </div>
      </div>

      {/* AR Canvas */}
      <Canvas
        camera={{ position: [0, 0, 0], fov: 70 }}
        gl={{ alpha: true }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <XR>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} />
          <DishModel
            imageUrl={dish.model_url || dish.thumbnail_url}
            scale={scale}
          />
        </XR>
      </Canvas>

      {/* AR Button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
        <ARButton
          className="btn-primary"
          sessionInit={{
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.body }
          }}
        />
      </div>
    </div>
  )
}