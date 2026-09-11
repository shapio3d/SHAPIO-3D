import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, CheckCircle2, ChevronRight, Info, Layers, PenTool, Image as ImageIcon } from 'lucide-react'
import { useScrollAnimations } from '../hooks/useScrollAnimations'
import SEO from '../components/SEO/SEO'
import { SERVICE_DATA } from '../data/services'
import MaterialVisualization from '../components/MaterialVisualization/MaterialVisualization'

export default function ServiceDetail() {
  useScrollAnimations()
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Reset tab when service changes
  useEffect(() => {
    setActiveTab('overview')
  }, [slug])
  
  const service = SERVICE_DATA[slug]

  if (!service) {
    return <Navigate to="/404" />
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'materials', label: 'Materials', icon: Layers },
    { id: 'design', label: 'Design Guidelines', icon: PenTool },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  ]

  return (
    <>
      <SEO 
        title={`${service.title} Services`}
        description={service.description}
      />
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        
        <Link to="/services" className="inline-flex items-center gap-2 text-k-silver-dim hover:text-white transition-colors mb-12 fade-up">
          <ArrowLeft size={16} />
          Back to Services
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 fade-up">
          <div>
            <span className="text-xs font-sub text-k-green uppercase tracking-[0.2em]">{service.subtitle}</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6 text-white uppercase">
              {service.title}
            </h1>
            <p className="text-k-silver text-lg leading-relaxed mb-8">
              {service.description}
            </p>
            <Link 
              to="/get-quote" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-200 text-black px-8 py-4 rounded font-sub font-bold text-sm tracking-widest uppercase transition-transform hover:scale-105 duration-300"
            >
              Request a Quote
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="glass-card glow-border p-2 relative aspect-video lg:aspect-square group">
            <div className="w-full h-full relative rounded-xl overflow-hidden">
              <img 
                src={service.image} 
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-k-black/80 to-transparent mix-blend-multiply" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-k-border mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex overflow-x-auto hide-scrollbar gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-2 text-sm font-medium tracking-wide transition-colors relative whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-k-silver-dim hover:text-k-silver'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-k-green' : ''} />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-k-green" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] fade-up" style={{ animationDelay: '0.2s' }}>
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-500">
              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-sub text-white mb-6">About this service</h3>
                <p className="text-k-silver leading-relaxed">
                  {service.longDescription}
                </p>
              </div>
              <div className="bg-k-dark rounded-xl p-8 border border-k-border">
                <h3 className="text-xl font-sub text-white mb-6">Key Applications</h3>
                <ul className="space-y-4">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-k-green shrink-0 mt-0.5" size={18} />
                      <span className="text-k-silver">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="animate-in fade-in duration-500">
              <MaterialVisualization 
                materials={service.materials} 
                isComponentViewer={true}
              />
            </div>
          )}

          {/* Design Guidelines Tab */}
          {activeTab === 'design' && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-2xl font-sub text-white mb-6 uppercase tracking-wide">Design Guidelines</h3>
              <div className="bg-k-dark rounded-xl p-8 border border-k-border mb-8">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {service.designGuidelines.map((guideline, idx) => {
                    const [title, desc] = guideline.split(': ')
                    return (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="mt-0.5 shrink-0 text-k-green">
                          <CheckCircle2 size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-white font-medium font-sub uppercase tracking-wider text-sm">{title}</span>
                          <span className="text-k-silver-dim text-sm leading-relaxed">{desc || title}</span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="mt-8 p-4 md:p-6 bg-[#01351D]/10 border border-k-green/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center md:text-left">
                  <Info className="text-k-green shrink-0 hidden md:block" size={20} />
                  <p className="text-sm text-k-silver">
                    Need help optimizing your design? Our team offers comprehensive DfAM consultations.
                  </p>
                </div>
                <Link to="/contact" className="px-5 py-2 bg-k-green/10 text-k-green border border-k-green/30 hover:bg-k-green hover:text-black font-semibold text-sm rounded-lg whitespace-nowrap transition-all w-full md:w-auto text-center">
                  Contact Support
                </Link>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.gallery.map((img, idx) => (
                  <div key={idx} className="glass-card glow-border p-2 group relative aspect-video">
                    <div className="w-full h-full relative rounded-xl overflow-hidden">
                      <img 
                        src={img} 
                        alt={`${service.title} Gallery ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

