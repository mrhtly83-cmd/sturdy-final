'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Brain, Sparkles, Send, Volume2 } from 'lucide-react';

export default function Home() {
  const [childAge, setChildAge] = useState('5');
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white">
      {/* 1. BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 min-w-full min-h-full object-cover -z-10 opacity-60"
      >
        <source src="https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4" type="video/mp4" />
      </video>

      {/* 2. DARK OVERLAY (To make text readable) */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 -z-10" />

      {/* 3. MAIN CONTENT (Glassmorphism Card) */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
          
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

        <p className="mt-8 text-white/40 text-sm">Powered by Sturdy AI</p>
      </div>
    </div>
  );
}