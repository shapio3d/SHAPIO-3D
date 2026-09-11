import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import logoUrl from '../assets/logo.png'

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
 <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#06150D]">

  {/* Login card */}
  <div className="relative z-10 w-full max-w-md mx-4">
  <div className="bg-[#0a0f0d]/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-10 shadow-2xl shadow-black/50">
  {/* Logo */}
  <div className="flex flex-col items-center mb-10">
  <div className="w-20 h-20 flex items-center justify-center mb-4">
  <img src={logoUrl} alt="Shapio 3D" className="w-full h-full object-contain drop-shadow-xl" />
  </div>
  <h1 style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-2xl tracking-widest uppercase font-bold">
  <span className="text-white">SHAPIO </span>
  <span className="text-emerald-400">3D</span>
  </h1>
  <p className="text-[11px] font-sub text-white/70 mt-2 uppercase tracking-[0.3em]">Admin Portal</p>
  </div>

  {/* Form */}
  <form onSubmit={handleSubmit} className="space-y-5">
  {/* Email */}
  <div>
  <label className="block text-[11px] font-sub text-white/70 uppercase tracking-widest mb-1.5">
  Email
  </label>
  <input
  type="email"
  id="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-lg px-4 py-3 text-sm font-body text-white placeholder-white/40 focus:outline-none focus:border-k-silver/40 transition-colors"
  placeholder="Enter email"
  />
  </div>

  {/* Password */}
  <div>
  <label className="block text-[11px] font-sub text-white/70 uppercase tracking-widest mb-1.5">
  Password
  </label>
  <div className="relative">
  <input
  type={showPassword ? 'text' : 'password'}
  id="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm font-body text-white placeholder-white/40 focus:outline-none focus:border-k-silver/40 transition-colors"
  placeholder="Enter password"
  />
  <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
  >
  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
  </div>
  </div>

  {/* Error */}
  {error && (
 <div className="px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-sm text-red-400">
 {error}
 </div>
 )}

  {/* Submit */}
  <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-white to-k-silver hover:shadow-lg hover:shadow-white/10 text-k-black font-sub font-semibold tracking-wide py-3 rounded-xl transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  >
 {loading ? (
 <span className="flex items-center justify-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-k-black animate-pulse" />
 <span className="w-1.5 h-1.5 rounded-full bg-k-black animate-pulse" style={{ animationDelay: '0.2s' }} />
 <span className="w-1.5 h-1.5 rounded-full bg-k-black animate-pulse" style={{ animationDelay: '0.4s' }} />
 </span>
 ) : (
 'Login'
 )}
 </button>
 </form>

 {/* Demo hint */}
 <p className="text-center text-[11px] text-white mt-6">
 Login with your registered email
 </p>
 </div>
 </div>
 </div>
 )
}
