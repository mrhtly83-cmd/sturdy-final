'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useCompletion } from 'ai/react';
import { useSearchParams } from 'next/navigation'; 
import Image from 'next/image';
import { 
  Heart, Home as HomeIcon, Users, BookOpen, 
  Copy, Check, Lock, 
  MessageCircle, ArrowLeft, X, ChevronLeft,
  History, Volume2, Lightbulb, Zap, Smile, ChevronRight,
  Sparkles, ShieldCheck, Timer, BadgeCheck, Crown
} from 'lucide-react';
import OnboardingScreen from '../_components/OnboardingScreen';
import ManifestoContent from '../_components/ManifestoContent';
import AuthPanel from '../_components/AuthPanel';
import { getSupabase } from '../_utils/supabaseClient';
import { PLANS, type PlanId } from '../_utils/plans';

// --- TYPES ---
type HistoryItem = {
  id: string;
  date: string;
  dateISO?: string;
  createdAt?: number;
  type: 'script' | 'coparent';
  situation: string;
  result: string;
};

// --- CONFIGURATION ---
const FREE_LIMIT = 5; 
const STRIPE_WEEKLY_LINK = process.env.NEXT_PUBLIC_STRIPE_WEEKLY_LINK || '';
const STRIPE_MONTHLY_LINK = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_LINK || '';
const STRIPE_LIFETIME_LINK = process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK || '';

// --- DYNAMIC CONTENT MAP ---
const strugglePlaceholders: { [key: string]: string } = {
  'Big Emotions': 'Ex: She is screaming because the toy car broke...',
  'Aggression': 'Ex: He hit his sister because she took his toy...',
  'Resistance/Defiance': 'Ex: They are refusing to get dressed for school...',
  'Siblings': 'Ex: The kids are fighting over who gets the blue cup...',
  'Screen Time': 'Ex: He had a meltdown when I told him to turn off the iPad...',
  'School & Anxiety': 'Ex: She cries every morning when I drop her off at school...',
};

const heroStats = [
  { value: '42k+', label: 'Families supported' },
  { value: '90%', label: 'Report calmer moments' },
  { value: '3 min', label: 'From chaos to clarity' }
];

const welcomeHighlights = [
  {
    title: 'Science-backed scripts',
    description: 'Language rooted in nervous system science, attachment, and collaborative problem solving.',
    icon: Sparkles
  },
  {
    title: 'Personalized in seconds',
    description: 'Tune every script by age, neurotype, and your preferred tone so it sounds like you.',
    icon: ShieldCheck
  },
  {
    title: 'Ready when life happens',
    description: 'Mobile-first experience that fits inside meltdowns, carpool lanes, and bedtime battles.',
    icon: Timer
  }
];

const scenarioCards = [
  {
    title: 'Homework standoff',
    script: '“Ugh, math again?” → “Let’s tackle the first problem together while your brain warms up.”'
  },
  {
    title: 'Siblings at war',
    script: '“Two brave kids, one lego set. Let’s make a quick plan so both heroes get a turn.”'
  },
  {
    title: 'Screen time meltdown',
    script: '“I hear how fun it is. Show me one thing you loved and then we’ll power down together.”'
  }
];

const stripSectionLabel = (text: string) => {
  return text
    .replace(
      /^["'\s]*(section\s*\d+\s*:\s*(script|summary|why\s+it\s+works|what\s+if\??|troubleshooting)?)\s*/i,
      ''
    )
    .replace(/^["'\s]+/, '')
    .replace(/["'\s]+$/, '')
    .trim();
};

const stripSectionSeparators = (text: string) => {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^#{3,}\s*$/.test(trimmed)) return false;
      if (/^section\s*\d+\s*:/i.test(trimmed)) return false;
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Function to parse the multi-part AI response (4 SECTIONS)
const parseCompletion = (completion: string) => {
    // 1. Use a robust split based on the '###' separator
    const parts = completion.split('###');

    if (parts.length === 4) { 
        // 2. Trim and process each section
        const extractBulletedContent = (text: string) => 
            // Split by '*', filter out empty lines, and trim
            text.split('*').filter(line => line.trim().length > 0).map(line => line.trim());

        const cleanedScript = stripSectionLabel(parts[0].trim());
        const cleanedSummary = stripSectionLabel(parts[1].trim());
        const cleanedWhy = extractBulletedContent(parts[2]).map(stripSectionLabel);
        const cleanedTroubleshooting = extractBulletedContent(parts[3]).map(stripSectionLabel);

        return {
            script: cleanedScript,
            summary: cleanedSummary,
            whyItWorks: cleanedWhy,
            troubleshooting: cleanedTroubleshooting,
        };
    }
    // Fallback for co-parenting mode or unexpected format
    return { script: stripSectionLabel(completion), summary: null, whyItWorks: [], troubleshooting: [] };
};

const toISODate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const safeISOFromHistoryItem = (item: HistoryItem) => {
  if (item.dateISO && /^\d{4}-\d{2}-\d{2}$/.test(item.dateISO)) return item.dateISO;
  const parsed = new Date(item.createdAt ?? item.date);
  if (!Number.isNaN(parsed.getTime())) return toISODate(parsed);
  return null;
};

// --- TONE LOGIC (Fixing the slider display) ---
const getToneFromValue = (value: number): 'Gentle' | 'Balanced' | 'Firm' => {
    return value === 1 ? 'Gentle' : value === 3 ? 'Firm' : 'Balanced';
};
const getValueFromTone = (tone: string): number => {
    return tone === 'Gentle' ? 1 : tone === 'Firm' ? 3 : 2;
};


function AppContent() {
  // --- APP FLOW STATE ---
  // `/` now owns the landing + onboarding flow; `/create` should always open directly.
  const [showSplash, setShowSplash] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'coparent' | 'guide'>('home');
  // NEW: Multi-Step Form State
  const [homeStep, setHomeStep] = useState(1);
  const maxHomeSteps = 4; // 1: Kid details, 2: Struggle, 3: Profile/Tone, 4: Situation/Generate

  // --- INPUT STATES ---
  const [gender, setGender] = useState('Boy');
  const [ageGroup, setAgeGroup] = useState('School Age (5-10)');
  const [struggle, setStruggle] = useState('Big Emotions');
  const [profile, setProfile] = useState('Neurotypical'); 
  const [tone, setTone] = useState('Balanced'); 
  const [coparentText, setCoparentText] = useState('');
  const [situationText, setSituationText] = useState(''); // New state for Situation input

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Removed tabbed view in favor of collapsible sections
  const [journalView, setJournalView] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedJournalDayISO, setSelectedJournalDayISO] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [accountPlan, setAccountPlan] = useState<PlanId | null>(null);
  const [accountScriptsRemaining, setAccountScriptsRemaining] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showUpgradeAuth, setShowUpgradeAuth] = useState(false);

  // Monetization State
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const searchParams = useSearchParams();
  const homeProgress = maxHomeSteps > 1 ? ((homeStep - 1) / (maxHomeSteps - 1)) * 100 : 100;

  // Dynamic Placeholder based on struggle selection
  const currentPlaceholder = useMemo(() => {
    return strugglePlaceholders[struggle] || 'What is happening in this moment?';
  }, [struggle]);


  // --- 1. HANDLE SPLASH SCREEN TIMER ---
  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [showSplash]);

  // --- 2. LOAD DATA ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchParams.get('unlocked') === 'true') {
        localStorage.setItem('sturdy-is-pro', 'true');
        setIsPro(true);
        window.history.replaceState(null, '', '/create');
        setShowWelcome(false);
        setToast('Lifetime access unlocked. Welcome to Sturdy.');
      } else if (searchParams.get('celebrate') === '1') {
        localStorage.setItem('sturdy-onboarded', 'true');
        setShowWelcome(false);
        setToast('Your first calm script! 🎉');
        window.history.replaceState(null, '', '/create');
      } else {
        const savedPro = localStorage.getItem('sturdy-is-pro');
        if (savedPro === 'true') setIsPro(true);
      }

      const savedHistory = localStorage.getItem('sturdy-history');
      if (savedHistory) setHistoryList(JSON.parse(savedHistory));
      const savedCount = localStorage.getItem('sturdy-usage');
      if (savedCount) setUsageCount(parseInt(savedCount));
    }, 0);

    return () => clearTimeout(timeout);
  }, [searchParams]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    let mounted = true;

    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthToken(data.session?.access_token ?? null);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAuthToken(session?.access_token ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshEntitlements = async (token: string) => {
    try {
      const res = await fetch('/api/entitlements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const planId = (data?.plan ?? null) as PlanId | null;
      const ent = planId ? PLANS[planId] : null;
      setAccountPlan(planId);

      if (ent?.scriptsIncluded === 'unlimited') {
        setAccountScriptsRemaining(null);
      } else if (ent?.scriptsIncluded && data?.usage?.scriptsUsed != null) {
        const remaining = Math.max(0, ent.scriptsIncluded - Number(data.usage.scriptsUsed));
        setAccountScriptsRemaining(remaining);
      } else {
        setAccountScriptsRemaining(null);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (!authToken) {
        setAccountPlan(null);
        setAccountScriptsRemaining(null);
        return;
      }
      refreshEntitlements(authToken);
    }, 0);
    return () => clearTimeout(t);
  }, [authToken]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // --- AI CONNECTION ---
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
    onResponse: async (response) => {
      if (response.ok) {
        setGenerateError(null);
        setCooldownUntil(null);
        return;
      }
      const retryAfterHeader = response.headers.get('retry-after');
      if (retryAfterHeader) {
        const seconds = Number.parseInt(retryAfterHeader, 10);
        if (Number.isFinite(seconds) && seconds > 0) {
          setCooldownUntil(Date.now() + seconds * 1000);
        }
      }
      try {
        const data = await response.clone().json();
        if (data?.error) setGenerateError(String(data.error));
        else setGenerateError('Something went wrong. Please try again.');
        if (response.status === 402) setShowUpgrade(true);
      } catch {
        setGenerateError('Something went wrong. Please try again.');
      }
    },
    onError: () => {
      setGenerateError('Network error. Please try again.');
    },
    onFinish: (_prompt, result) => {
      const type = activeTab === 'coparent' ? 'coparent' : 'script';
      const situation = activeTab === 'coparent' ? coparentText : situationText; // Use the situation state
      // no-op: collapsible sections always start from top

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        date: new Date().toLocaleDateString(),
        dateISO: toISODate(new Date()),
        type,
        situation,
        result
      };
      
      const updatedHistory = [newItem, ...historyList];
      setHistoryList(updatedHistory);
      localStorage.setItem('sturdy-history', JSON.stringify(updatedHistory));

      if (!isPro && !accountPlan) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('sturdy-usage', newCount.toString());
      }
    }
  });

  useEffect(() => {
    if (!cooldownUntil) return;
    const interval = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const cooldownSecondsLeft = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - nowMs) / 1000)) : 0;

  const handleGenerate = () => {
    if (!accountPlan && !isPro && usageCount >= FREE_LIMIT) return;
    if (cooldownSecondsLeft > 0) return;
    setGenerateError(null);
    
    if (activeTab === 'coparent') {
      complete('', {
        body: { message: coparentText, mode: 'coparent', authToken },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
    } else {
      const promptText = `Child: ${gender}, Group: ${ageGroup}, Struggle: ${struggle}. Profile: ${profile}. Tone: ${tone}. Situation: ${situationText}`;
      complete('', {
        body: { message: promptText, childAge: ageGroup, gender, struggle, profile, tone, mode: 'script', authToken },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    if (confirm('Clear your journal?')) {
      setHistoryList([]);
      localStorage.removeItem('sturdy-history');
    }
  };
  
  const parsedResponse = useMemo(() => parseCompletion(completion), [completion]);
  const cleanedCoparentText = useMemo(
    () => stripSectionSeparators(stripSectionLabel(completion)),
    [completion]
  );

  const journalEntriesByISO = useMemo(() => {
    const map = new Map<string, HistoryItem[]>();
    for (const item of historyList) {
      const iso = safeISOFromHistoryItem(item);
      if (!iso) continue;
      const list = map.get(iso) ?? [];
      list.push(item);
      map.set(iso, list);
    }
    for (const items of map.values()) {
      items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    return map;
  }, [historyList]);

  const selectedDayEntries = useMemo(() => {
    if (!selectedJournalDayISO) return [];
    return journalEntriesByISO.get(selectedJournalDayISO) ?? [];
  }, [journalEntriesByISO, selectedJournalDayISO]);

  // --- RENDER: 1. SPLASH SCREEN ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-70">
          <source src="/background.mp4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl animate-[sturdyGlow_6s_ease-in-out_infinite]" />
        <div className="absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl animate-[sturdyGlow_7s_ease-in-out_infinite]" />

        <div className="relative mx-auto w-full max-w-sm px-6 text-center text-white">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_30px_120px_rgba(0,0,0,0.55)] animate-[sturdyPop_700ms_ease-out_forwards]">
            <Image
              src="/assets/star.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 drop-shadow-[0_10px_40px_rgba(20,184,166,0.35)]"
            />
          </div>

          <h1 className="text-2xl font-extrabold tracking-[0.35em] animate-[sturdyPop_800ms_ease-out_forwards] [animation-delay:120ms] opacity-0">
            STURDY PARENT
          </h1>
          <p className="mt-4 text-white/80 text-base leading-relaxed animate-[sturdyPop_900ms_ease-out_forwards] [animation-delay:260ms] opacity-0">
            A calmer home starts with calmer words.
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-white/70 animate-[sturdyPop_900ms_ease-out_forwards] [animation-delay:420ms] opacity-0">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300 animate-[sturdyGlow_1.4s_ease-in-out_infinite]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300/80 animate-[sturdyGlow_1.4s_ease-in-out_infinite] [animation-delay:180ms]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300/60 animate-[sturdyGlow_1.4s_ease-in-out_infinite] [animation-delay:360ms]" />
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: 2. WELCOME / LANDING PAGE ---
  if (showWelcome) {
    return (
      <div className="relative z-10 flex min-h-screen flex-col justify-center font-sans">
        <video autoPlay loop muted playsInline className="fixed inset-0 -z-10 h-full w-full object-cover">
          <source src="/background.mp4.mp4" type="video/mp4" />
        </video>
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-black/80 to-teal-900/40" />

        <div className="relative">
          <OnboardingScreen
            stats={heroStats}
            highlights={welcomeHighlights}
            onGetStarted={() => {
              setActiveTab('home');
              setHomeStep(1);
              setShowWelcome(false);
            }}
            onSeeManifesto={() => {
              setActiveTab('guide');
              setShowWelcome(false);
            }}
          />
          <div className="mx-auto w-full max-w-5xl px-6 pb-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="hidden md:block" />
              <AuthPanel />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: 3. THE MAIN APP ---
  return (
    <div className="relative z-10 flex min-h-screen flex-col font-sans pb-24 animate-in fade-in duration-500 sturdy-grain">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl">
            {toast}
          </div>
        </div>
      )}
      
      {/* CONTENT AREA */}
      <div className="flex-1 p-6 pt-4 overflow-y-auto">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <header className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Personalized guidance</p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">Design the words that calm your home.</h1>
                <div className="flex flex-wrap items-center justify-start gap-3 text-sm text-white/70">
                  <span
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur',
                      accountPlan
                        ? 'border-teal-400/40 bg-teal-500/10 text-teal-100'
                        : isPro
                          ? 'border-teal-400/40 bg-teal-500/10 text-teal-100'
                          : 'border-white/15 bg-white/5 text-white/70',
                    ].join(' ')}
                  >
                    {accountPlan === 'lifetime' ? <Crown className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                    {accountPlan
                      ? `${accountPlan.toUpperCase()}${accountScriptsRemaining != null ? ` • ${accountScriptsRemaining} left` : ''}`
                      : isPro
                        ? 'Lifetime access'
                        : `${Math.max(0, FREE_LIMIT - usageCount)} free left`}
                  </span>
                  {heroStats.slice(0, 2).map((stat) => (
                    <div key={stat.label} className="hidden sm:block">
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                      <p>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white via-white to-teal-50 text-slate-900 shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),transparent_45%)]" />
                <div className="relative p-6 sm:p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-500">
                      <span>Step {homeStep} of {maxHomeSteps}</span>
                      <span>{Math.round(homeProgress)}% ready</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${homeProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* BACK BUTTON */}
                  {homeStep > 1 && (
                    <button
                      onClick={() => setHomeStep((s) => Math.max(1, s - 1))}
                      className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" /> Back
                    </button>
                  )}

                  <div className="w-full overflow-hidden">
                    <div
                      className="relative flex w-full will-change-transform transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${(homeStep - 1) * 100}%)` }}
                    >
                    {/* STEP 1: KID DETAILS */}
                    <div className="flex min-w-full flex-shrink-0 flex-col gap-4">
                      <h2 className="text-xl font-semibold text-slate-900">1. Who is the child?</h2>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-medium text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      >
                        <option>Boy</option>
                        <option>Girl</option>
                      </select>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-medium text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      >
                        <option>Toddler (1-4)</option>
                        <option>School Age (5-10)</option>
                        <option>Pre-Teen (11-13)</option>
                        <option>Teenager (14+)</option>
                      </select>
                      <button
                        onClick={() => setHomeStep(2)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 py-4 text-base font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:from-teal-500 hover:to-emerald-400"
                      >
                        Continue <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* STEP 2: STRUGGLE */}
                    <div className="flex min-w-full flex-shrink-0 flex-col gap-4">
                      <h2 className="text-xl font-semibold text-slate-900">2. What is the core struggle?</h2>
                      <select
                        value={struggle}
                        onChange={(e) => setStruggle(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-medium text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      >
                        <option>Big Emotions</option>
                        <option>Aggression</option>
                        <option>Resistance/Defiance</option>
                        <option>Siblings</option>
                        <option>Screen Time</option>
                        <option>School & Anxiety</option>
                      </select>
                      <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 text-sm text-teal-700">
                        Choose the behavior at the root so the script knows where to aim compassion.
                      </div>
                      <button
                        onClick={() => setHomeStep(3)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 py-4 text-base font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:from-teal-500 hover:to-emerald-400"
                      >
                        Continue <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* STEP 3: PROFILE & TONE */}
                    <div className="flex min-w-full flex-shrink-0 flex-col gap-4">
                      <h2 className="text-xl font-semibold text-slate-900">3. Fine-tune the advice</h2>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-600">Neurotype (for tailored language)</label>
                        <select
                          value={profile}
                          onChange={(e) => setProfile(e.target.value)}
                          className="w-full rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-base font-medium text-teal-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        >
                          <option>Neurotypical</option>
                          <option>ADHD</option>
                          <option>Autism</option>
                          <option>Highly Sensitive</option>
                        </select>
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="text-sm font-semibold text-slate-600">Your desired tone: {tone}</label>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Gentle</span>
                          <span>Firm</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          value={getValueFromTone(tone)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTone(getToneFromValue(val));
                          }}
                          className="range-lg w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-teal-600"
                        />
                      </div>
                      <button
                        onClick={() => setHomeStep(4)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 py-4 text-base font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:from-teal-500 hover:to-emerald-400"
                      >
                        Almost done <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    {/* STEP 4: SITUATION INPUT & GENERATE */}
                    <div className="flex min-w-full flex-shrink-0 flex-col gap-4">
                      <h2 className="text-xl font-semibold text-slate-900">4. Describe the moment</h2>
                      <textarea
                        value={situationText}
                        onChange={(e) => setSituationText(e.target.value)}
                        placeholder={currentPlaceholder}
                        className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-800 outline-none placeholder-slate-400 shadow-inner focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      />
                      {generateError && activeTab === 'home' && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {generateError}
                        </div>
                      )}
                      {cooldownSecondsLeft > 0 && activeTab === 'home' && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                          Please wait {cooldownSecondsLeft}s before trying again.
                        </div>
                      )}
                      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
                        Add sensory detail or the exact words your child used so Sturdy echoes the moment precisely.
                      </div>
                      <button
                        disabled={isLoading || cooldownSecondsLeft > 0}
                        onClick={handleGenerate}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 py-4 text-base font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:from-teal-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Heart className="h-5 w-5 fill-white/20" />
                        {isLoading ? 'Generating Sturdy guidance...' : 'Get my script'}
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-black/30 p-6 text-white shadow-2xl backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Scripts in action</p>
                  <div className="mt-4 space-y-4">
                    {scenarioCards.map((card) => (
                      <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">{card.title}</p>
                        <p className="mt-2 text-base text-white/85">{card.script}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[32px] border border-teal-500/30 bg-gradient-to-br from-teal-600/40 to-emerald-500/30 p-6 text-white shadow-2xl backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Why parents love it</p>
                  <div className="mt-4 space-y-3 text-base text-white/90">
                    <p className="flex items-start gap-2"><Check className="mt-0.5 h-5 w-5 text-teal-200" /> Micro copy that lands even when emotions peak.</p>
                    <p className="flex items-start gap-2"><Check className="mt-0.5 h-5 w-5 text-teal-200" /> Strategies rooted in attachment science, not random scripts.</p>
                    <p className="flex items-start gap-2"><Check className="mt-0.5 h-5 w-5 text-teal-200" /> Built for one-handed use during real life.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING RESULT SKELETON */}
        {(activeTab === 'home' || activeTab === 'coparent') && isLoading && !completion && (
          <div className="max-w-md mx-auto mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur animate-in fade-in">
            <div className={`p-4 text-white font-bold ${activeTab === 'coparent' ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-gradient-to-r from-teal-600 to-emerald-500'}`}>
              <p className="text-xs uppercase tracking-widest">
                {activeTab === 'coparent' ? 'NEUTRAL MESSAGE' : 'GENERATING SCRIPT'}
              </p>
            </div>
            <div className="p-4 space-y-4 bg-white/90">
              <div className="h-5 w-40 rounded-lg sturdy-skeleton" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded-lg sturdy-skeleton" />
                <div className="h-4 w-11/12 rounded-lg sturdy-skeleton" />
                <div className="h-4 w-9/12 rounded-lg sturdy-skeleton" />
              </div>
              <div className="h-10 w-full rounded-xl sturdy-skeleton" />
            </div>
          </div>
        )}

        {/* RESULT CARD (HORIZONTAL LAYOUT) */}
        {(activeTab === 'home' || activeTab === 'coparent') && completion && (
          <div className="max-w-md mx-auto bg-white/95 rounded-2xl shadow-xl mt-6 animate-in fade-in slide-in-from-bottom-4 overflow-hidden border border-gray-200">
            
            {/* GRADIENT HEADER & SUMMARY */}
            <div className={`p-4 text-white font-bold flex justify-between items-start ${activeTab === 'coparent' ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-gradient-to-r from-teal-600 to-emerald-500'}`}>
              <h3 className="uppercase text-xs tracking-widest flex items-center gap-2">
                {activeTab === 'coparent' ? 'NEUTRAL MESSAGE' : parsedResponse.summary ? parsedResponse.summary.toUpperCase() : 'SUGGESTED SCRIPT'}
              </h3>
              <button onClick={() => copyToClipboard(completion, 'current')} className="p-1.5 rounded-full hover:bg-black/20 transition-colors">
                {copiedId === 'current' ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="p-4 text-slate-800">
                
                {activeTab === 'home' ? (
                  <div className="space-y-3">
                    <details open className="group rounded-xl border border-gray-200 bg-white">
                      <summary className="cursor-pointer list-none select-none p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-teal-600" /> Use These Words
                          </p>
                          <span className="text-xs text-gray-400 group-open:hidden">Tap to expand</span>
                          <span className="text-xs text-gray-400 hidden group-open:inline">Tap to collapse</span>
                        </div>
                      </summary>
                      <div className="px-4 pb-4">
                        <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed border-l-4 border-teal-500/50 pl-3">
                          {parsedResponse.script}
                        </p>
                      </div>
                    </details>

                    <details className="group rounded-xl border border-gray-200 bg-white">
                      <summary className="cursor-pointer list-none select-none p-4">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" /> The Psychology
                        </p>
                      </summary>
                      <div className="px-4 pb-4">
                        <ul className="list-none space-y-3 pl-0">
                          {parsedResponse.whyItWorks.map((tip, index) => (
                            <li key={index} className="flex items-start text-base text-slate-700">
                              <Smile className="w-5 h-5 text-teal-600 shrink-0 mt-0.5 mr-2" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>

                    <details className="group rounded-xl border border-gray-200 bg-white">
                      <summary className="cursor-pointer list-none select-none p-4">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-4 h-4 text-red-500" /> What If They Resist?
                        </p>
                      </summary>
                      <div className="px-4 pb-4">
                        <ul className="list-none space-y-3 pl-0">
                          {parsedResponse.troubleshooting.map((tip, index) => (
                            <li key={index} className="flex items-start text-base text-slate-700">
                              <ChevronRight className="w-5 h-5 text-red-500 shrink-0 mt-0.5 mr-2" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-purple-600" /> Neutral Message
                    </p>
                    <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed border-l-4 border-purple-500/40 pl-3">
                      {cleanedCoparentText}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* TAB 2: JOURNAL */}
        {activeTab === 'journal' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-5 flex items-center justify-between mt-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Your Journal</h1>
                <p className="text-xs text-white/60">Saved scripts and rewrites on this device.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur">
                  <button
                    onClick={() => setJournalView('list')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${journalView === 'list' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => {
                      setJournalView('calendar');
                      const todayISO = toISODate(new Date());
                      setSelectedJournalDayISO((prev) => prev ?? todayISO);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${journalView === 'calendar' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    Calendar
                  </button>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-200 bg-red-900/30 px-3 py-2 rounded-xl border border-red-500/20"
                >
                  Clear
                </button>
              </div>
            </header>

            {accountPlan === 'weekly' && accountScriptsRemaining === 0 && (
              <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Weekly plan</p>
                <p className="mt-2 text-sm text-white/70">
                  You’ve used all 10 scripts this week. Your journal stays available in view-only mode.
                </p>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:from-teal-500 hover:to-emerald-400"
                >
                  Upgrade for more scripts
                </button>
              </div>
            )}

            {historyList.length === 0 ? (
              <div className="text-center text-white/60 py-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
                <p className="text-base font-semibold text-white">No entries yet</p>
                <p className="mt-2 text-sm text-white/60">Generate a script and it will show up here.</p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-teal-500 hover:to-emerald-400"
                >
                  Create my first script
                </button>
              </div>
            ) : journalView === 'list' ? (
              <div className="space-y-4">
                {historyList.map((item) => (
                  <div key={item.id} className="bg-stone-900/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                    <div className="flex justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${item.type === 'coparent' ? 'bg-purple-500/30 text-purple-200' : 'bg-teal-500/30 text-teal-200'}`}>
                        {item.type === 'coparent' ? 'Co-Parenting' : 'Script'}
                      </span>
                      <span className="text-xs text-white/40">{item.date}</span>
                    </div>
                    <p className="text-white/60 text-sm italic mb-3">
                      &ldquo;{item.situation}&rdquo;
                    </p>
                    <div className="text-white text-md font-medium border-l-2 border-white/20 pl-3 whitespace-pre-wrap">
                      {item.result}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              (() => {
                const monthLabel = calendarMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });
                const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                const startWeekday = firstDay.getDay(); // 0 Sunday
                const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                const cells: Array<{ iso: string | null; day: number | null }> = [];
                for (let i = 0; i < startWeekday; i++) cells.push({ iso: null, day: null });
                for (let day = 1; day <= daysInMonth; day++) {
                  const iso = toISODate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                  cells.push({ iso, day });
                }
                while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });

                return (
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                        >
                          Prev
                        </button>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{monthLabel}</p>
                          <button
                            onClick={() => {
                              const now = new Date();
                              setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                              setSelectedJournalDayISO(toISODate(now));
                            }}
                            className="text-xs text-teal-200 hover:text-teal-100"
                          >
                            Jump to today
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                        >
                          Next
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-white/50">
                        {dayLabels.map((d, idx) => (
                          <div key={`${d}-${idx}`}>{d}</div>
                        ))}
                      </div>
                      <div className="mt-2 grid grid-cols-7 gap-2">
                        {cells.map((cell, idx) => {
                          if (!cell.iso || !cell.day) return <div key={idx} className="h-12" />;

                          const items = journalEntriesByISO.get(cell.iso) ?? [];
                          const scriptCount = items.filter((i) => i.type === 'script').length;
                          const coparentCount = items.filter((i) => i.type === 'coparent').length;
                          const isSelected = selectedJournalDayISO === cell.iso;
                          const isToday = cell.iso === toISODate(new Date());

                          return (
                            <button
                              key={cell.iso}
                              onClick={() => setSelectedJournalDayISO(cell.iso)}
                              className={[
                                'h-12 rounded-2xl border text-left px-3 py-2 transition',
                                isSelected
                                  ? 'border-teal-400/60 bg-teal-500/15'
                                  : 'border-white/10 bg-white/5 hover:bg-white/10',
                              ].join(' ')}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-white">
                                  {cell.day}
                                </span>
                                {isToday && (
                                  <span className="text-[10px] font-bold text-teal-200">•</span>
                                )}
                              </div>
                              <div className="mt-1 flex gap-1">
                                {scriptCount > 0 && (
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-300" />
                                )}
                                {coparentCount > 0 && (
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-300" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white">
                          {selectedJournalDayISO ? selectedJournalDayISO : 'Pick a day'}
                        </p>
                        {selectedJournalDayISO && (
                          <p className="text-xs text-white/60">
                            {selectedDayEntries.length} entr{selectedDayEntries.length === 1 ? 'y' : 'ies'}
                          </p>
                        )}
                      </div>

                      {!selectedJournalDayISO ? (
                        <p className="mt-3 text-sm text-white/60">Select a date to view saved scripts.</p>
                      ) : selectedDayEntries.length === 0 ? (
                        <p className="mt-3 text-sm text-white/60">No entries saved on this day.</p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {selectedDayEntries.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${item.type === 'coparent' ? 'bg-purple-500/30 text-purple-200' : 'bg-teal-500/30 text-teal-200'}`}>
                                  {item.type === 'coparent' ? 'Co-Parenting' : 'Script'}
                                </span>
                                <span className="text-xs text-white/40">{item.date}</span>
                              </div>
                              <p className="mt-3 text-sm text-white/70 italic">
                                &ldquo;{item.situation}&rdquo;
                              </p>
                              <div className="mt-3 text-sm text-white whitespace-pre-wrap border-l-2 border-white/10 pl-3">
                                {item.result}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* TAB 3: CO-PARENT */}
        {activeTab === 'coparent' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-8 text-center mt-4">
              <h1 className="text-3xl font-bold text-white drop-shadow-md">Peaceful Comms</h1>
              <p className="text-white/80 text-sm">Rewrite angry texts into neutral ones.</p>
            </header>
            <div className="bg-purple-900/30 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <div className="space-y-4">
                <div className="bg-white/10 p-3 rounded-lg text-xs text-purple-200 flex gap-2">
                  <Check className="w-4 h-4" /> Removes blame and sarcasm.
                </div>
                <textarea
                  value={coparentText}
                  onChange={(e) => setCoparentText(e.target.value)}
                  placeholder="Ex: I can't believe you are late again! You are so irresponsible..."
                  className="w-full p-4 bg-black/20 border border-white/10 rounded-xl min-h-[120px] text-white placeholder-white/50 outline-none resize-none"
                />
                {generateError && (
                  <div className="rounded-2xl border border-rose-200/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {generateError}
                  </div>
                )}
                {cooldownSecondsLeft > 0 && (
                  <div className="rounded-2xl border border-amber-200/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Please wait {cooldownSecondsLeft}s before trying again.
                  </div>
                )}
                <button
                  disabled={isLoading || cooldownSecondsLeft > 0}
                  onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                   <MessageCircle className="w-5 h-5" />
                  {isLoading ? 'Rewriting...' : 'Neutralize Text'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUIDE */}
        {activeTab === 'guide' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-6 mt-4">
              <h1 className="text-2xl font-bold text-white">The Manifesto</h1>
            </header>
            <ManifestoContent />
          </div>
        )}
      </div>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 pb-6 pt-3 px-6 z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-teal-300' : 'text-white/50'}`}>
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Create</span>
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'journal' ? 'text-teal-300' : 'text-white/50'}`}
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold">Journal</span>
          </button>
          <button onClick={() => setActiveTab('coparent')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'coparent' ? 'text-purple-300' : 'text-white/50'}`}>
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">Co-Parent</span>
          </button>
          <button onClick={() => setActiveTab('guide')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'guide' ? 'text-amber-300' : 'text-white/50'}`}>
            <BookOpen className="w-6 h-6" />
            <span className="text-[10px] font-bold">Guide</span>
          </button>
        </div>
      </div>

      {/* PAYWALL / UPGRADE (Global) */}
      {(showUpgrade || (!isPro && usageCount >= FREE_LIMIT)) && (
        <div
          className={[
            'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
            'flex items-end justify-center sm:items-center',
            'pt-[max(0px,env(safe-area-inset-top))] pb-[max(0px,env(safe-area-inset-bottom))]',
          ].join(' ')}
        >
          <div
            className={[
              'w-full sm:max-w-md',
              'max-h-[calc(100dvh-0.5rem)] sm:max-h-[min(760px,calc(100dvh-3rem))]',
              'overflow-hidden rounded-t-[32px] sm:rounded-[32px]',
              'border border-white/10 bg-gradient-to-b from-white to-slate-50',
              'shadow-[0_40px_140px_rgba(0,0,0,0.55)] animate-in zoom-in',
              'mx-0 sm:mx-6',
            ].join(' ')}
            role="dialog"
            aria-modal="true"
            aria-label="Choose your plan"
          >
            <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
                    Upgrade
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold">Choose your plan</h2>
                  <p className="mt-1 text-white/85">
                    Weekly, monthly, or lifetime—unlock more scripts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (showUpgradeAuth) setShowUpgradeAuth(false);
                      else setShowUpgrade(false);
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                    aria-label={showUpgradeAuth ? 'Back' : 'Close'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{showUpgradeAuth ? 'Back' : 'Close'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUpgradeAuth(false);
                      setShowUpgrade(false);
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-white/15 p-2 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {([
                { id: 'weekly', link: STRIPE_WEEKLY_LINK, note: '10 scripts • journal (view-only)' },
                { id: 'monthly', link: STRIPE_MONTHLY_LINK, note: '25 scripts • full journal' },
                { id: 'lifetime', link: STRIPE_LIFETIME_LINK, note: 'Unlimited • all features' },
              ] as Array<{ id: PlanId; link: string; note: string }>).map((p) => {
                const plan = PLANS[p.id];
                const featured = p.id === 'lifetime';
                const disabled = !p.link;
                return (
                  <a
                    key={p.id}
                    href={disabled ? undefined : p.link}
                    aria-disabled={disabled}
                    className={[
                      'block rounded-2xl border p-4 transition',
                      featured
                        ? 'border-teal-500/40 bg-teal-50 hover:bg-teal-100/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                      disabled ? 'opacity-60 pointer-events-none' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900 capitalize">{plan.plan}</p>
                        <p className="text-xs text-slate-600">{p.note}</p>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900">{plan.priceLabel}</p>
                    </div>
                  </a>
                );
              })}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Included</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><Check className="mt-0.5 h-5 w-5 text-teal-600" /> Script creator tuned to your child + tone</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-5 w-5 text-teal-600" /> Co-parent message rewrites</li>
                  <li className="flex gap-2"><Check className="mt-0.5 h-5 w-5 text-teal-600" /> Journal + calendar (weekly view-only)</li>
                </ul>
              </div>

              {authToken ? (
                <button
                  onClick={() => refreshEntitlements(authToken)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  I already upgraded — refresh access
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-semibold">Sign in first</p>
                    <p className="mt-1 text-amber-900/80">
                      We attach purchases to your account so access stays synced across devices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUpgradeAuth((v) => !v)}
                    className="w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/50"
                  >
                    {showUpgradeAuth ? 'Hide sign-in options' : 'Sign in to continue'}
                  </button>

                  {showUpgradeAuth ? (
                    <div className="rounded-2xl bg-slate-900 p-4">
                      <AuthPanel variant="inline" />
                    </div>
                  ) : null}
                </div>
              )}

              {process.env.NODE_ENV !== 'production' &&
              (!STRIPE_WEEKLY_LINK || !STRIPE_MONTHLY_LINK || !STRIPE_LIFETIME_LINK) ? (
                <p className="text-center text-xs text-slate-500">
                  Missing Stripe env vars: `NEXT_PUBLIC_STRIPE_WEEKLY_LINK`, `NEXT_PUBLIC_STRIPE_MONTHLY_LINK`, `NEXT_PUBLIC_STRIPE_LIFETIME_LINK`.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUNDS */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-40">
        <source src="/assets/family-sunset.mp4" type="video/mp4" />
        <source src="/background.mp4.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-stone-900/40 mix-blend-multiply -z-10" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen w-full font-sans text-white bg-black sturdy-grain">
      <main id="main">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
          <AppContent />
        </Suspense>
      </main>
    </div>
  );
}
