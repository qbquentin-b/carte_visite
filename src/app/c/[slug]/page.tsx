import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QRCodeComponent from './QRCodeComponent'

// Force dynamic rendering since we are reading dynamic params
export const dynamic = 'force-dynamic'

export default async function PublicPassPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // Use the RPC function created previously to fetch pass data securely bypassing RLS data leaks.
  const { data: initialPass, error } = await supabase.rpc('get_public_pass', {
    p_slug: params.slug
  })

  let pass = initialPass

  if (error || !pass) {
    // Si la fonction n'est pas encore créée en BDD par l'utilisateur,
    // on essaie un fetch classique (qui marchera si RLS est permissif).
    // Ceci est une solution de repli.
    const { data: fallbackPass, error: fallbackError } = await supabase
      .from('passes')
      .select('*, cards(*), tenants(name)')
      .eq('pass_slug', params.slug)
      .eq('status', 'active')
      .single()

    if (fallbackError || !fallbackPass) {
       notFound()
    }

    // Normalize data structure if falling back
    pass = {
      customer_name: fallbackPass.customer_name,
      points: fallbackPass.points,
      pass_slug: fallbackPass.pass_slug,
      cards: {
        title: fallbackPass.cards.title,
        type: fallbackPass.cards.type,
        design_config: fallbackPass.cards.design_config
      },
      tenants: {
        name: fallbackPass.tenants.name
      }
    }
  }

  const { cards: card, tenants: tenant } = pass
  const design = card.design_config || { bgColor: '#000000', textColor: '#ffffff' }
  const urlPlaceholder = `https://votre-app.com/c/${pass.pass_slug}` // Fallback for SSR

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

      {/* Client Component for QR Code (needs window.location) */}
      <QRCodeComponent url={urlPlaceholder} slug={pass.pass_slug} />

    </div>
  )
}
