'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

export default function QRCodeComponent({ url, slug }: { url: string, slug: string }) {
  const [currentUrl, setCurrentUrl] = useState(url)

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  return (
    <div className="mt-10 bg-white p-8 rounded-xl shadow-sm text-center w-full max-w-sm">
      <p className="text-sm text-gray-500 mb-4">Présentez ce QR code lors de votre passage</p>
      <div className="flex justify-center bg-white p-4 rounded-lg inline-block mx-auto border border-gray-100">
        <QRCodeSVG value={currentUrl} size={200} />
      </div>
      <p className="text-xs text-gray-400 mt-4">{slug}</p>
    </div>
  )
}
