import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, FileText, FilePlus, Package,
  Settings, LogOut, Printer, ChevronLeft, ChevronRight, Activity, MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import logoUrl from '../../assets/logo.png'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Invoices', path: '/invoices', icon: FileText },
  { label: 'Quotations', path: '/quotations', icon: FilePlus },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Submissions', path: '/submissions', icon: MessageSquare },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, admin } = useAuth()
  const location = useLocation()

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 z-40 
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-white/10 shrink-0 px-6">
        {!collapsed && (
          <span className="font-display font-bold text-xl tracking-wider text-white">
            SHAPIO<span className="text-k-silver"> 3D</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/[0.07] text-white'
                    : 'text-k-silver-dim hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <item.icon
                  size={20}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-k-silver-dim group-hover:text-k-silver'
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* User / Collapse */}
      <div className="shrink-0 p-3 border-t border-white/10 flex flex-col gap-2">
        {/* User info */}
        {!collapsed && admin && (
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/5">
            <p className="text-xs text-k-silver-dim">Logged in as</p>
            <p className="text-sm font-medium text-white">{admin.username}</p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-k-silver-dim hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-full py-2 rounded-lg text-k-silver-dim hover:text-white hover:bg-white/[0.04] transition-all"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
