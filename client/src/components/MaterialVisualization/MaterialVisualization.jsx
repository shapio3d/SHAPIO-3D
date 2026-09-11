import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

const MATERIALS = [
  {
    id: 'pla',
    name: 'PLA',
    image: '/images/materials/gear-pla.png',
    description: 'Matte • Lightweight • FDM printed',
    surfaceFinish: 7,
    gloss: 3,
    layerVisibility: 6,
    detail: 8
  },
  {
    id: 'petg',
    name: 'PETG',
    image: '/images/materials/gear-petg.png',
    description: 'Smooth • Semi-gloss • Durable',
    surfaceFinish: 8,
    gloss: 6,
    layerVisibility: 5,
    detail: 8
  },
  {
    id: 'abs',
    name: 'ABS',
    image: '/images/materials/gear-abs.png',
    description: 'Matte • Impact Resistant • FDM printed',
    surfaceFinish: 7,
    gloss: 2,
    layerVisibility: 7,
    detail: 7
  },
  {
    id: 'nylon',
    name: 'Nylon',
    image: '/images/materials/gear-nylon.png',
    description: 'Textured • Low friction • High fatigue resistance',
    surfaceFinish: 6,
    gloss: 3,
    layerVisibility: 6,
    detail: 7
  },
  {
    id: 'tpu',
    name: 'TPU',
    image: '/images/materials/gear-tpu.png',
    description: 'Soft • Flexible • Rubber-like',
    surfaceFinish: 6,
    gloss: 2,
    layerVisibility: 8,
    detail: 6
  },
  {
    id: 'resin',
    name: 'Resin',
    image: '/images/materials/gear-resin.png',
    description: 'Extremely smooth • High resolution • SLA printed',
    surfaceFinish: 10,
    gloss: 8,
    layerVisibility: 1,
    detail: 10
  },
  {
    id: 'carbon',
    name: 'Carbon-fiber',
    image: '/images/materials/gear-carbon.png',
    description: 'Extremely rigid • Lightweight • Matte finish',
    surfaceFinish: 5,
    gloss: 2,
    layerVisibility: 7,
    detail: 7
  },
  {
    id: 'pc',
    name: 'Polycarbonate',
    image: '/images/materials/gear-petg.png', /* Fallback image until quota resets */
    description: 'High impact resistance • Translucent • Strong',
    surfaceFinish: 8,
    gloss: 7,
    layerVisibility: 5,
    detail: 8
  },
  {
    id: 'wax',
    name: 'Castable Wax',
    image: '/images/materials/gear-resin.png', /* Fallback image */
    description: 'Leaves 0% ash • Perfect for metal casting',
    surfaceFinish: 9,
    gloss: 4,
    layerVisibility: 2,
    detail: 10
  }
];

const StatBar = ({ label, value }) => {
  // Value is expected to be 0-10, we'll use 15 segments for a cooler look, so we scale it
  const segments = 15;
  const activeSegments = Math.round((value / 10) * segments);

  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between text-[10px] text-k-silver-dim mb-2 font-body uppercase tracking-wider">
        <span>{label}</span>
      </div>
      <div className="flex gap-[3px] h-3 w-full">
        {[...Array(segments)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 transform skew-x-[-20deg] transition-all duration-500 rounded-[1px] ${
              i < activeSegments 
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function MaterialVisualization({ 
  materials = MATERIALS, 
  title = "One Design.",
  subtitle = "Limitless Materials.",
  description = "See how the exact same engineering component transforms when manufactured using different materials. Select a material below to analyze its characteristics.",
  isComponentViewer = false
}) {
  const [activeMaterial, setActiveMaterial] = useState(materials[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedMaterial, setDisplayedMaterial] = useState(materials[0]);

  // Update if props change
  useEffect(() => {
    setActiveMaterial(materials[0]);
    setDisplayedMaterial(materials[0]);
  }, [materials]);

  const handleSelectMaterial = (material) => {
    if (material.id === activeMaterial.id || isAnimating) return;
    
    setActiveMaterial(material);
    setIsAnimating(true);
    
    // Simulate complex material rendering / analyzing
    setTimeout(() => {
      setDisplayedMaterial(material);
    }, 1200);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <section className={`w-full max-w-6xl mx-auto px-6 ${isComponentViewer ? 'py-4' : 'py-24 my-24 border-t border-white/10'}`}>
      
      {!isComponentViewer && (
        <div className="text-center mb-16">
          <h2 className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-body mb-4">Material Visualization</h2>
          <h3 className="font-sub text-3xl md:text-5xl font-bold text-white tracking-wide leading-tight">
            {title}<br/>{subtitle}
          </h3>
          <p className="text-k-silver-dim font-body mt-6 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>
      )}

      <div className="glass-card overflow-hidden flex flex-col lg:flex-row relative z-10 p-1 rounded-2xl">
        {/* Left Side: Image Viewer */}
        <div className="w-full lg:w-3/5 bg-k-bg-black rounded-xl relative overflow-hidden flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
          
          <img 
            src={displayedMaterial.image} 
            alt={`${displayedMaterial.name} Gear`} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isAnimating ? 'blur-md scale-105 opacity-40' : 'blur-0 scale-100 opacity-100'}`}
          />
          
          {/* Overlay loading state */}
          <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity duration-500 backdrop-blur-sm ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Cpu className="text-white/80 w-10 h-10 animate-[spin_3s_linear_infinite] mb-4" />
            <p className="text-white/80 font-sub tracking-widest text-sm uppercase">
              Analyzing {activeMaterial.name} properties...
            </p>
            
            {/* Scanline effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="w-full h-1 bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.5)] absolute animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
          
          {/* Watermark / Label */}
          <div className={`absolute top-4 left-0 w-full px-6 lg:w-auto lg:px-0 lg:bottom-6 lg:left-6 lg:top-auto lg:right-auto transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'} z-10`}>
            {/* Desktop Badge */}
            <div className="hidden lg:flex glass-card px-4 py-2 flex-col items-start">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-body mb-1">Preview</span>
              <span className="text-white font-sub font-semibold tracking-wide">{displayedMaterial.name}</span>
            </div>
            
            {/* Mobile Text */}
            <div className="flex lg:hidden justify-between items-center w-full">
              <span className="text-[10px] text-white/70 uppercase tracking-widest font-body drop-shadow-md">Preview</span>
              <span className="text-white font-sub text-sm font-semibold tracking-wide drop-shadow-md">{displayedMaterial.name}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Controls & Stats */}
        <div className="w-full lg:w-2/5 p-6 lg:p-10 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          
          <h4 className="font-sub text-lg text-white mb-6 tracking-wide">Select Material</h4>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-10">
            {materials.map(material => (
              <button
                key={material.id}
                onClick={() => handleSelectMaterial(material)}
                disabled={isAnimating}
                className={`px-4 py-2 rounded-full text-xs font-body tracking-wider uppercase transition-all duration-300 border ${
                  activeMaterial.id === material.id
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 text-k-silver-dim border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {material.name}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 mt-auto w-full">
            <h5 className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-body mb-6 text-center lg:text-left">What Changes?</h5>
            
            <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-30' : 'opacity-100'} w-full text-left`}>
              <StatBar label="Surface Finish" value={displayedMaterial.surfaceFinish} />
              <StatBar label="Gloss" value={displayedMaterial.gloss} />
              <StatBar label="Layer Visibility" value={10 - displayedMaterial.layerVisibility} />
              <StatBar label="Detail Resolution" value={displayedMaterial.detail} />
              
              <div className="mt-8 text-center lg:text-left">
                <span className="text-white font-sub text-xl tracking-wide">{displayedMaterial.name}</span>
                <p className="text-k-silver-dim text-sm mt-2 font-body font-light">
                  {displayedMaterial.description}
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}} />
    </section>
  );
}
