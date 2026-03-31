'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScannerOverlayProps {
  status?: 'scanning' | 'locked' | 'verifying' | 'success';
  label?: string;
  countdown?: number | null;
}

export function ScannerOverlay({ 
  status = 'scanning', 
  label = "Geometry Analysis", 
  countdown = null 
}: ScannerOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl">
      {/* ── Outer Corner Marks ───────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-500/40" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-500/40" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-500/40" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-500/40" />

      {/* ── Dynamic Laser Scan Line ──────────────────────────────────────── */}
      {status === 'scanning' && (
        <motion.div 
          className="absolute left-0 right-0 h-[2px] bg-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-30"
          initial={{ top: '10%' }}
          animate={{ top: '90%' }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            repeatType: "reverse", 
            ease: "easeInOut" 
          }}
        />
      )}

      {/* ── Status Indicator (Top Right) ─────────────────────────────────── */}
      <div className="absolute top-6 right-8 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 drop-shadow-sm">
          {status}
        </span>
        <div className={`w-2 h-2 rounded-full ${
          status === 'success' ? 'bg-emerald-500' : 
          status === 'verifying' ? 'bg-amber-500 animate-pulse' : 
          'bg-cyan-500 animate-pulse'
        }`} />
      </div>

      {/* ── Countdown Overlay ────────────────────────────────────────────── */}
      {countdown !== null && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 bg-cyan-950/40 backdrop-blur-[2px] flex items-center justify-center flex-col z-40"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 mb-2">Acquiring Geometry</p>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">
            {countdown}
          </span>
        </motion.div>
      )}

      {/* ── Bottom Label ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-8">
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-4 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {label}
          </span>
        </div>
      </div>

      {/* ── Scanning Grid (Subtle) ───────────────────────────────────────── */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
}
