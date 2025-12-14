'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { useSearchParams } from 'next/navigation'; 
import { 
  Brain, Sparkles, Send, Volume2, 
  History, ChevronDown, ChevronUp, 
  Copy, Trash2, Check, Lock 
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
// YOUR STRIPE LINK IS NOW INTEGRATED HERE:
const STRIPE_LINK = "https://buy.stripe.com/test_14A00c1WkbQU8EO2Tv2cg00"; 

export default function Home() {
  const [childAge, setChildAge] = useState('5');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // --- MONETIZATION STATE ---
  const [usageCount, setUsageCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const searchParams = useSearchParams();

  // --- 1. LOAD DATA ON START ---
  useEffect(() => {
    // Check if they just bought it (URL has ?unlocked=true)
    if (searchParams.get('unlocked') === 'true') {
      localStorage.setItem('sturdy-is-pro', 'true');
      setIsPro(true);
      // Remove the ugly URL tag
      window.history.replaceState(null, '', '/');
      alert("Thank you for supporting Sturdy Parent! Pro Mode Unlocked. 🌟");
    } else {
      // Load saved Pro status
      const savedPro = localStorage.getItem('sturdy-is-pro');
      if (savedPro === 'true') setIsPro(true);
    }

    // Load History
    const savedHistory = localStorage.getItem('sturdy-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load Usage Count
    const savedCount = localStorage.getItem('sturdy-usage');
    if (savedCount) setUsageCount(parseInt(savedCount));
  }, [searchParams]);

  // --- 2. AI CONNECTION ---
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
    onFinish: (_prompt, result) => {
      // Save History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        age: childAge,
        situation: document.querySelector('textarea')?.value || 'Unknown',
        script: result
      };
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('sturdy-history', JSON.stringify(updatedHistory));
      setIsHistoryOpen(true);

      // Increment Usage (If not Pro)
      if (!isPro) {
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem('sturdy-usage', newCount.toString());
      }
    }
  });

  const handleGenerate = () => {
    // BLOCK USER IF LIMIT REACHED
    if (!isPro && usageCount >= FREE_LIMIT) {
      return; // Do nothing, the UI handles the popup
    }
    complete('', { body: { message: document.querySelector('textarea')?.value, childAge } });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    if (confirm('Clear history?')) {
      setHistory([]);
      localStorage.removeItem('sturdy-history');
      // OPTIONAL: Reset usage for testing if needed
      // setUsageCount(0); localStorage.setItem('sturdy-usage', '0');
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-y-auto">
      {/* VIDEO BG */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-60">
        <source src="https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4" type="video/mp4" />
      </video>
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pb-20">
        
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl mt-8">
          
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/90 rounded-2xl shadow-lg ring-1 ring-white/20">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Sturdy Parent</h1>
                <p className="text-blue-200 text-sm font-medium">
                  {isPro ? '🌟 Pro Member' : `${Math.max(0, FREE_LIMIT - usageCount)} free tries left`}
                </p>
              </div>
            </div>
          </header>

          {/* PAYWALL ALERT */}
          {!isPro && usageCount >= FREE_LIMIT && (
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-xl mb-6 text-black animate-in zoom-in duration-300 border-2 border-white/50">
              <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                <Lock className="w-5 h-5" /> Limit Reached
              </div>
              <p className="mb-4 font-medium leading-tight">
                You've used your free scripts! Unlock unlimited access forever for just $9.99.
              </p>
              <a 
                href={STRIPE_LINK} 
                className="block w-full bg-black text-white text-center font-bold py-3 rounded-xl hover:bg-gray-900 transition-transform hover:scale-105 active:scale-95"
              >
                Unlock Lifetime Access ($9.99)
              </a>
            </div>
          )}

          {/* INPUT FORM (Blurs when locked) */}
          <div className={`space-y-6 transition-all duration-500 ${!isPro && usageCount >= FREE_LIMIT ? 'opacity-40 pointer-events-none filter blur-[2px]' : ''}`}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-100 uppercase tracking-widest ml-1">Child's Age</label>
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-400 outline-none text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-100 uppercase tracking-widest ml-1">What happened?</label>
              <textarea
                placeholder="Ex: He won't share his toys..."
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl min-h-[120px] text-white focus:ring-2 focus:ring-blue-400 outline-none text-lg"
              />
            </div>

            <button
              disabled={isLoading}
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {isLoading ? 'Consulting Sturdy AI...' : 'Generate Script'}
            </button>
          </div>

          {completion && (
            <div className="bg-white/95 text-slate-800 p-6 rounded-2xl shadow-xl mt-6 animate-in fade-in slide-in-from-bottom-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-blue-600 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Volume2 className="w-4 h-4" /> Suggested Script
                </h3>
                <button onClick={() => copyToClipboard(completion, 'current')} className="p-1.5 rounded-full hover:bg-slate-200">
                  {copiedId === 'current' ? <Check className="w-4 h-