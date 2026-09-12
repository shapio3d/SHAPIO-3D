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
 className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 w-[260px]
 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
 `}
 >
 {/* Logo */}
 <div className="h-16 flex items-center justify-start shrink-0 px-6 mt-4">
 <div className="flex items-center gap-3">
   <img src={logoUrl} alt="Shapio Logo" className="h-8 w-auto object-contain drop-shadow-lg shrink-0" />
   <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="font-bold text-xl tracking-widest text-gray-900">
    SHAPIO<span className="text-emerald-500"> 3D</span>
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
 ? 'bg-blue-50 border border-blue-100 text-blue-700'
 : 'text-slate-500 hover:text-gray-900 hover:bg-gray-50'
 }`}
 >
 <div className="flex items-center gap-4">
 <item.icon
 size={20}
 className={`shrink-0 transition-colors ${
 isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-gray-700'
 }`}
 />
 <span className="font-semibold text-[15px]">{item.label}</span>
 </div>
 {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1" />}
 </NavLink>
 )
 })}
 </div>
 </nav>

 {/* Bottom Section */}
 <div className="shrink-0 p-4 flex flex-col gap-2 border-t border-gray-100">

 {/* Profile Block */}
 <div className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center">
 <span className="text-slate-500 text-sm font-medium">Logged in as</span>
 {admin?.username && <span className="text-gray-900 text-sm ml-2 font-semibold">{admin.username}</span>}
 </div>
 
 <button onClick={logout} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full">
 <LogOut size={20} />
 <span className="font-semibold text-[15px]">Logout</span>
 </button>
 </div>
 </aside>
 )
}
