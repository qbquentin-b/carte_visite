'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

type PassData = {
  customer_name: string
  points: number
  pass_slug: string
  cards: { title: string, type: string, design_config?: Record<string, string> }
  tenants: { name: string }
}

export default function PublicPassPage({ params }: { params: { slug: string } }) {
  const [pass, setPass] = useState<PassData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchPass()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPass = async () => {
    const { data } = await supabase
      .from('passes')
      .select('*, cards(*), tenants(name)')
      .eq('pass_slug', params.slug)
      .eq('status', 'active')
      .single()

    if (data) {
      setPass(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!pass) {
    return <div className="min-h-screen flex items-center justify-center">Pass introuvable ou inactif.</div>
  }

  const { cards: card, tenants: tenant } = pass
  const design = card.design_config || { bgColor: '#000000', textColor: '#ffffff' }
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">

      {/* Digital Card Representation */}
      <div
        className="w-full max-w-sm rounded-xl shadow-2xl overflow-hidden relative"
        style={{ backgroundColor: design.bgColor, color: design.textColor }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{tenant.name}</h2>
              <p className="text-sm opacity-80 mt-1">{card.title}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Titulaire</p>
              <p className="font-semibold text-lg">{pass.customer_name}</p>
            </div>

            {card.type === 'loyalty' && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider opacity-80">Points</p>
                <p className="font-bold text-3xl">{pass.points}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="mt-10 bg-white p-8 rounded-xl shadow-sm text-center w-full max-w-sm">
        <p className="text-sm text-gray-500 mb-4">Présentez ce QR code lors de votre passage</p>
        <div className="flex justify-center bg-white p-4 rounded-lg inline-block mx-auto border border-gray-100">
          <QRCodeSVG value={currentUrl} size={200} />
        </div>
        <p className="text-xs text-gray-400 mt-4">{pass.pass_slug}</p>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-4 w-full max-w-sm">
         <button className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-black hover:bg-gray-800">
           Ajouter à Google Wallet
         </button>
         <p className="text-xs text-center text-gray-500">
           (L&apos;intégration Google Wallet est simulée pour ce MVP)
         </p>
      </div>

    </div>
  )
}
