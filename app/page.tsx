'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCompletion } from 'ai/react';
import { useSearchParams } from 'next/navigation'; 
import { 
  Heart, Sparkles, Volume2, 
  History, ChevronDown, ChevronUp, 
  Copy, Trash2, Check, Lock, Sun 
} from 'lucide-react';

type HistoryItem = {
  id: string;
  date: string;
  age: string;
  situation: string;
  script: string;
};

// --- CONFIGURATION ---
const FREE_LIMIT = 3;
// Your existing Stripe Link
const STRIPE_LINK = "https://buy.stripe.com/test_14A00c1WkbQU8EO2Tv2cg00"; 

function AppContent() {
  // New State for Categories
  const [gender, setGender] = useState('Boy');
  const [ageGroup, setAgeGroup] = useState('School Age (5-10)');
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Monetization State
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const searchParams = useSearchParams();

  // --- LOAD DATA ---
  useEffect(() => {
    if (searchParams.get('unlocked') === 'true') {
      localStorage.setItem('sturdy-is-pro', 'true');
      setIsPro(true);
      window.history.replaceState(null, '', '/');
      alert("Welcome to the family! Lifetime Access Unlocked. ☀️");
    } else {
      const savedPro = localStorage.getItem('sturdy-is-pro');
      if (savedPro === 'true') setIsPro(true);
    }

    const savedHistory = localStorage.getItem('sturdy-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCount = localStorage.getItem('sturdy-usage');
    if (savedCount) setUsageCount(parseInt(savedCount));
  }, [searchParams]);

  // --- AI CONNECTION ---
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
    onFinish: (_prompt, result) => {
      // Save History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        age: ageGroup,
        situation: document.querySelector('textarea')?.value || 'Unknown',
        script: result
      };
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('sturdy-history', JSON.stringify(updatedHistory));
      setIsHistoryOpen(true);

      if (!isPro) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('sturdy-usage', newCount.toString());
      }
    }
  });

  const handleGenerate = () => {
    if (!isPro && usageCount >= FREE_LIMIT) return;
    
    // We combine the new inputs into the message sent to AI
    const promptText = `
      Child: ${gender}, Group: ${ageGroup}.
      Situation: ${document.querySelector('textarea')?.value}
    `;
    
    complete('', { body: { message: promptText, childAge: ageGroup } });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    if (confirm('Clear your journal?')) {
      setHistory([]);
      localStorage.removeItem('sturdy-history');
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pb-20 font-sans">
      
      {/* HEADER MESSAGE - Warm & Therapeutic */}
      <div className="text-center mt-12 mb-6 max-w-lg animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white/90 text-sm font-medium mb-4 shadow-sm border border-white/10">
          <Sun className="w-4 h-4 text-amber-300" />
          <span>Calm Guidance in Seconds</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight shadow-black/10 drop-shadow-lg">
          Connect, Don't Conflict.
        </h1>
        <p className="text-lg text-white/90 leading-relaxed drop-shadow-md">
          Find the right words to navigate big feelings and build a stronger bond with your child.
        </p>
      </div>

      <div className="w-full max-w-md bg-stone-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        {/* PAYWALL ALERT - Softer Design */}
        {!isPro && usageCount >= FREE_LIMIT && (
          <div className="bg-white/90 p-6 rounded-2xl shadow-xl mb-6 text-stone-800 animate-in zoom-in duration-300">
            <div className="flex items-center gap-2 mb-2 font-bold text-lg text-teal-700">
              <Lock className="w-5 h-5" /> Daily Limit Reached
            </div>
            <p className="mb-4 text-sm font-medium leading-relaxed opacity-80">
              Join our community of mindful parents. Unlock unlimited scripts and lifetime access for just $9.99.
            </p>
            <a 
              href={STRIPE_LINK} 
              className="block w-full bg-teal-700 text-white text-center font-bold py-3 rounded-xl hover:bg-teal-800 transition-all shadow-lg hover:shadow-teal-700/20"
            >
              Unlock Lifetime Access ($9.99)
            </a>
          </div>
        )}

        {/* NEW INPUT FORM */}
        <div className={`space-y-6 transition-all duration-500 ${!isPro && usageCount >= FREE_LIMIT ? 'opacity-40 pointer-events-none filter blur-[2px]' : ''}`}>
          
          {/* 1. GENDER & AGE SELECTION */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-teal-100 uppercase tracking-widest ml-1">Gender</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-400 outline-none appearance-none"
              >
                <option className="text-black">Boy</option>
                <option className="text-black">Girl</option>
                <option className="text-black">Neutral</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-teal-100 uppercase tracking-widest ml-1">Age Group</label>
              <select 
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-400 outline-none appearance-none"
              >
                <option className="text-black">Toddler (1-4)</option>
                <option className="text-black">School Age (5-10)</option>
                <option className="text-black">Pre-Teen (11-13)</option>
                <option className="text-black">Teenager (14+)</option>
              </select>
            </div>
          </div>

          {/* 2. SITUATION INPUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-teal-100 uppercase tracking-widest ml-1">What is happening?</label>
            <textarea
              placeholder="Ex: He is refusing to turn off the iPad and yelling at me..."
              className="w-full p-4 bg-white/10 border border-white/10 rounded-xl min-h-[120px] text-white placeholder-white/50 focus:ring-2 focus:ring-teal-400 outline-none text-lg leading-relaxed resize-none"
            />
          </div>

          <button
            disabled={isLoading}
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
          >
            {isLoading ? <Sparkles className="animate-spin w-5 h-5" /> : <Heart className="w-5 h-5 fill-white/20" />}
            {isLoading ? 'Consulting Sturdy AI...' : 'Find the Words'}
          </button>
        </div>

        {/* RESULTS CARD */}
        {completion && (
          <div className="bg-white/95 text-slate-700 p-6 rounded-2xl shadow-xl mt-6 animate-in fade-in slide-in-from-bottom-4 border-l-4 border-teal-500">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-teal-700 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
                <Volume2 className="w-4 h-4" /> Gentle Script
              </h3>
              <button onClick={() => copyToClipboard(completion, 'current')} className="p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                {copiedId === 'current' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">{completion}</p>
          </div>
        )}
      </div>

      {/* JOURNAL / HISTORY */}
      {history.length > 0 && (
        <div className="w-full max-w-md mt-6 pb-10">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full flex items-center justify-between p-4 bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:bg-stone-900/50 transition-all"
          >
            <div className="flex items-center gap-2 font-semibold">
              <History className="w-4 h-4 text-teal-200" />
              <span>Your Journal ({history.length})</span>
            </div>
            {isHistoryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {isHistoryOpen && (
            <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-end">
                  <button onClick={clearHistory} className="text-xs text-red-200/80 hover:text-red-200 flex items-center gap-1 opacity-60 hover:opacity-100 px-2 py-1 transition-opacity">
                    <Trash2 className="w-3 h-3" /> Clear Journal
                  </button>
              </div>
              {history.map((item) => (
                <div key={item.id} className="bg-stone-900/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl hover:bg-stone-900/40 transition-colors">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-teal-200 bg-teal-900/30 px-2 py-1 rounded-md">{item.age}</span>
                    <span className="text-xs text-white/40">{item.date}</span>
                  </div>
                  <p className="text-white/70 text-sm italic mb-3">"{item.situation}"</p>
                  <p className="text-white text-md font-medium border-l-2 border-teal-500/50 pl-3">{item.script}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-y-auto">
      {/* THERAPEUTIC BACKGROUND: Pexels Video 3120662 */}
      {/* Note: Using the Pexels Download link as Source */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-60">
        <source src="https://www.pexels.com/download/video/3120662/" type="video/mp4" />
      </video>
      {/* Warm Overlay filter */}
      <div className="fixed top-0 left-0 w-full h-full bg-stone-900/40 mix-blend-multiply -z-10" />

      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white/80 font-medium">Preparing your space...</div>}>
        <AppContent />
      </Suspense>
    </div>
  );
}