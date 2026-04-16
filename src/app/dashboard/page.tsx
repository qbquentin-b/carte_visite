import { createClient } from '@/lib/supabase/server'
import { CreditCard, QrCode, Users } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!tenant) return null

  // Get some quick stats
  const { count: cardsCount } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  const { count: passesCount } = await supabase
    .from('passes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  const { count: scansCount } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Vue d&apos;ensemble</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Stat Card 1 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Modèles de cartes</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{cardsCount || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Passes actifs</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{passesCount || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QrCode className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scans totaux</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{scansCount || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
