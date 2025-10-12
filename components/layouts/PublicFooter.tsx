import Link from 'next/link'

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/carrot-mascot.png" 
                alt="Fitness Carrot" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-orange-400">
                Fitness Carrot
              </span>
            </div>
            <p className="text-gray-300 mb-4">
              Your personal fitness companion. Track workouts, plan meals, and achieve your goals with expert guidance.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-gray-300 hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
              <li><Link href="/products" className="text-gray-300 hover:text-white">Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Fitness Carrot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
