'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import PrimaryButton from '../_components/PrimaryButton';
import OutlineButton from '../_components/OutlineButton';

const isValidEmail = (value: string) => {
  if (!value.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export default function OnboardingPage() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const kidOptions = useMemo(() => [1, 2, 3, 4, 5, 6], []);
  const [kids, setKids] = useState<number>(2);
  const [tone, setTone] = useState<'Gentle' | 'Balanced' | 'Firm'>('Balanced');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emailOk = isValidEmail(email);

  const finish = () => {
    setSubmitted(true);
    if (!emailOk) return;

    try {
      localStorage.setItem('sturdy-onboarded', 'true');
      localStorage.setItem(
        'sturdy-onboarding',
        JSON.stringify({ kids, tone, email: email.trim() || null })
      );
    } catch {
      // ignore
    }

    setLeaving(true);
    window.setTimeout(() => router.push('/create?celebrate=1&from=onboarding'), 240);
  };

  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90" />
      </div>

      <main
        id="main"
        className={[
          'mx-auto w-full max-w-xl px-6',
          'pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          'transition-all duration-300 ease-out',
          leaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        ].join(' ')}
      >
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
            Quick onboarding
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Tell us a little about your home
          </h1>
          <p className="mt-2 text-base leading-relaxed text-white/65">
            Three quick questions, then you’ll generate your first script.
          </p>
        </header>

        <section className="mt-8 space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div>
            <label className="text-sm font-semibold text-white" htmlFor="kids">
              How many kids?
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="How many kids">
              {kidOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setKids(n)}
                  className={[
                    'min-h-12 rounded-2xl border px-3 py-3 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                    kids === n
                      ? 'border-teal-400/50 bg-teal-500/15 text-teal-50'
                      : 'border-white/10 bg-black/20 text-white/75 hover:bg-white/6',
                  ].join(' ')}
                  aria-checked={kids === n}
                  role="radio"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Your preferred tone?</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Preferred tone">
              {(['Gentle', 'Balanced', 'Firm'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={[
                    'min-h-12 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                    tone === t
                      ? 'border-teal-400/50 bg-teal-500/15 text-teal-50'
                      : 'border-white/10 bg-black/20 text-white/75 hover:bg-white/6',
                  ].join(' ')}
                  aria-checked={tone === t}
                  role="radio"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white" htmlFor="email">
              Email for updates?
              <span className="ml-2 text-xs font-semibold text-white/45">(optional)</span>
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              placeholder="you@example.com"
              className={[
                'mt-3 min-h-12 w-full rounded-2xl border bg-black/20 px-4 py-3 text-base text-white placeholder:text-white/35',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
                submitted && !emailOk ? 'border-rose-400/60' : 'border-white/10',
              ].join(' ')}
              aria-invalid={submitted && !emailOk ? true : undefined}
            />
            {submitted && !emailOk ? (
              <p className="mt-2 text-sm text-rose-200">Enter a valid email (or leave blank).</p>
            ) : null}
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <OutlineButton type="button" onClick={() => router.push('/manifesto')}>
            Read the Manifesto
          </OutlineButton>
          <PrimaryButton type="button" onClick={finish}>
            <span className="inline-flex items-center gap-2">
              Continue <ArrowRight className="h-5 w-5" />
            </span>
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
