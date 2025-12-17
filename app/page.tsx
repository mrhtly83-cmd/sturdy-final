'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Sparkles,
  Wand2,
  Timer,
  Smartphone,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import PrimaryButton from './_components/PrimaryButton';
import TestimonialRotator from './_components/TestimonialRotator';

type Benefit = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export default function LandingPage() {
  const router = useRouter();
  const [leavingTo, setLeavingTo] = useState<null | string>(null);

  const benefits = useMemo<Benefit[]>(
    () => [
      {
        title: 'Science-backed scripts',
        description: 'Nervous-system science + connection-first language, ready to use.',
        Icon: Sparkles,
      },
      {
        title: 'Personalized in seconds',
        description: 'Adjust tone and context so the words sound like you.',
        Icon: Wand2,
      },
      {
        title: 'Ready when life happens',
        description: 'Built for carpool lines, bedtime, and big emotions.',
        Icon: Timer,
      },
      {
        title: 'Mobile-first experience',
        description: 'Fast, thumb-friendly, and always in your pocket.',
        Icon: Smartphone,
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      '42k+ families supported',
      '90% report calmer moments',
      '3 min from chaos to clarity',
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      { quote: 'It helped me stay steady when my kid was spiraling.', name: 'Parent of two' },
      { quote: 'The exact words made the moment softer instantly.', name: 'Mom, 3 kids' },
      { quote: 'I felt like I had a calm co-pilot in my pocket.', name: 'Dad, 1 kid' },
    ],
    []
  );

  const go = (href: string) => {
    setLeavingTo(href);
    window.setTimeout(() => router.push(href), 220);
  };

  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <main
        id="main"
        className={[
          'mx-auto w-full max-w-6xl px-6',
          'pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          'transition-all duration-300 ease-out',
          leavingTo ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        ].join(' ')}
      >
        <header className="flex flex-col items-center pt-6">
          <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur">
            <Image src="/icon.png" alt="Sturdy Parent logo" width={96} height={96} priority className="h-20 w-20" />
          </div>
        </header>

        <section className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="opacity-0 animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Design the words that calm your home
            </h1>
            <p className="opacity-0 [animation-delay:120ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
              Science-backed scripts for parents
            </p>

            <div className="opacity-0 [animation-delay:220ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-7 grid gap-3 sm:max-w-md sm:grid-cols-2">
              <PrimaryButton onClick={() => go('/onboarding')} aria-label="Get started">
                <span className="inline-flex items-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </span>
              </PrimaryButton>

              <Link
                href="/manifesto"
                className={[
                  'inline-flex min-h-12 w-full items-center justify-center rounded-full border border-teal-400/45 bg-white/5 px-6 py-3 text-base font-semibold text-white',
                  'transition hover:border-teal-300/70 hover:bg-white/8',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-2">
                  See the Manifesto <BookOpen className="h-5 w-5" />
                </span>
              </Link>
            </div>

            <div className="opacity-0 [animation-delay:320ms] animate-[calmFadeUp_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] mt-7 flex flex-wrap gap-2 text-xs text-white/60">
              {stats.map((s) => (
                <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-6 shadow-2xl backdrop-blur">
              <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 opacity-25">
                <Image
                  src="/assets/family.svg"
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/55">Happy-home preview</p>
                <p className="mt-3 text-lg font-semibold text-white">“I hear how big this feels.”</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  “I’m right here. Let’s take one breath together, then we’ll make a plan.”
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tone', value: 'Gentle' },
                    { label: 'Kids', value: '2' },
                    { label: 'Moment', value: 'Bedtime' },
                    { label: 'Goal', value: 'Connection' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/80">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, description, Icon }, index) => (
            <div
              key={title}
              className={[
                'opacity-0 animate-[calmFadeUp_700ms_cubic-bezier(0.16,1,0.3,1)_forwards]',
                'rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition',
                'hover:scale-[1.02] hover:bg-white/7',
              ].join(' ')}
              style={{ animationDelay: `${420 + index * 40}ms` }}
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

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <TestimonialRotator testimonials={testimonials} />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-white">Calm, not complicated</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Quick onboarding. Clear scripts. Designed to feel steady, supportive, and modern.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
