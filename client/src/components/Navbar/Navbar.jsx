import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

import logoUrl from '../../assets/logo.png'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Track', path: '/track' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-black/30 backdrop-blur-2xl border-b border-transparent shadow-xl shadow-black/30'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        
        {/* Left: Image Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-16 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Center: Desktop nav links in a pill */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 shadow-lg">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-5 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-300 rounded-full ${location.pathname === link.path
                  ? 'text-white bg-white/10'
                  : 'text-k-silver-dim hover:text-white hover:bg-white/5'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Text Logo */}
        <Link to="/" className="hidden md:flex items-center group">
          <span className="font-display font-bold text-2xl tracking-widest text-white transition-opacity group-hover:opacity-80">
            SHAPIO<span className="text-white/50"> 3D</span>
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-k-silver hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-0 left-0 right-0 flex flex-col gap-4 pt-24 pb-6 px-6 bg-k-dark border-b border-k-border transition-all duration-400 overflow-hidden shadow-2xl shadow-black ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-3 rounded-lg text-sm font-medium tracking-wide uppercase transition-all ${location.pathname === link.path
                  ? 'text-white bg-white/5'
                  : 'text-k-silver-dim hover:text-white hover:bg-white/5'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
