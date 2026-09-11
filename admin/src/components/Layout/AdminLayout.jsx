import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'
import logoUrl from '../../assets/new-logo.png'


export default function AdminLayout({ children }) {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 return (
 <div className="min-h-screen relative text-white overflow-hidden">



 {/* Mobile Header */}
 <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0f0d]/60 backdrop-blur-2xl border-b border-white/10 z-30 flex items-center px-4 justify-between">
 <div className="flex items-center gap-2">
  <img src={logoUrl} alt="Shapio Logo" className="h-7 w-auto object-contain drop-shadow-lg" />
  <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="font-bold text-base tracking-widest text-white">
   SHAPIO<span className="text-emerald-400"> 3D</span>
  </span>
 </div>
 <button 
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="p-2 text-white hover:text-white transition-colors"
 >
 {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
 </button>
 </div>

 <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
 
 {/* Main content area — offset by sidebar width on desktop, padding top on mobile */}
 <main className="md:ml-[260px] min-h-screen transition-all duration-300 pt-16 md:pt-0">
 <div className="p-4 md:p-8 md:pt-8">
 {children}
 </div>
 </main>

 {/* Mobile Overlay */}
 {mobileMenuOpen && (
 <div 
 className="fixed inset-0 bg-black/60 z-30 md:hidden "
 onClick={() => setMobileMenuOpen(false)}
 />
 )}
 </div>
 )
}
