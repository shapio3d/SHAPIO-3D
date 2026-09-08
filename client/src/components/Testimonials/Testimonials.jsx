import { useState, useEffect, useRef } from 'react'
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Rahul Sharma',
    company: 'TechBuild Labs',
    text: 'Shapio 3D Technologies delivered our prototype in 48 hours with incredible precision. The surface finish was better than we expected from any FDM print.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    company: 'ArchiVision Studio',
    text: 'Their architectural models are stunning. The attention to detail at 0.1mm layer height made our client presentation a huge success.',
    rating: 5,
  },
  {
    name: 'Vikram Patel',
    company: 'RoboWorks India',
    text: 'We\'ve been using Shapio 3D Technologies for all our robot housing needs. Fast turnaround, consistent quality, and the Nylon parts are incredibly durable.',
    rating: 5,
  },
  {
    name: 'Ananya Desai',
    company: 'MediTech Solutions',
    text: 'Custom medical device housings printed to exact specifications. Their design consultation saved us weeks of iteration time.',
    rating: 4,
  },
  {
    name: 'Karthik Reddy',
    company: 'DroneForce',
    text: 'Lightweight carbon-nylon drone frames with perfect dimensional accuracy. Shapio 3D Technologies is our go-to for all aerospace-grade prototyping.',
    rating: 5,
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isAutoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => (prev + 1) % TESTIMONIALS.length)
      }, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isAutoPlay])

  const goTo = (index) => {
    setCurrent(index)
    setIsAutoPlay(false)
    setTimeout(() => setIsAutoPlay(true), 10000)
  }

  const prev = () => goTo((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => goTo((current + 1) % TESTIMONIALS.length)

  return (
    <section className="section-padding relative" id="testimonials">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">Trusted By</span>
          <h2 className="section-title font-display text-3xl md:text-4xl font-bold mt-3 text-gradient">
            Client Testimonials
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="relative">
          <div className="glass-card p-10 md:p-14 text-center relative overflow-hidden">
            {/* Quote icon */}
            <Quote size={48} className="text-k-border mx-auto mb-6" />

            {/* Text */}
            <p className="text-lg md:text-xl text-k-silver font-body font-light leading-relaxed max-w-2xl mx-auto transition-opacity duration-500">
              "{TESTIMONIALS[current].text}"
            </p>

            {/* Rating */}
            <div className="flex items-center justify-center gap-1 mt-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < TESTIMONIALS[current].rating ? 'text-k-silver fill-k-silver' : 'text-k-border'}
                />
              ))}
            </div>

            {/* Author */}
            <div className="mt-6">
              <p className="font-display text-sm font-semibold text-white tracking-wide">
                {TESTIMONIALS[current].name}
              </p>
              <p className="text-xs text-k-silver-dim mt-1">{TESTIMONIALS[current].company}</p>
            </div>

            {/* Background geometric accent */}
            <div className="absolute -top-20 -right-20 w-40 h-40 border border-k-border/30 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 border border-k-border/20 rotate-45" />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-k-border flex items-center justify-center text-k-silver-dim hover:text-white hover:border-k-silver transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-white' : 'w-1.5 bg-k-border hover:bg-k-silver-dim'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-k-border flex items-center justify-center text-k-silver-dim hover:text-white hover:border-k-silver transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
