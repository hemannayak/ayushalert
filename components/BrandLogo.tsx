'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'icon' | 'horizontal';
  size?: number;
  textSize?: number;
  hideTextOnMobile?: boolean;
}

export function BrandLogo({ 
  className = "", 
  variant = "horizontal", 
  size = 32,
  textSize: customTextSize,
  hideTextOnMobile = false 
}: BrandLogoProps) {
  // Scaling factors based on 'size' (height)
  const iconSize = size;
  const textSize = customTextSize || size * 0.85; // Use custom or default scale
  
  return (
    <div className={`flex items-center gap-3 select-none transition-all duration-300 ${className}`}>
      {/* ── Refined SVG Icon ────────────────────────────────────────────────── */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        {/* The 'A' Frame - Solid & Structural */}
        <path 
          d="M20 6L6 34H14M20 6L34 34H26" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-zinc-400 dark:text-zinc-700" 
        />
        
        {/* The Precision Digital Pulse - Electric Cyan */}
        <path 
          d="M4 24H12L16 14L24 30L28 24H36" 
          stroke="#22d3ee" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        />
        
        {/* The Connection Node - Modern Hex/Circle Hybrid */}
        <circle 
          cx="34" 
          cy="24" 
          r="3" 
          fill="#22d3ee" 
          className="animate-pulse"
        />
        
        {/* Subtle Alert Dot (Legacy DNA) */}
        <circle 
          cx="20" 
          cy="12" 
          r="1.5" 
          fill="#ef4444" 
        />
      </svg>

      {/* ── SaaS Typography ────────────────────────────────────────── */}
      {variant === 'horizontal' && (
        <div className={`flex items-baseline leading-none gap-0.5 ${hideTextOnMobile ? 'hidden sm:flex' : 'flex'}`}>
          <span 
            className="font-black tracking-tighter text-zinc-900 dark:text-white"
            style={{ fontSize: `${textSize}px` }}
          >
            Ayush
          </span>
          <span 
            className="font-semibold tracking-tight text-zinc-500 dark:text-zinc-400"
            style={{ fontSize: `${textSize}px` }}
          >
            Alert
          </span>
          <span 
            className="rounded-full bg-cyan-400 ml-1 self-baseline mb-[6%]" 
            style={{ 
              width: `${Math.max(4, textSize * 0.18)}px`, 
              height: `${Math.max(4, textSize * 0.18)}px`,
              boxShadow: '0 0 10px rgba(34,211,238,0.5)'
            }} 
          />
        </div>
      )}
    </div>
  );
}
