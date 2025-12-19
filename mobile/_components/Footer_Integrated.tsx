// This component is deprecated. Use Footer.tsx instead.

'use client';

import Link from 'next/link';
import { Mail, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Study Parent</p>
            <p className="text-sm text-white/60">
              Science-backed scripts for calm, connected parenting.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Product</p>
            <ul className="space-y-2">
              <li>
                <Link href="/create" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Create Script
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Guide
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Company</p>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/manifesto" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Manifesto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Legal</p>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/60 hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 py-8">
          {/* Social & Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/50">
              © {currentYear} Study Parent. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/studyparent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-teal-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              
              <a
                href="https://instagram.com/studyparent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-teal-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              
              <a
                href="mailto:hello@studyparent.com"
                className="text-white/60 hover:text-teal-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

