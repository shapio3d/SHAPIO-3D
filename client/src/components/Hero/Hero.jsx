import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, FileText, Cpu, Package, Factory, ChevronRight, Download, Video } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection = ({ videoName, isMobile, videoScale = 1, videoChildren, detailsNode }) => {
  const videoSrc = `/videos/hero/${videoName}-${isMobile ? 'mobile' : 'desktop'}.mp4`

  return (
    <section className="relative w-full flex flex-col">
      {/* 1. Sticky Video Wrapper (200vh tall to stick for 100vh of scrolling) */}
      <div className="h-[200vh] w-full relative">
        <div className="sticky top-0 h-[100vh] w-full z-0 overflow-hidden bg-black">
          <video
            src={videoSrc}
            autoPlay loop muted playsInline
            style={{ transform: `scale(${videoScale})` }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />

          {/* Video Text */}
          <div className="absolute inset-0 z-10 w-full p-4 md:p-8 lg:p-12 flex flex-col justify-center pointer-events-auto">
            {videoChildren}
          </div>
        </div>
      </div>

      {/* 2. Details Block (Slides OVER the sticky video with no gaps) */}
      <div className="relative z-20 w-full -mt-[100vh] min-h-[100vh] bg-[#03150d] pt-16 pb-0 flex flex-col justify-center">
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
              <h3 className="carousel-title font-display font-bold text-white mb-1 drop-shadow-md text-lg origin-bottom-left" style={{ willChange: 'transform' }}>
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
      image: "/images/services/engineering.png",
      items: [
        "Engineering & Industrial Components",
        "Custom Machine Parts",
        "Custom Industrial Parts"
      ]
    },
    {
      title: "Prototyping",
      image: "/images/services/prototyping.png",
      items: [
        "Functional Prototypes",
        "Product Development Prototypes",
        "Automotive Prototype Components"
      ]
    },
    {
      title: "Mechanical & Assembly",
      image: "/images/services/mechanical.png",
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
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#03150d] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#03150d] to-transparent z-10" />
        <div className="animate-marquee-left flex whitespace-nowrap opacity-80">
          <h2 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8">
            Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications •
          </h2>
          <h2 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8">
            Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications • Products & Applications •
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mb-8 flex flex-col justify-center text-center mx-auto px-4">
        <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
          We design and manufacture custom 3D-printed products and functional components for a wide range of industries and applications.
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
      image: "/images/services/electronics.png",
      items: [
        "PCB & Electronics Enclosures",
        "Device Housings & Protective Enclosures",
        "Electronics & IoT Enclosures"
      ]
    },
    {
      title: "Replacement Parts",
      image: "/images/services/production.png",
      items: [
        "Replacement & Spare Parts"
      ]
    },
    {
      title: "Education & Research",
      image: "/images/services/education.png",
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
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#03150d] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#03150d] to-transparent z-10" />
        <div className="animate-marquee-right flex whitespace-nowrap opacity-80">
          <h2 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8">
            Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision •
          </h2>
          <h2 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8">
            Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision • Uncompromising Precision •
          </h2>
        </div>
      </div>

      <div className="max-w-3xl mb-8 flex flex-col justify-center text-center mx-auto px-4">
        <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
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
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#03150d] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#03150d] to-transparent z-10" />
      <div className="animate-marquee-right flex whitespace-nowrap opacity-80">
        <h2 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8">
          Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale •
        </h2>
        <h2 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 px-8">
          Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale • Limitless Scale •
        </h2>
      </div>
    </div>

    <div className="max-w-5xl mx-auto w-full text-center glass-card p-10 md:p-20 border border-white/10 relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-3xl shadow-2xl mb-12">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#01351D] rounded-full blur-[100px] opacity-30 pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#01351D] rounded-full blur-[100px] opacity-30 pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <span className="text-xs text-white/50 tracking-widest uppercase mb-12 block relative z-10">End-to-End Solutions</span>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-16 relative z-10">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
        <h4 className="font-display text-2xl text-white mb-4">Batch & Bulk Production</h4>
        <p className="text-white/70 text-base leading-relaxed">
          Scaling up doesn't mean sacrificing quality. From hundreds to thousands of units, our production fleet runs 24/7 to meet your high-volume manufacturing needs efficiently.
        </p>
      </div>
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
        <h4 className="font-display text-2xl text-white mb-4">Made-to-Order Customization</h4>
        <p className="text-white/70 text-base leading-relaxed">
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
    <div className="bg-transparent">
      {/* 1. Intro Video & Details */}
      <HeroSection
        videoName="intro"
        type="full-to-top"
        isMobile={isMobile}
        detailsNode={<DetailsSection1 />}
        videoChildren={
          <div className="w-full px-4 mt-16 md:mt-32 mx-auto pointer-events-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-4xl mx-auto">
              Powering the next generation of <span className="italic font-serif text-white/90">functional</span> products.
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              From concept to production we turn ideas into functional products.
            </p>
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
              <h2 className="font-display text-[6vw] sm:text-3xl md:text-5xl font-bold text-white uppercase" style={{ letterSpacing: '0.15em' }}>
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
          <div className="w-full px-4 mt-16 md:mt-32 mx-auto pointer-events-auto text-center">
            <h1 className="font-display text-[5vw] sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight w-full">
              <span className="block">From Concept to Production</span>
              <span className="italic font-serif text-green-500/90 text-[4.5vw] sm:text-3xl md:text-4xl lg:text-6xl mt-2 block">We Turn Ideas into Functional Products.</span>
            </h1>
          </div>
        }
      />
    </div>
  )
}
