import { useScrollAnimations } from '../hooks/useScrollAnimations'
import ContactSection from '../components/Contact/Contact'
import SEO from '../components/SEO/SEO'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
export default function ContactPage() {
  useScrollAnimations()

  return (
    <>
      <SEO 
        title="Contact Us | Shapio 3D Technologies"
        description="Get in touch with Shapio 3D Technologies. Request a custom quote, technical consultation, or visit our Hyderabad facility."
      />
      <div className="pt-32">
        <div className="max-w-6xl mx-auto px-6 mb-2">
          <Link to="/#footer" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="-mt-16">
          <ContactSection />
        </div>
      </div>
    </>
  )
}
