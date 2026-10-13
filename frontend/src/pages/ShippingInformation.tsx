import { Link } from "react-router-dom";

const CONTACT_EMAIL = "clevisrukundo@gmail.com";

const shippingQuestions = [
  {
    number: "01",
    title: "Where do you deliver?",
    description:
      "Delivery availability depends on your destination. Contact us with your location and we’ll confirm the options for your order.",
  },
  {
    number: "02",
    title: "How long will delivery take?",
    description:
      "Delivery estimates can vary by destination and order. Get in touch for the latest estimate for your purchase.",
  },
  {
    number: "03",
    title: "What does shipping cost?",
    description:
      "Shipping charges may depend on your destination and order. We can help clarify the cost before you place an order.",
  },
];

export default function ShippingInformation() {
  return (
    <main className="bg-[#faf8f2]">
      <section className="relative isolate overflow-hidden bg-[#244b3d] text-[#fffdf8]">
        <div className="absolute -right-24 -top-36 -z-10 h-96 w-96 rounded-full border-[48px] border-white/5" />
        <div className="absolute -bottom-36 left-[15%] -z-10 h-80 w-80 rounded-full bg-[#d6a579]/15 blur-3xl" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9bc98]">
            The details, made simple
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Shipping Information
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#e0e8dc] sm:text-lg">
            We want your order to reach you smoothly. Get in touch and we’ll
            help you understand delivery options for your destination.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Shipping Question")}`}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#fffdf8] px-6 py-3.5 text-sm font-semibold text-[#244b3d] transition hover:-translate-y-0.5 hover:bg-[#f1eee3]"
          >
            Ask us about shipping <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b1704d]">
            Before your order arrives
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#202b25] sm:text-4xl">
            Need a little more detail?
          </h2>
          <p className="mt-4 leading-7 text-[#62665c]">
            Availability, delivery estimates, and shipping charges depend on
            your destination and order. We’re happy to confirm the details with
            you directly.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {shippingQuestions.map((item) => (
            <article
              key={item.number}
              className="rounded-2xl border border-[#e2dfd4] bg-[#fffdf8] p-6 shadow-sm"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e6e8dc] text-sm font-bold text-[#315b49]">
                {item.number}
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#283d31]">
                {item.title}
              </h3>
              <p className="mt-2 leading-6 text-[#62665c]">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl bg-[#f1eee3] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-[#283d31]">
              Asking about an existing order?
            </h2>
            <p className="mt-2 leading-6 text-[#62665c]">
              Include your order number and delivery location so we can help
              more quickly.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#315b49] px-6 py-3 text-sm font-semibold text-[#315b49] transition hover:bg-white"
          >
            Contact ShopEase
          </Link>
        </div>
      </section>
    </main>
  );
}
