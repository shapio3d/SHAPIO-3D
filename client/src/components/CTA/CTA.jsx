import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="section-padding relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[2rem] border border-white/10 bg-[#0a0f0d]/90 backdrop-blur-xl px-6 py-12 sm:p-12 md:p-16 text-center overflow-hidden shadow-2xl">
          {/* Background geometric accents */}
          <div className="absolute -top-32 -left-32 w-64 h-64 border border-white/5 rounded-full opacity-50" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-white/5 rotate-45 opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs sm:text-sm font-body text-emerald-400 uppercase tracking-[0.25em] font-semibold">
              Ready to Build?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-white uppercase tracking-wide leading-[1.1]">
              Let's Bring Your Ideas<br />to Reality
            </h2>
            <p className="mt-4 sm:mt-6 text-k-silver-dim font-body text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Whether it's a single prototype or a production run of thousands — we deliver precision-engineered 3D prints on time, every time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-10 w-full">
              <Link 
                to="/contact" 
                className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-body font-semibold text-xs sm:text-sm tracking-wider uppercase inline-flex items-center justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.25)] transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                <span>Get a Free Quote</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
