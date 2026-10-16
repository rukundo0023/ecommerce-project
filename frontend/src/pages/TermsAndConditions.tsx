import { Link } from "react-router-dom";

const termsSections = [
  {
    title: "Acceptance of terms",
    content:
      "By using RukundoeShop, you agree to these Terms & Conditions and any policies referenced within them. If you do not agree, please do not use the site or place orders with us.",
  },
  {
    title: "Product information and availability",
    content:
      "We do our best to provide accurate product information, pricing, and availability. We reserve the right to correct errors, update listings, and limit quantities without notice.",
  },
  {
    title: "Orders and payments",
    content:
      "Orders are subject to acceptance and confirmation. We may decline or cancel orders for reasons such as suspected fraud, payment issues, stock availability, or inaccurate information. Payment must be completed in full before items are dispatched.",
  },
  {
    title: "Shipping and delivery",
    content:
      "Delivery times are estimates and may vary by destination, courier, and order circumstances. We are not liable for delays caused by third-party shipping partners, customs, or force majeure events.",
  },
  {
    title: "Returns, refunds, and cancellations",
    content:
      "Returns and refunds are processed in accordance with our Returns & Refunds policy and applicable consumer protection laws. Certain products may be non-returnable depending on their nature and condition.",
  },
  {
    title: "Intellectual property",
    content:
      "All content, branding, images, text, and product information on this website are the property of RukundoeShop or its licensors and may not be reproduced or used without prior written consent.",
  },
  {
    title: "Limitation of liability",
    content:
      "RukundoeShop shall not be liable for indirect, incidental, special, or consequential damages arising from the use of our store, including loss of data, business interruption, or loss of profits, except where prohibited by law.",
  },
];

export default function TermsAndConditions() {
  return (
    <main className="bg-white">
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <div className="absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full border-[42px] border-white/5" />
        <div className="absolute -bottom-28 left-[10%] -z-10 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
            Our store rules
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Terms & Conditions
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            These terms govern your use of our website and services. Please read them carefully before shopping with us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-18">
        <div className="space-y-8">
          {termsSections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-slate-900">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">{section.content}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          <h2 className="text-xl font-semibold text-slate-900">
            Need clarification?
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            We’re happy to help if you have questions about these terms or any order-related matter.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Read Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-brand-700 px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
