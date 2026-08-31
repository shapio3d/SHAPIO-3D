import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { Eye, X, RotateCw } from 'lucide-react'
import { supabase } from '../../supabaseClient'

/* ─── Demo 3D object (placeholder until real .glb models) ─── */
function DemoModel({ type = 'torus' }) {
  return (
    <group>
      {type === 'torus' && (
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusKnotGeometry args={[0.8, 0.3, 128, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.15} />
        </mesh>
      )}
      {type === 'cube' && (
        <mesh rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.15} />
        </mesh>
      )}
      {type === 'sphere' && (
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.15} wireframe />
        </mesh>
      )}
      {type === 'cylinder' && (
        <mesh rotation={[0.3, 0, 0.3]}>
          <cylinderGeometry args={[0.6, 0.8, 1.6, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.15} />
        </mesh>
      )}
    </group>
  )
}

/* ─── 3D Model Viewer ─── */
function ModelViewer({ type = 'torus' }) {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -2, -5]} intensity={0.4} color="#888888" />
      <Suspense fallback={null}>
        <DemoModel type={type} />
        <Environment preset="studio" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={6}
          blur={2}
          far={4}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={8}
        autoRotate={true}
        autoRotateSpeed={1.5}
      />
    </Canvas>
  )
}

const PRODUCTS_FALLBACK = [
  { id: 1, name: 'Precision Gear Assembly', material: 'Nylon PA12', price: '₹2,500', type: 'torus', category: 'Mechanical' },
  { id: 2, name: 'Architectural Model', material: 'PLA White', price: '₹4,200', type: 'cube', category: 'Architecture' },
]

export default function Products() {
  const [selected, setSelected] = useState(null)
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      
    if (data && data.length > 0) {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.name,
        material: p.material,
        price: `₹${p.price.toLocaleString('en-IN')}`,
        type: p.type || 'cube',
        category: p.category || 'General'
      })))
    } else {
      setProducts(PRODUCTS_FALLBACK)
    }
  }

  return (
    <section className="section-padding relative" id="products">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">Portfolio</span>
          <h2 className="section-title font-display text-3xl md:text-4xl font-bold mt-3 text-gradient">
            Our Products
          </h2>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto">
            Interactive 3D preview — drag to rotate, scroll to zoom
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="glass-card glow-border overflow-hidden group cursor-pointer"
              onClick={() => setSelected(product)}
            >
              {/* 3D Preview */}
              <div className="h-56 bg-k-dark relative overflow-hidden">
                <ModelViewer type={product.type} />
                {/* Overlay hint */}
                <div className="absolute inset-0 bg-gradient-to-t from-k-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="flex items-center gap-2 text-xs text-k-silver uppercase tracking-wider">
                    <Eye size={14} />
                    Click to expand
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-k-silver-dim uppercase tracking-[0.2em] px-2 py-1 rounded bg-k-border/50">
                    {product.category}
                  </span>
                  <span className="text-sm font-display font-bold text-white">{product.price}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-white mt-3">{product.name}</h3>
                <p className="text-xs text-k-silver-dim mt-1">Material: {product.material}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[80vh] glass-card overflow-hidden">
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-k-card border border-k-border flex items-center justify-center text-k-silver hover:text-white hover:border-k-silver transition-all"
            >
              <X size={18} />
            </button>

            {/* 3D Viewer */}
            <div className="h-full relative">
              <ModelViewer type={selected.type} />
              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-k-black/95 to-transparent p-8">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-k-silver-dim uppercase tracking-[0.2em]">{selected.category}</span>
                    <h3 className="font-display text-2xl font-bold text-white mt-1">{selected.name}</h3>
                    <p className="text-sm text-k-silver-dim mt-1">Material: {selected.material}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-white">{selected.price}</p>
                    <div className="flex items-center gap-1 text-[10px] text-k-silver-dim mt-1 uppercase tracking-wider">
                      <RotateCw size={10} />
                      Drag to rotate · Scroll to zoom
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
