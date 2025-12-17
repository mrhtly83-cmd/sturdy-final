'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Smartphone, Timer, Wand2 } from 'lucide-react';
import Header from './_components/Header';
import Footer from './_components/Footer';

type ValueProp = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function LandingPage() {
  const howRef = useRef<HTMLElement | null>(null);
  const [howVisible, setHowVisible] = useState(false);

  useEffect(() => {
    const el = howRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) setHowVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const valueProps = useMemo<ValueProp[]>(
    () => [
      { title: 'Science-backed scripts', description: 'Connection-first words you can trust.', Icon: Sparkles },
      { title: 'Personalized in seconds', description: 'Tone + context tuned to your family.', Icon: Wand2 },
      { title: 'Ready when life happens', description: 'Built for big feelings and busy days.', Icon: Timer },
      { title: 'Mobile-first experience', description: 'Fast, thumb-friendly, always there.', Icon: Smartphone },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <Header />

      <main
        id="main"
        className={[
          'mx-auto w-full max-w-6xl px-6',
          'pt-[max(6.5rem,calc(env(safe-area-inset-top)+6.5rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          'opacity-0 animate-[calmFadeIn_700ms_ease-out_forwards]',
        ].join(' ')}
      >
        {/* HERO */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-center lg:text-left">
            <h1 className="opacity-0 animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Design the words that calm your home
            </h1>
            <p className="opacity-0 [animation-delay:120ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-4 mx-auto max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg lg:mx-0">
              Science-backed scripts for parents
            </p>

            <div className="opacity-0 [animation-delay:220ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-7 grid gap-3 sm:mx-auto sm:max-w-md sm:grid-cols-2 lg:mx-0">
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

              <Link
                href="#how"
                className={[
                  'inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white/85',
                  'transition hover:border-white/30 hover:bg-white/10',
                  'active:scale-[0.97]',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                ].join(' ')}
              >
                See How It Works
              </Link>
            </div>

            <div className="opacity-0 [animation-delay:320ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-7 flex flex-wrap justify-center gap-2 text-xs text-white/60 lg:justify-start">
              {['42k+ families', '90% report calmer moments', '3 min avg'].map((s) => (
                <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Example card (hidden on small screens) */}
          <div className="hidden md:block">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-6 shadow-2xl backdrop-blur">
              <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-25">
                <Image src="/assets/family.svg" alt="" fill className="object-cover" priority />
              </div>

              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">Example</p>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">Moment</p>
                    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                      <p className="text-sm text-white/70">“Go to bed!”</p>
                      <span className="mt-1 text-xs font-semibold text-teal-200">→</span>
                      <p className="text-sm font-semibold text-white">“I hear this feels hard. One breath, then we’ll make a plan.”</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tone', value: 'Gentle' },
                    { label: 'Kids', value: '2' },
                    { label: 'Moment', value: 'Bedtime' },
                    { label: 'Goal', value: 'Connection' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white/80">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map(({ title, description, Icon }, idx) => (
            <div
              key={title}
              className={[
                'opacity-0 animate-[calmFadeUp_700ms_cubic-bezier(0.16,1,0.3,1)_forwards]',
                'rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition',
                'hover:scale-[1.02] hover:bg-white/7 hover:shadow-2xl hover:shadow-black/30',
              ].join(' ')}
              style={{ animationDelay: `${220 + idx * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-teal-500/15 p-2 ring-1 ring-teal-400/20">
                  <Icon className="h-5 w-5 text-teal-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how"
          ref={(node) => {
            howRef.current = node;
          }}
          className="mt-14 scroll-mt-28"
        >
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-sm text-white/65 sm:text-base">
              Calm, clear, and fast—built for real parenting moments.
            </p>
          </div>

          <div
            className={[
              'mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3',
              'transition-all duration-700 ease-out',
              howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
            ].join(' ')}
          >
            {[
              { step: 'Step 1', title: 'Answer 3 questions', desc: 'Kids, tone, and the moment you’re in.' },
              { step: 'Step 2', title: 'Get a calm script', desc: 'AI drafts language designed to reduce conflict.' },
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

        {/* FINAL CTA */}
        <section className="mt-14">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-8 text-center backdrop-blur">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Ready to create calmer moments?
            </h2>
            <p className="mt-3 text-sm text-white/65 sm:text-base">
              Start free. Upgrade anytime.
            </p>
            <div className="mt-6 mx-auto grid max-w-md gap-3 sm:grid-cols-2">
              <Link
                href="/auth/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-teal-400 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
              >
                Start Free Trial
              </Link>
              <Link
                href="/create"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white/85 transition hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
              >
                Open the app
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
