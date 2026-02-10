import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ url, dishName, onClose }) {
  const canvasRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
    }
  }, [url])

  const downloadQR = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${dishName}-qr.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div className="card max-w-sm w-full fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-heading-3 text-slate-800 mb-4">QR Code</h2>

        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} className="rounded-lg"></canvas>
        </div>

        <p className="text-sm text-slate-600 text-center mb-6">
          Scan to view <strong>{dishName}</strong> in AR
        </p>

        <div className="space-y-3">
          <button onClick={copyURL} className="btn-secondary w-full">
            {copied ? 'Copied!' : 'Copy URL'}
          </button>

          <div className="flex gap-3">
            <button onClick={downloadQR} className="btn-primary flex-1">
              Download
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}