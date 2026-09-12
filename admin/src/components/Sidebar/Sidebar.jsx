import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
 LayoutDashboard, Users, FileText, FilePlus, Package,
 Settings, LogOut, MessageSquare, Search, Sparkles
} from 'lucide-react'
import logoUrl from '../../assets/new-logo.png'

const ALL_ITEMS = [
 { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
 { label: 'Customers', path: '/customers', icon: Users },
 { label: 'Invoices', path: '/invoices', icon: FileText },
 { label: 'Quotations', path: '/quotations', icon: FilePlus },
 { label: 'Submissions', path: '/submissions', icon: MessageSquare },
 { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
 const { logout, admin } = useAuth()
 const location = useLocation()

 return (
 <aside
 className={`fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-300 z-40 w-[260px]
 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
 `}
 >
 {/* Logo */}
 <div className="h-16 flex items-center justify-start shrink-0 px-6 mt-4">
 <div className="flex items-center gap-3">
   <img src={logoUrl} alt="Shapio Logo" className="h-8 w-auto object-contain drop-shadow-lg shrink-0" />
   <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="font-bold text-xl tracking-widest text-white">
    SHAPIO<span className="text-emerald-400"> 3D</span>
    </span>
 </div>
 </div>

 {/* Navigation */}
 <nav className="flex-1 py-2 px-3 overflow-y-auto custom-scrollbar flex flex-col">
 

 <div className="space-y-1 mt-2">
 {ALL_ITEMS.map((item) => {
 const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard')
 return (
 <NavLink
 key={item.path}
 to={item.path}
 onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
 className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
 isActive
 ? 'bg-[#0a0a0a] border border-white/5 text-white'
 : 'text-[#829087] hover:text-white hover:bg-white/5'
 }`}
 >
 <div className="flex items-center gap-4">
 <item.icon
 size={20}
 className={`shrink-0 transition-colors ${
 isActive ? 'text-white' : 'text-[#829087] group-hover:text-white'
 }`}
 />
 <span className="font-medium text-[15px]">{item.label}</span>
 </div>
 {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white mr-1 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
 </NavLink>
 )
 })}
 </div>
 </nav>

 {/* Bottom Section */}
 <div className="shrink-0 p-4 flex flex-col gap-2">

 {/* Profile Block */}
 <div className="px-4 py-3.5 bg-[#0a1a12] border border-white/5 rounded-xl flex items-center">
 <span className="text-[#7d8c83] text-sm font-medium">Logged in as</span>
 {admin?.username && <span className="text-white text-sm ml-2 font-medium">{admin.username}</span>}
 </div>
 
 <button onClick={logout} className="flex items-center gap-4 px-4 py-3 text-[#829087] hover:text-white transition-colors w-full">
 <LogOut size={20} />
 <span className="font-medium text-[15px]">Logout</span>
 </button>
 </div>
 </aside>
 )
}
