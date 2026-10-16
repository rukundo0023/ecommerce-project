import { Link } from "react-router-dom";

const benefits = [
  {
    number: "01",
    title: "Thoughtfully selected",
    description: "Useful finds and everyday favorites, all in one easy place.",
  },
  {
    number: "02",
    title: "A smoother checkout",
    description: "A simple, secure way to place your order whenever you're ready.",
  },
  {
    number: "03",
    title: "Here when you need us",
    description: "A friendly shopping experience from first browse to delivery.",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-white">
      <div className="bg-slate-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        A considered collection for everyday living <span className="mx-2 text-accent-500">✳</span> Explore something good
      </div>

      <section className="relative isolate overflow-hidden bg-white">
        <div className="absolute -right-28 -top-36 -z-10 h-[34rem] w-[34rem] rounded-full bg-brand-100 opacity-60 blur-3xl" />
        <div className="absolute -bottom-48 left-[30%] -z-10 h-96 w-96 rounded-full bg-orange-100 opacity-50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:gap-14 sm:px-5 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:py-28">
          <div className="relative z-10">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-800">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
              Meet your new favorite store
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.03] tracking-[-0.055em] text-slate-900 sm:text-6xl lg:text-6xl">
              Everyday finds.
              <span className="mt-2 block font-serif italic font-normal text-brand-700">
                A little more special.
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Discover useful, beautiful things picked to make the everyday feel
              better. Your next favorite is just around the corner.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-brand-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-800/20 transition hover:-translate-y-0.5 hover:bg-brand-800 sm:px-7"
              >
                Explore the collection
                <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/register"
                className="rounded-full px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                Join the community
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-4 border-t border-slate-200 pt-6">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-accent-500 text-xs text-white">✦</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-brand-600 text-xs text-white">✳</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-brand-300 text-xs text-slate-900">♡</span>
              </div>
              <p className="text-xs leading-5 text-slate-600">
                <span className="block font-semibold text-slate-900">Good things, easy to find.</span>
                Find your next everyday favorite.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="absolute -right-3 top-8 h-24 w-24 rounded-full border border-brand-700/20 sm:-right-8 sm:h-32 sm:w-32" />
            <div className="absolute -bottom-5 -left-4 h-28 w-28 rounded-full bg-accent-500/20 blur-2xl sm:-left-10 sm:h-40 sm:w-40" />
            <div className="relative grid aspect-[0.95] grid-cols-[1fr_0.82fr] grid-rows-[0.8fr_1fr] gap-2 sm:gap-4">
              <div className="relative row-span-2 overflow-hidden rounded-[1.5rem] bg-brand-900 p-4 text-white shadow-2xl shadow-slate-900/20 sm:rounded-[2.5rem] sm:p-8">
                <div className="absolute -right-16 top-20 h-56 w-56 rounded-full border-[28px] border-white/20" />
                <div className="absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-accent-500/40 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-100 sm:text-xs sm:tracking-[0.2em]">The good edit</span>
                  <div>
                    <div className="mb-4 grid h-24 w-24 place-items-center rounded-full bg-white/90 shadow-inner sm:mb-5 sm:h-44 sm:w-44">
                      <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-brand-200 bg-brand-100 text-4xl text-brand-800 shadow-lg sm:h-32 sm:w-32 sm:text-6xl">
                        <span aria-label="sun" role="img">☼</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium tracking-tight sm:text-3xl">Made for<br />your everyday.</p>
                    <p className="mt-2 text-xs text-brand-100 sm:mt-3 sm:text-sm">Find your next favorite</p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[1.5rem] bg-orange-100 p-3 shadow-xl sm:rounded-[2.5rem] sm:p-7">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-white/60" />
                <div className="absolute bottom-3 right-3 h-16 w-16 rotate-12 rounded-[1rem] bg-accent-700 shadow-lg sm:bottom-5 sm:right-8 sm:h-32 sm:w-32 sm:rounded-[1.5rem]" />
                <div className="absolute bottom-6 right-6 h-11 w-11 rotate-12 rounded-[0.75rem] border border-orange-300 bg-accent-500 sm:bottom-16 sm:right-20 sm:h-20 sm:w-20 sm:rounded-[1rem]" />
                <p className="relative z-10 max-w-24 text-xs font-semibold leading-4 text-slate-900 sm:text-sm sm:leading-5">Small details, big joy.</p>
                <span className="absolute bottom-3 left-3 text-2xl text-white sm:bottom-5 sm:left-5 sm:text-3xl">✳</span>
              </div>
              <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] bg-brand-50 p-3 sm:rounded-[2.5rem] sm:p-7">
                <div className="absolute -bottom-12 -right-7 h-40 w-40 rounded-full bg-brand-200/70" />
                <span className="relative text-2xl text-brand-700 sm:text-3xl">↗</span>
                <div className="relative">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-800 sm:text-xs sm:tracking-[0.16em]">Thoughtful picks</p>
                  <p className="mt-2 text-base font-semibold leading-tight text-slate-900 sm:text-2xl">Good things<br />live here.</p>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 top-[43%] hidden -translate-y-1/2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:block">
              <p className="text-xs font-semibold text-brand-800">A fresh perspective</p>
              <p className="mt-1 text-xs text-slate-600">Shop what feels like you</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">Why RukundoeShop</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Shopping, made more enjoyable.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">A calmer way to find the things you need—with a little inspiration along the way.</p>
        </div>
        <div className="grid gap-4 pt-7 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.number} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 sm:p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">{benefit.number}</span>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
              <span aria-hidden="true" className="mt-5 block text-xl text-accent-700 transition group-hover:translate-x-1">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-slate-900 sm:mx-auto sm:mb-20 sm:max-w-7xl sm:rounded-[2.5rem]">
        <div className="relative flex flex-col justify-between gap-8 px-7 py-10 sm:flex-row sm:items-center sm:px-12 sm:py-12">
          <div className="absolute -right-8 -top-28 h-64 w-64 rounded-full border-[1px] border-white/10 sm:right-20" />
          <div className="absolute -right-3 -top-20 h-52 w-52 rounded-full border-[1px] border-white/10 sm:right-24" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">The good stuff is waiting</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Make room for something you’ll love.</h2>
          </div>
          <Link to="/products" className="relative inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-bold text-brand-800 transition hover:bg-brand-50">
            Start exploring <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
