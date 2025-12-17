'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthPanel from '../../_components/AuthPanel';

export default function SignupPage() {
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
            href="/auth/login"
            className="text-sm font-semibold text-teal-300 hover:text-teal-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 rounded-xl px-3 py-2"
          >
            Login
          </Link>
        </div>

        <header className="mt-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Start your free trial</h1>
          <p className="mt-2 text-sm text-white/65">
            Create an account to save scripts and keep access synced.
          </p>
        </header>

        <div className="mt-8">
          <AuthPanel />
        </div>

        <div className="mt-6">
          <Link
            href="/onboarding"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-500 px-6 py-3 text-base font-semibold text-black transition hover:bg-teal-400 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
          >
            <span className="inline-flex items-center gap-2">
              Continue to onboarding <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}

