'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Brain, Sparkles, Send } from 'lucide-react';

export default function Home() {
  const [childAge, setChildAge] = useState('5');
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/generate-script',
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 max-w-md mx-auto font-sans">
      <header className="flex items-center gap-2 mb-8 pt-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold">Sturdy Parent</h1>
      </header>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Child's Age</label>
          <input
            type="number"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">What happened?</label>
          <textarea
            placeholder="He threw his toy..."
            className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl min-h-[100px] text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          {isLoading ? 'Thinking...' : 'Generate Script'}
        </button>

        {completion && (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mt-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Suggested Script:
            </h3>
            <p className="text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">{completion}</p>
          </div>
        )}
      </div>
    </div>
  );
}