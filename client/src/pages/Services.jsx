import { useScrollAnimations } from '../hooks/useScrollAnimations'
import { Printer, Wrench, Layers, ArrowRight, CheckCircle, Cpu, Settings, Box, Lightbulb, Shield, ArrowLeft, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO/SEO'
import MaterialVisualization from '../components/MaterialVisualization/MaterialVisualization'

const SERVICES_DETAIL = [
  {
    icon: Wrench,
    image: '/images/services/engineering_and_industrial.png',
    title: 'Engineering & Industrial',
    slug: 'engineering-industrial',
    subtitle: 'Custom Machine Parts',
    description: 'We design and manufacture robust engineering and industrial components tailored to your exact specifications for heavy-duty performance.',
    features: [
      'Engineering & Industrial Components',
      'Custom Machine Parts',
      'Custom Industrial Parts',
    ],
  },
  {
    icon: Lightbulb,
    image: '/images/services/cover_prototyping.png',
    title: 'Rapid Prototyping',
    slug: 'rapid-prototyping',
    subtitle: 'Functional & Development',
    description: 'Accelerate your product development cycle with our high-fidelity rapid prototyping services, from automotive to consumer goods.',
    features: [
      'Functional Prototypes',
      'Product Development Prototypes',
      'Automotive Prototype Components',
    ],
  },
  {
    icon: Settings,
    image: '/images/services/precison_gear_new.png',
    title: 'Mechanical & Assembly',
    slug: 'mechanical-assembly',
    subtitle: 'Fixtures & Supports',
    description: 'Precision-engineered mechanical parts and assembly aids designed for flawless integration and performance on the factory floor.',
    features: [
      'Mechanical Components & Parts',
      'Jigs, Fixtures & Assembly Aids',
      'Brackets, Mounts & Supports',
    ],
  },
  {
    icon: Cpu,
    image: '/images/services/cover_electronics.png',
    title: 'Electronics & IoT',
    slug: 'electronics-iot',
    subtitle: 'Enclosures & Housings',
    description: 'Custom protective housings and enclosures tailored specifically for PCBs, delicate electronics, and connected IoT devices.',
    features: [
      'PCB & Electronics Enclosures',
      'Device Housings & Protective Enclosures',
      'Electronics & IoT Enclosures',
    ],
  },
  {
    icon: Layers,
    image: '/images/services/cover_tooling.png',
    title: 'Tooling & Molding',
    slug: 'tooling-molding',
    subtitle: 'Patterns & Master Models',
    description: 'High-accuracy mold patterns and master models for casting and specialized manufacturing processes.',
    features: [
      'Mold Patterns & Mould Components',
      'Casting Patterns & Master Models',
    ],
  },
  {
    icon: Shield,
    image: '/images/services/robotics.png',
    title: 'Robotics & Automation',
    slug: 'robotics-automation',
    subtitle: 'Precision Parts',
    description: 'Durable and lightweight parts optimized for robotics, automation systems, and continuous rigorous operation.',
    features: [
      'Robotic Parts & Automation Components',
      'Replacement & Spare Parts',
    ],
  },
  {
    icon: Box,
    image: '/images/services/cover_education.png',
    title: 'Education & Research',
    slug: 'education-research',
    subtitle: 'Models & Projects',
    description: 'Supporting academic excellence and cutting-edge R&D with precise educational models and detailed student project prototypes.',
    features: [
      'College & Student Project Prototypes',
      'Research & Development Prototypes',
      'Educational Models & Demonstration Parts',
    ],
  },
  {
    icon: Printer,
    image: '/images/services/cover_production.png',
    title: 'Scale & Production',
    slug: 'scale-production',
    subtitle: 'Batch & Custom Orders',
    description: 'From Concept to Production — We Turn Ideas into Functional Products. We scale our manufacturing to seamlessly meet your demands.',
    features: [
      'Batch & Bulk 3D Production',
      'Customized Products & Made-to-Order Parts',
    ],
  },
  {
    icon: Printer,
    image: '/images/services/resin_print.png',
    title: 'Resin Print',
    slug: 'resin-print',
    subtitle: 'Ultra-Detail SLA/MSLA',
    description: 'Achieve injection-mold-level surface quality with our SLA/MSLA resin printing — perfect for miniatures, dental, jewelry, and high-detail prototypes.',
    features: [
      'Ultra-high detail surface finish',
      'Miniatures, figurines & display models',
    ],
  },
]
export default function ServicesPage() {
  useScrollAnimations()

  return (
    <>
      <SEO 
        title="Products & Applications | Shapio 3D Technologies"
        description="Shapio 3D Technologies is an additive manufacturing and product development company offering FDM & SLA 3D printing, bulk production, and rapid prototyping."
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-k-base">
        
        {/* Back button */}
        <div className="absolute top-24 md:top-28 left-6 md:left-12 z-20">
          <Link to="/#footer" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>


        {/* Top tiny label (Centered) */}
        <div className="absolute top-36 md:top-28 left-1/2 -translate-x-1/2 text-xs font-body text-white/50 uppercase tracking-[0.2em] whitespace-nowrap z-20">
          What We Offer
        </div>

        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-6 flex-1 flex flex-col lg:flex-row justify-center lg:justify-between items-center py-32 lg:py-40 gap-12 lg:gap-8">
          
          <div className="w-full lg:w-[60%] xl:w-[65%] relative text-center lg:text-left mt-12 md:mt-0">

            {/* Main Headline */}
            <h1 className="flex flex-col items-center lg:items-start justify-center lg:justify-start text-[11vw] lg:text-[7rem] xl:text-[8rem] font-body font-medium leading-[0.9] text-white tracking-tighter uppercase w-full">
              <span>CUSTOM 3D</span>
              <span>PRODUCTS <span className="font-sub font-light italic lowercase text-[1.1em] tracking-normal text-white">&</span></span>
              <span>APPLICATIONS</span>
            </h1>
          </div>
          
          {/* Right Content */}
          <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col gap-6 text-sm md:text-base text-k-silver-dim font-body font-light leading-relaxed lg:pl-10 lg:border-l border-white/10 text-justify">
            <p>
              <strong className="text-white font-normal">Shapio 3D Technologies</strong> is an additive manufacturing and product development company offering FDM & SLA 3D printing, bulk production, rapid prototyping, engineering and mechanical products, robotic parts, medical applications, and customized manufacturing solutions.
            </p>
            <p>
              We support businesses and industries from idea to final product — step by step, including concept development, 3D modelling, prototyping, testing, manufacturing, and production.
            </p>
          </div>
          
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center opacity-50">
           <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white overflow-visible">
                <path id="curve" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                <text className="text-[7.5px] uppercase tracking-[0.2em] fill-current font-body">
                  <textPath href="#curve" startOffset="0%">
                    SCROLL TO EXPLORE • SCROLL TO EXPLORE • 
                  </textPath>
                </text>
              </svg>
           </div>
           <ArrowDown size={16} className="absolute text-white" />
        </div>
      </section>

      <MaterialVisualization />

      {/* Services detail */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="space-y-20">
          {SERVICES_DETAIL.map((service, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}
            >
              {/* Visual */}
              <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="glass-card glow-border p-2 flex items-center justify-center min-h-[320px] relative overflow-hidden">
                  {/* Geometric pattern */}
                  <div className="absolute inset-0 opacity-10"
                       style={{
                         backgroundImage: 'linear-gradient(rgba(192,192,192,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(192,192,192,0.15) 1px, transparent 1px)',
                         backgroundSize: '30px 30px'
                       }} />
                  <img src={service.image} alt={service.title} className="w-full h-[320px] object-cover rounded-lg relative z-10 opacity-90 hover:opacity-100 transition-opacity duration-300" />
                  {/* Corner accents */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-k-silver/20" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-k-silver/20" />
                </div>
              </div>

              {/* Content */}
              <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-k-card border border-k-border flex items-center justify-center">
                    <service.icon size={20} className="text-k-silver" />
                  </div>
                  <span className="text-xs text-k-silver-dim uppercase tracking-[0.2em] font-sub">{service.subtitle}</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 uppercase">
                  {service.title}
                </h2>
                <p className="text-k-silver-dim font-body leading-relaxed mb-8">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-k-silver">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-2 text-sm font-sub text-white hover:text-emerald-400 transition-colors">
                    Learn More
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding text-center">
        <div className="max-w-2xl mx-auto glass-card p-12">
          <h3 className="font-sub text-2xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-k-silver-dim font-body mb-8">
            Every project is unique. Tell us what you need and we'll create a tailored manufacturing plan.
          </p>
          <Link to="/contact" className="btn-primary">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}

