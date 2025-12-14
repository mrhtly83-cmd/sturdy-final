'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { Brain, Sparkles, Send, Volume2, History, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Database connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [childAge, setChildAge] = useState('5');
  const [history, setHistory] = useState<any[]>([]); // Store past scripts
  
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
    onFinish: () => {
      // When AI finishes, refresh the history list
      fetchHistory();
    }
  });

  // Load history when app starts
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    const { data } = await supabase
      .from('generated_scripts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5); // Get last 5 scripts
    
    if (data) setHistory(data);
  }

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-y-auto">
      {/* 1. BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-60"
      >
        <source src="https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4" type="video/mp4" />
      </video>

      {/* 2. DARK OVERLAY */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* 3. MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pb-20">
        
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl mt-8">
          
          <header className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-500/80 rounded-2xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sturdy Parent</h1>
              <p className="text-blue-200 text-sm">Calm guidance in seconds</p>
            </div>
          </header>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100 uppercase tracking-wider">Child's Age</label>
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100 uppercase tracking-wider">What happened?</label>
              <textarea
                placeholder="Ex: He won't share his toys..."
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl min-h-[120px] text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 outline-none resize-none text-lg leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    complete('', { body: { message: e.currentTarget.value, childAge } });
                  }
                }}
              />
            </div>

            <button
              disabled={isLoading}
              onClick={() => complete('', { body: { message: document.querySelector('textarea')?.value, childAge } })}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
            >
              {isLoading ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {isLoading ? 'Creating Magic...' : 'Generate Script'}
            </button>

            {completion && (
              <div className="bg-white/90 text-slate-800 p-6 rounded-2xl shadow-xl mt-6 animate-in fade-in slide-in-from-bottom-4 border-l-4 border-blue-500">
                <h3 className="text-blue-600 font-bold mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <Volume2 className="w-4 h-4" /> Suggested Script
                </h3>
                <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">{completion}</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. HISTORY SECTION */}
        {history.length > 0 && (
          <div className="w-full max-w-md mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="flex items-center gap-2 text-white/60 font-semibold mb-4 ml-2">
              <History className="w-4 h-4" /> Recent Scripts
            </h2>
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-black/40 backdrop-blur-sm border border-white/5 p-4 rounded-xl hover:bg-black/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">
                      Age {item.age_group}
                    </span>
                    <span className="text-xs text-white/30 flex items-center gap-1">
                       <Clock className="w-3 h-3" /> 
                       {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm italic mb-2">"{item.situation}"</p>
                  <p className="text-white text-md font-medium border-l-2 border-blue-500 pl-3">
                    {item.script}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-white/40 text-sm mb-8">Powered by Sturdy AI</p>
      </div>
    </div>
  );
}