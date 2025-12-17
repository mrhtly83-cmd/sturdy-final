'use client';

import { useEffect, useMemo, useState } from 'react';

type Testimonial = { quote: string; name: string };

export default function TestimonialRotator({
  testimonials,
  intervalMs = 6500,
}: {
  testimonials: Testimonial[];
  intervalMs?: number;
}) {
  const safeTestimonials = useMemo(() => {
    return testimonials.filter((t) => t.quote.trim().length > 0);
  }, [testimonials]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (safeTestimonials.length <= 1) return;
    const id = window.setInterval(() => {
      setIncomingIndex((prev) => {
        if (prev != null) return prev;
        return (activeIndex + 1) % safeTestimonials.length;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [activeIndex, intervalMs, safeTestimonials.length]);

  useEffect(() => {
    if (incomingIndex == null) return;
    const t = window.setTimeout(() => {
      setActiveIndex(incomingIndex);
      setIncomingIndex(null);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [incomingIndex]);

  if (safeTestimonials.length === 0) return null;

  const active = safeTestimonials[activeIndex];
  const incoming = incomingIndex == null ? null : safeTestimonials[incomingIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="relative min-h-[96px]">
        <figure
          className={[
            'absolute inset-0 transition-opacity duration-[2000ms] ease-in-out',
            incoming ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
          aria-hidden={incoming ? true : undefined}
        >
          <blockquote className="text-sm leading-relaxed text-white/80">“{active.quote}”</blockquote>
          <figcaption className="mt-3 text-xs font-semibold text-white/55">— {active.name}</figcaption>
        </figure>

        {incoming ? (
          <figure className="absolute inset-0 opacity-100 transition-opacity duration-[2000ms] ease-in-out">
            <blockquote className="text-sm leading-relaxed text-white/80">“{incoming.quote}”</blockquote>
            <figcaption className="mt-3 text-xs font-semibold text-white/55">— {incoming.name}</figcaption>
          </figure>
        ) : null}
      </div>
    </div>
  );
}

