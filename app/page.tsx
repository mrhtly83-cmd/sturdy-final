'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Sparkles, Timer, Wand2 } from 'lucide-react';
import Header from './_components/Header';
import Footer from './_components/Footer';
import PrimaryButton from './_components/PrimaryButton'; // Now using your component
// Assuming you'll create a matching SecondaryButton for the 'See How It Works'

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement | null>(null);

  const valueProps = useMemo(() => [
    { title: 'Science-backed scripts', description: 'Connection-first words you can trust.', Icon: Sparkles },
    { title: 'Personalized in seconds', description: 'Tone + context tuned to your family.', Icon: Wand2 },
    { title: 'Ready when life happens', description: 'Built for big feelings and busy days.', Icon: Timer },
  ], []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // CHANGE: Softened background from black to Slate-950 for a "Sturdy" feel
    <div className="min-h-screen bg-[#020617] text-white selection:bg-teal-500/30">
      <Header />

      <main id="main">
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
          {/* Hero Video with added Poster for architectural stability */}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/family.svg"
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-1000"
          >
            <source src="/assets/151296-800360307_tiny.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/50 to-[#020617]" />

          <div className="relative mx-auto w-full max-w-4xl px-6 pt-24 text-center">
            {/* SOCIAL PROOF MOVED HIGHER: Establishing trust immediately */}
            <div className="opacity-0 animate-[calmFadeUp_900ms_0ms_forwards] mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Trusted by 42k+ families
              </span>
            </div>

            <h1 className="opacity-0 animate-[calmFadeUp_1000ms_200ms_forwards] text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Design the words that <span className="text-teal-400">calm your home</span>
            </h1>
            
            <p className="opacity-0 animate-[calmFadeUp_1000ms_400ms_forwards] mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-300">
              Science-backed scripts to help you navigate big feelings and busy days with confidence.
            </p>

            <div className="opacity-0 animate-[calmFadeUp_1000ms_700ms_forwards] mx-auto mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md">
              {/* REFACTORED: Using PrimaryButton with higher perceived value */}
              <PrimaryButton 
                href="/auth/signup" 
                className="w-full sm:w-auto min-w-[200px]"
              >
                Get My First Script <ArrowRight className="ml-2 h-5 w-5" />
              </PrimaryButton>

              <button
                onClick={scrollToFeatures}
                className="group flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                How it works 
                <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Sections remain similar but use the new theme variables */}
        <section
          ref={(node) => {
            featuresRef.current = node;
          }}
          className="py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Features
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Calm words, on demand
              </h2>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Everything is designed to feel steady, supportive, and fast.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {valueProps.map((p, idx) => (
                <FeatureCard key={p.title} index={idx} {...p} />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        <section className="pb-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Ready to create calmer moments?
              </h2>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Start your free trial and generate your first calm script.
              </p>
              <div className="mx-auto mt-6 grid max-w-md gap-3 sm:grid-cols-2">
                <PrimaryButton href="/auth/signup" className="w-full">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </PrimaryButton>
                <Link
                  href="/create"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50"
                >
                  Open the app
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

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

function FeatureCard({ title, description, Icon, index }: ValueProp & { index: number }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={[
        'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur',
        'shadow-[0_18px_60px_rgba(0,0,0,0.35)]',
        'transition duration-500 ease-out will-change-transform',
        'hover:scale-[1.02] hover:bg-white/7 hover:shadow-[0_28px_90px_rgba(0,0,0,0.45)]',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
      ].join(' ')}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-teal-500/15 p-2 ring-1 ring-teal-400/20">
          <Icon className="h-5 w-5 text-teal-200" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const { ref, inView } = useInViewOnce<HTMLElement>({ threshold: 0.15 });

  return (
    <section ref={ref} className="pb-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Three steps, then you’re ready
          </h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Answer a few questions. Get a calm script. Save it for later.
          </p>
        </div>

        <div
          className={[
            'mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3',
            'transition-all duration-700 ease-out',
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
          ].join(' ')}
        >
          {[
            { step: 'Step 1', title: 'Answer 3 questions', desc: 'Kids, tone, and what’s happening right now.' },
            { step: 'Step 2', title: 'Get a calm script', desc: 'AI generates language designed to reduce conflict.' },
            { step: 'Step 3', title: 'Use & save', desc: 'Copy it, speak it, and save to your journal.' },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{s.step}</p>
              <p className="mt-3 text-base font-semibold text-white">{s.title}</p>
              <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
