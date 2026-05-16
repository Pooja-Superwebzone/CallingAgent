import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-white to-slate-50 text-slate-900 overflow-x-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-indigo-100 opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute top-48 -right-24 h-[24rem] w-[24rem] rounded-full bg-fuchsia-100 opacity-50 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white font-bold">
              AI
            </div>
            <span className="text-lg font-semibold">Richa AI</span>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm font-medium text-indigo-700 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
              Privacy Policy
            </span>
            <button
              type="button"
              onClick={() => navigate("/tutorial")}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Tutorial
            </button>
            <button
              type="button"
              onClick={() => navigate("/login?tab=login")}
              className="hidden sm:inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/login?tab=signup")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Signup
            </button>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-600">Effective Date: January 1, 2026</p>

        <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
          <p>
            Richa AI (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our site and use our AI-powered sales and communication services.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
            <p className="mt-2">We may collect the following types of information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-slate-800">Personal Information:</strong> Name, email address, phone number,
                business details, billing details.
              </li>
              <li>
                <strong className="text-slate-800">Usage Data:</strong> IP address, browser type, device type, pages
                visited, time spent on pages.
              </li>
              <li>
                <strong className="text-slate-800">Communication Data:</strong> Messages, inquiries, chat logs, WhatsApp
                interaction data.
              </li>
              <li>
                <strong className="text-slate-800">Payment Information:</strong> Processed securely via third-party
                payment gateways.
              </li>
              <li>
                <strong className="text-slate-800">Cookies &amp; Tracking Technologies:</strong> Used for analytics and
                service improvements.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
            <p className="mt-2">We use collected data to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Provide and maintain our AI services</li>
              <li>Process subscriptions and payments</li>
              <li>Improve platform functionality and performance</li>
              <li>Send important updates and notifications</li>
              <li>Provide customer support</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Cookies and Tracking Technologies</h2>
            <p className="mt-2">
              We use cookies and similar tracking technologies to enhance your experience. These may include session
              cookies, analytics cookies, and advertising cookies. You may disable cookies in your browser settings, but
              some features may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Third-Party Services</h2>
            <p className="mt-2">We may use trusted third-party services including:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Payment gateways</li>
              <li>Cloud hosting providers</li>
              <li>Analytics providers</li>
              <li>Marketing automation tools</li>
            </ul>
            <p className="mt-3">These third parties have their own privacy policies governing data usage.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Data Security</h2>
            <p className="mt-2">
              We implement industry-standard security measures including encryption, secure servers, and access controls
              to protect your information from unauthorized access or disclosure. However, no system can guarantee 100%
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Data Retention</h2>
            <p className="mt-2">
              We retain your information only as long as necessary to fulfill service requirements, legal obligations, and
              business needs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Your Rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent where applicable</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Children&apos;s Privacy</h2>
            <p className="mt-2">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect data from
              children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. International Data Transfers</h2>
            <p className="mt-2">
              Your information may be transferred and processed outside your country of residence. We ensure appropriate
              safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">10. Updates to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated
              effective date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">11. Contact Information</h2>
            <p className="mt-2">
              If you have questions regarding this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:contact@infinitybrains.com"
                className="font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
              >
                contact@infinitybrains.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Richa AI. All rights reserved.</span>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-left font-medium text-indigo-600 hover:text-indigo-800 sm:text-right"
          >
            Back to home
          </button>
        </div>
      </footer>
    </div>
  );
}
