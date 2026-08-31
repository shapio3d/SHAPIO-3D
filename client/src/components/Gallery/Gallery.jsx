import { useState } from 'react'
import { X } from 'lucide-react'

const GALLERY_ITEMS = [
  { id: 1, title: 'Precision Gear Set', category: 'Mechanical', color: '#1a1a2e', image: '/images/gallery/gear.png' },
  { id: 2, title: 'Architectural Scale Model', category: 'Architecture', color: '#16213e', image: '/images/gallery/architecture.png' },
  { id: 3, title: 'Custom Robot Parts', category: 'Robotics', color: '#0f3460', image: '/images/gallery/robotics.png' },
  { id: 4, title: 'Medical Prosthetic', category: 'Healthcare', color: '#1a1a2e', image: '/images/gallery/medical.png' },
  { id: 5, title: 'Drone Frame', category: 'Aerospace', color: '#16213e', image: '/images/gallery/drone.png' },
  { id: 6, title: 'Art Installation Piece', category: 'Art', color: '#0f3460', image: '/images/gallery/art.png' },
  { id: 7, title: 'Electronics Enclosure', category: 'Electronics', color: '#1a1a2e', image: '/images/gallery/enclosure.png' },
  { id: 8, title: 'Automotive Prototype', category: 'Automotive', color: '#16213e', image: '/images/gallery/automotive.png' },
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)

  return (
    <section className="section-padding relative" id="gallery">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">Showcase</span>
          <h2 className="section-title font-display text-3xl md:text-4xl font-bold mt-3 text-gradient">
            Our Work
          </h2>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto">
            A glimpse into our precision-crafted 3D printed projects
          </p>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              className={`break-inside-avoid glass-card glow-border overflow-hidden cursor-pointer group ${
                i % 3 === 0 ? 'h-72' : i % 3 === 1 ? 'h-56' : 'h-64'
              }`}
            >
              {/* Image with geometric design fallback */}
              <div className="w-full h-full relative flex items-center justify-center"
                   style={{ background: `linear-gradient(135deg, ${item.color}, #0a0a0a)` }}>
                {/* Image */}
                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-20"
                     style={{
                       backgroundImage: 'linear-gradient(rgba(192,192,192,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,192,192,0.1) 1px, transparent 1px)',
                       backgroundSize: '20px 20px'
                     }} />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                  <span className="text-[10px] text-k-silver-dim uppercase tracking-[0.2em]">{item.category}</span>
                  <h4 className="font-display text-sm font-semibold text-white mt-1">{item.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl w-full glass-card p-8 text-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-k-border flex items-center justify-center text-k-silver hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-full h-64 md:h-96 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden"
                 style={{ background: `linear-gradient(135deg, ${lightbox.color}, #0a0a0a)` }}>
              <img src={lightbox.image} alt={lightbox.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <span className="text-xs text-k-silver-dim uppercase tracking-[0.2em]">{lightbox.category}</span>
            <h3 className="font-display text-xl font-bold text-white mt-2">{lightbox.title}</h3>
            <p className="text-sm text-k-silver-dim mt-3 font-body">
              Precision-crafted using advanced additive manufacturing techniques with premium materials.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
