import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";

const categories = [
  {
    name: "Fashion",
    note: "Pieces with personality",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=720&q=85",
    imageAlt: "Friends browsing a thoughtfully curated clothing collection",
    className: "object-[center_38%]",
  },
  {
    name: "Electronics",
    note: "Clever everyday essentials",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=720&q=85",
    imageAlt: "A collection of useful modern electronic devices",
    className: "object-center",
  },
  {
    name: "Home & Kitchen",
    note: "Make yourself at home",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=720&q=85",
    imageAlt: "Warm, inviting living room with considered home details",
    className: "object-center",
  },
  {
    name: "Beauty & Personal Care",
    note: "A little time for you",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=720&q=85",
    imageAlt: "A selection of beauty and personal care products",
    className: "object-center",
  },
];

const benefits = [
  {
    number: "01",
    title: "Find something you love",
    description:
      "Explore a considered mix of fashion, home, beauty, and everyday essentials.",
  },
  {
    number: "02",
    title: "Make it yours",
    description:
      "Save the pieces you love and keep your favorite finds close at hand.",
  },
  {
    number: "03",
    title: "Shop at your own pace",
    description:
      "Browse, compare, and come back when you are ready. Your next favorite will be here.",
  },
];

export default function Home() {
  const { auth } = useAuth();

  return (
    <main className="overflow-hidden bg-[#fbf8f1]">
      <div className="bg-brand-950 px-4 py-2.5 text-center text-[11px] font-semibold tracking-[0.12em] text-white sm:text-xs">
        GOOD FINDS FOR EVERYDAY LIVING
        <span aria-hidden="true" className="mx-2 text-accent-500">✳</span>
        A little something for you
      </div>

      <section className="relative">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-24 h-[32rem] w-[32rem] rounded-full bg-brand-100/70 blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:grid-cols-[1fr_0.88fr] sm:gap-6 sm:px-8 sm:py-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-12">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.19em] text-brand-800 sm:text-xs">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-500" />
              Welcome to RukundoeShop
            </p>
            <h1 className="mt-6 max-w-2xl font-serif text-[2.9rem] font-medium leading-[1.02] tracking-[-0.055em] text-slate-900 sm:text-4xl md:text-4xl lg:text-5xl xl:text-[4rem]">
              The little things
              <span className="mt-2 block font-normal italic text-brand-700">
                make a difference.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Find pieces that feel like you, useful things for home, and
              everyday favorites worth coming back to. Good shopping starts
              with a little inspiration.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-800 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/15 transition hover:-translate-y-0.5 hover:bg-brand-950 focus-visible:outline-offset-4"
              >
                Explore the collection
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to={auth ? "#collections" : "/login"}
                className="inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-brand-800"
              >
                Shop by category <span aria-hidden="true" className="ml-2">↓</span>
              </Link>
            </div>
            <div className="mt-5 hidden items-center gap-3 border-t border-slate-200/80 pt-4 lg:flex">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-500/10 text-lg text-accent-700" aria-hidden="true">
                ✳
              </span>
              <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                <span className="block font-bold text-slate-800">
                  A thoughtful mix, all in one place.
                </span>
                Take a look around and find your kind of good.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[580px] sm:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-brand-700/20 sm:-right-8 sm:-top-8 sm:h-44 sm:w-44"
            />
            <Link
              to="/products"
              aria-label="Explore products — Good things live here"
              className="group block rounded-[2rem] focus-visible:outline-offset-4 sm:rounded-[2rem] lg:rounded-[2.5rem]"
            >
              <div className="relative aspect-[0.98] overflow-hidden rounded-[2rem] bg-brand-100 shadow-2xl shadow-slate-900/10 sm:aspect-[0.92] sm:rounded-[2rem] lg:aspect-[1.3] lg:rounded-[2.5rem]">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=90"
                  alt=""
                  fetchPriority="high"
                  className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 sm:text-xs">
                      Find your everyday favorite
                    </p>
                    <p className="mt-2 font-serif text-2xl leading-tight sm:text-4xl">
                      Good things live here.
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/45 bg-white/15 text-xl backdrop-blur-sm transition group-hover:bg-white group-hover:text-brand-900 sm:h-14 sm:w-14"
                  >
                    ↗
                  </span>
                </div>
              </div>
            </Link>
            <div className="absolute left-3 top-4 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur sm:-left-8 sm:top-8 sm:gap-4 sm:p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-2xl text-brand-800 sm:h-14 sm:w-14">
                ♡
              </span>
              <span>
                <span className="block text-xs font-bold text-slate-900 sm:text-sm">Keep what you love</span>
                <span className="mt-1 block text-[10px] text-slate-500 sm:text-xs">Save favorite finds for later</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-8 sm:px-8 sm:py-8 lg:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-700 sm:text-xs">
              A little bit of everything
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              Find your kind of good.
            </h2>
          </div>
          <Link
            to="/products"
            className="group inline-flex w-fit items-center gap-2 pb-1 text-sm font-bold text-brand-800 transition hover:text-brand-950"
          >
            Browse everything
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-9 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative isolate aspect-[0.82] overflow-hidden rounded-2xl bg-slate-200 sm:aspect-[0.9] sm:rounded-[1.5rem]"
            >
              <img
                src={category.image}
                alt={category.imageAlt}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${category.className}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent transition group-hover:from-slate-950/85" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/75 sm:text-[10px]">
                  {category.note}
                </p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <h3 className="font-serif text-lg leading-tight sm:text-2xl">
                    {category.name}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/55 text-base transition group-hover:bg-white group-hover:text-slate-900 sm:h-9 sm:w-9"
                  >
                    ↗
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-100 bg-[#f5f3eb]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-700 sm:text-xs">
              The RukundoeShop feeling
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              Shopping should feel like you.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Not a rush. Not a chore. Just a lovely place to discover useful
              things, save what catches your eye, and choose what comes home
              with you.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.number}
                className="rounded-2xl border border-brand-100 bg-white/80 p-5 sm:p-6"
              >
                <span className="text-xs font-bold tracking-[0.15em] text-accent-700">
                  {benefit.number}
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-5 my-12 overflow-hidden rounded-[2rem] bg-brand-950 sm:mx-auto sm:my-16 sm:max-w-7xl sm:rounded-[2.5rem]">
        <div className="relative flex flex-col justify-between gap-7 px-6 py-9 sm:flex-row sm:items-center sm:px-12 sm:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-32 h-72 w-72 rounded-full border border-white/10 sm:right-20"
          />
          <div
            aria-hidden="true"
            className="absolute -right-2 -top-24 h-56 w-56 rounded-full border border-white/10 sm:right-28"
          />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-200 sm:text-xs">
              Your next favorite is waiting
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-3xl font-medium leading-tight text-white sm:text-4xl">
              Make a little room for something lovely.
            </h2>
          </div>
          <Link
            to="/products"
            className="relative inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-900 transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            Start exploring
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
