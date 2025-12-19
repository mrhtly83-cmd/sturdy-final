'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'bg-black/80 backdrop-blur-md',
          'transition-colors duration-200',
          scrolled ? 'border-b border-white/10' : 'border-b border-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 rounded-xl">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <Image src="/icon.png" alt="Study Parent" width={40} height={40} className="h-7 w-7" />
            </div>
            <span className="hidden text-base font-extrabold tracking-tight text-white sm:inline">
              Study Parent
            </span>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className={[
                'inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-semibold',
                'text-teal-300 transition',
                'hover:bg-teal-500/20 hover:text-teal-200',
                'active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
              ].join(' ')}
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className={[
                'inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold',
                'bg-teal-500 text-white shadow-lg shadow-teal-500/15 transition',
                'hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/20',
                'active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60',
              ].join(' ')}
            >
              Start Free Trial
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-white transition hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <div
        className={[
          'fixed inset-0 z-[60] md:hidden',
          isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={isMenuOpen ? undefined : true}
      >
        <div
          className={[
            'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200',
            isMenuOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          className={[
            'absolute left-0 top-0 h-full w-[82%] max-w-xs bg-black text-white',
            'border-r border-white/10',
            'transition-transform duration-[260ms] ease-out',
            isMenuOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <Image src="/icon.png" alt="Study Parent" width={40} height={40} className="h-7 w-7" />
              </div>
              <span className="text-base font-extrabold tracking-tight">Study Parent</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 pt-2">
            <Link
              href="/auth/login"
              onClick={() => setIsMenuOpen(false)}
              className="mb-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-500/15 text-sm font-semibold text-teal-200 ring-1 ring-teal-400/20 transition hover:bg-teal-500/20 active:scale-[0.97]"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-500 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-500/15 transition hover:bg-teal-400 active:scale-[0.97]"
            >
              Start Free Trial
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

