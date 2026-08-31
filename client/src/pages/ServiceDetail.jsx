import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useScrollAnimations } from '../hooks/useScrollAnimations'
import SEO from '../components/SEO/SEO'

const SERVICE_DATA = {
  'engineering-industrial': {
    title: 'Engineering & Industrial',
    subtitle: 'Custom Machine Parts',
    description: 'We design and manufacture robust engineering and industrial components tailored to your exact specifications for heavy-duty performance.',
    longDescription: 'Our industrial-grade 3D printing services produce high-strength, dimensionally accurate components designed for demanding environments. From custom machine parts to heavy-duty industrial components, we utilize advanced materials that can withstand rigorous operational stress, heat, and chemical exposure.',
    features: [
      'Engineering & Industrial Components',
      'Custom Machine Parts',
      'Custom Industrial Parts',
      'High strength and durability'
    ],
    materials: ['Carbon-fiber composites', 'Nylon PA12', 'Polycarbonate (PC)', 'ABS'],
    image: '/images/services/engineering.png'
  },
  'rapid-prototyping': {
    title: 'Rapid Prototyping',
    subtitle: 'Functional & Development',
    description: 'Accelerate your product development cycle with our high-fidelity rapid prototyping services, from automotive to consumer goods.',
    longDescription: 'Bring your ideas to life quickly and efficiently. Our rapid prototyping services allow you to test form, fit, and function before committing to expensive tooling. We cater to various industries, providing highly accurate and functional prototypes that accelerate your product development cycle.',
    features: [
      'Functional Prototypes',
      'Product Development Prototypes',
      'Automotive Prototype Components',
      'Fast turnaround times'
    ],
    materials: ['PLA', 'Standard Resin', 'ABS', 'PETG'],
    image: '/images/services/prototyping.png'
  },
  'mechanical-assembly': {
    title: 'Mechanical & Assembly',
    subtitle: 'Fixtures & Supports',
    description: 'Precision-engineered mechanical parts and assembly aids designed for flawless integration and performance on the factory floor.',
    longDescription: 'Optimize your manufacturing floor with custom-designed mechanical components and assembly aids. We produce highly accurate jigs, fixtures, mounts, and supports that improve workflow efficiency, reduce assembly errors, and ensure flawless integration into your existing systems.',
    features: [
      'Mechanical Components & Parts',
      'Jigs, Fixtures & Assembly Aids',
      'Brackets, Mounts & Supports',
      'Precision tolerances'
    ],
    materials: ['Tough Resin', 'PETG', 'Nylon', 'TPU (for grips)'],
    image: '/images/services/mechanical.png'
  },
  'electronics-iot': {
    title: 'Electronics & IoT',
    subtitle: 'Enclosures & Housings',
    description: 'Custom protective housings and enclosures tailored specifically for PCBs, delicate electronics, and connected IoT devices.',
    longDescription: 'Protect your delicate electronics and PCBs with custom-designed enclosures. Our 3D printed housings are tailored to your exact specifications, offering precise cutouts for ports, buttons, and displays, along with optimized ventilation and structural integrity for IoT devices and consumer electronics.',
    features: [
      'PCB & Electronics Enclosures',
      'Device Housings & Protective Enclosures',
      'Electronics & IoT Enclosures',
      'Snap-fit and screw-assembly designs'
    ],
    materials: ['ABS', 'PETG', 'Flame Retardant Resin', 'PLA'],
    image: '/images/services/electronics.png'
  },
  'tooling-molding': {
    title: 'Tooling & Molding',
    subtitle: 'Patterns & Master Models',
    description: 'High-accuracy mold patterns and master models for casting and specialized manufacturing processes.',
    longDescription: 'Bridge the gap between digital design and traditional manufacturing. We produce highly accurate mold patterns, master models, and tooling components. Our 3D printed patterns offer exceptional surface finish and dimensional stability, perfectly suited for casting and molding processes.',
    features: [
      'Mold Patterns & Mould Components',
      'Casting Patterns & Master Models',
      'Exceptional surface finish',
      'Complex geometries without draft angles'
    ],
    materials: ['Castable Wax Resin', 'High-Temp Resin', 'SLA Standard Resin'],
    image: '/images/services/tooling.png'
  },
  'robotics-automation': {
    title: 'Robotics & Automation',
    subtitle: 'Precision Parts',
    description: 'Durable and lightweight parts optimized for robotics, automation systems, and continuous rigorous operation.',
    longDescription: 'Elevate your automation systems with lightweight, durable 3D printed components. We manufacture custom robotic parts, end-of-arm tooling, and replacement components engineered for continuous operation, reducing weight and improving the speed and efficiency of your robotic assemblies.',
    features: [
      'Robotic Parts & Automation Components',
      'Replacement & Spare Parts',
      'End-of-arm tooling (EOAT)',
      'Lightweight and high-strength'
    ],
    materials: ['Carbon-fiber Nylon', 'TPU', 'Polycarbonate', 'ABS'],
    image: '/images/services/robotics.png'
  },
  'education-research': {
    title: 'Education & Research',
    subtitle: 'Models & Projects',
    description: 'Supporting academic excellence and cutting-edge R&D with precise educational models and detailed student project prototypes.',
    longDescription: 'Empowering the next generation of innovators and researchers. We provide precision 3D printing services for academic projects, R&D departments, and educational institutions. From complex demonstration models to functional prototypes for student projects, we help turn theoretical concepts into tangible reality.',
    features: [
      'College & Student Project Prototypes',
      'Research & Development Prototypes',
      'Educational Models & Demonstration Parts',
      'Cost-effective educational pricing'
    ],
    materials: ['PLA', 'PETG', 'Standard Resin', 'Multi-color printing'],
    image: '/images/services/education.png'
  },
  'scale-production': {
    title: 'Scale & Production',
    subtitle: 'Batch & Custom Orders',
    description: 'From Concept to Production — We Turn Ideas into Functional Products. We scale our manufacturing to seamlessly meet your demands.',
    longDescription: 'Scale your manufacturing without the massive upfront costs of traditional tooling. Our print farm is equipped for batch and bulk 3D production, providing a seamless transition from prototype to final product. Whether you need a small batch of custom parts or large-scale made-to-order manufacturing, we deliver on time and on spec.',
    features: [
      'Batch & Bulk 3D Production',
      'Customized Products & Made-to-Order Parts',
      'No minimum order quantities',
      'Rapid scaling capabilities'
    ],
    materials: ['Industrial SLA Resin', 'Nylon PA12 (SLS)', 'ABS', 'PETG'],
    image: '/images/services/production.png'
  }
}

export default function ServiceDetail() {
  useScrollAnimations()
  const { slug } = useParams()
  
  const service = SERVICE_DATA[slug]

  if (!service) {
    return <Navigate to="/404" />
  }

  return (
    <>
      <SEO 
        title={`${service.title} Services`}
        description={service.description}
      />
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        
        <Link to="/services" className="inline-flex items-center gap-2 text-k-silver-dim hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Content */}
          <div>
            <span className="text-xs font-display text-k-silver-dim uppercase tracking-[0.2em]">{service.subtitle}</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6 text-white">
              {service.title}
            </h1>
            <p className="text-lg text-k-silver leading-relaxed mb-10">
              {service.longDescription}
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-4 border-b border-k-border pb-2">Key Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-k-silver">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-white mb-4 border-b border-k-border pb-2">Available Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {service.materials.map((mat, i) => (
                    <span key={i} className="px-3 py-1 bg-k-card border border-k-border rounded-full text-xs text-k-silver font-display">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Link to="/contact" className="btn-primary">
                Get a Quote
              </Link>
            </div>
          </div>

          {/* Image */}
          <div>
            <div className="glass-card glow-border overflow-hidden h-full min-h-[400px]">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
