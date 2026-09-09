export const SERVICE_DATA = {
  'engineering-industrial': {
    title: 'Engineering & Industrial',
    subtitle: 'Custom Machine Parts',
    description: 'We design and manufacture robust engineering and industrial components tailored to your exact specifications for heavy-duty performance.',
    longDescription: 'Our industrial-grade 3D printing services produce high-strength, dimensionally accurate components designed for demanding environments. From custom machine parts to heavy-duty industrial components, we utilize advanced materials that can withstand rigorous operational stress, heat, and chemical exposure.',
    features: [
      'Engineering & Industrial Components',
      'Custom Machine Parts',
      'Custom Industrial Parts',
      'High strength and durability'
    ],
    materials: [
      { name: 'Carbon-fiber composites', desc: 'Extremely rigid and lightweight, ideal for structural parts.' },
      { name: 'Nylon PA12', desc: 'High fatigue resistance and low friction.' },
      { name: 'Polycarbonate (PC)', desc: 'Superior impact strength and heat resistance.' },
      { name: 'ABS', desc: 'Durable thermoplastic for everyday mechanical applications.' }
    ],
    designGuidelines: [
      'Minimum wall thickness: 1.2mm for structural integrity.',
      'Clearances: Maintain at least 0.3mm gap for moving parts.',
      'Tolerances: Standard ±0.2mm or ±0.002mm/mm.',
      'Orientation: Design parts to minimize overhanging angles beyond 45 degrees.'
    ],
    gallery: [
      '/images/services/precision_gear.png',
      '/images/services/engineering_gallery1_1788213552000.png',
      '/images/services/engineering_gallery2_1788213562722.png',
      '/images/services/engineering_gallery3_1788213580339.png'
    ],
    image: '/images/services/precision_gear.png'
  },
  'rapid-prototyping': {
    title: 'Rapid Prototyping',
    subtitle: 'Functional & Development',
    description: 'Accelerate your product development cycle with our high-fidelity rapid prototyping services, from automotive to consumer goods.',
    longDescription: 'Bring your ideas to life quickly and efficiently. Our rapid prototyping services allow you to test form, fit, and function before committing to expensive tooling. We cater to various industries, providing highly accurate and functional prototypes that accelerate your product development cycle.',
    features: [
      'Functional Prototypes',
      'Product Development Prototypes',
      'Automotive Prototype Components',
      'Fast turnaround times'
    ],
    materials: [
      { name: 'PLA', desc: 'Cost-effective, highly accurate for form and fit testing.' },
      { name: 'Standard Resin', desc: 'Exceptional surface finish and detail for visual prototypes.' },
      { name: 'ABS', desc: 'Functional testing with moderate heat resistance.' },
      { name: 'PETG', desc: 'Excellent layer adhesion and impact resistance.' }
    ],
    designGuidelines: [
      'Minimum wall thickness: 0.8mm (Resin) / 1.0mm (FDM).',
      'Embossed Details: Keep at least 0.5mm wide and 0.5mm deep.',
      'Tolerances: ±0.1mm (Resin) / ±0.2mm (FDM).',
      'Assembly: Consider snap-fits or threaded inserts for functional testing.'
    ],
    gallery: [
      '/images/services/prototyping_hero_1788213591197.png',
      '/images/services/prototyping_gallery1_1788213602795.png',
      '/images/services/prototyping_gallery2_1788213621464.png',
      '/images/services/prototyping_gallery3_1788213632596.png'
    ],
    image: '/images/services/prototyping_hero_1788213591197.png'
  },
  'mechanical-assembly': {
    title: 'Mechanical & Assembly',
    subtitle: 'Fixtures & Supports',
    description: 'Precision-engineered mechanical parts and assembly aids designed for flawless integration and performance on the factory floor.',
    longDescription: 'Optimize your manufacturing floor with custom-designed mechanical components and assembly aids. We produce highly accurate jigs, fixtures, mounts, and supports that improve workflow efficiency, reduce assembly errors, and ensure flawless integration into your existing systems.',
    features: [
      'Mechanical Components & Parts',
      'Jigs, Fixtures & Assembly Aids',
      'Brackets, Mounts & Supports',
      'Precision tolerances'
    ],
    materials: [
      { name: 'Tough Resin', desc: 'Simulates ABS properties with smooth surface finish.' },
      { name: 'PETG', desc: 'Durable, chemical-resistant for factory floor use.' },
      { name: 'Nylon', desc: 'Wear-resistant, ideal for friction surfaces and gears.' },
      { name: 'TPU', desc: 'Flexible material for custom grips and dampeners.' }
    ],
    designGuidelines: [
      'Minimum wall thickness: 1.5mm for load-bearing fixtures.',
      'Clearances: 0.4mm clearance for snap-fit assemblies.',
      'Tolerances: ±0.15mm for critical mounting points.',
      'Inserts: Use heat-set threaded inserts instead of printed threads.'
    ],
    gallery: [
      '/images/services/mechanical_hero_1788213643670.png',
      '/images/services/mechanical_gallery1_1788213662134.png',
      '/images/services/mechanical_gallery2_1788213673091.png',
      '/images/services/mechanical_gallery3_1788213686427.png'
    ],
    image: '/images/services/mechanical_hero_1788213643670.png'
  },
  'electronics-iot': {
    title: 'Electronics & IoT',
    subtitle: 'Enclosures & Housings',
    description: 'Custom protective housings and enclosures tailored specifically for PCBs, delicate electronics, and connected IoT devices.',
    longDescription: 'Protect your delicate electronics and PCBs with custom-designed enclosures. Our 3D printed housings are tailored to your exact specifications, offering precise cutouts for ports, buttons, and displays, along with optimized ventilation and structural integrity for IoT devices and consumer electronics.',
    features: [
      'PCB & Electronics Enclosures',
      'Device Housings & Protective Enclosures',
      'Electronics & IoT Enclosures',
      'Snap-fit and screw-assembly designs'
    ],
    materials: [
      { name: 'ABS', desc: 'Standard choice for consumer electronic casings.' },
      { name: 'PETG', desc: 'Slightly flexible, great for snap-fit enclosures.' },
      { name: 'Flame Retardant Resin', desc: 'V-0 rated material for critical electrical components.' },
      { name: 'PLA', desc: 'For low-heat, aesthetic desktop enclosures.' }
    ],
    designGuidelines: [
      'Minimum wall thickness: 1.2mm for rigid enclosures.',
      'Cutouts: Add 0.2mm tolerance around ports (USB, HDMI, etc).',
      'Snap Fits: Design with a 0.3mm interference fit.',
      'Ventilation: Ensure sufficient airflow paths to prevent heat buildup.'
    ],
    gallery: [
      '/images/services/electronics_hero_1788213704809.png',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    image: '/images/services/electronics_hero_1788213704809.png'
  },
  'tooling-molding': {
    title: 'Tooling & Molding',
    subtitle: 'Patterns & Master Models',
    description: 'High-accuracy mold patterns and master models for casting and specialized manufacturing processes.',
    longDescription: 'Bridge the gap between digital design and traditional manufacturing. We produce highly accurate mold patterns, master models, and tooling components. Our 3D printed patterns offer exceptional surface finish and dimensional stability, perfectly suited for casting and molding processes.',
    features: [
      'Mold Patterns & Mould Components',
      'Casting Patterns & Master Models',
      'Exceptional surface finish',
      'Complex geometries without draft angles'
    ],
    materials: [
      { name: 'Castable Wax Resin', desc: 'Leaves 0% ash after burnout, perfect for jewelry/metal casting.' },
      { name: 'High-Temp Resin', desc: 'Withstands up to 289°C for low-run injection molding.' },
      { name: 'SLA Standard Resin', desc: 'Extremely smooth surface for master silicone molds.' }
    ],
    designGuidelines: [
      'Minimum feature size: 0.2mm for high-res SLA.',
      'Draft Angles: Not required for 3D printing, but needed if used as a master mold.',
      'Tolerances: ±0.05mm for high-accuracy patterns.',
      'Wall Thickness: Minimum 0.5mm (supported).'
    ],
    gallery: [
      '/images/services/tooling.png',
      '/images/services/tooling_gallery2_1788685027734.png',
      '/images/services/tooling_gallery3_1788685043929.png'
    ],
    image: '/images/services/tooling.png'
  },
  'robotics-automation': {
    title: 'Robotics & Automation',
    subtitle: 'Precision Parts',
    description: 'Durable and lightweight parts optimized for robotics, automation systems, and continuous rigorous operation.',
    longDescription: 'Elevate your automation systems with lightweight, durable 3D printed components. We manufacture custom robotic parts, end-of-arm tooling, and replacement components engineered for continuous operation, reducing weight and improving the speed and efficiency of your robotic assemblies.',
    features: [
      'Robotic Parts & Automation Components',
      'Replacement & Spare Parts',
      'End-of-arm tooling (EOAT)',
      'Lightweight and high-strength'
    ],
    materials: [
      { name: 'Carbon-fiber Nylon', desc: 'Highest strength-to-weight ratio for robotic arms.' },
      { name: 'TPU', desc: 'Excellent for custom grippers and shock absorbers.' },
      { name: 'Polycarbonate', desc: 'High impact resistance for automation shields.' },
      { name: 'ABS', desc: 'Cost-effective structural components.' }
    ],
    designGuidelines: [
      'Weight Reduction: Use internal honeycomb infill (20-40%) to save weight.',
      'Clearances: 0.5mm gap for moving mechanical joints.',
      'Tolerances: ±0.2mm overall.',
      'Integration: Design channels directly into parts for wire routing.'
    ],
    gallery: [
      '/images/services/robotics.png',
      '/images/services/robotics_gallery2_1788685057790.png',
      '/images/services/robotics_gallery3_1788685071901.png'
    ],
    image: '/images/services/robotics.png'
  },
  'education-research': {
    title: 'Education & Research',
    subtitle: 'Models & Projects',
    description: 'Supporting academic excellence and cutting-edge R&D with precise educational models and detailed student project prototypes.',
    longDescription: 'Empowering the next generation of innovators and researchers. We provide precision 3D printing services for academic projects, R&D departments, and educational institutions. From complex demonstration models to functional prototypes for student projects, we help turn theoretical concepts into tangible reality.',
    features: [
      'College & Student Project Prototypes',
      'Research & Development Prototypes',
      'Educational Models & Demonstration Parts',
      'Cost-effective educational pricing'
    ],
    materials: [
      { name: 'PLA', desc: 'Most affordable and versatile, available in many colors.' },
      { name: 'PETG', desc: 'For mechanical projects needing moderate strength.' },
      { name: 'Standard Resin', desc: 'For highly detailed architectural or medical models.' },
      { name: 'Multi-color printing', desc: 'For distinct visualization of complex assemblies.' }
    ],
    designGuidelines: [
      'Scale: Models should fit within a 300x300x400mm build volume.',
      'Overhangs: Try to design with angles >45° to reduce support material.',
      'Tolerances: ±0.2mm standard accuracy.',
      'Text/Logos: Minimum 1mm thickness for readable embossed text.'
    ],
    gallery: [
      '/images/services/education.png',
      '/images/services/edu_periodic_black_1788687564753.png',
      '/images/services/edu_alphabet_black_1788687591164.png'
    ],
    image: '/images/services/education.png'
  },
  'scale-production': {
    title: 'Scale & Production',
    subtitle: 'Batch & Custom Orders',
    description: 'From Concept to Production — We Turn Ideas into Functional Products. We scale our manufacturing to seamlessly meet your demands.',
    longDescription: 'Scale your manufacturing without the massive upfront costs of traditional tooling. Our print farm is equipped for batch and bulk 3D production, providing a seamless transition from prototype to final product. Whether you need a small batch of custom parts or large-scale made-to-order manufacturing, we deliver on time and on spec.',
    features: [
      'Batch & Bulk 3D Production',
      'Customized Products & Made-to-Order Parts',
      'No minimum order quantities',
      'Rapid scaling capabilities'
    ],
    materials: [
      { name: 'Industrial SLA Resin', desc: 'For batches of parts requiring injection-mold-like finish.' },
      { name: 'Nylon PA12 (SLS)', desc: 'For high-volume, strong functional parts without support marks.' },
      { name: 'ABS / PETG Farm', desc: 'Cost-effective high-volume FDM production.' }
    ],
    designGuidelines: [
      'Batch nesting: We optimize build volumes for highest throughput.',
      'Wall Thickness: Maintain consistent 1.5-2mm walls for best batch reliability.',
      'Tolerances: ±0.15mm standard across all parts.',
      'Post-processing: Design parts to minimize manual post-processing for faster delivery.'
    ],
    gallery: [
      '/images/services/production.png',
      '/images/services/production_gallery2_1788685128285.png',
      '/images/services/production_gallery3_1788685187709.png'
    ],
    image: '/images/services/production.png'
  }
}
