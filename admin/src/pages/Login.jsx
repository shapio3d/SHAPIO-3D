import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import logoUrl from '../assets/new-logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      if (res && res.error) {
        setError(res.error)
      }
    } catch (err) {
      setError('Wrong email or password, please try again')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8f9fa] text-gray-900 px-4 py-12">
      {/* Subtle background ambient glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50">
          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <img src={logoUrl} alt="Shapio 3D" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <h1 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-2xl tracking-widest uppercase font-bold text-gray-900">
              SHAPIO <span className="text-emerald-500">3D</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 mt-1.5 uppercase tracking-[0.25em]">
              Admin Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-12 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold tracking-wide py-3.5 rounded-xl shadow-sm hover:shadow transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Login with your registered administrator account
          </p>
        </div>
      </div>
    </div>
  )
}
