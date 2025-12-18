'use client';

import Link from 'next/link';
import { useRef, useMemo } from 'react';
import { ArrowDown, ArrowRight, Sparkles, Timer, Wand2 } from 'lucide-react';
import Header from './_components/Header';
import Footer from './_components/Footer';
import PrimaryButton from './_components/PrimaryButton'; // Now using your component
// Assuming you'll create a matching SecondaryButton for the 'See How It Works'

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement | null>(null);

  const valueProps = useMemo(() => [
    { title: 'Science-backed scripts', description: 'Connection-first words you can trust.', Icon: Sparkles },
    { title: 'Personalized in seconds', description: 'Tone + context tuned to your family.', Icon: Wand2 },
    { title: 'Ready when life happens', description: 'Built for big feelings and busy days.', Icon: Timer },
  ], []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // CHANGE: Softened background from black to Slate-950 for a "Sturdy" feel
    <div className="min-h-screen bg-[#020617] text-white selection:bg-teal-500/30">
      <Header />

      <main id="main">
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
          {/* Hero Video with added Poster for architectural stability */}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/hero-placeholder.jpg" 
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-1000"
          >
            <source src="/assets/151296-800360307_tiny.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/50 to-[#020617]" />

          <div className="relative mx-auto w-full max-w-4xl px-6 pt-24 text-center">
            {/* SOCIAL PROOF MOVED HIGHER: Establishing trust immediately */}
            <div className="opacity-0 animate-[calmFadeUp_900ms_0ms_forwards] mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Trusted by 42k+ families
              </span>
            </div>

            <h1 className="opacity-0 animate-[calmFadeUp_1000ms_200ms_forwards] text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Design the words that <span className="text-teal-400">calm your home</span>
            </h1>
            
            <p className="opacity-0 animate-[calmFadeUp_1000ms_400ms_forwards] mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-300">
              Science-backed scripts to help you navigate big feelings and busy days with confidence.
            </p>

            <div className="opacity-0 animate-[calmFadeUp_1000ms_700ms_forwards] mx-auto mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md">
              {/* REFACTORED: Using PrimaryButton with higher perceived value */}
              <PrimaryButton 
                href="/auth/signup" 
                className="w-full sm:w-auto min-w-[200px]"
              >
                Get My First Script <ArrowRight className="ml-2 h-5 w-5" />
              </PrimaryButton>

              <button
                onClick={scrollToFeatures}
                className="group flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                How it works 
                <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </button>
            </div>
          </div>
        </section>

        {/* Feature Sections remain similar but use the new theme variables */}
        <section ref={featuresRef} className="py-24 bg-[#020617]">
          {/* Feature Grid Logic... */}
        </section>
      </main>

      <Footer />
    </div>
  );
}