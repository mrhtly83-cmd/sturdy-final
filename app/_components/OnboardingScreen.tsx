import type { ComponentType } from 'react';
import { ArrowRight } from 'lucide-react';

type Stat = { value: string; label: string };
type Highlight = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export default function OnboardingScreen({
  stats,
  highlights,
  onGetStarted,
  onSeeManifesto,
}: {
  stats: Stat[];
  highlights: Highlight[];
  onGetStarted: () => void;
  onSeeManifesto: () => void;
}) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 pb-10 pt-16 font-sans">
      <div className="mx-auto w-full max-w-5xl space-y-10 text-white animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Calm starts here</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Instant scripts backed by science.
          </h1>
          <p className="mx-auto max-w-xl text-lg text-white/80">
            Handle hard parenting moments with language designed to reduce conflict and build connection.
          </p>
        </div>

        <div className="mx-auto grid w-full gap-6 md:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-wrap justify-center gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-[140px] text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:from-teal-500 hover:to-emerald-400"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </span>
              </button>
              <button
                onClick={onSeeManifesto}
                className="flex-1 rounded-2xl border border-white/25 bg-white/5 px-5 py-4 text-base font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              >
                See the Manifesto
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">What you get</p>
            <div className="mt-4 space-y-3">
              {highlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-1 rounded-full bg-white/10 p-2">
                    <Icon className="h-4 w-4 text-teal-200" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{title}</p>
                    <p className="text-sm text-white/70">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

