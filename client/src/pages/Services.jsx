import { useScrollAnimations } from '../hooks/useScrollAnimations'
import { Printer, Wrench, Layers, ArrowRight, CheckCircle, Cpu, Settings, Box, Lightbulb, Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO/SEO'

const SERVICES_DETAIL = [
  {
    icon: Wrench,
    image: '/engineering_hero_1788213540020.png',
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
    image: '/prototyping_hero_1788213591197.png',
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
    image: '/mechanical_hero_1788213643670.png',
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
    image: '/electronics_hero_1788213704809.png',
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
    image: '/images/services/tooling.png',
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
    image: '/images/services/education.png',
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
    image: '/images/services/production.png',
    title: 'Scale & Production',
    slug: 'scale-production',
    subtitle: 'Batch & Custom Orders',
    description: 'From Concept to Production — We Turn Ideas into Functional Products. We scale our manufacturing to seamlessly meet your demands.',
    features: [
      'Batch & Bulk 3D Production',
      'Customized Products & Made-to-Order Parts',
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
      <div className="pt-32">
        <div className="max-w-4xl mx-auto px-6 mb-8 text-left">
          <Link to="/#footer" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        {/* Hero */}
      <section className="section-padding text-center pt-0">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">What We Offer</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 text-gradient">
            Products & Applications
          </h1>
          <div className="mt-8 space-y-4 text-lg text-k-silver-dim font-body font-light leading-relaxed text-center">
            <p className="text-white text-xl mb-8">
              We design and manufacture custom 3D-printed products and functional components for a wide range of industries and applications.
            </p>
            <p className="text-left text-base">
              <strong className="text-white font-normal">Shapio 3D Technologies</strong> is an additive manufacturing and product development company offering FDM & SLA 3D printing, bulk production, rapid prototyping, engineering and mechanical products, robotic parts, medical applications, and customized manufacturing solutions.
            </p>
            <p className="text-left text-base">
              We support businesses and industries from idea to final product — step by step, including concept development, 3D modelling, prototyping, testing, manufacturing, and production.
            </p>
          </div>
        </div>
      </section>

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
                  <span className="text-xs text-k-silver-dim uppercase tracking-[0.2em] font-display">{service.subtitle}</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
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
                  <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-2 text-sm font-display text-white hover:text-emerald-400 transition-colors">
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
          <h3 className="font-display text-2xl font-bold text-white mb-4">
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
      </div>
    </>
  )
}
