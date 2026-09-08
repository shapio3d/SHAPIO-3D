import { Link } from 'react-router-dom'
import { Printer, Globe, Share2, Link2, Mail, ArrowUpRight, Phone, Clock, ShieldCheck, CreditCard, MapPin } from 'lucide-react'

const InstagramIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const WhatsAppIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
)

const FOOTER_LINKS = [
  {
    title: 'Services',
    links: [
      { label: 'Engineering & Industrial', path: '/services/engineering-industrial' },
      { label: 'Rapid Prototyping', path: '/services/rapid-prototyping' },
      { label: 'Mechanical & Assembly', path: '/services/mechanical-assembly' },
      { label: 'Electronics & IoT', path: '/services/electronics-iot' },
      { label: 'Tooling & Molding', path: '/services/tooling-molding' },
      { label: 'Robotics & Automation', path: '/services/robotics-automation' },
      { label: 'Education & Research', path: '/services/education-research' },
      { label: 'Scale & Production', path: '/services/scale-production' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/#hero' },
      { label: 'Our Work', path: '/#gallery' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact', path: '/contact' },
    ],
  }
]

export default function Footer() {
  return (
    <footer id="footer" className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-3xl pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Trust Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-white/10 mb-12">
          <div className="flex items-center gap-4">
            <ShieldCheck size={32} className="text-emerald-400" />
            <div>
              <h4 className="text-white font-display font-semibold">100% Quality Guarantee</h4>
              <p className="text-sm text-k-silver-dim">Precision prints, delivered on time.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-k-silver-dim">
            <span className="text-sm font-semibold uppercase tracking-wider">Accepted Payments:</span>
            <div className="flex items-center gap-2">
              <CreditCard size={24} />
              <span className="text-sm font-semibold">UPI</span>
              <span className="text-sm font-semibold">Cards</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Brand & Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-k-silver flex items-center justify-center">
                <Printer size={22} className="text-k-black" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-k-white">
                SHAPIO <span className="text-emerald-400">3D</span>
              </span>
            </Link>
            <p className="text-sm text-k-silver-dim font-body leading-relaxed max-w-xs mb-8">
              Premium 3D printing services for prototypes, production parts, and custom manufacturing solutions in India.
            </p>
            
            <div className="space-y-4">
              <a href="tel:+916384014546" className="flex items-center gap-3 text-k-silver-dim hover:text-emerald-400 transition-colors group">
                <Phone size={16} className="group-hover:text-emerald-400" />
                <span className="text-sm">+91 63840 14546</span>
              </a>
              <a href="mailto:shapio3dtech@gmail.com" className="flex items-center gap-3 text-k-silver-dim hover:text-emerald-400 transition-colors group">
                <Mail size={16} className="group-hover:text-emerald-400" />
                <span className="text-sm">shapio3dtech@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-k-silver-dim group pt-1">
                <MapPin size={16} className="shrink-0 mt-1 group-hover:text-emerald-400 transition-colors" />
                <span className="text-sm leading-relaxed">
                  No.216 Ammanambakkam Street,<br />
                  Indranagar, Chengalpattu,<br />
                  Tamil Nadu 603002
                </span>
              </div>
              <div className="flex items-start gap-3 text-k-silver-dim pt-2">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white mb-1">Business Hours:</p>
                  <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-xs font-semibold text-white uppercase tracking-[0.2em] mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-k-silver-dim hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Legal */}
            <div>
              <h4 className="font-display text-xs font-semibold text-white uppercase tracking-[0.2em] mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                <li><Link to="/privacy-policy" className="text-sm text-k-silver-dim hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-k-silver-dim hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/terms#shipping-returns" className="text-sm text-k-silver-dim hover:text-white transition-colors">Shipping & Returns</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-k-silver-dim">
            © {new Date().getFullYear()} SHAPIO 3D TECHNOLOGIES. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/shapio3d/" target="_blank" rel="noopener noreferrer" className="text-k-silver-dim hover:text-white transition-colors" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href="https://wa.me/916384014546" target="_blank" rel="noopener noreferrer" className="text-k-silver-dim hover:text-white transition-colors" aria-label="WhatsApp">
              <WhatsAppIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

