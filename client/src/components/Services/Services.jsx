import { Printer, Wrench, Palette, Layers } from 'lucide-react'

const SERVICES = [
  {
    icon: Printer,
    title: '3D Printing',
    description: 'High-precision FDM, SLA, and SLS printing for prototypes and production-ready parts. Multiple materials and finishes available.',
    features: ['FDM / SLA / SLS', 'Tolerances to 0.1mm', 'Batch production'],
  },
  {
    icon: Wrench,
    title: 'Repair & Rebuild',
    description: 'Restore broken components, reverse-engineer discontinued parts, and rebuild damaged assemblies with precision scanning.',
    features: ['Reverse engineering', '3D scanning', 'Part restoration'],
  },
  {
    icon: Palette,
    title: 'Design Service',
    description: 'From napkin sketches to production-ready CAD. Our designers transform your ideas into optimized, printable 3D models.',
    features: ['CAD modeling', 'Design optimization', 'File preparation'],
  },
  {
    icon: Layers,
    title: 'Materials',
    description: 'PLA, ABS, PETG, Nylon, TPU, Resin, and specialty filaments. Choose the right material for strength, flexibility, or aesthetics.',
    features: ['50+ materials', 'Custom colors', 'Technical specs'],
  },
]

export default function Services() {
  return (
    <section className="services-section section-padding relative" id="services">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">What We Do</span>
          <h2 className="section-title font-display text-3xl md:text-4xl font-bold mt-3 text-gradient">
            Our Services
          </h2>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto">
            End-to-end additive manufacturing solutions — from design to delivery
          </p>
        </div>

        {/* Service cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <div
              key={i}
              className="service-card glass-card glow-border p-8 flex flex-col group cursor-pointer"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-k-card to-k-border flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <service.icon size={28} className="text-k-silver" />
              </div>

              {/* Title */}
              <h3 className="font-display text-lg font-semibold text-white mb-3 tracking-wide">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-k-silver-dim font-body leading-relaxed mb-6 flex-1">
                {service.description}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2">
                {service.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-k-silver">
                    <span className="w-1 h-1 rounded-full bg-k-silver" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
