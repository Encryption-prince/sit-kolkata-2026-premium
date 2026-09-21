import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function PreloaderDualHorizon({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const phaseTexts = [
    { title: 'HERITAGE', subtitle: 'Kolkata Cultural Soul', rightTitle: 'INNOVATION', rightSubtitle: 'SAP Enterprise Scale' },
    { title: 'THE CITY OF JOY', subtitle: 'Howrah • Trams • Heritage', rightTitle: 'CLEAN CORE', rightSubtitle: 'BTP • Joule AI • Cloud' },
    { title: 'WHERE THEY MEET', subtitle: '22.5726° N, 88.3639° E', rightTitle: '14 NOV 2026', rightSubtitle: 'East India Tech Flagship' },
    { title: 'SIT KOLKATA', subtitle: 'By Community, For Community', rightTitle: 'READY', rightSubtitle: 'Welcome to SIT Kolkata 2026' },
  ];

  useEffect(() => {
    // Lock scroll during preloader
    document.body.style.overflow = 'hidden';

    // High-speed smooth progress counter (approx 3.2s total for a cinematic, relaxed pace)
    const startTime = Date.now();
    const duration = 3200; // ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / duration) * 100));
      
      setProgress(rawPct);

      // Shift phases based on progress
      if (rawPct < 26) setPhaseIndex(0);
      else if (rawPct < 54) setPhaseIndex(1);
      else if (rawPct < 82) setPhaseIndex(2);
      else setPhaseIndex(3);

      if (rawPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(() => {
            document.body.style.overflow = '';
            if (onComplete) onComplete();
          }, 950); // curtain animation duration
        }, 400);
      }
    }, 25);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto flex select-none overflow-hidden font-sans">
          
          {/* ════════════════════════════════════════════════════════════════
              LEFT CURTAIN: KOLKATA HERITAGE (Warm Amber & Terracotta Slate)
              Slides out to the LEFT on finish
          ════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ x: '0%' }}
            exit={{ x: '-100%', transition: { duration: 0.95, ease: [0.77, 0, 0.175, 1] } }}
            className="relative w-1/2 h-full bg-[#120B09] border-r border-[#FFCE00]/20 flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden"
          >
            {/* Ambient Golden Heritage Glow */}
            <div className="absolute top-1/3 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#FFCE00]/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-0 w-60 h-60 rounded-full bg-[#d97706]/10 blur-[90px] pointer-events-none" />

            {/* Heritage Background Blueprint Grid */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #FFCE00 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Bar Left: Coordinates & Cultural Tag */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FFCE00] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#FFCE00]/80 uppercase">
                22.5726° N • KOLKATA
              </span>
            </div>

            {/* Center Content Left: Heritage Typographic Headline */}
            <div className="relative z-10 flex flex-col items-start my-auto pl-1 sm:pl-2">
              <div className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-amber-200/60 uppercase mb-2">
                01 / CULTURAL SOUL
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.45 }}
                >
                  <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCE00] via-amber-300 to-yellow-100">
                      {phaseTexts[phaseIndex].title}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-amber-100/70 mt-3 tracking-wider">
                    {phaseTexts[phaseIndex].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Bar Left: Heritage Icon & Progress Number */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                <span className="text-[#FFCE00] font-bold">HERITAGE</span>
                <span>•</span>
                <span>TRAM & TAXI</span>
              </div>
              <div className="text-2xl sm:text-4xl font-black font-mono text-[#FFCE00]/90">
                {String(progress).padStart(2, '0')}
                <span className="text-xs text-amber-300/60 font-sans ml-1">%</span>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════════════════
              RIGHT CURTAIN: SAP INNOVATION (Deep Sapphire & Cyber Cyan)
              Slides out to the RIGHT on finish
          ════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ x: '0%' }}
            exit={{ x: '100%', transition: { duration: 0.95, ease: [0.77, 0, 0.175, 1] } }}
            className="relative w-1/2 h-full bg-[#060D1A] border-l border-[#0070F2]/20 flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden"
          >
            {/* Ambient Sapphire Tech Glow */}
            <div className="absolute top-1/3 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#0070F2]/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-60 h-60 rounded-full bg-[#38BDF8]/10 blur-[90px] pointer-events-none" />

            {/* Tech Matrix Grid */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #0070F2 1px, transparent 1px), linear-gradient(to bottom, #0070F2 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Bar Right: SAP Brand Indicator */}
            <div className="relative z-10 flex items-center justify-end gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-[#38BDF8]/80 uppercase">
                SAP INSIDE TRACK • 2026
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#0070F2] animate-pulse" />
            </div>

            {/* Center Content Right: Innovation Typographic Headline */}
            <div className="relative z-10 flex flex-col items-end text-right my-auto pr-1 sm:pr-2">
              <div className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-cyan-200/60 uppercase mb-2">
                02 / TECH MATRIX
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-end"
                >
                  <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F2] via-cyan-400 to-sky-200">
                      {phaseTexts[phaseIndex].rightTitle}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-cyan-100/70 mt-3 tracking-wider">
                    {phaseTexts[phaseIndex].rightSubtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Bar Right: Innovation Telemetry */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-2xl sm:text-4xl font-black font-mono text-[#38BDF8]/90">
                <span className="text-xs text-cyan-300/60 font-sans mr-1">SYS</span>
                {progress >= 100 ? 'OK' : 'SYNC'}
              </div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                <span>CLEAN CORE</span>
                <span>•</span>
                <span className="text-[#38BDF8] font-bold">BTP CLOUD</span>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════════════════
              CENTER COLLISION SEAM & REACTOR EMBLEM
              Pulses with energy in the seam between Heritage & Innovation
          ════════════════════════════════════════════════════════════════ */}
          <motion.div
            exit={{ scale: 0.7, opacity: 0, transition: { duration: 0.4 } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
          >
            {/* Glowing Vertical Light Beam */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[180px] sm:h-[240px] bg-gradient-to-b from-transparent via-[#FFCE00] to-transparent shadow-[0_0_15px_#FFCE00]" />

            {/* Center Nexus Pill Badge */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-black border-2 border-white/30 shadow-[0_0_30px_rgba(255,206,0,0.35)] flex items-center gap-3 backdrop-blur-xl"
            >
              {/* Sparkle Icon */}
              <div className="w-5 h-5 rounded-full bg-[#FFCE00] flex items-center justify-center text-black shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-black stroke-none" />
              </div>

              {/* SIT Kolkata Tag */}
              <span className="text-xs sm:text-sm font-black text-white tracking-widest font-mono">
                #SITKOL_26
              </span>

              {/* Tiny Status Dot */}
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </motion.div>

            {/* Micro Tagline beneath Center Emblem */}
            <p className="mt-3 text-[10px] font-mono tracking-[0.35em] text-white/70 uppercase whitespace-nowrap drop-shadow">
              WHERE HERITAGE MEETS INNOVATION
            </p>
          </motion.div>

          {/* ════════════════════════════════════════════════════════════════
              BOTTOM HIGH-PRECISION DUAL PROGRESS LINE
          ════════════════════════════════════════════════════════════════ */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#FFCE00] via-amber-400 to-[#0070F2] shadow-[0_0_12px_#0070F2]"
            />
          </div>

        </div>
      )}
    </AnimatePresence>
  );
}
