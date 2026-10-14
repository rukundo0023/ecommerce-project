interface CustomerServicePageProps {
  title: string;
  intro: string;
  details: string[];
  emailSubject: string;
}

const CONTACT_EMAIL = "clevisrukundo@gmail.com";
const CONTACT_PHONE = "0780381227";

export default function CustomerServicePage({
  title,
  intro,
  details,
  emailSubject,
}: CustomerServicePageProps) {
  const emailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <main className="min-h-[60vh] bg-white px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-800">
            ShopEase Customer Service
          </p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <p className="mt-4 leading-7 text-stone-600">{intro}</p>

          <ul className="mt-6 list-inside list-disc space-y-3 leading-7 text-stone-700">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <section
            aria-labelledby="contact-details-heading"
            className="mt-8 rounded-xl border border-slate-200 bg-white p-6"
          >
            <h2 id="contact-details-heading" className="text-lg font-bold">
              Get in touch
            </h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href={emailHref}
                className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-brand-800"
              >
                Email {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="inline-flex items-center justify-center rounded-lg border border-brand-700 px-5 py-3 text-center font-semibold text-brand-900 transition hover:bg-white"
              >
                Call {CONTACT_PHONE}
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
