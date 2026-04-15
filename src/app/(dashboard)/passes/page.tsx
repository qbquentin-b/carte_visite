'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Pass = {
  id: string
  customer_name: string
  customer_email: string
  pass_slug: string
  points: number
  card_id: string
  cards: { title: string }
}

type Card = {
  id: string
  title: string
}

export default function PassesPage() {
  const [passes, setPasses] = useState<Pass[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [selectedCardId, setSelectedCardId] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (tenant) {
      // Fetch available cards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('id, title')
        .eq('tenant_id', tenant.id)

      if (cardsData) {
        setCards(cardsData)
        if (cardsData.length > 0 && !selectedCardId) {
          setSelectedCardId(cardsData[0].id)
        }
      }

      // Fetch passes
      const { data: passesData } = await supabase
        .from('passes')
        .select('*, cards(title)')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (passesData) setPasses(passesData)
    }
    setLoading(false)
  }

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCardId) return
    setIsSubmitting(true)

    // Generate a simple unique slug for the pass
    const passSlug = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)

    try {
      const response = await fetch('/api/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_id: selectedCardId,
          customer_name: customerName,
          customer_email: customerEmail,
          pass_slug: passSlug
        }),
      })

      if (response.ok) {
        setCustomerName('')
        setCustomerEmail('')
        fetchData()
      } else {
        const errorData = await response.json()
        alert(`Erreur: ${errorData.error || 'Création échouée'}`)
      }
    } catch {
      alert('Erreur lors de la génération du pass')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Passes clients</h1>
      </div>

      {/* Create Pass Form */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Générer un nouveau pass</h3>
        {cards.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">Veuillez d&apos;abord créer un modèle de carte.</p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleCreatePass}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Nom du client</label>
                <input
                  type="text"
                  id="customerName"
                  required
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ring-1 ring-inset ring-gray-300 px-3 py-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email du client</label>
                <input
                  type="email"
                  id="customerEmail"
                  required
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ring-1 ring-inset ring-gray-300 px-3 py-2"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cardSelect" className="block text-sm font-medium text-gray-700">Modèle de carte</label>
                <select
                  id="cardSelect"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ring-1 ring-inset ring-gray-300"
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                >
                  <option value="" disabled>Sélectionner un modèle</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Génération...' : 'Générer le pass'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Passes List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">Chargement...</li>
          ) : passes.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">Aucun pass généré.</li>
          ) : (
            passes.map((pass) => (
              <li key={pass.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-blue-600 truncate">{pass.customer_name}</p>
                      <p className="text-sm text-gray-500">{pass.customer_email}</p>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 text-right">
                      <p className="text-sm font-medium text-gray-900">{pass.cards?.title}</p>
                      <p className="text-sm text-gray-500">{pass.points} points</p>
                      <a
                        href={`/c/${pass.pass_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Voir le pass (URL)
                      </a>
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
