import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsent')
    if (!hasConsented) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-k-card border border-k-border p-6 rounded-xl shadow-2xl z-[9999] animate-slide-up flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <h4 className="font-display font-bold text-white text-lg">We value your privacy</h4>
        <button onClick={() => setIsVisible(false)} className="text-k-silver hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <p className="text-sm text-k-silver-dim font-body">
        We use cookies to analyze site traffic, personalize content, and provide you with a better experience. By continuing to use this site, you consent to our use of cookies.
      </p>
      <div className="flex gap-3 mt-2">
        <button onClick={handleAccept} className="btn-primary flex-1 justify-center py-2 text-sm">
          Accept All
        </button>
        <button onClick={() => setIsVisible(false)} className="btn-outline flex-1 justify-center py-2 text-sm">
          Decline
        </button>
      </div>
    </div>
  )
}
