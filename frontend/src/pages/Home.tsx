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
    <main className="overflow-hidden bg-[#faf8f2]">
      <div className="bg-[#244b3d] px-4 py-2 text-center text-xs font-medium tracking-wide text-[#f4eddb] sm:text-sm">
        A considered collection for everyday living <span className="mx-2 text-[#d6a579]">✳</span> Explore something good
      </div>

      <section className="relative isolate overflow-hidden bg-[#f1eee3]">
        <div className="absolute -right-28 -top-36 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#d9e3d5] opacity-70 blur-3xl" />
        <div className="absolute -bottom-48 left-[30%] -z-10 h-96 w-96 rounded-full bg-[#eadac8] opacity-70 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:py-28">
          <div className="relative z-10">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b7c7b2] bg-[#faf8f2]/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#315b49]">
              <span className="h-2 w-2 rounded-full bg-[#c47e52]" />
              Meet your new favorite store
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.03] tracking-[-0.055em] text-[#202b25] sm:text-6xl lg:text-7xl">
              Everyday finds.
              <span className="mt-2 block font-serif italic font-normal text-[#55735e]">
                A little more special.
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#62665c] sm:text-lg">
              Discover useful, beautiful things picked to make the everyday feel
              better. Your next favorite is just around the corner.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-[#244b3d] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#244b3d]/15 transition hover:-translate-y-0.5 hover:bg-[#193b30]"
              >
                Explore the collection
                <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/register"
                className="rounded-full px-4 py-3 text-sm font-semibold text-[#315b49] transition hover:bg-white/60"
              >
                Join the community
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-4 border-t border-[#d7d5c9] pt-6">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#f1eee3] bg-[#d9b294] text-xs">✦</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#f1eee3] bg-[#a9bba2] text-xs">✳</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#f1eee3] bg-[#e7c999] text-xs">♡</span>
              </div>
              <p className="text-xs leading-5 text-[#62665c]">
                <span className="block font-semibold text-[#283d31]">Good things, easy to find.</span>
                Find your next everyday favorite.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="absolute -right-3 top-8 h-24 w-24 rounded-full border border-[#7e9a80]/40 sm:-right-8 sm:h-32 sm:w-32" />
            <div className="absolute -bottom-5 -left-4 h-28 w-28 rounded-full bg-[#c47e52]/15 blur-2xl sm:-left-10 sm:h-40 sm:w-40" />
            <div className="relative grid aspect-[0.95] grid-cols-[1fr_0.82fr] grid-rows-[0.8fr_1fr] gap-3 sm:gap-4">
              <div className="relative row-span-2 overflow-hidden rounded-[2rem] bg-[#385a48] p-6 text-[#f7f1e5] shadow-2xl shadow-[#293c30]/20 sm:rounded-[2.5rem] sm:p-8">
                <div className="absolute -right-16 top-20 h-56 w-56 rounded-full border-[28px] border-[#d5b995]/30" />
                <div className="absolute -bottom-12 -left-10 h-48 w-48 rounded-full bg-[#c47e52]/50 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dce4d7]">The good edit</span>
                  <div>
                    <div className="mb-5 grid h-32 w-32 place-items-center rounded-full bg-[#e7d8bd] shadow-inner sm:h-44 sm:w-44">
                      <div className="grid h-24 w-24 place-items-center rounded-full border border-[#b9996d] bg-[#d8bd94] text-5xl shadow-lg sm:h-32 sm:w-32 sm:text-6xl">
                        <span aria-label="sun" role="img">☼</span>
                      </div>
                    </div>
                    <p className="text-2xl font-medium tracking-tight sm:text-3xl">Made for<br />your everyday.</p>
                    <p className="mt-3 text-sm text-[#e0e8dc]">Find your next favorite</p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[2rem] bg-[#dfc7a6] p-5 shadow-xl sm:rounded-[2.5rem] sm:p-7">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border-[18px] border-[#fff6e6]/50" />
                <div className="absolute bottom-5 right-8 h-24 w-24 rotate-12 rounded-[1.5rem] bg-[#b76f4f] shadow-lg sm:h-32 sm:w-32" />
                <div className="absolute bottom-11 right-14 h-16 w-16 rotate-12 rounded-[1rem] border border-[#e8c6a8] bg-[#d99a72] sm:bottom-16 sm:right-20 sm:h-20 sm:w-20" />
                <p className="relative z-10 max-w-24 text-sm font-semibold leading-5 text-[#443a2e]">Small details, big joy.</p>
                <span className="absolute bottom-5 left-5 text-3xl text-[#f5ebd9]">✳</span>
              </div>
              <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#e6e8dc] p-5 sm:rounded-[2.5rem] sm:p-7">
                <div className="absolute -bottom-12 -right-7 h-40 w-40 rounded-full bg-[#9caf91]/70" />
                <span className="relative text-3xl text-[#55735e]">↗</span>
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#55735e]">Thoughtful picks</p>
                  <p className="mt-2 text-xl font-semibold leading-tight text-[#283d31] sm:text-2xl">Good things<br />live here.</p>
                </div>
              </div>
            </div>
            <div className="absolute -left-4 top-[43%] hidden -translate-y-1/2 rounded-2xl border border-white/70 bg-[#fffdf8]/90 px-4 py-3 shadow-lg backdrop-blur sm:block">
              <p className="text-xs font-semibold text-[#315b49]">A fresh perspective</p>
              <p className="mt-1 text-[11px] text-[#77796f]">Shop what feels like you</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-[#e2dfd4] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b1704d]">Why ShopEase</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#202b25] sm:text-4xl">Shopping, made more enjoyable.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#6a6b61]">A calmer way to find the things you need—with a little inspiration along the way.</p>
        </div>
        <div className="grid gap-4 pt-7 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.number} className="group rounded-2xl border border-[#e6e2d8] bg-[#fffdf8] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#31493a]/5 sm:p-7">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8eee5] text-xs font-bold text-[#315b49]">{benefit.number}</span>
              <h3 className="mt-6 text-lg font-semibold text-[#283d31]">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6a6b61]">{benefit.description}</p>
              <span aria-hidden="true" className="mt-5 block text-xl text-[#b1704d] transition group-hover:translate-x-1">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[#244b3d] sm:mx-auto sm:mb-20 sm:max-w-7xl sm:rounded-[2.5rem]">
        <div className="relative flex flex-col justify-between gap-8 px-7 py-10 sm:flex-row sm:items-center sm:px-12 sm:py-12">
          <div className="absolute -right-8 -top-28 h-64 w-64 rounded-full border-[1px] border-white/10 sm:right-20" />
          <div className="absolute -right-3 -top-20 h-52 w-52 rounded-full border-[1px] border-white/10 sm:right-24" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d5b995]">The good stuff is waiting</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[#fffdf8] sm:text-4xl">Make room for something you’ll love.</h2>
          </div>
          <Link to="/products" className="relative inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#f1e8d7] px-6 py-4 text-sm font-bold text-[#244b3d] transition hover:bg-white">
            Start exploring <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
