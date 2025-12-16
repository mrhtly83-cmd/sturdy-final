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
      <div className="mx-auto w-full max-w-5xl space-y-10 text-white">
        <div className="space-y-4 text-center">
          <p className="opacity-0 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/60 animate-[sturdyPop_1100ms_ease-out_forwards]">
            CALM STARTS HERE
          </p>
          <h1 className="opacity-0 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl animate-[sturdyPop_1400ms_ease-out_forwards] [animation-delay:220ms]">
            Instant scripts backed by science.
          </h1>
          <p className="opacity-0 mx-auto max-w-xl text-base leading-relaxed text-white/75 md:text-lg animate-[sturdyPop_1400ms_ease-out_forwards] [animation-delay:420ms]">
            Handle hard parenting moments with language designed to reduce conflict and build connection.
          </p>
        </div>

        <div className="mx-auto grid w-full gap-6 md:grid-cols-[1fr_1fr]">
          <div className="opacity-0 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur animate-[sturdyPop_1400ms_ease-out_forwards] [animation-delay:700ms]">
            <div className="grid grid-cols-2 gap-6 text-center">
              {stats.slice(0, 2).map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
              {stats[2] && (
                <div className="col-span-2">
                  <p className="text-3xl font-bold text-white">{stats[2].value}</p>
                  <p className="mt-1 text-sm text-white/60">{stats[2].label}</p>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onSeeManifesto}
                className="opacity-0 flex-1 rounded-2xl border border-white/25 bg-white/5 px-5 py-4 text-base font-semibold text-white/90 backdrop-blur transition hover:border-white/40 hover:bg-white/10 animate-[sturdyPop_1200ms_ease-out_forwards] [animation-delay:1700ms]"
              >
                See the Manifesto
              </button>
              <button
                onClick={onGetStarted}
                className="opacity-0 flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:from-teal-500 hover:to-emerald-400 animate-[sturdyPop_1200ms_ease-out_forwards] [animation-delay:1950ms]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </span>
              </button>
            </div>
          </div>

          <div className="opacity-0 rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur-xl animate-[sturdyPop_1400ms_ease-out_forwards] [animation-delay:980ms]">
            <p className="inline-flex rounded bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/60">
              WHAT YOU GET
            </p>
            <div className="mt-4 space-y-3">
              {highlights.map(({ title, description, icon: Icon }, index) => (
                <div
                  key={title}
                  className="opacity-0 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 animate-[sturdyPop_1100ms_ease-out_forwards]"
                  style={{ animationDelay: `${1150 + index * 180}ms` }}
                >
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
