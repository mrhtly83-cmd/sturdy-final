'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface PrimaryButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function PrimaryButton({ href, children, className = "" }: PrimaryButtonProps) {
  return (
    <Link
      href={href}
      className={`
        relative inline-flex items-center justify-center
        px-8 py-4 font-bold text-black
        bg-teal-400 rounded-xl
        transition-all duration-200
        /* THE STURDY DESIGN: Physicality & Weight */
        shadow-[0_5px_0_0_#0d9488] 
        hover:shadow-[0_2px_0_0_#0d9488]
        hover:translate-y-[2px]
        active:shadow-none
        active:translate-y-[5px]
        /* Accessibility & Focus */
        focus:outline-none focus:ring-4 focus:ring-teal-500/50
        ${className}
      `}
    >
      {children}
    </Link>
  );
}