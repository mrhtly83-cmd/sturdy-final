// This component is deprecated. Use Header.tsx instead.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10 group-hover:bg-white/8 transition-all duration-200">
                <Image src="/icon.png" alt="Study Parent" width={40} height={40} className="h-7 w-7" />
              </div>
              <span className="text-white font-bold text-lg hidden sm:inline">Study Parent</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-white/70 hover:text-teal-400 transition-colors duration-200 font-medium text-sm"
              >
                Login
              </Link>
              
              <Link
                href="/auth/signup"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-teal-400/45 bg-white/5 px-5 py-2 text-sm font-semibold text-white hover:border-teal-300/70 hover:bg-white/8 transition"
              >
                Start Free Trial
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-3 pb-4 border-t border-white/10 pt-4">
              <Link
                href="/auth/login"
                className="block w-full text-center px-4 py-2 text-white/70 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-colors duration-200 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              
              <Link
                href="/auth/signup"
                className="block w-full text-center px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/45 rounded-full font-semibold text-sm transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Free Trial
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

