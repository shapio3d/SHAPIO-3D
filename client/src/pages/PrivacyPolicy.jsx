import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 uppercase">
            Privacy Policy
          </h1>
          <p className="text-lg text-k-silver-dim font-body max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how Shapio 3D Technologies collects, uses, and protects your information.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We may collect the following types of information when you use our website or services:
            </p>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2 mt-3">
              <li><strong className="text-white">Personal Information:</strong> Name, phone number, email address, delivery address, and other contact details you provide when placing an order or contacting us.</li>
              <li><strong className="text-white">Project Information:</strong> Design files, specifications, drawings, and technical requirements shared for quotation or production purposes.</li>
              <li><strong className="text-white">Order Information:</strong> Order history, payment details, and transaction records.</li>
              <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and browser type (collected via Cloudflare Web Analytics).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="text-k-silver-dim leading-relaxed mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Processing and fulfilling your orders</li>
              <li>Providing quotations and communicating about project requirements</li>
              <li>Sending order confirmations, production updates, and delivery notifications</li>
              <li>Improving our website, services, and customer experience</li>
              <li>Responding to inquiries and providing customer support</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">3. Data Sharing</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We do not intentionally sell or share your personal information with unrelated third parties. Your information may be shared only in the following circumstances:
            </p>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2 mt-3">
              <li><strong className="text-white">Service Delivery:</strong> With shipping partners and courier services to deliver your orders.</li>
              <li><strong className="text-white">Payment Processing:</strong> With payment gateways to process your transactions securely.</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, regulation, or legal proceedings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">4. Data Security</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our website uses SSL/TLS encryption, and we employ industry-standard security practices to safeguard your data.
              <br /><br />
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">5. Cookies & Analytics</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We use Cloudflare Web Analytics, a privacy-focused analytics service that does not use cookies or track individual users. It collects aggregate data about page views, visitor counts, and referral sources to help us improve our website.
              <br /><br />
              We do not use any third-party tracking cookies or advertising trackers on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="text-k-silver-dim leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 text-k-silver-dim leading-relaxed space-y-2">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal data (subject to legal and business requirements)</li>
              <li>Opt out of promotional communications</li>
            </ul>
            <p className="text-k-silver-dim leading-relaxed mt-3">
              To exercise any of these rights, please contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">7. Data Retention</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-k-silver-dim leading-relaxed">
              We may update this Privacy Policy from time to time. The latest version will always be available on our website. We encourage you to review this page periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sub font-semibold text-white mb-3">9. Contact Us</h2>
            <p className="text-k-silver-dim leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              <br /><br />
              <span className="font-semibold text-white">Shapio 3D Technologies</span>
              <br />
              Email: <a href="mailto:shapio3dtech@gmail.com" className="text-emerald-400 hover:underline">shapio3dtech@gmail.com</a>
              <br />
              Phone: <a href="tel:+916384014546" className="text-emerald-400 hover:underline">+91 63840 14546</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

