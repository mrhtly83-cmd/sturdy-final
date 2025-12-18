'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Sparkles, Timer, Wand2 } from 'lucide-react';
import Header from './_components/Header';
import Footer from './_components/Footer';

type ValueProp = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

function useInViewOnce<T extends Element>(options?: IntersectionObserverInit) {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!node || inView) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first?.isIntersecting) setInView(true);
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, node, options]);

  return { ref: setNode, inView };
}

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement | null>(null);

  const valueProps = useMemo<ValueProp[]>(
    () => [
      { title: 'Science-backed scripts', description: 'Connection-first words you can trust.', Icon: Sparkles },
      { title: 'Personalized in seconds', description: 'Tone + context tuned to your family.', Icon: Wand2 },
      { title: 'Ready when life happens', description: 'Built for big feelings and busy days.', Icon: Timer },
    ],
    []
  );

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <Header />

      <main id="main">
        {/* 1) HERO WITH VIDEO BACKGROUND */}
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          >
            <source src="/assets/151296-800360307_tiny.mp4" type="video/mp4" />
            <source src="/assets/family-sunset.mp4" type="video/mp4" />
            <source src="/background.mp4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/55" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),transparent_45%)]" />
            <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
            <div className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto w-full max-w-4xl px-6 pt-[max(6.5rem,calc(env(safe-area-inset-top)+6.5rem))] pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
            <h1 className="opacity-0 animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              Design the words that calm your home
            </h1>
            <p className="opacity-0 [animation-delay:120ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              Science-backed scripts for parents
            </p>

            <div className="opacity-0 [animation-delay:220ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mx-auto mt-8 grid max-w-md gap-3 sm:grid-cols-2">
              <Link
                href="/auth/signup"
                className={[
                  'inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-500 px-6 py-3 text-base font-semibold text-black',
                  'shadow-lg shadow-teal-500/15 transition will-change-transform',
                  'hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/20',
                  'active:scale-[0.97] active:shadow-2xl active:shadow-teal-500/25',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-2">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </span>
              </Link>

              <button
                type="button"
                onClick={scrollToFeatures}
                className={[
                  'inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-base font-semibold text-white/90',
                  'transition hover:bg-white/10',
                  'active:scale-[0.97]',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                ].join(' ')}
              >
                See How It Works
              </button>
            </div>

            <div className="opacity-0 [animation-delay:320ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-7 flex flex-wrap justify-center gap-2 text-xs text-white/70">
              {['42k+ families', '90% report calmer moments', '3 min avg'].map((s) => (
                <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  {s}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollToFeatures}
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 rounded-xl px-4 py-3"
              aria-label="Scroll to features"
            >
              Scroll <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* 2) ANIMATED FEATURE CARDS */}
        <section
          ref={(node) => {
            featuresRef.current = node;
          }}
          className="mx-auto w-full max-w-6xl px-6 py-14"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Built for real-life parenting
            </h2>
            <p className="mt-3 text-sm text-white/65 sm:text-base">
              Clear words, calm delivery, and a design that stays out of your way.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {valueProps.map((p, idx) => (
              <FeatureCard key={p.title} {...p} index={idx} />
            ))}
          </div>
        </section>

        {/* 3) HOW IT WORKS (3-step visual) */}
        <HowItWorks />

        {/* 4) CTA SECTION */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-8 text-center backdrop-blur">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Ready?</h2>
            <p className="mt-3 text-sm text-white/65 sm:text-base">
              Start your free trial and generate your first calm script.
            </p>
            <div className="mt-6 mx-auto max-w-md">
              <Link
                href="/auth/signup"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-teal-400 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function HowItWorks() {
  const { ref, inView } = useInViewOnce<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={ref} className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">How it works</h2>
        <p className="mt-3 text-sm text-white/65 sm:text-base">Three steps, then you’re ready.</p>
      </div>

      <div
        className={[
          'mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3',
          'transition-all duration-700 ease-out',
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
        ].join(' ')}
      >
        {[
          { step: 'Step 1', title: 'Answer questions', desc: 'Kids, tone, and the moment you’re in.' },
          { step: 'Step 2', title: 'Get a calm script', desc: 'AI generates language designed to reduce conflict.' },
          { step: 'Step 3', title: 'Use & save', desc: 'Copy it, speak it, and save to your journal.' },
        ].map((s, idx) => (
          <div key={s.step} className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">{s.step}</p>
            <p className="mt-3 text-base font-semibold text-white">{s.title}</p>
            <p className="mt-2 text-sm text-white/65">{s.desc}</p>
            {idx < 2 ? (
              <div className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40">
                  <ArrowRight className="h-5 w-5 text-teal-200" />
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  Icon,
  index,
}: ValueProp & { index: number }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={[
        'rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition',
        'hover:scale-[1.02] hover:bg-white/7 hover:shadow-2xl hover:shadow-black/30',
        'will-change-transform',
        'duration-700 ease-out',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      ].join(' ')}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-teal-500/15 p-2 ring-1 ring-teal-400/20">
          <Icon className="h-5 w-5 text-teal-200" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>
        </div>
      </div>
    </div>
  );
}
