import { Upload, Cog, Eye, Truck } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Design',
    description: 'Send us your 3D model file (STL, OBJ, STEP) or describe your idea. We accept all major CAD formats.',
  },
  {
    icon: Cog,
    step: '02',
    title: 'We Optimize & Print',
    description: 'Our engineers optimize your design for the best print quality, select the ideal material, and start printing.',
  },
  {
    icon: Eye,
    step: '03',
    title: 'Quality Inspection',
    description: 'Every print undergoes rigorous quality checks — dimensional accuracy, surface finish, and structural integrity.',
  },
  {
    icon: Truck,
    step: '04',
    title: 'Fast Delivery',
    description: 'Securely packaged and shipped to your doorstep. Most orders delivered within 3–5 business days.',
  },
]

export default function HowItWorks() {
  return (
    <section className="steps-section section-padding relative" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">Process</span>
          <h2 className="section-title font-display text-3xl md:text-4xl font-bold mt-3 text-gradient">
            How It Works
          </h2>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto">
            From file to finished product — our streamlined process ensures quality at every step
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[56px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0" />

          {STEPS.map((step, i) => (
            <div key={i} className="step-card relative flex flex-col items-center text-center group">
              {/* Step number */}
              <div className="relative mb-6">
                <div className="relative z-10 w-28 h-28 rounded-2xl bg-k-card border border-k-border flex flex-col items-center justify-center transition-all duration-500 group-hover:border-k-silver/30 group-hover:shadow-lg group-hover:shadow-k-glow">
                  <step.icon size={32} className="text-k-silver mb-1 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-[10px] text-k-silver-dim font-display tracking-wider">{step.step}</span>
                </div>
              </div>

              <h3 className="font-display text-sm font-semibold text-white mb-2 tracking-wide">
                {step.title}
              </h3>
              <p className="text-xs text-k-silver-dim font-body leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
