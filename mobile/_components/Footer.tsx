import Link from 'next/link';
import { Instagram, Mail, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Study Parent</p>
            <p className="max-w-sm text-sm text-white/60">
              Science-backed scripts that help you stay calm, connected, and clear.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Links</p>
              <div className="grid gap-2 text-sm">
                <Link className="text-white/60 hover:text-teal-300 transition" href="/about">
                  About
                </Link>
                <Link className="text-white/60 hover:text-teal-300 transition" href="/privacy">
                  Privacy
                </Link>
                <Link className="text-white/60 hover:text-teal-300 transition" href="/terms">
                  Terms
                </Link>
                <Link className="text-white/60 hover:text-teal-300 transition" href="/contact">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Social</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-teal-300 transition"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-teal-300 transition"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="mailto:hello@studyparent.com"
                  className="text-white/60 hover:text-teal-300 transition"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center">
          <p>© 2025 Study Parent</p>
          <p className="text-white/40">Designed for calm moments.</p>
        </div>
      </div>
    </footer>
  );
}

