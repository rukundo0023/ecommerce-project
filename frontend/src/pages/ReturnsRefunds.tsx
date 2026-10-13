import { Link } from "react-router-dom";

const CONTACT_EMAIL = "clevisrukundo@gmail.com";
const CONTACT_PHONE = "0780381227";

const returnSteps = [
  {
    number: "1",
    title: "Get in touch",
    description:
      "Email or call us with your order number and a brief description of what happened.",
  },
  {
    number: "2",
    title: "We’ll review your request",
    description:
      "Our team will check the details and explain the return options and eligibility for your purchase.",
  },
  {
    number: "3",
    title: "Get help with next steps",
    description:
      "If a return or refund is applicable, we’ll guide you through the process and explain what happens next.",
  },
];

export default function ReturnsRefunds() {
  return (
    <main className="bg-[#f3efe4] px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] bg-[#fffdf8] shadow-sm ring-1 ring-stone-200">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-12 lg:py-16">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#e6e8dc] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#315b49]">
                <span aria-hidden="true" className="text-[#b1704d]">✳</span>
                Here to help
              </p>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-[#202b25] sm:text-5xl">
                Returns <span className="font-serif italic text-[#55735e]">&</span>{" "}
                Refunds
              </h1>
              <p className="mt-5 max-w-lg leading-7 text-[#62665c]">
                Need help with a purchase? Tell us what happened. We’ll review
                your order and help you understand the available next steps.
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#244b3d] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#193b30]"
              >
                Start a return enquiry <span aria-hidden="true">→</span>
              </Link>
            </div>

            <aside className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#dfe6d9] p-7 sm:p-10 lg:min-h-full">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[30px] border-[#55735e]/10" />
              <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#c47e52]/15 blur-2xl" />
              <div className="relative">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fffdf8]/80 text-2xl text-[#315b49] shadow-sm" aria-hidden="true">
                  ↺
                </span>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#55735e]">
                  A simple place to start
                </p>
                <p className="mt-3 max-w-sm text-2xl font-semibold leading-snug text-[#283d31]">
                  Every order is different. We’ll help you find the right next
                  step.
                </p>
              </div>
              <p className="relative mt-8 text-sm leading-6 text-[#62665c]">
                Return eligibility and refund details are confirmed with you
                based on your order.
              </p>
            </aside>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b1704d]">
              What to expect
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#202b25] sm:text-4xl">
              We’ll walk through it together
            </h2>
          </div>

          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {returnSteps.map((step) => (
              <li
                key={step.number}
                className="rounded-2xl border border-[#e2dfd4] bg-[#fffdf8] p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#244b3d] font-semibold text-white">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#283d31]">
                  {step.title}
                </h3>
                <p className="mt-2 leading-6 text-[#62665c]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col justify-between gap-6 rounded-2xl bg-[#244b3d] p-7 text-[#fffdf8] sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="text-2xl font-semibold">Let’s get it sorted.</h2>
            <p className="mt-2 text-sm leading-6 text-[#e0e8dc]">
              Include your order number when you contact us so we can help
              faster.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Returns Question")}`}
              className="font-semibold text-[#f1d1ae] underline decoration-[#f1d1ae]/50 underline-offset-4 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="text-sm font-medium text-[#e0e8dc] hover:text-white"
            >
              Call {CONTACT_PHONE}
            </a>
            <Link
              to="/contact"
              className="text-sm font-semibold text-white hover:underline"
            >
              More ways to contact us
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
