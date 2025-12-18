'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type LinkVariantProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;

type ButtonVariantProps = {
  href?: never;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton(props: LinkVariantProps | ButtonVariantProps) {
  const baseClassName = [
    'relative inline-flex min-h-12 items-center justify-center',
    'px-8 py-4 font-bold text-black',
    'bg-teal-400 rounded-xl',
    'transition-all duration-200',
    'shadow-[0_5px_0_0_#0d9488]',
    'hover:shadow-[0_2px_0_0_#0d9488] hover:translate-y-[2px]',
    'active:shadow-none active:translate-y-[5px]',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50',
    'select-none',
  ].join(' ');

  const isLinkVariant = (p: LinkVariantProps | ButtonVariantProps): p is LinkVariantProps =>
    typeof (p as { href?: unknown }).href === 'string';

  if (isLinkVariant(props)) {
    const { href, children, className = '', ...rest } = props;
    return (
      <Link href={href} className={[baseClassName, className].join(' ')} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={[
        baseClassName,
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_5px_0_0_#0d9488]',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
