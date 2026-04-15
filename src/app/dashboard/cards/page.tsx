'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Card = {
  id: string
  title: string
  type: string
  design_config: Record<string, string>
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('loyalty')
  const [bgColor, setBgColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#ffffff')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCards()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCards = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (tenant) {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (data) setCards(data)
    }
    setLoading(false)
  }

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const designConfig = { bgColor, textColor }

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          type,
          design_config: designConfig
        }),
      })

      if (response.ok) {
        setTitle('')
        setType('loyalty')
        setBgColor('#000000')
        setTextColor('#ffffff')
        fetchCards()
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.error || 'Création échouée'}`)
      }
    } catch {
      alert('Erreur lors de la création de la carte')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Modèles de cartes</h1>
      </div>

      {/* Create Card Form */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Créer un nouveau modèle</h3>
        <form className="mt-5 space-y-4" onSubmit={handleCreateCard}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre de la carte</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ring-1 ring-inset ring-gray-300 px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ring-1 ring-inset ring-gray-300"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="loyalty">Fidélité</option>
                <option value="business_card">Carte de visite</option>
              </select>
            </div>
            <div>
              <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700">Couleur de fond</label>
              <div className="mt-1 flex items-center">
                <input
                  type="color"
                  name="bgColor"
                  id="bgColor"
                  className="h-8 w-8 rounded-md border-0 p-0"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
                <span className="ml-2 text-sm text-gray-500">{bgColor}</span>
              </div>
            </div>
            <div>
              <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">Couleur du texte</label>
              <div className="mt-1 flex items-center">
                <input
                  type="color"
                  name="textColor"
                  id="textColor"
                  className="h-8 w-8 rounded-md border-0 p-0"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
                <span className="ml-2 text-sm text-gray-500">{textColor}</span>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer la carte'}
            </button>
          </div>
        </form>
      </div>

      {/* Cards List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">Chargement...</li>
          ) : cards.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">Aucune carte créée.</li>
          ) : (
            cards.map((card) => (
              <li key={card.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-blue-600 truncate">{card.title}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          - {card.type === 'loyalty' ? 'Fidélité' : 'Visite'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                     <div
                        className="h-8 w-12 rounded border border-gray-200 flex items-center justify-center text-xs"
                        style={{ backgroundColor: card.design_config?.bgColor || '#000', color: card.design_config?.textColor || '#fff' }}
                      >
                        A
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
