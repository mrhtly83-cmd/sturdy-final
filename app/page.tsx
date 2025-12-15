'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useCompletion } from 'ai/react';
import { useSearchParams } from 'next/navigation'; 
import { 
  Heart, Home as HomeIcon, Users, BookOpen, 
  Copy, Check, Lock, 
  MessageCircle, ArrowRight,
  History 
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

function AppContent() {
  // --- APP FLOW STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<'home' | 'journal' | 'coparent' | 'guide'>('home');

  // --- INPUT STATES ---
  const [gender, setGender] = useState('Boy');
  const [ageGroup, setAgeGroup] = useState('School Age (5-10)');
  const [struggle, setStruggle] = useState('Big Emotions');
  const [profile, setProfile] = useState('Neurotypical'); 
  const [tone, setTone] = useState('Balanced'); 
  const [coparentText, setCoparentText] = useState('');

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
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
      const situation = activeTab === 'coparent' ? coparentText : document.querySelector('textarea')?.value || 'Unknown';

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
      const promptText = `Child: ${gender}, Group: ${ageGroup}, Struggle: ${struggle}. Profile: ${profile}. Tone: ${tone}. Situation: ${document.querySelector('textarea')?.value}`;
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
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen pb-16 px-6 font-sans">
        {/* UPDATED BACKGROUND VIDEO: Mother Holding Baby's Hands (Calm & Connected) */}
        <video autoPlay loop muted playsInline className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10">
          <source src="https://cdn.coverr.co/videos/coverr-a-mother-and-her-child-touching-hands-6625/1080p.mp4" type="video/mp4" />
        </video>
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent -z-10" />

        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
           <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
           </div>
           
           <h1 className="text-4xl md:text-5xl font-bold text-white text-center leading-tight drop-shadow-xl">
             Make it easier to focus on your kids.
           </h1>
           
           <p className="text-lg text-white/90 text-center font-medium">
             Less conflict. More connection. The words you need, instantly.
           </p>

           <button 
             onClick={() => setShowWelcome(false)}
             className="w-full bg-white text-teal-900 font-bold text-lg py-4 rounded-full shadow-2xl hover:bg-teal-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
           >
             Get Started <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER: 3. THE MAIN APP ---
  return (
    <div className="relative z-10 flex flex-col min-h-screen font-sans pb-24 animate-in fade-in duration-500">
      
      {/* CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="mb-8 text-center mt-4">
              <h1 className="text-3xl font-bold text-white drop-shadow-md">The Script Creator</h1>
              <p className="text-white/80 text-sm">Personalize your guidance for immediate impact.</p>
            </header>

            {/* UPGRADED CARD DESIGN */}
            <div className="bg-white/95 p-6 rounded-3xl shadow-2xl border-t-8 border-teal-500">
              <div className="space-y-4">
                
                {/* ROW 1: GENDER & AGE */}
                <div className="grid grid-cols-2 gap-3">
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 outline-none text-sm">
                    <option>Boy</option>
                    <option>Girl</option>
                  </select>
                  <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 outline-none text-sm">
                    <option>Toddler (1-4)</option>
                    <option>School Age (5-10)</option>
                    <option>Pre-Teen (11-13)</option>
                    <option>Teenager (14+)</option>
                  </select>
                </div>
                
                {/* ROW 2: STRUGGLE & PROFILE */}
                <div className="grid grid-cols-2 gap-3">
                   <select value={struggle} onChange={(e) => setStruggle(e.target.value)} className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 outline-none font-medium text-sm">
                      <option>Big Emotions</option>
                      <option>Aggression</option>
                      <option>Resistance/Defiance</option>
                      <option>Siblings</option>
                      <option>Screen Time</option>
                      <option>School & Anxiety</option>
                    </select>
                   {/* Neurodiverse Profile Dropdown (Premium Style) */}
                    <select value={profile} onChange={(e) => setProfile(e.target.value)} className="w-full p-3 bg-teal-100 border border-teal-300 rounded-xl text-teal-800 outline-none font-medium text-sm shadow-sm">
                        <option>Neurotypical</option>
                        <option>ADHD</option>
                        <option>Autism</option>
                        <option>Highly Sensitive</option>
                    </select>
                </div>
                
                {/* ROW 3: TONE SLIDER */}
                <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest ml-1 block">Tone: {tone}</label>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Gentle</span>
                        <span>Firm</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        value={tone === 'Gentle' ? 1 : tone === 'Firm' ? 3 : 2}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTone(val === 1 ? 'Gentle' : val === 3 ? 'Firm' : 'Balanced');
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-teal-600"
                    />
                </div>


                <textarea
                  placeholder={currentPlaceholder}
                  className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl min-h-[100px] text-gray-800 placeholder-gray-400 outline-none resize-none text-base shadow-inner focus:ring-2 focus:ring-teal-500"
                />

                <button
                  disabled={isLoading}
                  onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.01] transition-all"
                >
                  <Heart className="w-5 h-5 fill-white/20" />
                  {isLoading ? 'Thinking...' : 'Generate Script'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULT CARD (UPGRADED DESIGN) */}
        {(activeTab === 'home' || activeTab === 'coparent') && completion && (
          <div className="max-w-md mx-auto bg-white/95 rounded-2xl shadow-xl mt-6 animate-in fade-in slide-in-from-bottom-4 overflow-hidden border border-gray-200">
            {/* GRADIENT HEADER */}
            <div className={`p-4 text-white font-bold flex justify-between items-center ${activeTab === 'coparent' ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-gradient-to-r from-teal-600 to-emerald-500'}`}>
              <h3 className="uppercase text-xs tracking-widest flex items-center gap-2">
                {activeTab === 'coparent' ? <MessageCircle className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                {activeTab === 'coparent' ? 'Neutral Message' : 'Suggested Script'}
              </h3>
              <button onClick={() => copyToClipboard(completion, 'current')} className="p-1.5 rounded-full hover:bg-black/20 transition-colors">
                {copiedId === 'current' ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {/* CONTENT */}
            <div className="p-4 text-slate-800">
                <p className="text-lg font-medium whitespace-pre-wrap leading-relaxed">{completion}</p>
            </div>
          </div>
        )}

        {/* TAB 2: JOURNAL (Unchanged) */}
        {activeTab === 'journal' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-6 flex justify-between items-center mt-4">
              <h1 className="text-2xl font-bold text-white">Your Journal</h1>
              <button onClick={clearHistory} className="text-xs text-red-200 bg-red-900/30 px-3 py-1 rounded-full">Clear</button>
            </header>

            <div className="space-y-4">
              {historyList.length === 0 ? (
                <div className="text-center text-white/50 py-10">No entries yet. Go generate some wisdom!</div>
              ) : (
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

        {/* TAB 3: CO-PARENT (Unchanged) */}
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

        {/* TAB 4: GUIDE (Unchanged) */}
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