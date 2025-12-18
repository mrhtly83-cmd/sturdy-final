'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../_utils/supabaseClient';

type RoleResponse = {
  userId: string;
  email: string | null;
  role: 'admin' | 'user' | string;
};

const LOCAL_KEYS = [
  'sturdy-usage',
  'sturdy-history',
  'sturdy-is-pro',
  'sturdy-onboarded',
  'sturdy-onboarding',
];

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<RoleResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sb = useMemo(() => getSupabase(), []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!sb) return;
      sb.auth.getSession().then(({ data }) => {
        setToken(data.session?.access_token ?? null);
      });
    }, 0);
    return () => window.clearTimeout(t);
  }, [sb]);

  useEffect(() => {
    if (!token) return;
    const t = window.setTimeout(() => {
      setError(null);
      fetch('/api/admin/role', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const body = (await res.json().catch(() => null)) as unknown;
          if (!res.ok) {
            const msg =
              body && typeof body === 'object' && 'error' in body
                ? String((body as { error: unknown }).error)
                : `Request failed (${res.status})`;
            throw new Error(msg);
          }
          return body as RoleResponse;
        })
        .then((data) => setRole(data))
        .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unable to load role.'));
    }, 0);
    return () => window.clearTimeout(t);
  }, [token]);

  const clearLocal = () => {
    try {
      for (const k of LOCAL_KEYS) localStorage.removeItem(k);
      setMessage('Local test data cleared.');
    } catch {
      setMessage('Unable to clear localStorage in this browser.');
    }
  };

  const resetEntitlementsUsage = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/reset-usage', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const msg =
          body && typeof body === 'object' && 'error' in body
            ? String((body as { error: unknown }).error)
            : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      setMessage('Entitlements usage reset (scripts_used = 0).');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.22),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black/90" />
      </div>

      <main
        id="main"
        className="mx-auto w-full max-w-2xl px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
          >
            Back
          </Link>
          <Link
            href="/create"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-teal-300 hover:text-teal-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
          >
            Open app
          </Link>
        </div>

        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Admin</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">View & testing tools</h1>
          <p className="mt-2 text-sm text-white/65">
            This page is for internal testing. No hidden “master login” is used—admin is role-based.
          </p>
        </header>

        {!sb ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold">Auth not configured</p>
            <p className="mt-2 text-sm text-white/70">
              Set Supabase env vars on Vercel and redeploy.
            </p>
          </div>
        ) : !token ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm font-semibold">Sign in required</p>
            <p className="mt-2 text-sm text-white/70">
              Go to <Link className="text-teal-300 hover:text-teal-200" href="/auth/login">/auth/login</Link> first.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white">Account</p>
              <div className="mt-3 space-y-1 text-sm text-white/70">
                <p>
                  <span className="text-white/50">Email:</span> {role?.email ?? '…'}
                </p>
                <p>
                  <span className="text-white/50">Role:</span>{' '}
                  <span className={role?.role === 'admin' ? 'text-teal-200 font-semibold' : ''}>
                    {role?.role ?? '…'}
                  </span>
                </p>
              </div>
              {role?.role !== 'admin' ? (
                <div className="mt-4 rounded-2xl border border-amber-200/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  You’re signed in, but not an admin. Set your role to <code>admin</code> in Supabase.
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white">Local testing</p>
              <p className="mt-2 text-sm text-white/65">
                Clears local trial counters and history stored in your browser.
              </p>
              <button
                type="button"
                onClick={clearLocal}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
              >
                Clear local test data
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm font-semibold text-white">Database testing</p>
              <p className="mt-2 text-sm text-white/65">
                Resets your entitlement usage in Supabase (requires `SUPABASE_SERVICE_ROLE_KEY` on the server).
              </p>
              <button
                type="button"
                disabled={busy || role?.role !== 'admin'}
                onClick={resetEntitlementsUsage}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
              >
                {busy ? 'Resetting…' : 'Reset scripts_used to 0'}
              </button>
              <p className="mt-2 text-xs text-white/45">
                If this fails with 501, add `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars.
              </p>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

