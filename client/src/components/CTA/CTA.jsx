import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="section-padding relative">
      <div className="max-w-4xl mx-auto">
        <div className="relative glass-card p-12 md:p-16 text-center overflow-hidden">
          {/* Background geometric accents */}
          <div className="absolute -top-20 -left-20 w-60 h-60 border border-k-border/20 rounded-full" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 border border-k-border/15 rotate-45" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-k-silver/5 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">
              Ready to Build?
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 text-gradient">
              Let's Bring Your Ideas<br />to Reality
            </h2>
            <p className="mt-4 text-k-silver-dim font-body max-w-lg mx-auto">
              Whether it's a single prototype or a production run of thousands — we deliver precision-engineered 3D prints on time, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link to="/contact" className="btn-primary">
                Get a Free Quote
                <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn-outline">
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
