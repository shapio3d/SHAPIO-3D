import { Link } from 'react-router-dom'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/50">
          <AlertTriangle size={36} className="text-k-silver" />
        </div>
        
        <h1 className="font-display font-bold text-6xl text-white mb-4 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-k-silver-dim mb-8 text-sm leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Please check the URL or navigate back to safety.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => window.history.back()} className="px-5 py-2.5 rounded-xl border border-white/10 text-k-silver text-sm font-medium hover:bg-white/[0.04] transition-colors flex items-center gap-2">
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link to="/dashboard" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-white to-k-silver text-k-black text-sm font-semibold hover:shadow-lg hover:shadow-white/10 transition-all flex items-center gap-2">
            <Home size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
