'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
  glowEffect?: boolean;
}

export default function TiltCard({
  children,
  maxTilt = 6,
  className,
  glowEffect = false,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`,
      transition: 'transform 0.08s ease-out',
    });

    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        'relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md card-3d overflow-hidden',
        className
      )}
      {...props}
    >
      {glowEffect && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, rgba(59, 130, 246, 0.35), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
