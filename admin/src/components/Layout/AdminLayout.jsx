import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'
import logoUrl from '../../assets/new-logo.png'


export default function AdminLayout({ children }) {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 return (
 <div className="min-h-screen relative text-gray-900 overflow-hidden bg-[#f8f9fa]">

 {/* Mobile Header */}
 <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4 justify-between shadow-sm">
 <div className="flex items-center gap-2">
  <img src={logoUrl} alt="Shapio Logo" className="h-7 w-auto object-contain" />
  <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="font-bold text-base tracking-widest text-gray-900">
   SHAPIO<span className="text-emerald-600"> 3D</span>
  </span>
 </div>
 <button 
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
 >
 {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
 </button>
 </div>

 <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
 
 {/* Main content area */}
 <main className="md:ml-[260px] min-h-screen transition-all duration-300 pt-16 md:pt-0 bg-[#f8f9fa]">
 <div className="p-4 md:p-8 md:pt-8">
 {children}
 </div>
 </main>

 {/* Mobile Overlay */}
 {mobileMenuOpen && (
 <div 
 className="fixed inset-0 bg-black/40 z-30 md:hidden"
 onClick={() => setMobileMenuOpen(false)}
 />
 )}
 </div>
 )
}
