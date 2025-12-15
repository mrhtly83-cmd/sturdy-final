'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useCompletion } from 'ai/react';
import { useSearchParams } from 'next/navigation'; 
import { 
  Heart, Home as HomeIcon, Users, BookOpen, 
  Copy, Check, Lock, 
  MessageCircle, ArrowRight, ArrowLeft,
  History, Volume2, Lightbulb, Zap, Smile, ChevronRight,
  Sparkles, ShieldCheck, Timer
} from 'lucide-react';

// --- TYPES ---
type HistoryItem = {
  id: string;
  date: string;
  type: 'script' | 'coparent';
  situation: string;
  result: string;
};

// --- CONFIGURATION ---
const FREE_LIMIT = 5; 
const STRIPE_LINK = "https://buy.stripe.com/test_14A00c1WkbQU8EO2Tv2cg00"; 

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

// Function to parse the multi-part AI response (4 SECTIONS)
const parseCompletion = (completion: string) => {
    // 1. Use a robust split based on the '###' separator
    const parts = completion.split('###');

    if (parts.length === 4) { 
        // 2. Trim and process each section
        const extractBulletedContent = (text: string) => 
            // Split by '*', filter out empty lines, and trim
            text.split('*').filter(line => line.trim().length > 0).map(line => line.trim());

        return {
            script: parts[0].trim(),
            summary: parts[1].trim(),
            whyItWorks: extractBulletedContent(parts[2]),
            troubleshooting: extractBulletedContent(parts[3]),
        };
    }
    // Fallback for co-parenting mode or unexpected format
    return { script: completion, summary: null, whyItWorks: [], troubleshooting: [] };
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
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

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
  const [scriptView, setScriptView] = useState<'script' | 'why' | 'troubleshoot'>('script'); // State for horizontal script view

  // Monetization State
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const searchParams = useSearchParams();

  // Dynamic Placeholder based on struggle selection
  const currentPlaceholder = useMemo(() => {
    return strugglePlaceholders[struggle] || 'What is happening in this moment?';
  }, [struggle]);


  // --- 1. HANDLE SPLASH SCREEN TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- 2. LOAD DATA ---
  useEffect(() => {
    if (searchParams.get('unlocked') === 'true') {
      localStorage.setItem('sturdy-is-pro', 'true');
      setIsPro(true);
      window.history.replaceState(null, '', '/');
      setShowWelcome(false); 
      alert("Welcome to the family! Lifetime Access Unlocked. ☀️");
    } else {
      const savedPro = localStorage.getItem('sturdy-is-pro');
      if (savedPro === 'true') setIsPro(true);
    }
    const savedHistory = localStorage.getItem('sturdy-history');
    if (savedHistory) setHistoryList(JSON.parse(savedHistory));
    const savedCount = localStorage.getItem('sturdy-usage');
    if (savedCount) setUsageCount(parseInt(savedCount));
  }, [searchParams]);

  // --- AI CONNECTION ---
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
    onFinish: (_prompt, result) => {
      const type = activeTab === 'coparent' ? 'coparent' : 'script';
      const situation = activeTab === 'coparent' ? coparentText : situationText; // Use the situation state
      setScriptView('script'); // Reset view to script after completion

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        type,
        situation,
        result
      };
      
      const updatedHistory = [newItem, ...historyList];
      setHistoryList(updatedHistory);
      localStorage.setItem('sturdy-history', JSON.stringify(updatedHistory));

      if (!isPro) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('sturdy-usage', newCount.toString());
      }
    }
  });

  const handleGenerate = () => {
    if (!isPro && usageCount >= FREE_LIMIT) return;
    
    if (activeTab === 'coparent') {
      complete('', { body: { message: coparentText, mode: 'coparent' } });
    } else {
      const promptText = `Child: ${gender}, Group: ${ageGroup}, Struggle: ${struggle}. Profile: ${profile}. Tone: ${tone}. Situation: ${situationText}`;
      complete('', { body: { message: promptText, childAge: ageGroup, gender, struggle, profile, tone, mode: 'script' } });
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

  // --- RENDER: 1. SPLASH SCREEN ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
        <div className="relative animate-pulse">
          <svg className="w-24 h-24 text-teal-500 animate-spin-slow duration-[3000ms]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <h1 className="text-teal-900 text-xl font-bold mt-6 tracking-widest animate-in fade-in duration-1000 slide-in-from-bottom-4">
          STURDY PARENT
        </h1>
      </div>
    );
  }

  // --- RENDER: 2. WELCOME / LANDING PAGE ---
  if (showWelcome) {
    return (
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 pb-10 pt-16 font-sans">
        <video autoPlay loop muted playsInline className="fixed inset-0 -z-10 h-full w-full object-cover">
          <source src="https://cdn.coverr.co/videos/coverr-a-mother-and-her-child-touching-hands-6625/1080p.mp4" type="video/mp4" />
        </video>
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-black/80 to-teal-900/40" />

        <div className="mx-auto w-full max-w-5xl space-y-10 text-white animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            <div className="rounded-full bg-white/20 p-2 backdrop-blur">
              <Heart className="h-4 w-4 text-teal-200" />
            </div>
            Calm Starts Here
          </div>

          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                  Instant scripts for meltdowns, sibling drama, and “I hate you” moments.
                </h1>
                <p className="text-lg text-white/85 md:text-xl">
                  Sturdy translates tense moments into calm, connected language that keeps everyone’s nervous system regulated.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowWelcome(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-teal-900 shadow-2xl transition hover:-translate-y-0.5 hover:bg-teal-50"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('guide');
                    setShowWelcome(false);
                  }}
                  className="rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white/90 backdrop-blur transition hover:border-white hover:bg-white/10"
                >
                  See the manifesto
                </button>
              </div>

              <div className="flex flex-wrap gap-6 rounded-3xl bg-white/5 p-6 backdrop-blur">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="flex-1 min-w-[140px]">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-6 rounded-3xl bg-black/40 p-6 backdrop-blur-xl ring-1 ring-white/10">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/60">What Sturdy Feels Like</p>
                <div className="space-y-3">
                  {welcomeHighlights.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mt-1 rounded-full bg-white/10 p-2">
                        <Icon className="h-4 w-4 text-teal-200" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{title}</p>
                        <p className="text-sm text-white/70">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 shadow-2xl backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Scripts in action</p>
                <div className="mt-4 space-y-4">
                  {scenarioCards.map((card) => (
                    <div key={card.title} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                      <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">{card.title}</p>
                      <p className="mt-2 text-base text-white/85">{card.script}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: 3. THE MAIN APP ---
  return (
    <div className="relative z-10 flex flex-col min-h-screen font-sans pb-24 animate-in fade-in duration-500">
      
      {/* CONTENT AREA */}
      <div className="flex-1 p-6 pt-4 overflow-y-auto">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="max-w-md mx-auto">
            <header className="mb-4 text-center mt-2">
              <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">The Script Creator</h1>
              <p className="text-white/80 text-sm font-medium drop-shadow">Step {homeStep} of {maxHomeSteps}</p>
            </header>

            {/* UPGRADED CARD DESIGN WITH ANIMATION */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-t-8 border-teal-500 min-h-[300px] overflow-hidden">
                
                {/* BACK BUTTON */}
                {homeStep > 1 && (
                    <button 
                        onClick={() => setHomeStep(s => Math.max(1, s - 1))}
                        className="text-gray-500 hover:text-teal-600 transition-colors mb-4 flex items-center text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1"/> Back
                    </button>
                )}

                <div className="relative transition-transform duration-500 ease-in-out flex" 
                     style={{ transform: `translateX(-${(homeStep - 1) * 100}%)` }}>
                    
                    {/* STEP 1: KID DETAILS */}
                    <div className="flex-none w-full space-y-4 pr-6">
                        <h2 className="text-lg font-bold text-gray-800">1. Who is the child?</h2>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 outline-none text-base">
                            <option>Boy</option>
                            <option>Girl</option>
                        </select>
                        <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 outline-none text-base">
                            <option>Toddler (1-4)</option>
                            <option>School Age (5-10)</option>
                            <option>Pre-Teen (11-13)</option>
                            <option>Teenager (14+)</option>
                        </select>
                        <button onClick={() => setHomeStep(2)} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all hover:bg-teal-700">
                            Continue <ChevronRight className="w-5 h-5 ml-1"/>
                        </button>
                    </div>

                    {/* STEP 2: STRUGGLE */}
                    <div className="flex-none w-full space-y-4 pr-6">
                        <h2 className="text-lg font-bold text-gray-800">2. What is the Core Struggle?</h2>
                        <select value={struggle} onChange={(e) => setStruggle(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 outline-none font-medium text-base">
                            <option>Big Emotions</option>
                            <option>Aggression</option>
                            <option>Resistance/Defiance</option>
                            <option>Siblings</option>
                            <option>Screen Time</option>
                            <option>School & Anxiety</option>
                        </select>
                        <button onClick={() => setHomeStep(3)} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all hover:bg-teal-700">
                            Continue <ChevronRight className="w-5 h-5 ml-1"/>
                        </button>
                    </div>

                    {/* STEP 3: PROFILE & TONE */}
                    <div className="flex-none w-full space-y-4 pr-6">
                        <h2 className="text-lg font-bold text-gray-800">3. Fine-Tune the Advice</h2>
                        
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-600 block">Neurotype (For tailored language)</label>
                            <select value={profile} onChange={(e) => setProfile(e.target.value)} className="w-full p-3 bg-teal-100 border border-teal-300 rounded-xl text-teal-800 outline-none font-medium text-base shadow-sm">
                                <option>Neurotypical</option>
                                <option>ADHD</option>
                                <option>Autism</option>
                                <option>Highly Sensitive</option>
                            </select>
                        </div>

                        <div className="space-y-2 pt-1">
                            <label className="text-sm font-bold text-gray-600 block">Your Desired Tone: {tone}</label>
                            <div className="flex justify-between items-center text-xs text-gray-500">
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
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-teal-600"
                            />
                        </div>
                        <button onClick={() => setHomeStep(4)} className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all hover:bg-teal-700">
                            Almost Done <ChevronRight className="w-5 h-5 ml-1"/>
                        </button>
                    </div>

                    {/* STEP 4: SITUATION INPUT & GENERATE */}
                    <div className="flex-none w-full space-y-4 pr-6">
                        <h2 className="text-lg font-bold text-gray-800">4. Describe the Moment</h2>
                        <textarea
                            value={situationText}
                            onChange={(e) => setSituationText(e.target.value)}
                            placeholder={currentPlaceholder}
                            className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl min-h-[100px] text-gray-800 placeholder-gray-400 outline-none resize-none text-base shadow-inner focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            disabled={isLoading}
                            onClick={handleGenerate}
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.98] active:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-400/50"
                        >
                            <Heart className="w-5 h-5 fill-white/20" />
                            {isLoading ? 'Generating Sturdy Guidance...' : 'Get My Script'}
                        </button>
                    </div>
                </div>
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
                
                {/* HORIZONTAL NAV FOR SCRIPT TABS */}
                {activeTab === 'home' && (
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
                        <button 
                            onClick={() => setScriptView('script')} 
                            className={`flex-1 text-sm py-2 rounded-lg font-semibold transition-all ${scriptView === 'script' ? 'bg-teal-500 text-white shadow-md' : 'text-gray-600'}`}>
                            Words
                        </button>
                        <button 
                            onClick={() => setScriptView('why')} 
                            className={`flex-1 text-sm py-2 rounded-lg font-semibold transition-all ${scriptView === 'why' ? 'bg-teal-500 text-white shadow-md' : 'text-gray-600'}`}>
                            Strategy
                        </button>
                        <button 
                            onClick={() => setScriptView('troubleshoot')} 
                            className={`flex-1 text-sm py-2 rounded-lg font-semibold transition-all ${scriptView === 'troubleshoot' ? 'bg-teal-500 text-white shadow-md' : 'text-gray-600'}`}>
                            What If?
                        </button>
                    </div>
                )}
                
                {/* CONTENT AREA FOR TABS */}
                <div className="min-h-[150px] relative">
                    
                    {/* 1. SCRIPT SECTION */}
                    <div className={`absolute w-full transition-opacity duration-300 ${scriptView === 'script' ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Volume2 className='w-4 h-4 text-teal-600'/> Use These Words
                        </p>
                        <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed border-l-4 border-teal-500/50 pl-3">
                            {parsedResponse.script}
                        </p>
                    </div>

                    {/* 2. WHY IT WORKS SECTION */}
                    <div className={`absolute w-full transition-opacity duration-300 ${scriptView === 'why' ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Lightbulb className='w-4 h-4 text-amber-500 fill-amber-500'/> The Psychology
                        </p>
                        <ul className="list-none space-y-3 pl-0">
                            {parsedResponse.whyItWorks.map((tip, index) => (
                                <li key={index} className="flex items-start text-base text-slate-700">
                                    <Smile className="w-5 h-5 text-teal-600 shrink-0 mt-0.5 mr-2" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. TROUBLESHOOTING SECTION */}
                    <div className={`absolute w-full transition-opacity duration-300 ${scriptView === 'troubleshoot' ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 pointer-events-none'}`}>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap className='w-4 h-4 text-red-500'/> What If They Resist?
                        </p>
                        <ul className="list-none space-y-3 pl-0">
                            {parsedResponse.troubleshooting.map((tip, index) => (
                                <li key={index} className="flex items-start text-base text-slate-700">
                                    <ChevronRight className="w-5 h-5 text-red-500 shrink-0 mt-0.5 mr-2" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Fallback for Co-Parent Tab results */}
                {activeTab === 'coparent' && (
                    <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed">{completion}</p>
                )}
            </div>
          </div>
        )}

        {/* TAB 2: JOURNAL */}
        {activeTab === 'journal' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-6 flex justify-between items-center mt-4">
              <h1 className="text-2xl font-bold text-white">Your Journal</h1>
              <button onClick={clearHistory} className="text-xs text-red-200 bg-red-900/30 px-3 py-1 rounded-full">Clear</button>
            </header>
            <div className="space-y-4">
              {historyList.length === 0 ? (<div className="text-center text-white/50 py-10">No entries yet. Go generate some wisdom!</div>) : (
                historyList.map((item) => (
                  <div key={item.id} className="bg-stone-900/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                    <div className="flex justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${item.type === 'coparent' ? 'bg-purple-500/30 text-purple-200' : 'bg-teal-500/30 text-teal-200'}`}>
                        {item.type === 'coparent' ? 'Co-Parenting' : 'Script'}
                      </span>
                      <span className="text-xs text-white/40">{item.date}</span>
                    </div>
                    <p className="text-white/60 text-sm italic mb-3">"{item.situation}"</p>
                    <div className="text-white text-md font-medium border-l-2 border-white/20 pl-3">
                      {item.result}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                <button
                  disabled={isLoading}
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
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border-l-4 border-amber-400">
                <h3 className="font-bold text-amber-200 mb-1">Rupture & Repair</h3>
                <p className="text-sm text-white/80">You don't have to be perfect. If you lose your cool, apologize. The repair builds the bond stronger than before.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border-l-4 border-teal-400">
                <h3 className="font-bold text-teal-200 mb-1">Connection Before Correction</h3>
                <p className="text-sm text-white/80">Before you teach a lesson, connect with the feeling. "I see you are sad" comes before "We don't hit."</p>
              </div>
            </div>
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
          <button onClick={() => setActiveTab('journal')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'journal' ? 'text-teal-300' : 'text-white/50'}`}>
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

      {/* PAYWALL ALERT (Global) */}
      {!isPro && usageCount >= FREE_LIMIT && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl animate-in zoom-in">
            <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unlock Sturdy Parent</h2>
            <p className="text-slate-600 mb-6">You've hit your free limit. Get unlimited scripts, co-parenting tools, and journal access.</p>
            <a href={STRIPE_LINK} className="block w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700">
              Get Lifetime Access ($9.99)
            </a>
          </div>
        </div>
      )}

      {/* BACKGROUNDS */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-40">
        <source src="https://cdn.coverr.co/videos/coverr-a-mother-and-her-child-touching-hands-6625/1080p.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-stone-900/40 mix-blend-multiply -z-10" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen w-full font-sans text-white bg-black">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AppContent />
      </Suspense>
    </div>
  );
}
