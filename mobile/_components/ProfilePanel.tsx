'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CreditCard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import { getSupabase } from '../_utils/supabaseClient';
import OutlineButton from './OutlineButton';
import PrimaryButton from './PrimaryButton';
import { PLANS, type PlanId } from '../_utils/plans';

type HistoryItem = {
  type: 'script' | 'coparent';
  createdAt?: number;
  dateISO?: string;
};

const toISODate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isoFromHistoryItem = (item: HistoryItem) => {
  if (item.dateISO && /^\d{4}-\d{2}-\d{2}$/.test(item.dateISO)) return item.dateISO;
  if (item.createdAt && Number.isFinite(item.createdAt)) return toISODate(new Date(item.createdAt));
  return null;
};

const computeStreak = (items: HistoryItem[]) => {
  const scriptDays = new Set(
    items
      .filter((i) => i.type === 'script')
      .map(isoFromHistoryItem)
      .filter((d): d is string => Boolean(d))
  );

  let streak = 0;
  let cursor = new Date();
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());

  for (let i = 0; i < 365; i++) {
    const iso = toISODate(cursor);
    if (!scriptDays.has(iso)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

type EntitlementsResponse = {
  plan: PlanId | null;
  usage: { scriptsUsed: number | null } | null;
  error?: string;
};

export default function ProfilePanel({ mode = 'page' }: { mode?: 'page' | 'tab' }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [scriptsRemaining, setScriptsRemaining] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    let mounted = true;
    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setAuthToken(data.session?.access_token ?? null);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthToken(session?.access_token ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sturdy-history');
      if (saved) setHistory(JSON.parse(saved) as HistoryItem[]);
    } catch {
      // ignore
    }
  }, []);

  const scriptsBuilt = useMemo(() => history.filter((i) => i.type === 'script').length, [history]);
  const streak = useMemo(() => computeStreak(history), [history]);

  const refreshEntitlements = async () => {
    if (!authToken) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/entitlements', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = (await res.json().catch(() => null)) as EntitlementsResponse | null;
      if (!res.ok) throw new Error(data?.error ?? `Unable to refresh (${res.status}).`);

      const planId = (data?.plan ?? null) as PlanId | null;
      setPlan(planId);

      if (planId && data?.usage?.scriptsUsed != null) {
        const ent = PLANS[planId];
        if (ent.scriptsIncluded === 'unlimited') setScriptsRemaining(null);
        else setScriptsRemaining(Math.max(0, ent.scriptsIncluded - Number(data.usage.scriptsUsed)));
      } else {
        setScriptsRemaining(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unable to refresh entitlements.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.replace('/');
  };

  useEffect(() => {
    if (!authToken) return;
    const t = window.setTimeout(() => void refreshEntitlements(), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const content = (() => {
    if (loading) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur text-center">
          <p className="font-black uppercase tracking-widest text-white">Loading Foundation...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm font-semibold text-white">Sign in required</p>
          <p className="mt-2 text-sm text-white/70">Log in to view your profile and plan.</p>
          <div className="mt-5 grid gap-3">
            <PrimaryButton href="/auth/login">Login</PrimaryButton>
            <OutlineButton type="button" onClick={() => router.push('/')}>
              Back to home
            </OutlineButton>
          </div>
        </div>
      );
    }

    const displayName = user.email?.split('@')[0] || 'Parent Leader';
    const planLabel = plan ? PLANS[plan].priceLabel : 'Free trial';
    const planTitle =
      plan === 'lifetime'
        ? 'Lifetime Access Plan'
        : plan === 'monthly'
          ? 'Monthly Plan'
          : plan === 'weekly'
            ? 'Weekly Plan'
            : 'Free Trial';

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* 1. LEADERSHIP IDENTITY (HEADER) */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-400 border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_#000]">
              <User className="w-8 h-8 text-black" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-black uppercase tracking-tight truncate">
                {displayName}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Architect ID: {user.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        {/* 2. SUBSCRIPTION FOUNDATION */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0_0_#000] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Subscription Status
            </h3>
            <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-teal-200">
              {plan ? 'Active' : 'Trial'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <div className="min-w-0">
              <p className="font-black text-black uppercase text-sm truncate">{planTitle}</p>
              <p className="text-[11px] font-semibold text-slate-500">{planLabel}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
              <span>Script usage</span>
              <span>
                {plan && scriptsRemaining != null ? `${scriptsRemaining} left` : plan ? 'Unlimited' : '5 free'}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 border border-black rounded-sm overflow-hidden">
              <div className="h-full bg-teal-400 w-full" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <OutlineButton
              type="button"
              className="w-full mt-2"
              onClick={() => router.push('/create')}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" /> Manage Billing
              </span>
            </OutlineButton>
            <button
              type="button"
              disabled={busy}
              onClick={refreshEntitlements}
              className="w-full mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 border border-slate-200 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4" />
              {busy ? 'Refreshing…' : 'Refresh Entitlements'}
            </button>
          </div>
        </div>

        {/* 3. STRUCTURAL STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
            <BarChart3 className="w-5 h-5 text-slate-400 mb-2" />
            <p className="text-2xl font-black text-black">{scriptsBuilt}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Scripts Built
            </p>
          </div>
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0_0_#000]">
            <Zap className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-black text-black">{streak}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Day Streak
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {/* 4. SYSTEM ACTIONS */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-rose-50 border-2 border-rose-600 rounded-xl p-4 hover:bg-rose-100 transition shadow-[2px_2px_0_0_#e11d48] text-rose-600 font-black uppercase text-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <LogOut className="w-5 h-5" />
          Deactivate Session
        </button>
      </div>
    );
  })();

  if (mode === 'tab') {
    return <div className="mx-auto w-full max-w-md pb-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white sturdy-grain">
      <main
        id="main"
        className="mx-auto w-full max-w-md px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(6rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between">
          <Link href="/create" className="text-sm font-semibold text-white/70 hover:text-white">
            Back
          </Link>
          <Link href="/admin" className="text-sm font-semibold text-teal-300 hover:text-teal-200">
            Admin
          </Link>
        </div>

        <div className="mt-6">{content}</div>
      </main>
    </div>
  );
}

