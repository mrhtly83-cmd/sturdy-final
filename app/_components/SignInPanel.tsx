'use client';

import { useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../_utils/firebaseClient';

export default function SignInPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to sign in with Google.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to sign in with email.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-xl">
      <p className="inline-flex rounded bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/60">
        SIGN IN
      </p>

      <form onSubmit={handleEmailLogin} className="mt-5 space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? 'Signing in…' : 'Sign in with Email'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em]">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={isBusy}
        className="w-full rounded-2xl border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue with Google
      </button>

      {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}
      <p className="mt-4 text-xs text-white/50">
        Requires Firebase env vars (`NEXT_PUBLIC_FIREBASE_*`) to be set.
      </p>
    </div>
  );
}
