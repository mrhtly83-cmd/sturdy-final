'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export default function OutlineButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={[
        'inline-flex min-h-12 w-full items-center justify-center rounded-full border border-teal-400/45 bg-white/5 px-6 py-3 text-base font-semibold text-white',
        'transition hover:border-teal-300/70 hover:bg-white/8',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

