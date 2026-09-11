import { Upload, Cog, Eye, Truck, ArrowDown, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    step: '01',
    subtitle: 'SEND YOUR FILES',
    title: 'UPLOAD YOUR DESIGN',
    description: 'Send us your 3D model file (STL, OBJ, STEP) or describe your idea. We accept all major CAD formats.',
    features: ['Upload STL, OBJ, STEP formats', 'Describe your custom idea', 'Fast and secure upload'],
    image: '/images/howitworks/step1.png'
  },
  {
    icon: Cog,
    step: '02',
    subtitle: 'ENGINEERING & SETUP',
    title: 'WE OPTIMIZE YOUR PRINT',
    description: 'Our engineers optimize your design for the best print quality, select the ideal material, and start printing.',
    features: ['Design optimization for 3D printing', 'Material selection & consulting', 'High-quality FDM & SLA printing'],
    image: '/images/howitworks/step2.png'
  },
  {
    icon: Eye,
    step: '03',
    subtitle: 'QUALITY ASSURANCE',
    title: 'QUALITY INSPECTION',
    description: 'Every print undergoes rigorous quality checks — dimensional accuracy, surface finish, and structural integrity.',
    features: ['Dimensional accuracy checks', 'Surface finish validation', 'Structural integrity testing'],
    image: '/images/howitworks/step3.png'
  },
  {
    icon: Truck,
    step: '04',
    subtitle: 'LOGISTICS & DISPATCH',
    title: 'FAST DELIVERY',
    description: 'Securely packaged and shipped to your doorstep. Most orders delivered within 3–5 business days.',
    features: ['Secure and safe packaging', 'Nationwide fast shipping', 'Most orders delivered in 3-5 days'],
    image: '/images/howitworks/step4.png'
  },
]

export default function HowItWorks() {
  return (
    <section className="steps-section section-padding relative" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 flex flex-col items-center">
          <span className="text-sm font-sub text-k-silver-dim uppercase tracking-[0.3em] font-semibold pl-[0.3em]">Process</span>
          <h2 className="section-title font-sub text-4xl md:text-5xl font-bold mt-3 text-white tracking-wide text-center">
            How It Works
          </h2>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto text-center">
            From file to finished product — our streamlined process ensures quality at every step
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto relative flex flex-col">
          {STEPS.map((step, i) => (
            <div key={i} className={`flex flex-col w-full ${i < STEPS.length - 1 ? 'mb-24 lg:mb-32' : ''}`}>
              
              <div className={`step-row relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Text Content */}
                <div className={`step-text w-full lg:w-1/2 flex flex-col ${i % 2 === 1 ? 'lg:pl-8' : 'lg:pr-8'}`}>
                  <div className="flex items-start gap-6 mb-8 relative">
                    {/* Big aesthetic number */}
                    <div className="text-[5.5rem] md:text-[6.5rem] font-body font-black text-white/30 select-none shrink-0 leading-[0.85] mt-1 tracking-tighter">
                      {step.step}
                    </div>
                    
                    <div className="flex flex-col mt-1">
                      {/* Small subtitle */}
                      <div className="flex items-center mb-1">
                        <span className="font-sub text-xs tracking-[0.2em] text-k-silver uppercase font-semibold">
                          {step.subtitle}
                        </span>
                      </div>
                      
                      {/* Main Title */}
                      <h3 className="font-sub text-2xl md:text-3xl font-bold text-white uppercase tracking-wide leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description (Orbitron) */}
                  <p className="text-base text-white font-body leading-relaxed mb-10">
                    {step.description}
                  </p>
                  
                  {/* Features */}
                  <ul className="space-y-5">
                    {step.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-4">
                        <CheckCircle size={22} className="text-emerald-500 shrink-0" />
                        <span className="text-white font-body text-base">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Card / Image */}
                <div className="step-image w-full lg:w-1/2 flex justify-center mt-10 lg:mt-0">
                  <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group bg-k-card flex items-center justify-center">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

              </div>


              
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

