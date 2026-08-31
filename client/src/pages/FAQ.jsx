import { useState } from 'react'
import { Plus, Minus, HelpCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const FAQS = [
  {
    question: "What 3D printing services do you offer?",
    answer: "We provide professional FDM and SLA 3D printing services for prototypes, engineering components, mechanical parts, enclosures, architectural models, robotic parts, decorative products, and custom applications."
  },
  {
    question: "Do you accept custom 3D printing requirements?",
    answer: "Yes. We accept custom requirements based on your design, dimensions, application, and functional needs."
  },
  {
    question: "What file formats can I send for 3D printing?",
    answer: "You can share common 3D CAD formats such as STL, STEP, STP, OBJ, and 3MF. If you do not have a 3D model, our team can also assist with design and modelling requirements."
  },
  {
    question: "Can you design the 3D model for us?",
    answer: "Yes. We provide 3D modelling and design support based on your sketches, drawings, reference images, dimensions, or existing components."
  },
  {
    question: "What materials are available?",
    answer: "We work with a range of materials including PLA, PETG, ABS, TPU and other suitable materials depending on the application and required properties."
  },
  {
    question: "Do you provide engineering-grade functional parts?",
    answer: "Yes. We manufacture functional components for mechanical, engineering, automation, robotics, electronics, and other industrial applications based on the required specifications."
  },
  {
    question: "Do you provide prototypes for new products?",
    answer: "Yes. We support product development from concept and design to prototyping and final production."
  },
  {
    question: "Can you manufacture products in bulk quantities?",
    answer: "Yes. We undertake batch and bulk 3D printing requirements and can support low-volume production as well as customized manufacturing."
  },
  {
    question: "Do you provide PCB and electronic device enclosures?",
    answer: "Yes. We design and manufacture customized PCB enclosures, electronic housings, device cases, covers, brackets, and mounting components."
  },
  {
    question: "Do you provide architectural 3D printing support?",
    answer: "Yes. We provide 3D printing support for architectural models, scale models, design prototypes, presentation models, and other architectural applications."
  },
  {
    question: "Can you make replacement or discontinued parts?",
    answer: "Yes. We can recreate and manufacture replacement parts from an existing component, measurements, drawings, or reference images, subject to design feasibility."
  },
  {
    question: "Do you provide college project prototypes?",
    answer: "Yes. We support students, colleges, and educational institutions with custom prototypes, project components, working models, robotics parts, mechanical parts, and demonstration models."
  },
  {
    question: "How do I get a quotation?",
    answer: "Simply share your 3D model, drawing, dimensions, quantity, and application details with us. Our team will review the requirement and provide a quotation."
  },
  {
    question: "How long does 3D printing take?",
    answer: "Production time depends on the size, complexity, material, quantity, and finishing requirements of the product. We will provide an estimated delivery timeline along with the quotation."
  },
  {
    question: "Can you help choose the right material?",
    answer: "Yes. Based on the product’s application, strength, flexibility, temperature resistance, appearance, and budget, we can recommend a suitable material."
  },
  {
    question: "Do you provide finishing services?",
    answer: "Yes. Depending on the requirement, we can provide suitable post-processing and finishing options to improve the appearance and functionality of the printed part."
  },
  {
    question: "Can you manufacture a product from just an idea or sketch?",
    answer: "Yes. We can support the development process from Idea → 3D Design → Prototype → Testing → Final Product → Batch Production, depending on the project requirements."
  },
  {
    question: "Do you provide product development and R&D support?",
    answer: "Yes. We support individuals, startups, students, and industries with prototyping, product development, design modifications, testing models, and R&D requirements."
  },
  {
    question: "Do you offer urgent 3D printing?",
    answer: "Yes, subject to machine availability, project complexity, and quantity. Contact us with your requirement and we will check the earliest possible production schedule."
  },
  {
    question: "How can I contact Shapio 3D Technologies?",
    answer: "You can contact our team through WhatsApp, phone, email, or our website. Share your requirement and we will guide you through the next steps."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/#footer" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
            <HelpCircle size={32} className="text-emerald-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-k-silver-dim font-body">
            Everything you need to know about our 3D printing services, pricing, and capabilities.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className={`glass-card overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-emerald-500/30 bg-white/[0.04]' : 'hover:border-white/20'}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className={`font-display font-semibold text-lg ${openIndex === index ? 'text-white' : 'text-k-silver'}`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 ml-4 p-1.5 rounded-full transition-colors ${openIndex === index ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-k-silver'}`}>
                  {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 text-k-silver-dim font-body leading-relaxed border-t border-white/5 mt-2 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-k-silver-dim mb-4">Still have questions?</p>
          <a href="/contact" className="btn-primary inline-flex">
            Contact Our Team
          </a>
        </div>
      </div>
    </div>
  )
}
