'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export default function PrimaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={[
        'inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-500 px-6 py-3 text-base font-semibold text-black',
        'shadow-lg shadow-teal-500/15 transition will-change-transform',
        'hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/20',
        'active:scale-[0.97] active:shadow-2xl active:shadow-teal-500/25',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-400/60 focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

