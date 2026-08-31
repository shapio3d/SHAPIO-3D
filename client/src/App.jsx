import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Products from './pages/Products'
import Contact from './pages/Contact'
import TrackProcess from './pages/TrackProcess'
import CookieBanner from './components/CookieBanner/CookieBanner'
import ScrollToTop from './components/ScrollToTop'
import FAQ from './pages/FAQ'
import Terms from './pages/Terms'

export default function App() {
  return (
    <>
      {/* Accessibility skip link */}
      <a 
        href="#main-content" 
        className="absolute top-[-999px] left-4 z-[9999] bg-emerald-500 text-white px-4 py-2 font-bold focus:top-4 transition-all rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      {/* Glowing background */}
      <div className="glow-bg">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
      </div>

      <ScrollToTop />

      {/* Navigation */}
      <Navbar />

      {/* Page routes */}
      <main id="main-content" className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track" element={<TrackProcess />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals/Banners */}
      <CookieBanner />

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-k-dark/90 backdrop-blur-md border-t border-k-border z-[9900]">
        <a href="/contact" className="btn-primary w-full justify-center text-center">
          Get a Free Quote
        </a>
      </div>
    </>
  )
}
