import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/#footer" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Terms & Policies
          </h1>
          <p className="text-lg text-k-silver-dim font-body max-w-2xl mx-auto">
            Please read these terms carefully before placing an order with Shapio 3D Technologies.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">1. General Terms</h2>
            <p className="text-k-silver-dim leading-relaxed">
              By placing an order with Shapio 3D Technologies, the customer agrees to the terms and policies mentioned below. These terms apply to all 3D printing, product development, prototyping, design, manufacturing, training, and related services provided by us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">2. Quotation & Pricing</h2>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>All quotations are based on the specifications, quantity, material, design, finishing, and other requirements shared by the customer.</li>
              <li>The quoted price may change if there are modifications to the design, quantity, material, or project requirements after quotation approval.</li>
              <li>A quotation is valid for the period mentioned in the quotation.</li>
              <li>Additional charges may apply for urgent orders, special materials, complex finishing, design modifications, or additional processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">3. Order Confirmation & Payment</h2>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>An order will be considered confirmed only after receiving the required advance/payment.</li>
              <li>Production will normally begin after confirmation of the order and approval of the final design/specifications.</li>
              <li>The balance payment, if applicable, must be completed as per the agreed payment terms before dispatch or delivery.</li>
              <li>For customized or made-to-order products, payment terms may differ based on the project requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">4. Custom Designs & Design Approval</h2>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Customers are responsible for providing accurate dimensions, drawings, references, and technical requirements.</li>
              <li>Where Shapio 3D Technologies provides design/modelling support, the customer must review and approve the final design before production.</li>
              <li>Once production starts, design changes may result in additional charges and revised delivery timelines.</li>
              <li>Any errors resulting from incorrect information or dimensions provided by the customer may require a new print or redesign at additional cost.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">5. 3D Printing Tolerance & Product Variation</h2>
            <p className="text-k-silver-dim leading-relaxed mb-2">3D printed parts may have minor variations due to material properties, printing technology, machine settings, environmental conditions, and post-processing.</p>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Minor dimensional variations within reasonable manufacturing tolerance may occur.</li>
              <li>Surface finish, layer lines, colour, texture, and appearance may vary depending on the material and printing process.</li>
              <li>Exact colour matching cannot always be guaranteed for every material or batch.</li>
              <li>For critical engineering applications, required tolerances must be specified and agreed upon before production.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">6. Material Selection</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Material recommendations are made based on the intended application, strength, flexibility, temperature resistance, appearance, and other requirements shared by the customer.
              <br /><br />
              The final material selection should be confirmed before production. Shapio 3D Technologies will not be responsible for performance issues resulting from an unsuitable application or incorrect requirements provided by the customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">7. Design Files & Intellectual Property</h2>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Customers must have the necessary rights or authorization to use the designs, models, logos, images, and other files submitted to us.</li>
              <li>Customers are responsible for any copyright, trademark, patent, or intellectual-property issues related to files supplied by them.</li>
              <li>Shapio 3D Technologies will not knowingly reproduce protected designs without appropriate authorization.</li>
              <li>Designs created by Shapio 3D Technologies remain subject to the agreed ownership and usage terms for the respective project.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">8. Confidentiality</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Customer-provided designs, drawings, product concepts, and project information will be handled with reasonable confidentiality and used only for fulfilling the agreed requirements.
              <br /><br />
              Where a project requires specific confidentiality or an NDA, the terms can be agreed upon separately before starting the project.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">9. Cancellation & Modification</h2>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Custom production orders may not be cancellable once manufacturing has started.</li>
              <li>If cancellation is requested after production begins, costs already incurred for material, printing, labour, design, and processing may be deducted from any eligible refund.</li>
              <li>Design or quantity changes after order confirmation may affect the final price and delivery timeline.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">10. Returns & Refunds</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Since most of our products are customized or manufactured according to customer requirements, returns are generally not accepted for change-of-mind reasons.
              <br /><br />
              If a product has a confirmed manufacturing defect or significant issue attributable to Shapio 3D Technologies, the customer should contact us within the specified period after receiving the product. After review, we may offer repair, reprint, replacement, or an appropriate resolution where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">11. Product Inspection</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Customers are advised to inspect the product immediately after delivery.
              <br /><br />
              Any damage, missing items, or significant manufacturing issues should be reported to us as soon as possible with photographs/videos and relevant order details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">12. Delivery & Dispatch</h2>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Delivery timelines are estimates and depend on product complexity, quantity, material availability, production load, and finishing requirements.</li>
              <li>Delays caused by courier services, transportation issues, material availability, natural events, or circumstances beyond our reasonable control may affect the delivery date.</li>
              <li>Shipping charges, where applicable, will be communicated separately.</li>
              <li>Customers are responsible for providing accurate delivery information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">13. Prototype & Product Development</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Prototype and R&D projects may require multiple iterations.
              <br /><br />
              The final product performance may depend on design, material selection, assembly, electronics, operating conditions, and other factors outside the printing process. Prototype development does not guarantee that the final product will meet a particular commercial or industrial performance requirement unless specifically agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">14. Engineering & Functional Applications</h2>
            <p className="text-k-silver-dim leading-relaxed">
              For safety-critical, load-bearing, medical, automotive, aerospace, or other high-risk applications, customers must clearly communicate the intended use and required specifications before production.
              <br /><br />
              Printed parts should be properly tested and validated by the customer before being used in critical applications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">15. Warranty</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Warranty, if applicable, will depend on the product and will be clearly mentioned in the quotation or invoice.
              <br /><br />
              Warranty does not normally cover damage caused by incorrect installation, misuse, excessive load, unsuitable operating conditions, modifications, accidents, or normal wear and tear.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">16. Customer-Supplied Components</h2>
            <p className="text-k-silver-dim leading-relaxed">
              If customers provide physical components, electronics, materials, or other items for integration or modification, they are responsible for ensuring that the supplied items are suitable and functional.
              <br /><br />
              Shapio 3D Technologies will take reasonable care of customer-supplied items during the agreed service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">17. Website Content & Information</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We make reasonable efforts to keep the information on our website accurate and updated. Product availability, pricing, specifications, images, service capabilities, and timelines may change without prior notice.
              <br /><br />
              Website images may be used for reference and may not always represent the exact final product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">18. Privacy Policy</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Customer information such as name, phone number, email address, delivery details, project information, and order details may be collected for providing our services, processing orders, communicating with customers, and improving our services.
              <br /><br />
              We do not intentionally sell or share customer information with unrelated third parties, except where required for service delivery, payment processing, shipping, legal compliance, or other legitimate business requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">19. Communication</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Customers may be contacted through phone, WhatsApp, email, or other communication channels provided by them for quotation updates, order confirmations, production updates, payment information, and delivery-related communication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">20. Limitation of Liability</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Shapio 3D Technologies will make reasonable efforts to provide products and services according to the agreed specifications.
              <br /><br />
              We will not be responsible for indirect losses, business interruption, loss of profits, or damages resulting from misuse, unauthorized modification, incorrect customer-provided information, or use of a product outside its intended application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">21. Right to Refuse an Order</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Shapio 3D Technologies reserves the right to refuse or discontinue an order if the requested product, design, application, or service is technically infeasible, unlawful, unsafe, or outside our capabilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">22. Changes to These Policies</h2>
            <p className="text-k-silver-dim leading-relaxed">
              Shapio 3D Technologies reserves the right to update these terms and policies from time to time. The latest version published on our website will apply to future orders and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">23. Contact Us</h2>
            <p className="text-k-silver-dim leading-relaxed">
              For questions regarding our Terms & Policies, quotations, orders, or services, customers can contact Shapio 3D Technologies through our official communication channels.
              <br /><br />
              <span className="font-semibold text-white">Shapio 3D Technologies</span>
              <br />
              <span className="italic">From Idea to Product — Design. Prototype. Manufacture.</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
