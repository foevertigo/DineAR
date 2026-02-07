// Plate size constants (in meters)
export const PLATE_SIZES = {
  small: { diameter: 0.20, label: 'Small (20cm)' },
  medium: { diameter: 0.26, label: 'Medium (26cm)' },
  large: { diameter: 0.30, label: 'Large (30cm)' }
}

// Get scale factor based on plate size
export function getScaleFactor(plateSize) {
  return PLATE_SIZES[plateSize]?.diameter || PLATE_SIZES.medium.diameter
}

// Check if WebXR is supported
export function isWebXRSupported() {
  return 'xr' in navigator && navigator.xr !== undefined
}

// Check if AR is supported
export async function isARSupported() {
  if (!isWebXRSupported()) return false
  
  try {
    return await navigator.xr.isSessionSupported('immersive-ar')
  } catch (error) {
    console.error('AR support check failed:', error)
    return false
  }
}