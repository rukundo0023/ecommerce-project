import { Link } from "react-router-dom";

const privacySections = [
  {
    title: "Information we collect",
    content:
      "We collect information needed to provide a smooth shopping experience, including your contact details, order history, payment information required for processing transactions, account details, and browsing activity that helps us improve our services.",
  },
  {
    title: "How we use your information",
    content:
      "Your information helps us process and deliver orders, manage your account, personalize your shopping experience, communicate important updates, prevent fraud, and improve the quality of our products and services.",
  },
  {
    title: "Sharing and disclosure",
    content:
      "We may share information with trusted service providers involved in shipping, payment processing, customer support, analytics, and marketing, only as needed to operate our store and meet legal obligations.",
  },
  {
    title: "Your choices",
    content:
      "You can update your account details, manage email communications, and contact us to request access to, correction of, or deletion of your personal information where applicable under local laws.",
  },
  {
    title: "Security",
    content:
      "We use reasonable administrative, technical, and physical safeguards to protect personal information. However, no system is completely secure, and we encourage you to keep your account credentials confidential.",
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="bg-white">
      <section className="relative isolate overflow-hidden bg-slate-900 text-white">
        <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full border-[38px] border-white/5" />
        <div className="absolute -bottom-28 left-[12%] -z-10 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
            Your privacy matters
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            We are committed to protecting your personal information and being transparent about how we use it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-18">
        <div className="space-y-8">
          {privacySections.map((section) => (
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
            Contact us
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            If you have questions about this Privacy Policy, please contact us at
            <a
              href="mailto:clevisrukundo@gmail.com"
              className="ml-1 font-semibold text-brand-800 underline decoration-brand-800/40 underline-offset-4"
            >
              clevisrukundo@gmail.com
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/terms-and-conditions"
              className="inline-flex items-center rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
            >
              Read Terms & Conditions
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-brand-700 px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
