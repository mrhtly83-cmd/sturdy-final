'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '../_utils/supabaseClient';
import { Check, LogOut } from 'lucide-react';

export default function AuthPanel({
  variant = 'card',
}: {
  variant?: 'card' | 'inline';
}) {
  const [supabaseReady, setSupabaseReady] = useState<ReturnType<typeof getSupabase> | null>(null);
  const [email, setEmail] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    setSupabaseReady(sb);
    if (!sb) return;

    let mounted = true;

    sb.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!supabaseReady) return;
    setError(null);
    setSent(false);
    setIsBusy(true);
    try {
      const origin = window.location.origin;
      const { error: signInError } = await supabaseReady.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: origin },
      });
      if (signInError) throw signInError;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to sign in with Google.');
    } finally {
      setIsBusy(false);
    }
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) return;
    setError(null);
    setSent(false);
    setIsBusy(true);
    try {
      const origin = window.location.origin;
      const { error: signInError } = await supabaseReady.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: origin },
      });
      if (signInError) throw signInError;
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to send sign-in email.');
    } finally {
      setIsBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabaseReady) return;
    setError(null);
    setIsBusy(true);
    try {
      const { error: signOutError } = await supabaseReady.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to sign out.');
    } finally {
      setIsBusy(false);
    }
  };

  const isCard = variant === 'card';

  return (
    <div
      className={
        isCard
          ? 'rounded-[28px] border border-white/10 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-xl'
          : 'text-white'
      }
    >
      {isCard && (
        <p className="inline-flex rounded bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/60">
          ACCOUNT
        </p>
      )}

      {!supabaseReady && (
        <div className={isCard ? 'mt-5 space-y-3' : 'space-y-2'}>
          <p className="text-sm font-semibold text-white">Auth not configured</p>
          <p className="text-sm text-white/70">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel (and redeploy).
          </p>
        </div>
      )}

      {userEmail ? (
        <div className={isCard ? 'mt-5 space-y-3' : 'space-y-2'}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Signed in</p>
              <p className="truncate text-sm text-white/70">{userEmail}</p>
            </div>
            <button
              onClick={signOut}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" /> Your account is ready for syncing (journal + access) next.
            </span>
          </div>
        </div>
      ) : (
        supabaseReady && (
          <div className={isCard ? 'mt-5 space-y-4' : 'space-y-3'}>
          <button
            onClick={signInWithGoogle}
            disabled={isBusy}
            className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-white/40">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.35em]">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={sendMagicLink} className="space-y-3">
            <input
              type="email"
              placeholder="Email for magic link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder-white/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isBusy || !email}
              className="w-full rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>

          {sent && !error && (
            <p className="text-sm text-emerald-200">Check your inbox for your sign-in link.</p>
          )}
          </div>
        )
      )}

      {error && <p className="mt-4 text-sm text-rose-200">{error}</p>}
    </div>
  );
}
