'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { 
  Brain, Sparkles, Send, Volume2, 
  History, ChevronDown, ChevronUp, 
  Copy, Trash2, Check 
} from 'lucide-react';

type HistoryItem = {
  id: string;
  date: string;
  age: string;
  situation: string;
  script: string;
};

export default function Home() {
  const [childAge, setChildAge] = useState('5');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- 1. LOAD HISTORY ON START ---
  useEffect(() => {
    const saved = localStorage.getItem('sturdy-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // --- 2. AI CONNECTION WITH AUTO-SAVE ---
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
    onFinish: (_prompt, result) => {
      // Create new history item
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        age: childAge,
        situation: document.querySelector('textarea')?.value || 'Unknown',
        script: result
      };
      
      // Update State & LocalStorage
      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('sturdy-history', JSON.stringify(updatedHistory));
      
      // Open history automatically to show user it saved
      setIsHistoryOpen(true);
    }
  });

  // --- HELPER: COPY TO CLIPBOARD ---
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Reset icon after 2s
  };

  // --- HELPER: DELETE HISTORY ---
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your history?')) {
      setHistory([]);
      localStorage.removeItem('sturdy-history');
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-y-auto">
      {/* BACKGROUND VIDEO */}
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-60">
        <source src="https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pb-20">
        
        {/* CARD CONTAINER */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <header className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600/90 rounded-2xl shadow-lg ring-1 ring-white/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Sturdy Parent</h1>
              <p className="text-blue-200 text-sm font-medium">Calm guidance in seconds</p>
            </div>
          </header>

          <div className="space-y-6">
            {/* INPUTS */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-100 uppercase tracking-widest ml-1">Child's Age</label>
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:bg-black/30 outline-none transition-all text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-blue-100 uppercase tracking-widest ml-1">What happened?</label>
              <textarea
                placeholder="Ex: He won't share his toys..."
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl min-h-[120px] text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:bg-black/30 outline-none resize-none text-lg leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    complete('', { body: { message: e.currentTarget.value, childAge } });
                  }
                }}
              />
            </div>

            {/* GENERATE BUTTON */}
            <button
              disabled={isLoading}
              onClick={() => complete('', { body: { message: document.querySelector('textarea')?.value, childAge } })}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {isLoading ? 'Consulting Sturdy AI...' : 'Generate Script'}
            </button>

            {/* LIVE RESULT CARD */}
            {completion && (
              <div className="bg-white/95 text-slate-800 p-6 rounded-2xl shadow-xl mt-6 animate-in fade-in slide-in-from-bottom-4 border-l-4 border-blue-500 relative group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-blue-600 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
                    <Volume2 className="w-4 h-4" /> Suggested Script
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(completion, 'current')}
                    className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
                    title="Copy to clipboard"
                  >
                    {copiedId === 'current' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">{completion}</p>
              </div>
            )}
          </div>
        </div>

        {/* SAFE HISTORY SECTION */}
        {history.length > 0 && (
          <div className="w-full max-w-md mt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* COLLAPSIBLE TOGGLE BUTTON */}
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-black/50 transition-all text-white/80 group"
            >
              <div className="flex items-center gap-2 font-semibold">
                <History className="w-4 h-4 text-blue-300" />
                <span>Saved Scripts ({history.length})</span>
              </div>
              {isHistoryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {/* EXPANDABLE TABLE AREA */}
            {isHistoryOpen && (
              <div className="mt-2 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300 origin-top">
                
                {/* CLEAR ALL BUTTON */}
                <div className="flex justify-end">
                   <button onClick={clearHistory} className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity px-2 py-1">
                     <Trash2 className="w-3 h-3" /> Clear History
                   </button>
                </div>

                {/* HISTORY LIST */}
                {history.map((item) => (
                  <div key={item.id} className="bg-black/30 backdrop-blur-sm border border-white/5 p-5 rounded-2xl hover:bg-black/40 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-blue-200 bg-blue-500/20 px-2 py-1 rounded-md border border-blue-500/30">
                           Age {item.age}
                         </span>
                         <span className="text-xs text-white/30">{item.date}</span>
                      </div>
                      
                      {/* COPY BUTTON */}
                      <button 
                        onClick={() => copyToClipboard(item.script, item.id)}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Copy script"
                      >
                         {copiedId === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <p className="text-white/60 text-sm italic mb-3 line-clamp-1">"{item.situation}"</p>
                    
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-white text-md font-medium leading-relaxed">
                        {item.script}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="mt-12 text-white/30 text-xs font-medium tracking-widest uppercase">Powered by Sturdy AI</p>
      </div>
    </div>
  );
}