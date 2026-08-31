import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'
import logoUrl from '../../assets/shapio-logo.png'

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative text-white overflow-hidden">
      {/* Floating Logo Top Right */}
      <div className="absolute top-6 right-8 z-50 pointer-events-none hidden md:block">
        <img src={logoUrl} alt="Shapio Logo" className="h-16 w-auto object-contain opacity-90" />
      </div>

      {/* Glowing background */}
      <div className="glow-bg">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 z-30 flex items-center px-4 justify-between">
        <span className="font-display font-bold text-sm tracking-wider text-white">
          SHAPIO<span className="text-k-silver"> 3D</span> <span className="text-xs text-k-silver-dim ml-2 font-body font-normal">ADMIN</span>
        </span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-k-silver hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Main content area — offset by sidebar width on desktop, padding top on mobile */}
      <main className="md:ml-[260px] min-h-screen transition-all duration-300 pt-16 md:pt-0">
        <div className="p-4 md:p-8 md:pt-28">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
