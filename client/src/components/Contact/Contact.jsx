import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Send, User, Mail, Phone, MessageSquare, Upload, CheckCircle, Printer, ArrowRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [file, setFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [trackingId, setTrackingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (file && file.size > 10 * 1024 * 1024) {
      setError('Please choose a file smaller than 10 MB.')
      return
    }
    setLoading(true)
    setError(null)
    // Instead of direct Supabase upload/insert, send everything to the Express backend via FormData
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('phone', form.phone)
    formData.append('message', form.message)
    if (file) {
      formData.append('file', file)
    }

    try {
      const { data } = await axios.post(`${API_URL}/contact`, formData, {
        timeout: 30000, // 30 second timeout
      })

      setTrackingId(data.trackingId)
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err)
      // axios wraps server errors in err.response
      const serverMsg = err.response?.data?.error || err.response?.data?.details?.[0]?.message
      if (serverMsg) {
        setError(serverMsg)
      } else if (err.code === 'ERR_NETWORK') {
        setError(file ? 'The attachment upload could not be completed. Please try a smaller file or send the message without an attachment.' : 'Could not reach the server. Please try again.')
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Your file may be too large or your connection is slow.')
      } else {
        setError(err.message || 'There was an error sending your message. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="section-padding relative" id="contact">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-16 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h3 className="font-sub text-2xl font-bold text-white">Message Sent!</h3>
            <p className="text-k-silver-dim mt-3 font-body">
              We'll get back to you within 24 hours. Thank you for choosing Shapio 3D Technologies.
            </p>

            {/* Tracking ID Section */}
            <div className="mt-8 p-6 bg-k-black border border-k-border rounded-xl w-full max-w-md">
              <p className="text-xs text-k-silver-dim uppercase tracking-wider mb-2">Your Tracking ID</p>
              <div className="flex items-center justify-center gap-3 bg-k-dark py-3 px-4 rounded-lg border border-white/5">
                <span className="font-mono text-xl font-bold text-white tracking-widest">{trackingId}</span>
              </div>
              <p className="text-[11px] text-k-silver-dim mt-4">
                Please save this ID. You can use it to track the status of your request at any time.
              </p>
              <Link to="/track" className="btn-primary mt-6 w-full justify-center">
                Track Process Now <ArrowRight size={16} />
              </Link>
            </div>

            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }); setFile(null); setTrackingId(null) }}
              className="text-k-silver-dim hover:text-white mt-6 text-sm font-medium transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding relative" id="contact">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">Get in Touch</span>
          <h2 className="section-title font-sub text-3xl md:text-4xl font-bold mt-3 text-white tracking-wide">
            Contact Us
          </h2>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto">
            Have a project in mind? Send us your requirements and we'll get back to you with a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-card p-8">
              <h3 className="font-sub text-xl font-bold text-white mb-8">Quick Info</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm text-white font-bold tracking-wide uppercase mb-1">Email</p>
                    <a href="mailto:shapio3dtech@gmail.com" className="text-[15px] text-white hover:text-emerald-400 transition-colors">
                      shapio3dtech@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm text-white font-bold tracking-wide uppercase mb-1">Phone</p>
                    <a href="tel:+916384014546" className="text-[15px] text-white hover:text-emerald-400 transition-colors">
                      +91 63840 14546
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
                    <Printer size={20} className="text-white" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm text-white font-bold tracking-wide uppercase mb-1">COMPANY</p>
                    <p className="text-[15px] text-white leading-relaxed">
                      No.216 Ammanambakkam Street, <br />
                      Indra nagar, Chengalpattu, <br />
                      Tamil Nadu 603002
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working hours */}
            <div className="glass-card p-8">
              <h3 className="font-sub text-lg font-semibold text-white mb-4">Working Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-k-silver-dim">Mon — Fri</span>
                  <span className="text-white">9:00 AM — 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-k-silver-dim">Saturday</span>
                  <span className="text-white">10:00 AM — 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-k-silver-dim">Sunday</span>
                  <span className="text-k-silver-dim">Closed</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="glass-card p-2 overflow-hidden h-64">
              <iframe
                title="Location Map"
                src="https://maps.google.com/maps?q=SHAPIO%203D%20Technologies,%20No.216%20Ammanambakkam%20Street,%20Indranagar,%20Chengalpattu,%20Tamil%20Nadu%20603002&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 glass-card p-8 md:p-10 flex flex-col h-full">
            <h3 className="font-sub text-lg font-semibold text-white mb-8">Send a Message</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="relative">
                <User size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-k-dark border border-k-border rounded-lg text-sm text-white placeholder:text-k-silver-dim/50 focus:outline-none focus:border-k-silver/50 transition-colors font-body"
                />
              </div>
              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-k-dark border border-k-border rounded-lg text-sm text-white placeholder:text-k-silver-dim/50 focus:outline-none focus:border-k-silver/50 transition-colors font-body"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative mt-5">
              <Phone size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-k-dark border border-k-border rounded-lg text-sm text-white placeholder:text-k-silver-dim/50 focus:outline-none focus:border-k-silver/50 transition-colors font-body"
              />
            </div>

            {/* Message */}
            <div className="relative mt-5">
              <MessageSquare size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
              <textarea
                name="message"
                placeholder="Describe your project requirements..."
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full pl-11 pr-4 py-3 bg-k-dark border border-k-border rounded-lg text-sm text-white placeholder:text-k-silver-dim/50 focus:outline-none focus:border-k-silver/50 transition-colors font-body resize-none"
              />
            </div>

            {/* File upload */}
            <div className="mt-5 flex-1 min-h-[180px] flex flex-col">
              <label className="flex flex-col items-center justify-center gap-3 w-full h-full p-8 bg-k-dark/30 hover:bg-k-dark/80 border-2 border-dashed border-k-border rounded-xl cursor-pointer hover:border-emerald-500/50 transition-all group">
                <div className="w-16 h-16 rounded-full bg-k-border/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={24} className="text-k-silver-dim group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="text-center">
                  {file ? (
                    <span className="text-emerald-400 font-medium text-lg">{file.name}</span>
                  ) : (
                    <>
                      <p className="text-base text-k-silver-dim">
                        <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-k-silver-dim/60 mt-2">
                        3D Models (STL, STEP) or Reference Images
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  accept=".glb,.gltf,.stl,.obj,.step,.pdf,.jpg,.png"
                />
              </label>
              <p className="text-[11px] text-k-silver-dim/70 mt-2 text-center leading-relaxed">
                Max file size: 10MB. For larger 3D models, please share via{' '}
                <a href="https://wa.me/916384014546" target="_blank" rel="noopener noreferrer" className="text-emerald-400/80 hover:text-emerald-400 transition-colors">WhatsApp</a>
                {' '}or{' '}
                <a href="mailto:shapio3dtech@gmail.com" className="text-emerald-400/80 hover:text-emerald-400 transition-colors">email</a>.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loader-dot" style={{ animationDelay: '0s' }} />
                  <span className="loader-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="loader-dot" style={{ animationDelay: '0.4s' }} />
                </span>
              ) : (
                <>
                  Send Message
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}


