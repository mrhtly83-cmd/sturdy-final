'use client';

import Link from 'next/link';
import AuthPanel from '../../_components/AuthPanel';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90" />
      </div>

      <main
        id="main"
        className="mx-auto w-full max-w-lg px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 rounded-xl px-3 py-2"
          >
            Back
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold text-teal-300 hover:text-teal-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 rounded-xl px-3 py-2"
          >
            Start Free Trial
          </Link>
        </div>

        <header className="mt-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-white/65">Sign in to sync your journal and plan.</p>
        </header>

        <div className="mt-8">
          <AuthPanel />
        </div>
      </main>
    </div>
  );
}

