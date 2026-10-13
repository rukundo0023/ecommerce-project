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
    <main className="bg-[#faf8f2]">
      <section className="relative isolate overflow-hidden bg-[#244b3d] text-[#fffdf8]">
        <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full border-[38px] border-white/5" />
        <div className="absolute -bottom-28 left-[12%] -z-10 h-80 w-80 rounded-full bg-[#d6a579]/15 blur-3xl" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9bc98]">
            Your privacy matters
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#e0e8dc] sm:text-lg">
            We are committed to protecting your personal information and being transparent about how we use it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:py-18">
        <div className="space-y-8">
          {privacySections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-[#e2dfd4] bg-[#fffdf8] p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-[#2a3a31]">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-[#5c635d]">{section.content}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-[#f2efe7] p-6 text-[#2f3c35]">
          <h2 className="text-xl font-semibold text-[#1f312b]">
            Contact us
          </h2>
          <p className="mt-3 leading-7 text-[#5b625d]">
            If you have questions about this Privacy Policy, please contact us at
            <a
              href="mailto:clevisrukundo@gmail.com"
              className="ml-1 font-semibold text-[#244b3d] underline decoration-[#244b3d]/40 underline-offset-4"
            >
              clevisrukundo@gmail.com
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/terms-and-conditions"
              className="inline-flex items-center rounded-full bg-[#244b3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193b30]"
            >
              Read Terms & Conditions
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-[#244b3d] px-5 py-3 text-sm font-semibold text-[#244b3d] transition hover:bg-white"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
