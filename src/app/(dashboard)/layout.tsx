import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, CreditCard, Users, QrCode } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the tenant associated with the user
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tenant) {
     // For MVP: if the trigger hasn't fired yet or failed, redirect or show error
     // In a real app, you might have an explicit onboarding step here.
     return <div>Erreur : Compte commerçant non trouvé.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-800">SaaS Cartes</span>
        </div>
        <div className="p-4">
           <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
             {tenant.name || user.email}
           </div>
           <nav className="space-y-1">
             <Link href="/dashboard" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50">
               <LayoutDashboard className="h-5 w-5 mr-3 text-gray-400" />
               Tableau de bord
             </Link>
             <Link href="/dashboard/cards" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50">
               <CreditCard className="h-5 w-5 mr-3 text-gray-400" />
               Modèles de cartes
             </Link>
             <Link href="/dashboard/passes" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50">
               <Users className="h-5 w-5 mr-3 text-gray-400" />
               Passes clients
             </Link>
             <Link href="/dashboard/scans" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-50">
               <QrCode className="h-5 w-5 mr-3 text-gray-400" />
               Scans & Points
             </Link>
           </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <div className="md:hidden text-lg font-bold">SaaS Cartes</div>
          <div className="flex-1"></div>
          <form action="/auth/signout" method="post">
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </button>
          </form>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
