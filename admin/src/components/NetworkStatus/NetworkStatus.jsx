import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showRestored) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 shadow-2xl`}>
      {!isOnline ? (
        <div className="flex items-center gap-3 bg-red-500/90 backdrop-blur-md text-white px-5 py-3 rounded-full border border-red-400/30">
          <WifiOff size={16} />
          <p className="text-sm font-semibold tracking-wide">You are offline. Please check your internet connection.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-500/90 backdrop-blur-md text-white px-5 py-3 rounded-full border border-emerald-400/30 animate-pulse">
          <Wifi size={16} />
          <p className="text-sm font-semibold tracking-wide">Connection restored.</p>
        </div>
      )}
    </div>
  )
}
