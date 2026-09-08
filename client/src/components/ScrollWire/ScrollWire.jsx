import { useEffect, useState } from 'react'

export default function ScrollWire() {
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      setScrollPct(Math.min(Math.max(pct, 0), 1))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <svg
      className="fixed right-2 top-0 h-screen z-[999] pointer-events-none hidden md:block"
      width="12"
      viewBox="0 0 12 100"
      preserveAspectRatio="none"
    >
      {/* Background track */}
      <line x1="6" y1="0" x2="6" y2="100" stroke="#222" strokeWidth="2" />
      {/* Filled filament */}
      <line
        x1="6" y1="0" x2="6" y2={scrollPct * 100}
        stroke="url(#filamentGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Glowing nozzle dot */}
      <circle
        cx="6"
        cy={scrollPct * 100}
        r="3"
        fill="#fff"
        filter="url(#glow)"
      />
      <defs>
        <linearGradient id="filamentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#888888" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
