import { useScrollAnimations } from '../hooks/useScrollAnimations'
import ProductsSection from '../components/Products/Products'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ProductsPage() {
  useScrollAnimations()

  return (
    <div className="pt-32">
      <div className="max-w-7xl mx-auto px-6 mb-2">
        <Link to="/#footer" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
      {/* Products grid (reusing the component) */}
      <div className="-mt-16">
        <ProductsSection />
      </div>
    </div>
  )
}
