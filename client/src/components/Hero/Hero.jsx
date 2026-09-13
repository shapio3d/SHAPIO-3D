import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowRight, ChevronDown, FileText, Cpu, Package, Factory, ChevronRight, Download, Video } from 'lucide-react'
import { Link } from 'react-router-dom'

const WhatsAppIcon = ({ size = 20, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31" />
  </svg>
)

const HeroSection = ({ videoName, isMobile, videoScale = 1, videoChildren, detailsNode }) => {
  const videoSrc = videoName ? `/videos/hero/${videoName}-${isMobile ? 'mobile' : 'desktop'}.mp4` : null
  const videoRef = useRef(null)

  // Synchronous callback ref: sets defaultMuted, muted, and playsInline the exact millisecond WebKit creates the DOM node
  const setVideoRef = useCallback((video) => {
    videoRef.current = video
    if (video) {
      video.defaultMuted = true
      video.muted = true
      video.playsInline = true
      video.setAttribute('muted', '')
      video.setAttribute('playsinline', '')
      video.setAttribute('webkit-playsinline', 'true')
      const promise = video.play()
      if (promise !== undefined) {
        promise.catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (!videoSrc) return
    const video = videoRef.current
    if (!video) return

    video.defaultMuted = true
    video.muted = true
    video.playsInline = true

    const playVideo = () => {
      if (video && video.paused) {
        const promise = video.play()
        if (promise !== undefined) {
          promise.catch(() => {})
        }
      }
    }

    playVideo()

    // Listening to user gestures ensures video playback starts immediately on iOS Low Power Mode
    const onUserGesture = () => {
      playVideo()
    }

    const onVisibilityChange = () => {
      if (!document.hidden) {
        playVideo()
      }
    }

    window.addEventListener('touchstart', onUserGesture, { passive: true })
    window.addEventListener('touchend', onUserGesture, { passive: true })
    window.addEventListener('click', onUserGesture, { passive: true })
    window.addEventListener('scroll', onUserGesture, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('touchstart', onUserGesture)
      window.removeEventListener('touchend', onUserGesture)
      window.removeEventListener('click', onUserGesture)
      window.removeEventListener('scroll', onUserGesture)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [videoSrc])

  const handleContainerInteraction = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
    }
  }

  return (
    <section className="relative w-full flex flex-col">
      {/* 1. Sticky Video Wrapper (200vh tall to stick for 100vh of scrolling) */}
      <div className="h-[200vh] w-full relative">
        <div 
          className="sticky top-0 h-[100vh] w-full z-0 overflow-hidden bg-[#06150D] select-none"
          onClick={handleContainerInteraction}
          onTouchStart={handleContainerInteraction}
        >
          {videoSrc ? (
            <video
              ref={setVideoRef}
              key={videoSrc}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              style={{ transform: `scale(${videoScale})`, pointerEvents: 'none' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#06150D] overflow-hidden pointer-events-none">
              {/* Futuristic ambient lighting & tech grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(16,185,129,0.2),rgba(0,0,0,0))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.07]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/[0.07] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-emerald-500/[0.04] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.05] blur-[100px] rounded-full pointer-events-none" />
            </div>
          )}
          {/* Enhanced cinematic video overlay for luxury depth and high contrast */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/70 pointer-events-none" />

          {/* Video Text */}
          <div className="absolute inset-0 z-10 w-full p-4 md:p-8 lg:p-12 flex flex-col justify-center pointer-events-auto">
            {videoChildren}
          </div>
        </div>
      </div>

      {/* 2. Details Block (Slides OVER the sticky video with no gaps) */}
      <div className="relative z-20 w-full -mt-[100vh] min-h-[100vh] bg-[#06150D] pt-16 pb-0 flex flex-col justify-center">
        {detailsNode}
      </div>
    </section>
  )
}

const ImageCarousel = ({ tabs, scrollDirection = 'left' }) => {
  const scrollRef = useRef(null)
  const cardsRef = useRef([])
  const isHovered = useRef(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 5 sets of tabs (20 items) to guarantee seamless infinite wrapping
  const infiniteTabs = [...tabs, ...tabs, ...tabs, ...tabs, ...tabs]

  useEffect(() => {
    let animationId
    const container = scrollRef.current
    if (!container) return

    // Initialize to the middle set to allow scrolling both ways immediately
    container.scrollLeft = container.scrollWidth / 2 - container.clientWidth / 2

    const loop = () => {
      // Auto-scroll continuously if not hovered and not on mobile
      if (!isHovered.current && !isMobile) {
        const speed = scrollDirection === 'left' ? 1.5 : -1.5
        container.scrollLeft += speed // 1.5px per frame for a smooth, visible glide
      }

      const singleSetWidth = container.scrollWidth / 5
      // Infinite loop wrap boundaries
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 50) {
        container.scrollLeft -= singleSetWidth * 2
      } else if (container.scrollLeft <= 50) {
        container.scrollLeft += singleSetWidth * 2
      }

      // Dynamic sizing based on distance from center
      const centerLine = container.scrollLeft + container.clientWidth / 2
      cardsRef.current.forEach((card) => {
        if (!card) return
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const dist = Math.abs(centerLine - cardCenter)

        const maxDist = isMobile ? 250 : 400
        const ratio = Math.max(0, 1 - dist / maxDist)
        const easeRatio = Math.sin((ratio * Math.PI) / 2)

        // Interpolate scale and opacity
        const scale = 0.85 + (0.25 * easeRatio)
        const opacity = 0.3 + (0.7 * easeRatio)

        card.style.transform = `scale(${scale})`
        card.style.opacity = opacity
        card.style.zIndex = Math.round(easeRatio * 10)

        // Animate text reveal
        const textContainer = card.querySelector('.carousel-text')
        if (textContainer) {
          textContainer.style.opacity = easeRatio
          textContainer.style.maxHeight = `${easeRatio * 200}px`
          textContainer.style.transform = `translateY(${(1 - easeRatio) * 20}px)`
        }

        // Animate title scale
        const title = card.querySelector('.carousel-title')
        if (title) {
          title.style.transform = `scale(${1 + 0.15 * easeRatio})`
        }
      })

      animationId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animationId)
  }, [isMobile])

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -350 : 350,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div
      className="w-full max-w-[1400px] mx-auto relative mt-4 mb-0 h-[380px] flex items-center justify-center"
      onMouseEnter={() => isHovered.current = true}
      onMouseLeave={() => isHovered.current = false}
      onTouchStart={() => isHovered.current = true}
      onTouchEnd={() => isHovered.current = false}
    >
      {/* Scroll Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 lg:left-8 z-30 hidden lg:block">
        <button onClick={() => scroll('left')} className="p-4 rounded-full bg-black/80 border border-white/20 text-white hover:bg-white/10 hover:scale-110 transition-all shadow-xl">
          <ArrowRight size={24} className="rotate-180" />
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 lg:right-8 z-30 hidden lg:block">
        <button onClick={() => scroll('right')} className="p-4 rounded-full bg-black/80 border border-white/20 text-white hover:bg-white/10 hover:scale-110 transition-all shadow-xl">
          <ArrowRight size={24} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto gap-4 md:gap-8 pb-8 pt-8 px-[50vw] scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {infiniteTabs.map((tab, i) => (
          <div
            key={i}
            ref={el => cardsRef.current[i] = el}
            className="flex-shrink-0 relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer bg-black/40 w-[70vw] md:w-[320px] h-[220px] md:h-[260px] origin-center"
            style={{ willChange: 'transform, opacity' }}
          >
            <img
              src={tab.image}
              alt={tab.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

            <div className="absolute bottom-0 left-0 w-full p-5 md:p-6 flex flex-col justify-end">
              <h3 className="carousel-title font-sub font-bold text-white mb-1 drop-shadow-md text-lg origin-bottom-left" style={{ willChange: 'transform' }}>
                {tab.title}
              </h3>
              <div className="carousel-text overflow-hidden mt-2" style={{ willChange: 'opacity, max-height, transform' }}>
                <ul className="space-y-1.5 text-white/80 text-xs md:text-sm">
                  {tab.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] flex-shrink-0 mt-1" />
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DetailsSection1 = () => {
  const tabs = [
    {
      title: "Engineering & Industrial",
      image: "/images/services/engineering_and_industrial.png",
      items: [
        "Engineering & Industrial Components",
        "Custom Machine Parts",
        "Custom Industrial Parts"
      ]
    },
    {
      title: "Prototyping",
      image: "/images/services/cover_prototyping.png",
      items: [
        "Functional Prototypes",
        "Product Development Prototypes",
        "Automotive Prototype Components"
      ]
    },
    {
      title: "Mechanical & Assembly",
      image: "/images/services/precison_gear_new.png",
      items: [
        "Mechanical Components & Parts",
        "Jigs, Fixtures & Assembly Aids",
        "Brackets, Mounts & Supports"
      ]
    },
    {
      title: "Tooling & Molding",
      image: "/images/services/tooling.png",
      items: [
        "Mold Patterns & Mould Components",
        "Casting Patterns & Master Models"
      ]
    }
  ]

  return (
    <div className="w-full relative overflow-hidden pt-12 pb-8">
      {/* Marquee Heading - Flows Left */}
      <div className="w-full overflow-hidden mb-12 relative pointer-events-none select-none">
        <div className="animate-marquee-left flex whitespace-nowrap opacity-80">
          <h2 className="font-sub italic tracking-widest text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8 uppercase">
            Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications •
          </h2>
          <h2 className="font-sub italic tracking-widest text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8 uppercase">
            Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications •
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mb-8 flex flex-col justify-center text-center mx-auto px-4">
        <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto">
          We design and manufacture custom <span className="whitespace-nowrap">3D-printed</span> products and functional components for a wide range of industries and applications.
        </p>
      </div>
      {/* Products & Applications text moves LEFT, so carousel moves RIGHT */}
      <ImageCarousel tabs={tabs} scrollDirection="right" />
    </div>
  )
}

const DetailsSection2 = () => {
  const tabs = [
    {
      title: "Robotics & Automation",
      image: "/images/services/robotics.png",
      items: [
        "Robotic Parts & Automation Components"
      ]
    },
    {
      title: "Electronics & IoT",
      image: "/images/services/cover_electronics.png",
      items: [
        "PCB & Electronics Enclosures",
        "Device Housings & Protective Enclosures",
        "Electronics & IoT Enclosures"
      ]
    },
    {
      title: "Replacement Parts",
      image: "/images/services/cover_production.png",
      items: [
        "Replacement & Spare Parts"
      ]
    },
    {
      title: "Education & Research",
      image: "/images/services/cover_education.png",
      items: [
        "College & Student Project Prototypes",
        "Research & Development Prototypes",
        "Educational Models & Demonstration Parts"
      ]
    }
  ]

  return (
    <div className="w-full relative overflow-hidden pt-12 pb-8 mt-12">
      {/* Marquee Heading - Flows Right */}
      <div className="w-full overflow-hidden mb-12 relative pointer-events-none select-none">
        <div className="animate-marquee-right flex whitespace-nowrap opacity-80">
          <h2 className="font-sub italic tracking-widest text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8 uppercase">
            Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision •
          </h2>
          <h2 className="font-sub italic tracking-widest text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8 uppercase">
            Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision •
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mb-8 flex flex-col justify-center text-center mx-auto px-4">
        <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto">
          Engineered to exact specifications. Our advanced manufacturing techniques ensure flawless accuracy across complex geometries.
        </p>
      </div>
      {/* Precision Components text moves RIGHT, so carousel moves LEFT */}
      <ImageCarousel tabs={tabs} scrollDirection="left" />
    </div>
  )
}


const DetailsSection3 = () => (
  <div className="w-full relative overflow-hidden pt-12 pb-8 mt-12">
    {/* Marquee Heading - Flows Right (left to right) */}
    <div className="w-full overflow-hidden mb-12 relative pointer-events-none select-none">
      <div className="animate-marquee-right flex whitespace-nowrap opacity-80">
        <h2 className="font-sub italic tracking-widest text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8 uppercase">
          Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale •
        </h2>
        <h2 className="font-sub italic tracking-widest text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8 uppercase">
          Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale •
        </h2>
      </div>
    </div>

    <div className="max-w-5xl mx-auto w-full mb-12 px-4 md:px-0">
      <div className="max-w-3xl mb-12 flex flex-col justify-center text-center mx-auto">
        <p className="text-white text-lg leading-relaxed max-w-4xl mx-auto">
          From initial prototype to full-scale production runs. <br className="hidden md:block" />
          Our high-volume manufacturing capabilities ensure consistent quality whether you need ten parts or ten thousand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center relative z-10">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden flex flex-col h-full">
          <h4 className="font-sub text-lg md:text-xl xl:text-2xl text-white mb-4 text-center leading-tight">Batch & Bulk Production</h4>
          <p className="text-white/70 text-sm md:text-base leading-relaxed flex-1">
            Scaling up doesn't mean sacrificing quality. From hundreds to thousands of units, our production fleet runs 24/7 to meet your high-volume manufacturing needs efficiently.
          </p>
        </div>
        <div className="glass-card p-8 md:p-12 relative overflow-hidden flex flex-col h-full">
          <h4 className="font-sub text-lg md:text-xl xl:text-2xl text-white mb-4 text-center leading-tight">Made-to-Order Customization</h4>
          <p className="text-white/70 text-sm md:text-base leading-relaxed flex-1">
            Unlike traditional molding, we offer limitless iterations. Customized products and on-demand parts manufactured directly from digital files without tooling costs.
          </p>
        </div>
      </div>
    </div>
  </div>
)

export default function Hero() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div id="hero" className="bg-transparent">
      {/* 1. Intro Video & Details */}
      <HeroSection
        videoName="intro"
        type="full-to-top"
        isMobile={isMobile}
        detailsNode={<DetailsSection1 />}
        videoChildren={
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-10 sm:mt-14 md:mt-18 pointer-events-auto text-center flex flex-col items-center justify-center">
            {/* Main Headline (Multi-font & Color Pairing: Modern Sans in Pure White + Editorial Italic Serif in Emerald) */}
            <h1 
              className="drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] w-full max-w-5xl mx-auto flex flex-col items-center justify-center px-2"
              style={{ lineHeight: 1.1 }}
            >
              <span 
                className="font-body font-semibold tracking-tight whitespace-nowrap text-white"
                style={{ fontSize: 'clamp(1.35rem, 5.2vw, 5.2rem)' }}
              >
                Advanced 3D Printing
              </span>
              <span 
                className="font-serif italic font-normal tracking-normal whitespace-nowrap mt-1 bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                style={{ 
                  fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif", 
                  fontSize: 'clamp(1.45rem, 5.8vw, 5.8rem)' 
                }}
              >
                for Engineering &amp; Manufacturing
              </span>
            </h1>

            {/* Service Capability Buttons (Separate Frosted-Glass Buttons with Navbar Effect) */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 md:flex md:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-sm sm:max-w-md md:max-w-4xl mx-auto">
              <Link
                to="/services/rapid-prototyping"
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-xl border border-white/10 border-t-white/20 hover:border-white/30 text-white/90 hover:text-white font-body text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 text-center flex items-center justify-center whitespace-nowrap"
              >
                Prototypes
              </Link>
              <Link
                to="/services/engineering-industrial"
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-xl border border-white/10 border-t-white/20 hover:border-white/30 text-white/90 hover:text-white font-body text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 text-center flex items-center justify-center whitespace-nowrap"
              >
                Functional Parts
              </Link>
              <Link
                to="/services/robotics-automation"
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-xl border border-white/10 border-t-white/20 hover:border-white/30 text-white/90 hover:text-white font-body text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 text-center flex items-center justify-center whitespace-nowrap"
              >
                Robotic Parts
              </Link>
              <Link
                to="/services/scale-production"
                className="w-full md:w-auto px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-xl border border-white/10 border-t-white/20 hover:border-white/30 text-white/90 hover:text-white font-body text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 text-center flex items-center justify-center whitespace-nowrap"
              >
                Bulk Production
              </Link>
            </div>

            {/* Primary Call to Action Buttons (Matching Navbar Glass Depth & Highlights) */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Link
                to="/contact"
                className="h-12 w-60 sm:w-52 rounded-full bg-white text-black hover:bg-white/90 font-body text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.25)] transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                <span>Get a Quote</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <a
                href="https://wa.me/916384014546?text=Hi%20Shapio%203D,%20I%20would%20like%20to%20get%20a%20quote%20for%203D%20printing."
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-60 sm:w-52 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 border-t-emerald-400/50 hover:border-emerald-400/80 text-white font-body text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-95 whitespace-nowrap group"
              >
                <WhatsAppIcon size={17} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        }
      />

      {/* 2. Service Video & Details */}
      <HeroSection
        videoName="service"
        type="bottom-to-full-to-top"
        isMobile={isMobile}
        videoScale={1.35}
        detailsNode={<DetailsSection2 />}
        videoChildren={
          <div className="w-full h-full flex items-center justify-center md:justify-end text-center md:text-right px-4 md:pr-8 lg:pr-12">
            <div className="max-w-2xl">
              <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase leading-none" style={{ letterSpacing: '0.05em' }}>
                Uncompromising<br />Precision
              </h2>
            </div>
          </div>
        }
      />

      {/* 3. Final Video & Details */}
      <HeroSection
        videoName="final"
        type="bottom-to-full-to-top"
        isMobile={isMobile}
        detailsNode={<DetailsSection3 />}
        videoChildren={
          <div className="w-full max-w-7xl mx-auto px-4 md:px-12 mt-16 md:mt-32 pointer-events-auto text-center flex flex-col items-center">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide mb-2 max-w-5xl mx-auto uppercase">
              From Concept to Production
            </h1>
            <p className="text-2xl sm:text-4xl md:text-5xl italic font-serif text-k-green tracking-wide lowercase">
              we turn ideas into functional products.
            </p>
          </div>
        }
      />
    </div>
  )
}

