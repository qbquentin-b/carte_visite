import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <span className="text-xl font-bold text-gray-900">SaaS Cartes</span>
          </div>
          <div className="flex flex-1 justify-end space-x-4">
            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Connexion
            </Link>
            <Link href="/register" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              S&apos;inscrire
            </Link>
          </div>
        </nav>
      </header>

      <main className="isolate">
        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Digitalisez vos cartes de fidélité
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Créez, distribuez et gérez des cartes de fidélité virtuelles pour vos clients. Compatible avec les smartphones via QR code.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Commencer gratuitement
                </Link>
                <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
                  Espace commerçant <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
