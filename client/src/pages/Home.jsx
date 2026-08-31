import { useScrollAnimations } from '../hooks/useScrollAnimations'
import Hero from '../components/Hero/Hero'
import HowItWorks from '../components/HowItWorks/HowItWorks'
import Products from '../components/Products/Products'
import Gallery from '../components/Gallery/Gallery'
import Testimonials from '../components/Testimonials/Testimonials'
import ContactSection from '../components/Contact/Contact'
import CTA from '../components/CTA/CTA'
import SEO from '../components/SEO/SEO'

export default function Home() {
  useScrollAnimations()

  return (
    <div className="relative">
      <SEO 
        title="Premium 3D Printing & Additive Manufacturing"
        description="Shapio 3D Technologies provides professional FDM, SLA, and SLS 3D printing services. Fast turnaround, high precision, and custom prototyping."
      />
      <Hero />
      <HowItWorks />
      <Products />
      <Gallery />
      <Testimonials />
      <CTA />
      <ContactSection />
    </div>
  )
}
