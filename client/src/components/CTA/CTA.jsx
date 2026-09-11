import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="section-padding relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative rounded-[2rem] border border-white/5 bg-[#0a0f0d] p-12 md:p-16 text-center overflow-hidden shadow-2xl">
          {/* Background geometric accents */}
          <div className="absolute -top-32 -left-32 w-64 h-64 border border-white/5 rounded-full opacity-50" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-white/5 rotate-45 opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            <span className="text-sm font-sub text-k-silver-dim uppercase tracking-[0.3em] font-semibold">
              Ready to Build?
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 text-white uppercase tracking-wide leading-[1.1]">
              Let's Bring Your Ideas<br />to Reality
            </h2>
            <p className="mt-6 text-k-silver-dim font-body text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Whether it's a single prototype or a production run of thousands — we deliver precision-engineered 3D prints on time, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link to="/contact" className="h-12 px-8 rounded-lg bg-gradient-to-r from-white to-gray-200 text-black font-sub font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-transform duration-300">
                Get a Free Quote
                <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="h-12 px-8 rounded-lg border border-white/20 bg-transparent text-white font-sub font-bold text-sm tracking-widest uppercase flex items-center hover:bg-white/5 transition-colors duration-300">
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
