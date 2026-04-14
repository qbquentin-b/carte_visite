'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Scan = {
  id: string
  action_type: string
  scanned_at: string
  passes: {
    customer_name: string
    pass_slug: string
  }
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [scanSlug, setScanSlug] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchScans()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchScans = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (tenant) {
      const { data } = await supabase
        .from('scans')
        .select('*, passes(customer_name, pass_slug)')
        .eq('tenant_id', tenant.id)
        .order('scanned_at', { ascending: false })

      if (data) setScans(data)
    }
    setLoading(false)
  }

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionMessage(null)

    if (!scanSlug.trim()) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pass_slug: scanSlug.trim(),
          action_type: 'point_added',
          device_info: 'Manual Entry (Dashboard)'
        }),
      })

      if (response.ok) {
        const { newPoints } = await response.json()
        setActionMessage({ type: 'success', text: `Point ajouté avec succès ! Total : ${newPoints} points.` })
        setScanSlug('')
        fetchScans()
      } else {
        const errorData = await response.json()
        setActionMessage({ type: 'error', text: errorData.error || 'Erreur lors du scan' })
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Erreur réseau' })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Scans & Points</h1>
      </div>

      {/* Manual Scan Entry */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Simuler un scan (Ajout de point)</h3>
        <p className="mt-1 text-sm text-gray-500">
          Saisissez le slug public du pass (la fin de l&apos;URL) pour lui ajouter un point manuellement.
        </p>
        <form className="mt-5 sm:flex sm:items-center" onSubmit={handleManualScan}>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="scanSlug" className="sr-only">Pass Slug</label>
            <input
              type="text"
              name="scanSlug"
              id="scanSlug"
              className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ring-1 ring-inset ring-gray-300 px-3 py-2"
              placeholder="ex: abc123xyz"
              value={scanSlug}
              onChange={(e) => setScanSlug(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Ajout...' : 'Ajouter un point'}
          </button>
        </form>
        {actionMessage && (
          <div className={`mt-3 text-sm ${actionMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {actionMessage.text}
          </div>
        )}
      </div>

      {/* Scans History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Historique récent</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">Chargement...</li>
          ) : scans.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">Aucun scan enregistré.</li>
          ) : (
            scans.map((scan) => (
              <li key={scan.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-blue-600 truncate">{scan.passes?.customer_name}</p>
                      <p className="text-sm text-gray-500">Action: {scan.action_type}</p>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(scan.scanned_at).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-400">Slug: {scan.passes?.pass_slug}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
