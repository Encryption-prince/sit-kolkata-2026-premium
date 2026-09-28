import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 7-strip data for KOLKATA mapping directly to the 7 images in /pre-loader-images/
const KOLKATA_FULLSCREEN_STRIPS = [
  {
    id: 1,
    letter: 'K',
    image: '/pre-loader-images/1.jpeg',
    fallback: '/gallery/sit_kol_2024_01.png',
    tag: 'Knowledge',
  },
  {
    id: 2,
    letter: 'O',
    image: '/pre-loader-images/2.jpeg',
    fallback: '/venue/snu-auditorium.jpg',
    tag: 'Opportunity',
  },
  {
    id: 3,
    letter: 'L',
    image: '/pre-loader-images/3.jpeg',
    fallback: '/gallery/sit_kol_2025_01.jpg',
    tag: 'Leadership',
  },
  {
    id: 4,
    letter: 'K',
    image: '/pre-loader-images/4.jpeg',
    fallback: '/venue/snu-building.png',
    tag: 'Kolkata',
  },
  {
    id: 5,
    letter: 'A',
    image: '/pre-loader-images/5.jpeg',
    fallback: '/gallery/sit_kol_2024_02.png',
    tag: 'Architecture',
  },
  {
    id: 6,
    letter: 'T',
    image: '/pre-loader-images/6.jpeg',
    fallback: '/gallery/sit_kol_mini_02_01.jpg',
    tag: 'Technology',
  },
  {
    id: 7,
    letter: 'A',
    image: '/pre-loader-images/7.jpeg',
    fallback: '/gallery/sit_kol_2025_02.jpg',
    tag: 'Advancement',
  },
];

export default function KolkataPreloader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Lock body scroll while preloader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Sequence timing:
    // 0.0s - 0.9s: Premium brand logo shown statically on clean soft white background
    // 0.9s - 2.5s: 7 full-screen image strips glide in smoothly without outer shadow spill, covering the logo completely
    // 2.5s - 4.2s: Full display of the 7-picture panorama with "K O L K A T A"
    // 4.2s: Smooth exit transition
    // 4.9s: Preloader finishes, revealing website
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 4200);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4900);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        setIsExiting(true);
        setTimeout(() => onComplete && onComplete(), 500);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="kolkata-fullscreen-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#FAF8F5] select-none"
        >
          {/* ── BACKGROUND LAYER (z-10): PREMIUM STATIC SAP INSIDE TRACK LOGO ── */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none flex items-center justify-center gap-3.5 sm:gap-5 md:gap-6 px-4">
            {/* Square Emblem */}
            <img
              src="/sap-logo-org.jpg"
              alt="SAP Inside Track Emblem"
              className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl object-cover border border-slate-300/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] shrink-0 select-none"
            />

            {/* Typography Lockup (without KOLKATA) */}
            <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight flex items-baseline gap-1.5 sm:gap-2.5 text-slate-950 leading-none">
              <span className="text-[#0070F2]">SAP</span>
              <span>Inside Track</span>
            </div>
          </div>

          {/* ── FOREGROUND LAYER (z-20): 7 FULL-SCREEN VERTICAL STRIPS ── */}
          {/* Clean glide without outer shadow bleed at top/bottom, completely covering the logo and screen */}
          <div className="absolute inset-0 w-full h-full flex flex-row overflow-hidden z-20 pointer-events-none">
            {KOLKATA_FULLSCREEN_STRIPS.map((strip, idx) => {
              const isFromTop = idx % 2 === 0;

              return (
                <motion.div
                  key={strip.id}
                  initial={{ y: isFromTop ? '-100%' : '100%' }}
                  animate={{ y: '0%' }}
                  exit={{
                    y: isFromTop ? '-100%' : '100%',
                    transition: {
                      duration: 0.75,
                      ease: [0.76, 0, 0.24, 1],
                      delay: idx * 0.03,
                    },
                  }}
                  transition={{
                    duration: 1.3,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.85 + idx * 0.11,
                  }}
                  className="relative flex-1 h-full min-w-0 overflow-hidden border-r border-white/10 last:border-r-0 bg-slate-950 flex flex-col justify-between items-center pointer-events-none"
                >
                  {/* Full-bleed Photo covering this strip entirely */}
                  <img
                    src={strip.image}
                    alt={`SIT Kolkata 2026 - ${strip.letter}`}
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.74] contrast-[1.08] saturate-[1.1] pointer-events-none"
                    loading="eager"
                    onError={(e) => {
                      if (strip.fallback && !e.currentTarget.src.includes(strip.fallback)) {
                        e.currentTarget.src = strip.fallback;
                      }
                    }}
                  />

                  {/* Clean gradient overlay for filmic depth & contrast without heavy dark bands */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/50 pointer-events-none" />

                  {/* Top Strip Index */}
                  <div className="relative z-10 pt-6 sm:pt-8 text-[10px] sm:text-xs font-mono font-bold text-amber-300/80 tracking-widest drop-shadow-md select-none">
                    0{idx + 1}
                  </div>

                  {/* Center Bold Letter of "K O L K A T A" */}
                  <div className="relative z-10 my-auto flex flex-col items-center select-none pointer-events-none px-1">
                    <span className="font-bebas text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-none">
                      {strip.letter}
                    </span>
                    <span className="hidden sm:inline-block text-[9px] md:text-[10px] lg:text-xs font-mono font-bold tracking-[0.25em] text-amber-300 uppercase mt-2.5 drop-shadow-md">
                      {strip.tag}
                    </span>
                  </div>

                  {/* Bottom Golden Dot Indicator */}
                  <div className="relative z-10 pb-6 sm:pb-8 flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
