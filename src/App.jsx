import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, MapPin, ArrowRight, Ticket, Users, Mic, Zap, Star, Play, Pause, ChevronRight, ChevronLeft, Landmark, Train, Map, CheckCircle, Clock3, Sparkles, Coffee, BrainCircuit, Network, ArrowUpRight, BadgeCheck, CircleDot, Gift, RotateCcw, Pencil, HelpCircle, Eraser, Bookmark, ExternalLink, X, Menu, Image as ImageIcon, Camera } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { LampContainer } from './ui/lamp';
import PixelSwap from './PixelSwap';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Image = ({ src, alt, width, height, className, ...props }) => (
  <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
);

// Custom Hook for Scroll Reveal Animations
const useScrollReveal = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (!options.retrigger) observer.unobserve(currentRef);
      } else if (options.retrigger) {
        // Reset visibility when out of view to retrigger on next scroll
        setIsVisible(false);
      }
    }, { threshold: 0.1, ...options });

    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options.retrigger, options.threshold]);

  return [ref, isVisible];
};

// Wrapper Component for Reveal Animations
const Reveal = ({ children, className = '', delay = 'delay-0', direction = 'up', retrigger = false }) => {
  const [ref, isVisible] = useScrollReveal({ retrigger });

  const baseClasses = "transition-all duration-1000 ease-out";
  const directionClasses = {
    up: isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
    left: isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12",
    right: isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12",
    scale: isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90",
  };

  return (
    <div ref={ref} className={`${baseClasses} ${directionClasses[direction]} ${delay} ${className}`}>
      {children}
    </div>
  );
};

// High-Performance Interactive Custom Cursor
const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isDarkArea, setIsDarkArea] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 50, stiffness: 950, mass: 0.08 };
  const followerX = useSpring(mouseX, springConfig);
  const followerY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only activate on devices with a fine pointer (mouse), avoiding touchscreens
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    document.documentElement.classList.add('custom-cursor-active');

    const detectIsDarkArea = (target) => {
      if (!target) return false;

      let curr = target;
      while (curr && curr !== document.documentElement && curr !== document.body) {
        const classList = typeof curr.className === 'string' ? curr.className : '';

        // Explicit light element overrides (e.g. white cards/badges in dark sections)
        if (
          classList.includes('bg-white') ||
          classList.includes('bg-stone-50') ||
          classList.includes('bg-slate-50') ||
          classList.includes('bg-yellow-400') ||
          classList.includes('bg-yellow-300') ||
          classList.includes('bg-[#FAF8F5]') ||
          curr.getAttribute?.('data-theme') === 'light'
        ) {
          return false;
        }

        // Explicit dark element overrides (e.g. dark buttons/pills in light sections)
        if (
          classList.includes('bg-slate-950') ||
          classList.includes('bg-slate-900') ||
          classList.includes('bg-slate-800') ||
          classList.includes('bg-black') ||
          classList.includes('bg-[#080d1a]') ||
          classList.includes('bg-[#0a0a0a]') ||
          classList.includes('bg-[#070e1e]') ||
          classList.includes('bg-[#140f06]') ||
          classList.includes('bg-[#05130d]') ||
          classList.includes('bg-[#140c0b]') ||
          curr.getAttribute?.('data-theme') === 'dark'
        ) {
          return true;
        }

        // Section ID checks
        const id = curr.id;
        if (
          id === 'venue' ||
          id === 'agenda' ||
          id === 'schedule' ||
          id === 'memory-wall' ||
          id === 'events' ||
          id === 'speakers' ||
          id === 'sponsors'
        ) {
          return true;
        }
        if (curr.tagName === 'FOOTER') {
          return true;
        }
        if (id === 'hero' || id === 'about' || id === 'tickets' || id === 'faq') {
          return false;
        }

        // Computed luminance fallback
        const bg = window.getComputedStyle(curr).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (match) {
            const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
            if (a > 0.4) {
              const r = parseInt(match[1], 10);
              const g = parseInt(match[2], 10);
              const b = parseInt(match[3], 10);
              const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
              return luminance < 140;
            }
          }
        }

        curr = curr.parentElement;
      }

      // Default page background is light (#FAF8F5)
      return false;
    };

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      if (target) {
        setIsDarkArea(detectIsDarkArea(target));
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const interactiveEl = target.closest(
        'a, button, [role="button"], input, textarea, select, .cursor-pointer, [data-interactive]'
      );
      setIsHovered(!!interactiveEl);
      setIsDarkArea(detectIsDarkArea(target));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleElementHover, { passive: true });

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleElementHover);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Outer Spring Follower Ring */}
      <motion.div
        style={{
          x: followerX,
          y: followerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isPressed ? 0.8 : isHovered ? 1.75 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border flex items-center justify-center pointer-events-none transition-[border-color,background-color,box-shadow] duration-150 ${isDarkArea
            ? isHovered
              ? 'border-white bg-white/20 shadow-[0_0_16px_rgba(255,255,255,0.4)]'
              : 'border-white/80 bg-transparent'
            : isHovered
              ? 'border-slate-950 bg-slate-950/15 shadow-[0_0_16px_rgba(0,0,0,0.18)]'
              : 'border-slate-950/80 bg-transparent'
          }`}
      />

      {/* Inner Precision Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isPressed ? 1.4 : isHovered ? 0.4 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.08 }}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full transition-colors duration-200 ${isDarkArea
            ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
            : 'bg-slate-950 shadow-[0_0_4px_rgba(0,0,0,0.4)]'
          }`}
      />
    </div>
  );
};

// Graffiti & Kolkata Elements Background
const KolkataBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Ambient Glows */}
    <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
    <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
    <div className="absolute -bottom-32 left-1/2 w-[40rem] h-[40rem] bg-yellow-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>

    {/* SVG Graffiti Splatters */}
    <svg className="absolute top-1/4 right-10 opacity-10" width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M45,-78C56.5,-69.5,63,-51.5,70.5,-35C78,-18.5,86.5,-3.5,84.5,10.5C82.5,24.5,70,37.5,58,48.5C46,59.5,34.5,68.5,20.5,72.5C6.5,76.5,-9.5,75.5,-23.5,70.5C-37.5,65.5,-49.5,56.5,-59,44.5C-68.5,32.5,-75.5,17.5,-77.5,2C-79.5,-13.5,-76.5,-29.5,-67.5,-42.5C-58.5,-55.5,-43.5,-65.5,-29,-73C-14.5,-80.5,33.5,-86.5,45,-78Z" transform="translate(100 100)" fill="#eab308" />
    </svg>
    <svg className="absolute bottom-1/4 left-10 opacity-10" width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.5,-63.5C51.5,-55.5,67.5,-48.5,75.5,-36C83.5,-23.5,83.5,-6.5,79.5,9C75.5,24.5,67.5,38.5,56.5,49.5C45.5,60.5,31.5,68.5,16,72.5C0.5,76.5,-16.5,76.5,-30.5,71C-44.5,65.5,-55.5,54.5,-64.5,41.5C-73.5,28.5,-80.5,14.5,-80.5,0C-80.5,-14.5,-73.5,-29,-64.5,-41C-55.5,-53,-44.5,-62.5,-31,-70C-17.5,-77.5,-2,-83,11,-80.5C24,-78,35,-67,37.5,-63.5Z" transform="translate(100 100)" fill="#3b82f6" />
    </svg>

    {/* Abstract Howrah Bridge Silhouette */}
    <div className="absolute bottom-0 w-full h-64 opacity-[0.03] flex justify-center items-end" style={{
      backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 200 L200 50 L250 50 L350 200 Z" fill="black"/><path d="M650 200 L750 50 L800 50 L900 200 Z" fill="black"/><path d="M150 120 C 300 0, 700 0, 850 120" stroke="black" stroke-width="10" fill="none"/></svg>')`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    }}></div>
  </div>
);

// A restrained reading-progress indicator gives the long-form landing page a more editorial feel.
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.8)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const EventEssentials = () => {
  const highlights = [
    {
      icon: BrainCircuit,
      eyebrow: 'Learn',
      title: 'Ideas that ship',
      text: 'Sharp, practitioner-led sessions on BTP, AI and enterprise transformation.',
      iconBg: 'bg-blue-50 text-[#0070F2] border-blue-200/80',
      eyebrowColor: 'text-[#0070F2]',
    },
    {
      icon: Network,
      eyebrow: 'Connect',
      title: 'Your next collaborator',
      text: 'A deliberately designed room for honest conversations and valuable introductions.',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
      eyebrowColor: 'text-indigo-600',
    },
    {
      icon: Sparkles,
      eyebrow: 'Experience',
      title: 'Kolkata, unapologetically',
      text: 'A technology gathering with the warmth, flavour and energy of the City of Joy.',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200/80',
      eyebrowColor: 'text-amber-600',
    },
  ];

  return (
    <section className="relative z-20 mt-2 sm:mt-4 md:mt-6 px-4 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white/95 backdrop-blur-xl shadow-[0_24px_70px_-15px_rgba(15,23,42,0.14),0_10px_24px_-6px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
          {/* Subtle brand blue top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#0070F2]/70 to-transparent" />

          <div className="relative grid grid-cols-1 divide-y divide-stone-200/70 md:grid-cols-3 md:divide-x md:divide-y-0">
            {highlights.map(({ icon: Icon, eyebrow, title, text, iconBg, eyebrowColor }) => (
              <div key={eyebrow} className="group relative p-7 md:p-9 transition-colors duration-300 hover:bg-stone-50/70">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border ${iconBg} shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6 stroke-[2.2]" />
                </div>
                <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.24em] ${eyebrowColor}`}>{eyebrow}</p>
                <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
                <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-600">{text}</p>
                <ArrowUpRight className="absolute bottom-8 right-8 h-5 w-5 text-stone-300 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0070F2]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const HowrahBridgeLogo = ({ className = "w-11 h-7 text-[#0070F2]" }) => (
  <svg viewBox="0 0 110 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Base river line */}
    <line x1="2" y1="58" x2="108" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="14" y1="62" x2="38" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="72" y1="62" x2="98" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* Left tower */}
    <path d="M14 58 L28 12 L33 12 L40 58" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Right tower */}
    <path d="M70 58 L77 12 L82 12 L96 58" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Deck roadway */}
    <line x1="8" y1="48" x2="102" y2="48" stroke="currentColor" strokeWidth="2.8" />
    {/* Arch / top suspension curve */}
    <path d="M28 12 C 45 32, 65 32, 82 12" stroke="currentColor" strokeWidth="2.2" fill="none" />
    {/* Left anchor stay */}
    <line x1="6" y1="48" x2="28" y2="12" stroke="currentColor" strokeWidth="2.2" />
    {/* Right anchor stay */}
    <line x1="104" y1="48" x2="82" y2="12" stroke="currentColor" strokeWidth="2.2" />
    {/* Center upper chord */}
    <line x1="40" y1="33" x2="70" y2="33" stroke="currentColor" strokeWidth="2" />
    {/* Left tower cross braces */}
    <line x1="18" y1="48" x2="30" y2="26" stroke="currentColor" strokeWidth="1.5" />
    <line x1="31" y1="48" x2="22" y2="26" stroke="currentColor" strokeWidth="1.5" />
    <line x1="28" y1="12" x2="40" y2="48" stroke="currentColor" strokeWidth="1.5" />
    {/* Right tower cross braces */}
    <line x1="79" y1="26" x2="92" y2="48" stroke="currentColor" strokeWidth="1.5" />
    <line x1="88" y1="26" x2="76" y2="48" stroke="currentColor" strokeWidth="1.5" />
    <line x1="82" y1="12" x2="70" y2="48" stroke="currentColor" strokeWidth="1.5" />
    {/* Center span vertical and cross trussing */}
    <line x1="48" y1="33" x2="48" y2="48" stroke="currentColor" strokeWidth="1.5" />
    <line x1="55" y1="31" x2="55" y2="48" stroke="currentColor" strokeWidth="1.5" />
    <line x1="62" y1="33" x2="62" y2="48" stroke="currentColor" strokeWidth="1.5" />
    <line x1="48" y1="33" x2="55" y2="48" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
    <line x1="62" y1="33" x2="55" y2="48" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
  </svg>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Venue', href: '#venue' },
    { label: 'Agenda', href: '#agenda' },
    { label: 'Memory Wall', href: '#memory-wall' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Tickets', href: '#tickets' },
    { label: 'Sponsors', href: '#sponsors' },
    { label: 'FAQ', href: '#faq' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = [
        'hero',
        'about',
        'venue',
        'agenda',
        'memory-wall',
        'speakers',
        'tickets',
        'sponsors',
        'faq',
      ];
      const scrollPosition = window.scrollY + 160;

      // When reaching near the bottom of document, activate last section (FAQ)
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        setActiveSection('faq');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection('hero');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-sm py-2.5 border-b border-stone-200/70'
          : 'bg-[#FAF8F5] py-3.5'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-10 flex justify-between items-center">
        {/* Logo */}
        <a
          href="#hero"
          onClick={() => setActiveSection('hero')}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group"
        >
          <HowrahBridgeLogo className="w-10 h-6 sm:w-11 sm:h-7 text-[#0070F2] transition-transform duration-300 group-hover:scale-105" />
          <div className="leading-tight">
            <div className="text-[16px] sm:text-[17px] font-black tracking-tight text-slate-950 flex items-center gap-1.5">
              <span className="text-[#0070F2]">SAP</span>
              <span>Inside Track</span>
            </div>
            <div className="text-[9px] sm:text-[9.5px] font-extrabold text-slate-900 tracking-[0.28em] uppercase mt-0.5">
              KOLKATA
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-6 text-[12.5px] xl:text-[13.5px] font-semibold text-slate-700">
          {navItems.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <div key={item.label} className="relative flex flex-col items-center">
                <a
                  href={item.href}
                  onClick={() => setActiveSection(sectionId)}
                  className={`py-1 transition-colors duration-200 ${isActive
                      ? 'text-slate-950 font-bold'
                      : 'text-slate-600 hover:text-[#0070F2]'
                    }`}
                >
                  {item.label}
                </a>
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-0.5 w-full h-[2.5px] bg-[#0070F2] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right CTA + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#tickets"
            onClick={() => setActiveSection('tickets')}
            className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 xl:px-5 xl:py-2.5 rounded-full font-bold text-[12px] xl:text-[13px] transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Get Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5 xl:w-4 xl:h-4 stroke-[2.5]" />
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-950 hover:bg-stone-200/50 rounded-lg transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-[#FAF8F5]/98 backdrop-blur-xl border-b border-stone-200/90 shadow-lg"
          >
            <div className="px-5 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const sectionId = item.href.replace('#', '');
                const isActive = activeSection === sectionId;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setActiveSection(sectionId);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${isActive
                        ? 'bg-blue-50 text-[#0070F2] font-bold'
                        : 'text-slate-700 hover:bg-stone-100 hover:text-slate-950'
                      }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0070F2]" />}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const TicketsLiveBadge = () => {
  return (
    <div className="relative inline-flex items-center justify-center my-3 sm:my-4 select-none">
      {/* Left Action Marks (3 radiating strokes) */}
      <div className="flex flex-col gap-1.5 mr-2.5 sm:mr-4 shrink-0">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-slate-950 stroke-[2.5] stroke-linecap-round">
          <line x1="20" y1="6" x2="6" y2="2" />
          <line x1="22" y1="16" x2="4" y2="16" />
          <line x1="20" y1="26" x2="6" y2="30" />
        </svg>
      </div>

      {/* Yellow Brushstroke Container */}
      <div className="relative flex items-center justify-center px-7 sm:px-12 py-2 sm:py-2.5">
        {/* SVG painterly brush background */}
        <svg
          viewBox="0 0 420 70"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full text-[#F5B800] drop-shadow-sm filter"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18,34 C12,32 5,28 10,21 C15,14 26,11 38,10 C85,6 150,5 215,6 C285,7 350,5 392,10 C406,12 414,18 412,25 C410,31 418,36 414,42 C409,50 398,53 382,55 C335,60 260,62 205,61 C140,60 75,62 34,58 C22,57 12,52 8,46 C4,40 10,36 18,34 Z"
            fill="#F5B800"
          />
          {/* Upper brush texture bristles */}
          <path
            d="M32,12 C90,8 180,8 260,9 C320,10 370,8 395,12 C402,13 408,16 405,21 C390,20 330,17 260,17 C180,17 90,18 35,21 C28,19 25,14 32,12 Z"
            fill="#FFC72C"
            opacity="0.6"
          />
          {/* Lower brush texture bristles */}
          <path
            d="M25,48 C75,54 165,54 250,53 C320,52 380,51 398,46 C402,48 400,53 392,55 C345,58 270,59 195,58 C120,57 55,58 20,53 C18,50 20,49 25,48 Z"
            fill="#E5A600"
            opacity="0.4"
          />
          {/* Edge bristle marks */}
          <path d="M5,24 L14,26 M3,32 L12,33 M6,40 L16,38 M415,22 L405,24 M418,30 L406,31 M413,38 L404,36" stroke="#F5B800" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Text inside */}
        <span
          className="relative z-10 text-slate-950 text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-black italic tracking-wide uppercase leading-none"
          style={{
            fontFamily: '"Permanent Marker", "Caveat", "Plus Jakarta Sans", cursive, sans-serif',
            transform: 'rotate(-1deg)',
            textShadow: '0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          TICKETS ARE LIVE
        </span>
      </div>

      {/* Right Action Marks (3 radiating strokes) */}
      <div className="flex flex-col gap-1.5 ml-2.5 sm:ml-4 shrink-0">
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-slate-950 stroke-[2.5] stroke-linecap-round">
          <line x1="4" y1="6" x2="18" y2="2" />
          <line x1="2" y1="16" x2="20" y2="16" />
          <line x1="4" y1="26" x2="18" y2="30" />
        </svg>
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-[88vh] lg:min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-[#FAF8F5] pt-24 pb-16 lg:pt-26 lg:pb-20 scroll-mt-20">
      {/* Ambient warm canvas lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[35rem] bg-gradient-to-b from-yellow-200/20 via-blue-100/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── LEFT SIDE ILLUSTRATION (Howrah Bridge with splashes & reflection) ── */}
      <div className="hidden lg:block absolute left-0 bottom-0 z-10 w-[33vw] max-w-[500px] min-w-[280px] pointer-events-none select-none">
        <img
          src="/hero-left.png"
          alt="Howrah Bridge Kolkata"
          className="w-full h-auto object-contain object-bottom drop-shadow-sm"
          loading="eager"
        />
      </div>
      {/* Mobile/Tablet backdrop version */}
      <div className="block lg:hidden absolute left-0 bottom-0 z-0 w-[45vw] max-w-[260px] opacity-25 pointer-events-none select-none">
        <img
          src="/hero-left.png"
          alt="Howrah Bridge Kolkata"
          className="w-full h-auto object-contain object-bottom"
        />
      </div>

      {/* ── RIGHT SIDE ILLUSTRATION (Taxi, Victoria Memorial & Lamps) ── */}
      <div className="hidden lg:block absolute right-0 bottom-0 z-10 w-[33vw] max-w-[500px] min-w-[280px] pointer-events-none select-none">
        <img
          src="/hero-right.png"
          alt="Kolkata Yellow Taxi and Victoria Memorial"
          className="w-full h-auto object-contain object-bottom drop-shadow-sm"
          loading="eager"
        />
      </div>
      {/* Mobile/Tablet backdrop version */}
      <div className="block lg:hidden absolute right-0 bottom-0 z-0 w-[45vw] max-w-[260px] opacity-25 pointer-events-none select-none">
        <img
          src="/hero-right.png"
          alt="Kolkata Yellow Taxi"
          className="w-full h-auto object-contain object-bottom"
        />
      </div>

      {/* ── CENTER CONTENT ── */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-2xl lg:max-w-3xl mx-auto w-full">
        {/* Category Overline */}
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-3 sm:mb-4 select-none">
          COMMUNITY × KNOWLEDGE × OPPORTUNITY
        </p>

        {/* Tickets Live Brush Badge */}
        <TicketsLiveBadge />

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-[-0.03em] leading-none text-slate-950 mt-2 sm:mt-3">
          <span className="text-[#0070F2]">SAP</span> Inside Track
        </h1>

        {/* ── TRAM TRANSIT CORRIDOR (EXPANDED GAP) ── */}
        <div className="relative w-full max-w-[320px] sm:max-w-[440px] md:max-w-[560px] lg:max-w-[620px] mx-auto my-3 sm:my-4 md:my-5 h-12 sm:h-14 md:h-16 overflow-hidden select-none pointer-events-none">
          {/* Overhead electric tram wire */}
          <div className="absolute top-2 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

          {/* Steel tram rails */}
          <div className="absolute bottom-1 inset-x-0 flex flex-col gap-[2px]">
            <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-slate-400/80 to-transparent" />
            <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-slate-400/80 to-transparent" />
          </div>

          {/* Left and right edge soft fade vignettes */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10 pointer-events-none" />

          {/* Moving Tram */}
          <div className="absolute bottom-1.5 animate-tram flex items-end z-0 shrink-0 min-w-max">
            <img
              src="/tram.png"
              alt="Kolkata Tram"
              className="h-10 sm:h-12 md:h-14 w-auto max-w-none shrink-0 object-contain drop-shadow-sm animate-tram-rumble"
            />
          </div>
        </div>

        {/* City Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.45em] text-slate-900 uppercase">
          K O L K A T A
        </p>

        {/* Community Tagline */}
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-slate-500 uppercase mt-3">
          BY THE COMMUNITY, FOR THE COMMUNITY.
        </p>

        {/* Event Details Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 mt-7 md:mt-9">
          {/* Date */}
          <div className="flex items-center gap-3 text-left">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 shrink-0 stroke-[2.2]" />
            <div>
              <div className="font-extrabold text-slate-950 text-sm sm:text-[15px] leading-tight">14 November 2026</div>
              <div className="text-slate-500 text-xs font-medium mt-0.5">8:00 AM – 5:00 PM IST</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 text-left">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 shrink-0 stroke-[2.2]" />
            <div>
              <div className="font-extrabold text-slate-950 text-sm sm:text-[15px] leading-tight">Sister Nivedita University</div>
              <div className="text-slate-500 text-xs font-medium mt-0.5">Kolkata, India</div>
            </div>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-3 text-left">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 shrink-0 stroke-[2.2]" />
            <div>
              <div className="font-extrabold text-slate-950 text-sm sm:text-[15px] leading-tight">400+</div>
              <div className="text-slate-500 text-xs font-medium mt-0.5">Attendees</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 md:mt-10">
          <a
            href="#tickets"
            className="bg-slate-950 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold text-[15px] shadow-lg shadow-slate-950/15 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Get Your Tickets</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </a>
          <a
            href="#about"
            className="bg-white hover:bg-slate-50 text-slate-950 border border-slate-300 hover:border-slate-400 px-8 py-3.5 rounded-full font-bold text-[15px] shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Learn More</span>
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

const AgendaSection = () => {
  const sessions = [
    { time: '09:00', title: 'Check-in & coffee', detail: 'Badges, first hellos, and a little Kolkata fuel.', icon: Coffee, tone: 'text-yellow-300' },
    { time: '10:00', title: 'The opening signal', detail: 'A community-first welcome and the ideas shaping the day.', icon: Sparkles, tone: 'text-cyan-300' },
    { time: '11:15', title: 'Deep-dive tracks', detail: 'Choose your perspective: architecture, AI, BTP, or S/4HANA.', icon: BrainCircuit, tone: 'text-blue-300' },
    { time: '14:30', title: 'People, not pitches', detail: 'Roundtables, peer exchange and conversations worth keeping.', icon: Users, tone: 'text-violet-300' },
    { time: '17:15', title: 'Closing notes', detail: 'Takeaways, new connections and a toast to what is next.', icon: Mic, tone: 'text-rose-300' },
  ];

  return (
    <section id="agenda" className="relative overflow-hidden bg-slate-950 py-24 text-white scroll-mt-16">
      <div id="schedule" className="absolute -top-20" />
      <div className="absolute inset-0 premium-grid opacity-30 pointer-events-none" />
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-yellow-400/15 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <Reveal direction="up" className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
              <Clock3 className="h-4 w-4" /> One high-energy day
            </div>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">A programme with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">real momentum.</span></h2>
          </div>
          <p className="max-w-md text-lg font-medium leading-relaxed text-slate-400">No filler. Just useful ideas, generous people, and enough space for the conversations between sessions.</p>
        </Reveal>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute bottom-6 left-[1.7rem] top-6 hidden w-px bg-gradient-to-b from-yellow-400/70 via-blue-400/60 to-transparent md:block" />
          <div className="space-y-4">
            {sessions.map(({ time, title, detail, icon: Icon, tone }, index) => (
              <Reveal key={time} direction={index % 2 === 0 ? 'left' : 'right'} delay={`delay-${(index % 4) * 100}`}>
                <article className="group relative grid grid-cols-[72px_1fr] gap-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-yellow-400/45 hover:bg-white/[0.08] md:grid-cols-[120px_1fr_auto] md:items-center md:gap-8 md:p-6">
                  <div className="text-xl font-black tracking-tight text-yellow-300 md:text-2xl">{time}</div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 md:hidden"><Icon className={`h-4 w-4 ${tone}`} /></span>
                      <h3 className="text-xl font-black text-white md:text-2xl">{title}</h3>
                    </div>
                    <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-400 md:text-base">{detail}</p>
                  </div>
                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 md:flex">
                    <Icon className={`h-6 w-6 ${tone}`} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal direction="up" className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold text-slate-400">
          <span className="inline-flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-yellow-400" /> 50+ speakers</span>
          <span className="inline-flex items-center gap-2"><CircleDot className="h-5 w-5 text-cyan-400" /> Multiple tracks</span>
          <span className="inline-flex items-center gap-2"><Ticket className="h-5 w-5 text-violet-400" /> Admission is free with RSVP</span>
        </Reveal>
      </div>
    </section>
  );
};

const InteractivePhotoStack = () => {
  const initialPhotos = [
    {
      id: 1,
      src: "/gallery/sit_kol_2025_03.jpg",
      alt: "Keynote Audience Hall at SIT Kolkata 2025",
      caption: "400+ Enterprise Practitioners & Leaders Converge",
      tag: "Keynotes",
      label: "SIT KOL 2025 Keynotes",
    },
    {
      id: 2,
      src: "/gallery/sit_kol_2024_01.png",
      alt: "Lamp Lighting Ceremony at SIT Kolkata 2024",
      caption: "Auspicious Lamp Lighting & Inauguration",
      tag: "Inauguration",
      label: "SIT KOL 2024 Ceremony",
    },
    {
      id: 3,
      src: "/gallery/sit_kol_mini_01_01.jpg",
      alt: "Grand Auditorium Crowd at Mini Session 01",
      caption: "Electrifying Energy Across the Auditorium",
      tag: "Auditorium",
      label: "Mini Session 01 Hall",
    },
    {
      id: 4,
      src: "/gallery/sit_kol_2025_01.jpg",
      alt: "Volunteers and Community Champions",
      caption: "By the Community, For the Community",
      tag: "Champions",
      label: "Community Volunteers",
    },
    {
      id: 5,
      src: "/gallery/sit_kol_mini_02_02.jpg",
      alt: "Hands-on Student Workshop at Mini Session 02",
      caption: "Next-Gen Enterprise Tech & AI Workshops",
      tag: "Workshops",
      label: "Mini Session 02 Labs",
    },
  ];

  const [photos, setPhotos] = useState(initialPhotos);
  const [dragState, setDragState] = useState({
    isDragging: false,
    cardIndex: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [tagPop, setTagPop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const bringToFront = (indexToBring) => {
    if (indexToBring === 0) return;
    setPhotos((prev) => {
      const selected = prev[indexToBring];
      const rest = prev.filter((_, i) => i !== indexToBring);
      return [selected, ...rest];
    });
    setTagPop(true);
    setTimeout(() => setTagPop(false), 350);
  };

  const sendToBack = useCallback(() => {
    setPhotos((prev) => {
      const [front, ...rest] = prev;
      return [...rest, front];
    });
    setTagPop(true);
    setTimeout(() => setTagPop(false), 350);
  }, []);

  const prevPhoto = () => {
    setPhotos((prev) => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
    setTagPop(true);
    setTimeout(() => setTagPop(false), 350);
  };

  // Automatic carousel cycling every 3.5 seconds (pauses on hover or drag)
  useEffect(() => {
    if (dragState.isDragging || isHovered) return;

    const interval = setInterval(() => {
      sendToBack();
    }, 3500);

    return () => clearInterval(interval);
  }, [dragState.isDragging, isHovered, sendToBack]);

  const handlePointerDown = (e, index) => {
    if (e.button && e.button !== 0) return;
    setDragState({
      isDragging: true,
      cardIndex: index,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  };

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handlePointerMove = (e) => {
      setDragState((prev) => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
      }));
    };

    const handlePointerUp = () => {
      const dx = dragState.currentX - dragState.startX;
      const dy = dragState.currentY - dragState.startY;
      const distance = Math.hypot(dx, dy);

      if (dragState.cardIndex === 0) {
        if (distance > 60) {
          sendToBack();
        }
      } else if (dragState.cardIndex !== null) {
        bringToFront(dragState.cardIndex);
      }

      setDragState({ isDragging: false, cardIndex: null, startX: 0, startY: 0, currentX: 0, currentY: 0 });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState]);

  const activePhoto = photos[0];
  const deltaX = dragState.isDragging ? dragState.currentX - dragState.startX : 0;
  const deltaY = dragState.isDragging ? dragState.currentY - dragState.startY : 0;

  const getStackStyle = (idx) => {
    if (idx === 0) {
      const isDragged = dragState.isDragging && dragState.cardIndex === 0;
      return {
        zIndex: 30,
        transform: isDragged
          ? `translate3d(${deltaX}px, ${deltaY}px, 0px) rotate(${deltaX * 0.08 - 2.5}deg) scale(1.02)`
          : 'translate3d(0px, 0px, 0px) rotate(-2.5deg) scale(1)',
        opacity: 1,
        transition: isDragged ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        boxShadow: isDragged
          ? '0 32px 64px -10px rgba(15,23,42,0.38)'
          : '0 22px 50px -12px rgba(15,23,42,0.24)',
      };
    }
    if (idx === 1) {
      const isDragged = dragState.isDragging && dragState.cardIndex === 1;
      return {
        zIndex: 20,
        transform: isDragged
          ? `translate3d(${deltaX}px, ${deltaY}px, 0px) rotate(${deltaX * 0.08 + 4.5}deg) scale(0.98)`
          : 'translate3d(22px, 16px, 0px) rotate(4.5deg) scale(0.97)',
        opacity: 0.95,
        transition: isDragged ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 16px 36px -10px rgba(15,23,42,0.18)',
      };
    }
    if (idx === 2) {
      const isDragged = dragState.isDragging && dragState.cardIndex === 2;
      return {
        zIndex: 15,
        transform: isDragged
          ? `translate3d(${deltaX}px, ${deltaY}px, 0px) rotate(${deltaX * 0.08 - 5.5}deg) scale(0.94)`
          : 'translate3d(-20px, 28px, 0px) rotate(-5.5deg) scale(0.93)',
        opacity: 0.88,
        transition: isDragged ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 12px 30px -8px rgba(15,23,42,0.14)',
      };
    }
    if (idx === 3) {
      const isDragged = dragState.isDragging && dragState.cardIndex === 3;
      return {
        zIndex: 10,
        transform: isDragged
          ? `translate3d(${deltaX}px, ${deltaY}px, 0px) rotate(${deltaX * 0.08 + 3}deg) scale(0.9)`
          : 'translate3d(16px, 40px, 0px) rotate(3deg) scale(0.89)',
        opacity: 0.78,
        transition: isDragged ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 10px 24px -6px rgba(15,23,42,0.12)',
      };
    }
    return {
      zIndex: 5,
      transform: 'translate3d(0px, 48px, 0px) rotate(-1deg) scale(0.85)',
      opacity: 0.65,
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-full min-h-[540px] md:min-h-[580px] p-6 sm:p-8 flex flex-col justify-between select-none"
    >

      {/* ── TOP HEADER BAR INSIDE BOX ── */}
      <div className="relative z-30 flex items-center justify-between gap-3">
        {/* Left: Vintage / Live event pill */}
        <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/90 shadow-sm text-slate-800 font-bold text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-extrabold text-[11px] tracking-wider uppercase text-slate-900">Kolkata Edition • 2026</span>
        </div>

        {/* Right: The Dynamic Tag that updates with front photo */}
        <div
          className={`bg-yellow-400 text-slate-950 border-2 border-slate-950 font-black px-4 py-1.5 rounded-xl transform shadow-[4px_4px_0px_rgba(15,23,42,1)] cursor-pointer select-none transition-all duration-300 hover:translate-x-0.5 hover:-translate-y-0.5 ${tagPop ? 'scale-115 rotate-6' : 'scale-100 rotate-12'
            }`}
          onClick={sendToBack}
          title="Click to cycle next photo"
        >
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>{activePhoto.tag}</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: THE INTERACTIVE PHOTO STACK ── */}
      <div className="relative flex-1 flex items-center justify-center my-3">
        <div className="relative w-[92%] sm:w-[86%] max-w-[440px] aspect-[4/3] flex items-center justify-center">
          {photos.slice(0, 4).map((card, idx) => (
            <div
              key={card.id}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              style={getStackStyle(idx)}
              className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-2xl border-[6px] border-white bg-white overflow-hidden touch-none"
            >
              <img
                src={card.src}
                alt={card.alt}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
              />
              {/* Gradient caption overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3.5 pt-7 pointer-events-none">
                <p className="text-white text-xs sm:text-sm font-black truncate drop-shadow-sm">{card.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM INFO & CONTROLS RAIL ── */}
      <div className="relative z-30 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">

        {/* Attendees micro-badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/90 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0070F2] flex items-center justify-center">
            <Users className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-black text-slate-950">400+ Attendees</div>
            <div className="text-[10px] text-slate-500 font-medium">Developers & Leads</div>
          </div>
        </div>

        {/* Thumbnail Selector & Arrow Controls */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/90 shadow-sm">
          <button
            onClick={prevPhoto}
            className="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-700 transition-colors"
            title="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            {initialPhotos.map((p) => {
              const isActive = p.id === activePhoto.id;
              return (
                <button
                  key={p.id}
                  onClick={() => bringToFront(photos.findIndex(item => item.id === p.id))}
                  className={`transition-all duration-300 rounded-full ${isActive
                      ? 'w-5 h-2 bg-[#0070F2]'
                      : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                  title={p.label}
                />
              );
            })}
          </div>

          <button
            onClick={sendToBack}
            className="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-700 transition-colors"
            title="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Venue micro-badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/90 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-black text-slate-950">SNU Campus</div>
            <div className="text-[10px] text-slate-500 font-medium">New Town, Kolkata</div>
          </div>
        </div>
      </div>

    </div>
  );
};

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden scroll-mt-16">
      {/* Decorative tram line track */}
      <div className="absolute left-10 top-0 bottom-0 w-8 opacity-5 border-l-4 border-r-4 border-dashed border-slate-900 pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          <div className="w-full lg:w-1/2">
            <Reveal direction="left">
              <div className="inline-flex items-center gap-2 mb-4 border-2 border-yellow-400 bg-yellow-50 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest text-slate-900 transform -rotate-1 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                THE KOLKATA EDITION • MAIN THEME: SAP BUSINESS AI
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Where Enterprise AI <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Meets Culture.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                SAP Inside Track Kolkata 2026 is Eastern India’s flagship community tech conference, bringing together developers, architects, consultants, and enterprise leaders to explore the transformational power of <strong className="text-slate-900 font-extrabold">SAP Business AI</strong> in the vibrant City of Joy.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Experience a high-energy fusion of enterprise innovation and legendary Kolkata hospitality. Dive deep into real-world AI use cases, Joule copilots, and Clean Core architectures while networking with industry pioneers.
              </p>

              <ul className="space-y-4">
                {[
                  { icon: <BrainCircuit className="w-5 h-5 text-blue-600" />, text: "SAP Business AI & Joule Copilots: Embedding generative AI across enterprise workflows." },
                  { icon: <Zap className="w-5 h-5 text-yellow-500" />, text: "Clean Core & BTP Architecture: Decoupled extensions, RAP models & event-driven mesh." },
                  { icon: <Landmark className="w-5 h-5 text-amber-600" />, text: "Heritage & Connections: High-octane peer networking paired with Kolkata culture." },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-sm hover:border-yellow-300 transition-all">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 shrink-0">{item.icon}</div>
                    <span className="text-slate-800 font-bold text-sm sm:text-base leading-snug">{item.text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="w-full lg:w-1/2 relative min-h-[560px] md:min-h-[600px] flex items-center justify-center">
            {/* Rich decorative background canvas */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/80 via-white to-amber-50/60 rounded-[3rem] transform rotate-1 scale-[0.98] border-2 border-stone-200/90 shadow-xl overflow-hidden pointer-events-none">
              {/* Subtle ambient grid watermark */}
              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              {/* Corner coordinates label */}
              <div className="absolute bottom-3 right-6 text-[10px] font-mono tracking-widest text-slate-400/80 uppercase">
                22.5726° N, 88.3639° E • KOLKATA
              </div>
            </div>

            <Reveal direction="right" className="relative z-10 w-full h-full">
              <InteractivePhotoStack />
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

const CuratedTag = ({ label, tilt = "-rotate-2", className = "", size = "normal" }) => {
  const isSmall = size === "small";
  const formattedLabel = label.startsWith("#") ? label : `#${label}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${isSmall ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-xs font-black"
        } rounded-full bg-[#FFCE00] border-2 border-black text-black font-black uppercase tracking-wider shadow-[3px_3px_0px_#000000] hover:shadow-[4.5px_4.5px_0px_#000000] hover:-translate-y-0.5 hover:rotate-0 transition-all duration-200 cursor-pointer select-none ${tilt} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} shrink-0 text-black fill-none stroke-black stroke-[2.5] stroke-linejoin-round`}
      >
        <path d="M12 2.5 L14.5 9.5 L21.5 12 L14.5 14.5 L12 21.5 L9.5 14.5 L2.5 12 L9.5 9.5 Z" />
        <circle cx="4.5" cy="5.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="19.5" cy="18.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      <span className="font-extrabold tracking-wide" style={{ textShadow: "0.5px 0.5px 0px rgba(0,0,0,0.12)" }}>
        {formattedLabel}
      </span>
    </div>
  );
};

const PastEventsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const slides = [
    {
      id: "sit-kol-2025",
      label: "SIT KOL 2025",
      theme: {
        name: "Conference Blue",
        sectionBg: "#070e1e",
        cardBg: "#0f1c3a",
        cardBorder: "border-[#1d3568]/50 hover:border-[#0070F2]/70",
        accent: "#0070F2",
        accentHover: "#1b82f8",
        badgeBg: "bg-[#0070F2]/15",
        badgeBorder: "border-[#0070F2]/40",
        badgeText: "text-[#38bdf8]",
        glow1: "bg-[#0070F2]/25",
        glow2: "bg-[#38bdf8]/15",
        prevBtnBg: "#0f1c3a",
        prevBtnHover: "hover:bg-[#162750]",
        prevBtnBorder: "border-blue-400/20",
        textMuted: "text-[#bfdbfe]",
        gradientText: "from-blue-400 via-cyan-400 to-indigo-300",
      },
      hero: {
        title: "SIT KOL 2025",
        subtitle: "East India's Flagship SAP Community Conference",
        img: "/gallery/sit_kol_2025_03.jpg",
      },
      story: {
        title: "Where Passion Meets Community",
        desc: "Relive the electrifying energy of 400+ SAP practitioners, clean-core pioneers, and enterprise architects converging in Kolkata.",
        cta: "EXPLORE HIGHLIGHTS",
      },
      portraitPhoto: {
        img: "/gallery/sit_kol_2025_04.jpg",
        alt: "Keynote Session by Mr. Monimoy Kundu at SIT Kolkata 2025",
        title: "Keynote Speaker",
      },
      explore: {
        title: "Keynotes",
        desc: "Masterclasses on SAP BTP, Clean Core & SAP Business AI.",
      },
      streetPhoto: {
        img: "/gallery/sit_kol_2025_02.jpg",
        alt: "Tech Leaders & Speakers in Hallway Discussion",
        title: "Hallway Connections",
      },
      stay: {
        title: "Camaraderie",
        desc: "Hallway conversations, mentor links, and community connections.",
      },
      blossomPhoto: {
        img: "/gallery/sit_kol_2025_01.jpg",
        alt: "Core Volunteer Champions & Organizing Committee",
        title: "Core Organizers",
      },
      cuisine: {
        title: "Media Coverage",
        desc: "Press interviews and broadcast media coverage",
        img: "/gallery/sit_kol_2025_05.jpg",
        alt: "Press & TV Media Interview",
      },
    },
    {
      id: "sit-kol-2024",
      label: "SIT KOL 2024",
      theme: {
        name: "Inaugural Sapphire",
        sectionBg: "#090d1f",
        cardBg: "#131a38",
        cardBorder: "border-[#26356b]/50 hover:border-[#6366f1]/70",
        accent: "#4f46e5",
        accentHover: "#6366f1",
        badgeBg: "bg-[#4f46e5]/15",
        badgeBorder: "border-[#4f46e5]/40",
        badgeText: "text-[#a5b4fc]",
        glow1: "bg-[#4f46e5]/25",
        glow2: "bg-[#6366f1]/15",
        prevBtnBg: "#131a38",
        prevBtnHover: "hover:bg-[#1c2652]",
        prevBtnBorder: "border-indigo-400/20",
        textMuted: "text-[#c7d2fe]",
        gradientText: "from-indigo-400 via-purple-300 to-sky-300",
      },
      hero: {
        title: "SIT KOL 2024",
        subtitle: "The Landmark Inception of SAP Inside Track Kolkata",
        img: "/gallery/sit_kol_2024_01.png",
      },
      story: {
        title: "The Historic Inception",
        desc: "Where the journey began — uniting Eastern India's enterprise ecosystem with visionary keynotes and executive leadership.",
        cta: "EXPLORE 2024",
      },
      portraitPhoto: {
        img: "/gallery/sit_kol_2024_02.png",
        alt: "Executive Panel Discussion",
        title: "Executive Panel",
      },
      explore: {
        title: "Leadership",
        desc: "Distinguished executive panels and architectural vision.",
      },
      streetPhoto: {
        img: "/gallery/sit_kol_2024_03.png",
        alt: "Ceremonial Stage Lamp Lighting with Dignitaries",
        title: "Lamp Lighting",
      },
      stay: {
        title: "Community",
        desc: "Uniting delegates, champions, and enterprise leaders.",
      },
      blossomPhoto: {
        img: "/gallery/sit_kol_2024_04.jpg",
        alt: "Community Welcome Backdrop at SIT Kolkata 2024",
        title: "Community Welcome",
      },
      cuisine: {
        title: "Felicitation",
        desc: "Celebration of volunteer team & certificates",
        img: "/gallery/sit_kol_2024_05.jpg",
        alt: "Felicitation & Community Celebration",
      },
    },
    {
      id: "mini-session-01",
      label: "Mini Session 01",
      theme: {
        name: "Community Amber",
        sectionBg: "#161006",
        cardBg: "#291e0a",
        cardBorder: "border-[#624410]/50 hover:border-[#f59e0b]/70",
        accent: "#d97706",
        accentHover: "#f59e0b",
        badgeBg: "bg-[#d97706]/15",
        badgeBorder: "border-[#d97706]/35",
        badgeText: "text-[#fbbf24]",
        glow1: "bg-[#d97706]/25",
        glow2: "bg-amber-600/15",
        prevBtnBg: "#291e0a",
        prevBtnHover: "hover:bg-[#382a0e]",
        prevBtnBorder: "border-white/[0.08]",
        textMuted: "text-[#fde68a]",
        gradientText: "from-amber-400 via-yellow-400 to-amber-200",
      },
      hero: {
        title: "Mini Session 01",
        subtitle: "Auditorium Masterclasses & Deep Technical Labs",
        img: "/gallery/sit_kol_mini_01_01.jpg",
      },
      story: {
        title: "Auditorium Tech Sprints",
        desc: "Interactive developer workspaces, clean-core implementations, and real-time mentor feedback in a packed hall.",
        cta: "VIEW SESSION LABS",
      },
      portraitPhoto: {
        img: "/gallery/sit_kol_mini_01_02.jpg",
        alt: "Interactive Q&A Session with Attendee",
        title: "Audience Q&A",
      },
      explore: {
        title: "Workshops",
        desc: "Hands-on deep dives into SAP BTP and Joule AI agent extensibility.",
      },
      streetPhoto: {
        img: "/gallery/sit_kol_mini_01_03.jpg",
        alt: "Engaged Audience Discussions & Mic Questions",
        title: "Engaged Discussions",
      },
      stay: {
        title: "Community",
        desc: "Connect directly with SAP Champions and Developer Advocates.",
      },
      blossomPhoto: {
        img: "/gallery/sit_kol_mini_01_04.jpg",
        alt: "Keynote Address to Grand Auditorium from Podium",
        title: "Keynote Perspective",
      },
      cuisine: {
        title: "Fellowship",
        desc: "Speakers & organizers fellowship on stage",
        img: "/gallery/sit_kol_mini_01_05.jpg",
        alt: "Speakers & Organizers Stage Group",
      },
    },
    {
      id: "mini-session-02",
      label: "Mini Session 02",
      theme: {
        name: "Cyber Emerald",
        sectionBg: "#05130d",
        cardBg: "#0c241a",
        cardBorder: "border-[#144d37]/50 hover:border-[#10b981]/70",
        accent: "#059669",
        accentHover: "#10b981",
        badgeBg: "bg-[#059669]/15",
        badgeBorder: "border-[#059669]/40",
        badgeText: "text-[#34d399]",
        glow1: "bg-[#059669]/25",
        glow2: "bg-[#10b981]/15",
        prevBtnBg: "#0c241a",
        prevBtnHover: "hover:bg-[#133728]",
        prevBtnBorder: "border-emerald-400/20",
        textMuted: "text-[#a7f3d0]",
        gradientText: "from-emerald-400 via-teal-300 to-cyan-300",
      },
      hero: {
        title: "Mini Session 02",
        subtitle: "Interactive Enterprise Labs & Academic Sprints",
        img: "/gallery/sit_kol_mini_02_02.jpg",
      },
      story: {
        title: "Enterprise Learning & Sprints",
        desc: "Masterclasses bridging academics and enterprise IT with live demonstrations and real-world architecture.",
        cta: "EXPLORE SESSIONS",
      },
      portraitPhoto: {
        img: "/gallery/sit_kol_mini_02_01.jpg",
        alt: "Interactive Q&A on Enterprise Trends",
        title: "Enterprise Q&A",
      },
      explore: {
        title: "Masterclasses",
        desc: "Strategic deep-dives on SAP architecture and enterprise solutions.",
      },
      streetPhoto: {
        img: "/gallery/sit_kol_mini_02_03.jpg",
        alt: "Speaker presenting What is SAP?",
        title: "SAP Demystified",
      },
      stay: {
        title: "Mentorship",
        desc: "Direct guidance for students and aspiring SAP consultants.",
      },
      blossomPhoto: {
        img: "/gallery/sit_kol_mini_02_04.jpg",
        alt: "Attentive Students & Future Tech Innovators",
        title: "Future Innovators",
      },
      cuisine: {
        title: "Session Team",
        desc: "Faculty, speaker & student coordinators fellowship",
        img: "/gallery/sit_kol_mini_02_05.jpg",
        alt: "Faculty & Student Volunteers Group",
      },
    },
  ];

  const current = slides[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      id="memory-wall"
      style={{ backgroundColor: current.theme.sectionBg }}
      className="py-6 sm:py-8 lg:py-8 text-white relative overflow-hidden border-t border-white/10 select-none transition-colors duration-500 scroll-mt-16"
    >
      <div id="events" className="absolute -top-20" />
      {/* Dynamic Ambient Background Glows */}
      <div
        style={{ backgroundColor: current.theme.accent }}
        className="absolute top-1/4 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none transition-colors duration-700"
      />
      <div
        style={{ backgroundColor: current.theme.accent }}
        className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none transition-colors duration-700"
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-10 relative z-10 max-w-7xl">
        {/* Compact Header: Title + Theme Tabs inline to ensure screen fit */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${current.theme.badgeBg} ${current.theme.badgeBorder} ${current.theme.badgeText}`}>
              <Sparkles className="w-3 h-3" />
              <span>MEMORY WALL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Curated <span className={`text-transparent bg-clip-text bg-gradient-to-r ${current.theme.gradientText}`}>Moments</span>
            </h2>
          </div>

          {/* Chapter Selector Tabs & Slide Counter */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-inner">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    backgroundColor: idx === currentSlide ? current.theme.accent : 'transparent',
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${idx === currentSlide
                      ? 'text-white shadow-md'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono font-bold">
              <span style={{ color: current.theme.accent }}>0{currentSlide + 1}</span>
              <span className="text-stone-600">/</span>
              <span className="text-stone-400">0{slides.length}</span>
            </div>
          </div>
        </div>

        {/* ── FIXED-HEIGHT BENTO GRID: EXACT SAME SIZE ACROSS ALL SLIDES, FITS IN SCREEN ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:h-[480px]"
          >
            {/* ════════════════════════════════════════════════════════════
                LEFT BLOCK (6 COLS): HERO CARD (240px) + 2 SUB-COLS (228px) = 480px
            ════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-3 h-full">
              {/* 1. Large Landscape Hero Card */}
              <div
                onClick={() => current.hero.img && setLightboxImage(current.hero.img)}
                className={`relative h-[220px] sm:h-[240px] w-full rounded-2xl overflow-hidden group border ${current.theme.cardBorder} shadow-xl shrink-0 ${current.hero.img ? 'cursor-pointer' : ''}`}
                style={{ backgroundColor: current.theme.cardBg }}
              >
                {current.hero.img ? (
                  <>
                    <img
                      src={current.hero.img}
                      alt={current.hero.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-br from-black/40 via-transparent to-black/60">
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${current.theme.badgeBg} ${current.theme.badgeBorder} ${current.theme.badgeText}`}>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Featured Gallery</span>
                      </div>
                      <CuratedTag label="#SITKOL_26" tilt="-rotate-2" />
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl lg:text-[38px] font-black text-white tracking-tight leading-none drop-shadow-md">
                        {current.hero.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-300 mt-2 font-medium">
                        {current.hero.subtitle}
                      </p>
                    </div>
                  </div>
                )}

                {current.hero.img && (
                  <div className="absolute bottom-4 left-5 right-5 z-10 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-none drop-shadow-md">
                        {current.hero.title}
                      </h3>
                    </div>
                    <CuratedTag label="#SITKOL_26" tilt="-rotate-2" />
                  </div>
                )}
              </div>

              {/* 2. Sub-columns below Hero Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-[228px]">
                {/* Sub-column 1: Story Text Card + Action CTA Button */}
                <div className="flex flex-col justify-between gap-2.5 h-full">
                  <div
                    style={{ backgroundColor: current.theme.cardBg }}
                    className={`flex-1 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-center items-start border ${current.theme.cardBorder} shadow-lg transition-colors duration-500 gap-2.5`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <CuratedTag label="#Innovation" tilt="-rotate-2" size="small" />
                      <CuratedTag label="#CleanCore" tilt="rotate-1" size="small" />
                    </div>
                    <p className="text-xs text-stone-300/85 leading-relaxed line-clamp-3">
                      East India&apos;s premier SAP community gathering uniting enterprise innovators, developers, and architects.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const el = document.getElementById('tickets');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ backgroundColor: current.theme.accent }}
                    className="h-[42px] w-full text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer hover:brightness-110 active:scale-98 shrink-0"
                  >
                    {current.story.cta}
                  </button>
                </div>

                {/* Sub-column 2: Portrait Photo Card + Prev/Next Buttons */}
                <div className="flex flex-col justify-between gap-2.5 h-full">
                  <div
                    onClick={() => current.portraitPhoto.img && setLightboxImage(current.portraitPhoto.img)}
                    style={{ backgroundColor: current.theme.cardBg }}
                    className={`flex-1 rounded-2xl overflow-hidden relative group border ${current.theme.cardBorder} shadow-lg min-h-[160px] flex items-center justify-center p-4 ${current.portraitPhoto.img ? 'cursor-pointer' : ''}`}
                  >
                    {current.portraitPhoto.img ? (
                      <>
                        <img
                          src={current.portraitPhoto.img}
                          alt={current.portraitPhoto.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="text-center flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${current.theme.badgeBg} border ${current.theme.badgeBorder}`}>
                          <Camera className={`w-5 h-5 ${current.theme.badgeText}`} />
                        </div>
                        <span className="text-xs font-semibold text-white/90">{current.portraitPhoto.title || "Community"}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-[42px] flex items-center gap-2 shrink-0">
                    <button
                      onClick={prevSlide}
                      aria-label="Previous Slide"
                      style={{ backgroundColor: current.theme.prevBtnBg }}
                      className={`flex-1 h-full ${current.theme.prevBtnHover} text-white/80 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl border ${current.theme.prevBtnBorder} transition-all flex items-center justify-center cursor-pointer active:scale-98 shadow-sm`}
                    >
                      PREVIOUS
                    </button>
                    <button
                      onClick={nextSlide}
                      aria-label="Next Slide"
                      style={{ backgroundColor: current.theme.accent }}
                      className="flex-1 h-full text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer hover:brightness-110 active:scale-98"
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                MIDDLE BLOCK (3 COLS): EXPLORE (84px) + STREET (276px) + STAY (84px) = 480px
            ════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-3 h-full">
              {/* Explore Text Card -> Replaced with generic tag #Keynotes */}
              <div
                style={{ backgroundColor: current.theme.cardBg }}
                className={`h-[84px] rounded-2xl p-3.5 border ${current.theme.cardBorder} shadow-lg transition-colors duration-500 flex items-center justify-center shrink-0`}
              >
                <CuratedTag label="#Keynotes" tilt="rotate-2" />
              </div>

              {/* Lantern Street Portrait Photo Card */}
              <div
                onClick={() => current.streetPhoto.img && setLightboxImage(current.streetPhoto.img)}
                style={{ backgroundColor: current.theme.cardBg }}
                className={`flex-1 rounded-2xl overflow-hidden relative group border ${current.theme.cardBorder} shadow-lg min-h-[220px] flex items-center justify-center p-4 ${current.streetPhoto.img ? 'cursor-pointer' : ''}`}
              >
                {current.streetPhoto.img ? (
                  <>
                    <img
                      src={current.streetPhoto.img}
                      alt={current.streetPhoto.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="text-center flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${current.theme.badgeBg} border ${current.theme.badgeBorder}`}>
                      <ImageIcon className={`w-5 h-5 ${current.theme.badgeText}`} />
                    </div>
                    <span className="text-xs font-semibold text-white/90">{current.streetPhoto.title || "Keynotes & Labs"}</span>
                  </div>
                )}
              </div>

              {/* Stay Text Card -> Replaced with generic tag #Networking */}
              <div
                style={{ backgroundColor: current.theme.cardBg }}
                className={`h-[84px] rounded-2xl p-3.5 border ${current.theme.cardBorder} shadow-lg transition-colors duration-500 flex items-center justify-center shrink-0`}
              >
                <CuratedTag label="#Networking" tilt="-rotate-2" />
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                RIGHT BLOCK (3 COLS): BLOSSOM (246px) + CUISINE (222px) = 480px
            ════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-3 h-full">
              {/* Blossom Portrait Photo Card */}
              <div
                onClick={() => current.blossomPhoto.img && setLightboxImage(current.blossomPhoto.img)}
                style={{ backgroundColor: current.theme.cardBg }}
                className={`h-[246px] rounded-2xl overflow-hidden relative group border ${current.theme.cardBorder} shadow-xl shrink-0 flex items-center justify-center p-4 ${current.blossomPhoto.img ? 'cursor-pointer' : ''}`}
              >
                {current.blossomPhoto.img ? (
                  <>
                    <img
                      src={current.blossomPhoto.img}
                      alt={current.blossomPhoto.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="text-center flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${current.theme.badgeBg} border ${current.theme.badgeBorder}`}>
                      <Camera className={`w-5 h-5 ${current.theme.badgeText}`} />
                    </div>
                    <span className="text-xs font-semibold text-white/90">{current.blossomPhoto.title || "Highlights"}</span>
                  </div>
                )}
              </div>

              {/* Cuisine Card with Text & Ceramic Food Photo */}
              <div
                style={{ backgroundColor: current.theme.cardBg }}
                className={`h-[222px] rounded-2xl p-3.5 flex flex-col justify-between border ${current.theme.cardBorder} shadow-lg transition-colors duration-500 shrink-0`}
              >
                <div className="flex items-center justify-center pt-1 pb-1">
                  <CuratedTag label="#SAPCommunity" tilt="rotate-1" size="small" />
                </div>
                <div
                  onClick={() => current.cuisine.img && setLightboxImage(current.cuisine.img)}
                  className={`rounded-xl overflow-hidden relative group h-[135px] w-full border border-white/5 shadow-md shrink-0 flex items-center justify-center ${current.cuisine.img ? 'cursor-pointer' : 'bg-black/20'}`}
                >
                  {current.cuisine.img ? (
                    <>
                      <img
                        src={current.cuisine.img}
                        alt={current.cuisine.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                    </>
                  ) : (
                    <div className="text-center flex flex-col items-center gap-1.5 p-2">
                      <Coffee className={`w-4 h-4 ${current.theme.badgeText}`} />
                      <span className="text-[11px] font-medium text-stone-300">Hospitality & Chai</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* High-Resolution Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src={lightboxImage}
              alt="Expanded preview"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              aria-label="Close Preview"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const speakersData = [
  {
    id: 1,
    name: "Sunil Chopra",
    role: "Director – SAP ALM Global Rollout",
    company: "SAP",
    category: "SAP Cloud ALM Roadshow Keynote",
    track: "SAP Cloud ALM Roadshow",
    time: "14 NOV 2026 • 8:00 AM - 5:00 PM IST",
    topic: "SAP Cloud ALM Roadshow: AI-Powered Digital Transformation | Cloud ALM | GTM & Adoption",
    bio: "Director – SAP ALM Global Rollout at SAP. Spearheading AI-Powered Digital Transformation, SAP Cloud ALM strategy, Go-To-Market (GTM) execution, and enterprise adoption globally.",
    takeaways: [
      { title: "AI-Powered Digital Transformation", desc: "Unlocking operational excellence & proactive maintenance with SAP Cloud ALM." },
      { title: "Cloud ALM & Clean Core Alignment", desc: "Strategies for managing modern hybrid SAP software lifecycles." },
      { title: "GTM & Enterprise Adoption Frameworks", desc: "Scaling digital transformation methodologies across enterprise landscapes." },
    ],
    tags: ["SAP Cloud ALM", "AI Transformation", "Cloud ALM GTM", "Roadshow Keynote"],
    accentColor: "#0070F2",
    img: "/speakers/sunil-chopra-poster.jpg",
    poster: "/speakers/sunil-chopra-poster.jpg",
    linkedin: "https://www.linkedin.com/in/sunilchopra-apac-uae/",
  },
  {
    id: 2,
    name: "Srini Gottimukkula",
    role: "Vice President - Data & Analytics",
    company: "SAP Business Data Cloud",
    category: "Panelist",
    track: "Data & Analytics Panel",
    time: "14 NOV 2026 • 8:00 AM - 5:00 PM IST",
    topic: "Executive Panelist: Data & Analytics Strategy, SAP Business Data Cloud & Product Management",
    bio: "Vice President - Data & Analytics at SAP Business Data Cloud. Leading product management, strategic data mesh architectures, and analytics innovation across the SAP ecosystem.",
    takeaways: [
      { title: "SAP Business Data Cloud Strategy", desc: "Enterprise data context, business semantics, and cloud data integration." },
      { title: "Product Management & Innovation", desc: "Future roadmap of SAP Datasphere & SAP Analytics Cloud capabilities." },
      { title: "Interactive Executive Panel", desc: "Direct dialogue on enterprise analytics, governance, and AI data strategy." },
    ],
    tags: ["Data & Analytics", "SAP Business Data Cloud", "Product Strategy", "Panelist"],
    accentColor: "#F59E0B",
    img: "/speakers/srini-gottimukkula-poster.jpg",
    poster: "/speakers/srini-gottimukkula-poster.jpg",
    linkedin: "https://www.linkedin.com/in/srini-gottimukkula-85b15813/",
  },
  {
    id: 3,
    name: "Arghadip Kar",
    role: "SAP S/4HANA Solution Architect",
    company: "SAP SDN Hall of Fame",
    category: "Speaker",
    track: "S/4HANA Architecture",
    time: "14 NOV 2026 • 8:00 AM - 5:00 PM IST",
    topic: "20+ Years in SAP: S/4HANA Solution Architecture & Clean Core Innovation",
    bio: "SAP Developer Network (SDN) Hall of Fame member with 20+ years of SAP expertise. Senior S/4HANA Solution Architect driving enterprise ERP transformations and modern clean code engineering.",
    takeaways: [
      { title: "20+ Years SAP Engineering Insights", desc: "Battle-tested architectural wisdom from two decades of enterprise SAP implementations." },
      { title: "S/4HANA Clean Core Architecture", desc: "Designing upgrade-safe extensions and decoupling custom business logic." },
      { title: "SDN Hall of Fame Developer Mastery", desc: "Elevating community code standards, modern ABAP RESTful programming (RAP), and CDS." },
    ],
    tags: ["SAP S/4HANA", "Solution Architect", "SDN Hall of Fame", "20+ Yrs SAP"],
    accentColor: "#10B981",
    img: "/speakers/arghadip-kar-poster.jpg",
    poster: "/speakers/arghadip-kar-poster.jpg",
    linkedin: "https://www.linkedin.com/in/arghadip-kar-23590532/",
  },
];

const SpeakersSection = () => {
  const [scrollPos, setScrollPos] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState({});
  const [posterModalImage, setPosterModalImage] = useState(null);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const targetPosRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartPosRef = useRef(0);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 45) {
      nextSpeaker();
    } else if (distance < -45) {
      prevSpeaker();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Sync ref with state to prevent stale closures in rAF
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const N = speakersData.length;

  // Continuous animation loop (60fps)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      setScrollPos((prev) => {
        // If smooth transition target exists, lerp towards it
        if (targetPosRef.current !== null) {
          const diff = targetPosRef.current - prev;
          if (Math.abs(diff) < 0.004) {
            const finalVal = targetPosRef.current;
            targetPosRef.current = null;
            return finalVal;
          }
          return prev + diff * (1 - Math.exp(-8 * delta));
        }

        // If paused by hover or dragging, hold position
        if (isHoveredRef.current || isDraggingRef.current) {
          return prev;
        }

        // Smooth continuous loop speed: 1 full cycle every ~24 seconds
        const speed = 0.22;
        return prev + speed * delta;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Compute normalized active speaker index
  const rawActiveIndex = Math.round(scrollPos);
  const activeIndex = ((rawActiveIndex % N) + N) % N;
  const activeSpeaker = speakersData[activeIndex];

  // Navigate to specific speaker smoothly
  const goToSpeaker = (targetIdx) => {
    const currentNorm = ((Math.round(scrollPos) % N) + N) % N;
    let diff = targetIdx - currentNorm;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    targetPosRef.current = Math.round(scrollPos) + diff;
  };

  const nextSpeaker = () => {
    targetPosRef.current = Math.round(scrollPos) + 1;
  };

  const prevSpeaker = () => {
    targetPosRef.current = Math.round(scrollPos) - 1;
  };

  // Drag handling on the carousel column
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartPosRef.current = scrollPos;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) { }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dy = e.clientY - dragStartYRef.current;
    setScrollPos(dragStartPosRef.current - dy / 110);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) { }
  };

  const toggleBookmark = (id) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Pre-calculate curved arc track dots (conference blue & amber palette)
  const trackDots = Array.from({ length: 17 }, (_, i) => {
    const norm = (i - 8) / 8; // -1 to 1
    const y = norm * 240;
    const x = -(norm * norm) * 44;
    // Harmonious SAP theme tones
    const isCenter = Math.abs(i - 8) <= 1;
    const isMid = Math.abs(i - 8) <= 4;
    const color = isCenter ? '#F59E0B' : isMid ? '#0070F2' : '#64748B';
    const size = isCenter ? 7 : isMid ? 5 : 4;
    return { id: i, x, y, color, size };
  });

  return (
    <section
      id="speakers"
      className="py-16 sm:py-20 lg:py-24 bg-[#080d1a] text-white relative overflow-hidden select-none border-t border-slate-800 scroll-mt-16"
    >
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#0070F2]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 bg-amber-400/10 border border-amber-400/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              GLOBAL SAP THOUGHT LEADERS
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F2] via-blue-400 to-amber-400">Speakers</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl font-medium mt-2">
              Architects, SAP Champions, and engineering executives sharing actionable clean-core blueprints & AI strategies.
            </p>
          </div>

          {/* Speaker Navigation & Dynamic Track Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-full text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-500 shrink-0"
                style={{
                  backgroundColor: activeSpeaker.accentColor || '#F59E0B',
                  boxShadow: `0 0 10px ${activeSpeaker.accentColor || '#F59E0B'}`,
                }}
              />
              <span className="font-mono font-bold text-amber-400">
                {String(activeIndex + 1).padStart(2, '0')}
                <span className="text-slate-600 font-normal"> / </span>
                <span className="text-slate-400 font-normal">{String(N).padStart(2, '0')}</span>
              </span>
              <span className="w-px h-3.5 bg-slate-700/80" />
              <span className="text-slate-300 font-semibold truncate max-w-[130px] sm:max-w-[200px]">
                {activeSpeaker.track}
              </span>
              <span className="hidden sm:inline-block w-px h-3.5 bg-slate-700/80" />
              <div className="hidden sm:flex items-center gap-1.5 pl-0.5">
                {speakersData.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goToSpeaker(i)}
                    title={`View ${s.name} (${s.track})`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === activeIndex
                        ? 'w-4 bg-gradient-to-r from-[#0070F2] to-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                        : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full p-1">
              <button
                onClick={prevSpeaker}
                aria-label="Previous speaker"
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSpeaker}
                aria-label="Next speaker"
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN INTERACTIVE SECTION (DESKTOP: 2 COLUMNS) ── */}
        <div
          className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[580px]"
        >
          {/* ════════════════════════════════════════════════════════════
              LEFT COLUMN: CURVED INFINITE WHEEL OF SPEAKER CAPSULES
          ════════════════════════════════════════════════════════════ */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="lg:col-span-6 relative h-[520px] sm:h-[580px] w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
          >
            {/* Ambient Background Arc Glow */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Curved Subtle Track Dots */}
            <div className="absolute right-10 sm:right-14 top-1/2 -translate-y-1/2 h-[480px] w-24 pointer-events-none flex items-center justify-center">
              {trackDots.map((dot) => (
                <div
                  key={dot.id}
                  style={{
                    transform: `translate(${dot.x}px, ${dot.y}px)`,
                    backgroundColor: dot.color,
                    boxShadow: `0 0 8px ${dot.color}`,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                  }}
                  className="absolute rounded-full transition-transform duration-200 opacity-75"
                />
              ))}
            </div>

            {/* 2. Central Glowing Arrow Pointer (Apex of the Curve) */}
            <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40">
              <button
                onClick={nextSpeaker}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title="Next Speaker"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#0070F2] via-blue-600 to-amber-500 text-white shadow-[0_0_28px_rgba(0,112,242,0.6),0_0_16px_rgba(245,158,11,0.3)] border-2 border-white/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer group"
              >
                <ChevronRight className="w-7 h-7 stroke-[3] text-white transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* 3. Curved Rotating Speaker Profile Capsules */}
            <div className="relative w-full h-full flex items-center justify-center">
              {speakersData.map((speaker, idx) => {
                // Compute angular delta distance from current scroll position
                let diff = ((idx - (scrollPos % N)) % N + N) % N;
                if (diff > N / 2) diff -= N;

                // Render only visible cards near the viewport
                if (Math.abs(diff) > 2.6) return null;

                // Calculate curved arc trajectory (convex towards the right arrow pointer)
                const translateY = diff * 116; // vertical spacing
                const translateX = -(diff * diff) * 24; // arc curve bending to left above/below center
                const rotate = diff * 6.5; // tangent angle
                const scale = 1.05 - Math.abs(diff) * 0.12;
                const opacity = Math.max(0.15, 1 - Math.abs(diff) * 0.32);
                const zIndex = Math.round(30 - Math.abs(diff) * 10);
                const isActive = Math.abs(diff) < 0.5;

                return (
                  <div
                    key={speaker.id}
                    onClick={() => goToSpeaker(idx)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                      transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                    }}
                    className={`absolute left-3 sm:left-8 w-[280px] sm:w-[330px] h-[82px] sm:h-[88px] rounded-2xl p-3 sm:p-3.5 transition-all duration-150 cursor-pointer flex items-center gap-3.5 backdrop-blur-xl border ${isActive
                        ? 'bg-gradient-to-r from-slate-900/95 via-blue-950/90 to-slate-900/95 border-[#0070F2] ring-2 ring-amber-400/40 shadow-[0_15px_35px_-5px_rgba(0,112,242,0.45),0_0_20px_rgba(245,158,11,0.25)]'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/80 hover:border-slate-700 shadow-md'
                      }`}
                  >
                    {/* Speaker Circular Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={speaker.img}
                        alt={speaker.name}
                        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 transition-all ${isActive
                            ? 'border-amber-400 ring-2 ring-blue-500/50 shadow-md'
                            : 'border-slate-700'
                          }`}
                      />
                      {isActive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm animate-pulse" />
                      )}
                    </div>

                    {/* Speaker Basic Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isActive
                            ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-400'
                          }`}>
                          {speaker.track.split(' ')[0]}
                        </span>
                      </div>
                      <div className={`text-sm sm:text-base font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'
                        }`}>
                        {speaker.name}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-400 truncate">
                        {speaker.role} • <span className="text-slate-300 font-medium">{speaker.company}</span>
                      </div>
                    </div>

                    {/* Active Chevron Indicator */}
                    {isActive && (
                      <div className="shrink-0 w-6 h-6 rounded-full bg-[#0070F2]/20 border border-[#0070F2]/40 flex items-center justify-center">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              RIGHT COLUMN: ACTIVE SPEAKER DETAILS SHOWCASE
          ════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="bg-slate-900/95 rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              {/* Subtle dynamic background glow */}
              <div
                style={{ backgroundColor: activeSpeaker.accentColor }}
                className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[140px] opacity-20 pointer-events-none transition-colors duration-700"
              />

              {/* Speaker Profile Header */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800/90">
                <div className="relative shrink-0">
                  <img
                    src={activeSpeaker.img}
                    alt={activeSpeaker.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400/60 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#0070F2] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                    SPEAKER
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {activeSpeaker.track}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                      <Clock3 className="w-3.5 h-3.5 text-blue-400" />
                      {activeSpeaker.time}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                    {activeSpeaker.name}
                  </h3>
                  <p className="text-sm font-semibold text-blue-400 mt-1">
                    {activeSpeaker.role} <span className="text-slate-400 font-normal">• {activeSpeaker.company}</span>
                  </p>
                </div>
              </div>

              {/* Session Overview & Abstract */}
              <div className="relative z-10 mt-6">
                <div className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-amber-400" />
                  SESSION OVERVIEW
                </div>

                <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-3">
                  {activeSpeaker.topic}
                </h4>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal mb-5">
                  {activeSpeaker.bio}
                </p>

                {/* Key Takeaways & Workshop Deliverables */}
                <div className="space-y-2.5 mb-6">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    KEY TAKEAWAYS & WORKSHOP DELIVERABLES:
                  </div>
                  {activeSpeaker.takeaways.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Technology Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {activeSpeaker.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono font-bold px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Action Controls */}
                <div className="pt-4 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleBookmark(activeSpeaker.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${bookmarked[activeSpeaker.id]
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                        }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{bookmarked[activeSpeaker.id] ? 'Saved to Agenda ★' : 'Save Session'}</span>
                    </button>

                    <button
                      onClick={() => setPosterModalImage(activeSpeaker.poster)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#0070F2]/20 text-blue-300 hover:text-white hover:bg-[#0070F2]/40 border border-[#0070F2]/50 transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>View Official Poster</span>
                    </button>

                    <a
                      href={activeSpeaker.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white font-bold text-xs inline-flex items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                      title="Speaker Profile"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <span className="hidden sm:inline">Speaker Profile</span>
                    </a>
                  </div>

                  <a
                    href="#tickets"
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            MOBILE / TABLET INTERACTIVE VIEW (< lg screens)
        ════════════════════════════════════════════════════════════ */}
        <div className="block lg:hidden">
          {/* 1. Horizontal Avatar Selector Rail */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 pt-1 -mx-2 px-2 no-scrollbar touch-pan-x">
            {speakersData.map((s, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => goToSpeaker(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 transition-all border ${isActive
                      ? 'bg-slate-800/90 border-[#0070F2] ring-2 ring-amber-400/50 shadow-md text-white'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <img
                    src={s.img}
                    alt={s.name}
                    className={`w-6 h-6 rounded-full object-cover border ${isActive ? 'border-amber-400' : 'border-slate-700'
                      }`}
                  />
                  <span className="text-xs font-bold whitespace-nowrap">{s.name.split(' ')[0]}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* 2. Interactive Touch-Swipeable Speaker Card */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="touch-pan-y bg-slate-900/95 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-800/90 shadow-2xl relative overflow-hidden backdrop-blur-xl"
          >
            {/* Dynamic ambient background glow */}
            <div
              style={{ backgroundColor: activeSpeaker.accentColor }}
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-25 pointer-events-none transition-colors duration-700"
            />

            {/* Profile Header */}
            <div className="relative z-10 flex items-start gap-4 pb-5 border-b border-slate-800/90">
              <div className="relative shrink-0">
                <img
                  src={activeSpeaker.img}
                  alt={activeSpeaker.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/60 shadow-xl"
                />
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#0070F2] text-white text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md">
                  SPEAKER
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {activeSpeaker.track}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                    <Clock3 className="w-3 h-3 text-blue-400" />
                    {activeSpeaker.time.split('•')[0].trim()}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight truncate">
                  {activeSpeaker.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-blue-400 mt-0.5 truncate">
                  {activeSpeaker.role}
                </p>
                <p className="text-xs text-slate-400 font-medium truncate">
                  {activeSpeaker.company}
                </p>
              </div>
            </div>

            {/* Session Details */}
            <div className="relative z-10 mt-5">
              <div className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
                SESSION OVERVIEW
              </div>

              <h4 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug mb-2.5">
                {activeSpeaker.topic}
              </h4>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal mb-4">
                {activeSpeaker.bio}
              </p>

              {/* Key Takeaways */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  KEY TAKEAWAYS:
                </div>
                {activeSpeaker.takeaways.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800/80"
                  >
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Technology Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {activeSpeaker.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Controls & Navigation */}
              <div className="pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(activeSpeaker.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${bookmarked[activeSpeaker.id]
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{bookmarked[activeSpeaker.id] ? 'Saved ★' : 'Save'}</span>
                  </button>

                  <button
                    onClick={() => setPosterModalImage(activeSpeaker.poster)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#0070F2]/20 text-blue-300 border border-[#0070F2]/50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Poster</span>
                  </button>

                  <a
                    href={activeSpeaker.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white font-bold text-xs inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Profile</span>
                  </a>
                </div>

                <a
                  href="#tickets"
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <span>Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Swipe guidance & quick dots */}
              <div className="text-center text-[10px] font-mono text-slate-500 mt-4 flex items-center justify-between">
                <span>⟵ Swipe to browse speakers ⟶</span>
                <div className="flex items-center gap-1.5">
                  {speakersData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSpeaker(i)}
                      className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-slate-700'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Poster Lightbox Modal */}
      {posterModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPosterModalImage(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] bg-slate-900 border border-amber-400/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between p-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Sparkles className="w-4 h-4" /> OFFICIAL SAP INSIDE TRACK POSTER
              </div>
              <button
                onClick={() => setPosterModalImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full overflow-auto flex items-center justify-center p-2">
              <img
                src={posterModalImage}
                alt="Official Speaker Poster"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl border border-slate-800 shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const VenueSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Sister Nivedita University",
      tag: "Main Academic Campus",
      desc: "Contemporary green campus located in New Town Action Area I, Kolkata's major tech hub.",
      badge: "SNU Campus",
      icon: "🏛️"
    },
    {
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Main Keynote Auditorium",
      tag: "500+ Seater Amphitheatre",
      desc: "State-of-the-art keynote hall with dual 4K laser projection & acoustic sound engineering.",
      badge: "Keynote Stage",
      icon: "🎤"
    },
    {
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Networking & Exhibition Atrium",
      tag: "Community Hub & Swag Desk",
      desc: "Sky-lit central pavilion hosting sponsor kiosks, discussion pods, and Kolkata high tea breaks.",
      badge: "Community Atrium",
      icon: "☕"
    },
    {
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Hands-On BTP Tech Labs",
      tag: "Live Developer Pods",
      desc: "Air-conditioned computer labs pre-configured for live coding, GenAI, and SAP Build tracks.",
      badge: "Tech Labs",
      icon: "💻"
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('Sister Nivedita University, DG Block(Newtown), Action Area I, 1/2, Newtown, Chakpachuria, West Bengal 700156');
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="venue" className="py-24 bg-slate-900 text-white relative overflow-hidden scroll-mt-16">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">The <span className="text-yellow-400">Venue</span></h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-medium">Hosted at the prestigious Sister Nivedita University, offering world-class facilities for our community.</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Auto-Scroll Carousel */}
          <Reveal direction="left" className="w-full flex">
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl relative group w-full h-[460px] sm:h-[500px] lg:h-full min-h-[460px] flex flex-col justify-between select-none"
            >
              {/* Carousel Images with Smooth Cross-Fade */}
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                    }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-900/20" />
                </div>
              ))}

              {/* Top Overlays */}
              <div className="relative z-20 p-5 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-white/10 text-xs font-bold text-white shadow-md backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Venue Partner • SNU</span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                  22.5726° N, 88.4735° E
                </div>
              </div>

              {/* Prev / Next Navigation Chevrons */}
              <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  aria-label="Previous slide"
                  className="w-10 h-10 rounded-full bg-slate-950/80 hover:bg-yellow-400 hover:text-slate-950 text-white border border-white/10 flex items-center justify-center transition-all shadow-lg pointer-events-auto cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  aria-label="Next slide"
                  className="w-10 h-10 rounded-full bg-slate-950/80 hover:bg-yellow-400 hover:text-slate-950 text-white border border-white/10 flex items-center justify-center transition-all shadow-lg pointer-events-auto cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Caption & Carousel Dots */}
              <div className="relative z-20 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <div className="bg-yellow-400 text-slate-900 font-black px-3.5 py-1 rounded-lg inline-flex items-center gap-1.5 mb-2.5 shadow-lg text-xs uppercase tracking-wider">
                  <span>{slides[currentSlide].icon}</span>
                  <span>{slides[currentSlide].badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 mb-4 font-medium">
                  {slides[currentSlide].desc}
                </p>

                {/* Carousel Indicator Dots with Auto-Scroll Progress */}
                <div className="flex items-center gap-2">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentSlide(dotIdx)}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlide === dotIdx
                          ? 'w-8 bg-yellow-400'
                          : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-auto font-mono">
                    {currentSlide + 1} / {slides.length}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Google Maps Embed + Neo-Brutalist Pop Component */}
          <Reveal direction="right" delay="delay-100" className="w-full flex flex-col justify-between space-y-4">
            {/* Top Row Sticker Badge in the exact attached style */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-full border-2 border-slate-950 shadow-[3px_3px_0px_#020617] -rotate-2 hover:rotate-0 transition-transform cursor-default text-sm tracking-tight select-none">
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>#SITKOL_26</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-800 text-yellow-400 font-extrabold px-3 py-1 rounded-full border border-slate-700 text-xs shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                <span>New Town Action Area I</span>
              </div>
            </div>

            {/* Embedded Google Maps Container */}
            <div className="w-full h-[250px] sm:h-[270px] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl relative bg-slate-950">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.754792683073!2d88.4735511!3d22.5882676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02753239a58409%3A0x2a3e0f065330364f!2sSister%20Nivedita%20University!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sister Nivedita University Location Map"
                className="w-full h-full grayscale-[15%] contrast-[105%]"
              />
            </div>

            {/* Neo-Brutalist Pop Component (Matching Attached Image UI Style) */}
            <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl p-5 border-2 border-slate-950 shadow-[5px_5px_0px_#020617] text-slate-950 relative overflow-hidden select-none">
              {/* Card Top Pill & Geotag */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-white text-slate-950 font-black px-3 py-1 rounded-full border-2 border-slate-950 shadow-[2px_2px_0px_#020617] text-xs -rotate-2">
                  <Landmark className="w-3.5 h-3.5 text-slate-950" /> Official Campus
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-900 bg-yellow-300/90 px-2.5 py-0.5 rounded-md border border-slate-950 shadow-[1px_1px_0px_#020617]">
                  Gate 1 • Main Entry
                </span>
              </div>

              {/* Title & Address */}
              <h4 className="text-xl font-black text-slate-950 tracking-tight leading-snug mb-1">
                Sister Nivedita University (SNU)
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed mb-4">
                DG Block(Newtown), Action Area I, 1/2, Newtown, Chakpachuria, West Bengal 700156
              </p>

              {/* Commute Chips in Neo-brutalist pop style */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white/95 border-2 border-slate-950 shadow-[2px_2px_0px_#020617] rounded-xl p-2 text-center">
                  <div className="text-base">✈️</div>
                  <div className="text-[11px] font-black text-slate-950">15 Mins</div>
                  <div className="text-[9px] font-bold text-slate-700">From Airport</div>
                </div>
                <div className="bg-white/95 border-2 border-slate-950 shadow-[2px_2px_0px_#020617] rounded-xl p-2 text-center">
                  <div className="text-base">🚇</div>
                  <div className="text-[11px] font-black text-slate-950">Sector V</div>
                  <div className="text-[9px] font-bold text-slate-700">Green Line Metro</div>
                </div>
                <div className="bg-white/95 border-2 border-slate-950 shadow-[2px_2px_0px_#020617] rounded-xl p-2 text-center">
                  <div className="text-base">🚗</div>
                  <div className="text-[11px] font-black text-slate-950">Free Parking</div>
                  <div className="text-[9px] font-bold text-slate-700">200+ Slots</div>
                </div>
              </div>

              {/* Action Buttons in matching 3D pop style */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sister+Nivedita+University+Kolkata"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-slate-950 hover:bg-slate-900 text-white font-black py-2.5 px-4 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#ffffff] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <Map className="w-4 h-4 text-yellow-400" />
                  <span>Open Full Google Map</span>
                  <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
                </a>

                <button
                  onClick={handleCopy}
                  className="bg-white hover:bg-slate-50 text-slate-950 font-black py-2.5 px-4 rounded-xl border-2 border-slate-950 shadow-[3px_3px_0px_#020617] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#020617] transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const Barcode = ({ className = "h-8 w-full text-slate-800" }) => (
  <svg viewBox="0 0 200 38" className={className} fill="currentColor">
    <rect x="0" y="0" width="3" height="38" />
    <rect x="5" y="0" width="1.5" height="38" />
    <rect x="8" y="0" width="4" height="38" />
    <rect x="14" y="0" width="2" height="38" />
    <rect x="18" y="0" width="5" height="38" />
    <rect x="25" y="0" width="2" height="38" />
    <rect x="29" y="0" width="1.5" height="38" />
    <rect x="33" y="0" width="3" height="38" />
    <rect x="38" y="0" width="5" height="38" />
    <rect x="45" y="0" width="2" height="38" />
    <rect x="49" y="0" width="4" height="38" />
    <rect x="55" y="0" width="1.5" height="38" />
    <rect x="58" y="0" width="3" height="38" />
    <rect x="63" y="0" width="5" height="38" />
    <rect x="70" y="0" width="2" height="38" />
    <rect x="74" y="0" width="4" height="38" />
    <rect x="80" y="0" width="1.5" height="38" />
    <rect x="83" y="0" width="5" height="38" />
    <rect x="90" y="0" width="2" height="38" />
    <rect x="94" y="0" width="3" height="38" />
    <rect x="99" y="0" width="5" height="38" />
    <rect x="106" y="0" width="1.5" height="38" />
    <rect x="109" y="0" width="4" height="38" />
    <rect x="115" y="0" width="2" height="38" />
    <rect x="119" y="0" width="5" height="38" />
    <rect x="126" y="0" width="3" height="38" />
    <rect x="131" y="0" width="1.5" height="38" />
    <rect x="134" y="0" width="5" height="38" />
    <rect x="141" y="0" width="2" height="38" />
    <rect x="145" y="0" width="4" height="38" />
    <rect x="151" y="0" width="1.5" height="38" />
    <rect x="154" y="0" width="3" height="38" />
    <rect x="159" y="0" width="5" height="38" />
    <rect x="166" y="0" width="2" height="38" />
    <rect x="170" y="0" width="4" height="38" />
    <rect x="176" y="0" width="1.5" height="38" />
    <rect x="179" y="0" width="3" height="38" />
    <rect x="184" y="0" width="5" height="38" />
    <rect x="191" y="0" width="2" height="38" />
    <rect x="195" y="0" width="3" height="38" />
  </svg>
);

const TicketsSection = () => {
  return (
    <section id="tickets" className="relative py-12 md:py-16 bg-[#FAF8F5] border-t border-stone-200/80 overflow-hidden scroll-mt-16">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-100/40 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-yellow-100/40 rounded-full blur-[90px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Compact Static Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-2 bg-yellow-100/90 border border-yellow-300 text-yellow-900 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-yellow-600" />
            Zero Registration Fee
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Spot</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium mt-1">
            Join 500+ professionals for Eastern India's largest community-driven SAP gathering.
          </p>
        </div>

        {/* PixelSwap Ticket Card */}
        <div className="max-w-4xl mx-auto">
          <PixelSwap
            trigger="hover"
            aspectRatio="auto"
            pixelSize={50}
            maxPixels={36}
            gap={1}
            pixelRadius={6}
            pixelSpin={8}
            pixelScale={0.35}
            duration={650}
            pixelDuration={240}
            pattern="spiral"
            fade={true}
            className="w-full cursor-pointer rounded-[2rem]"
            firstContent={
              /* ── REGULAR ADMISSION TICKET (FRONT) ── */
              <div className="w-full bg-white rounded-[2rem] border-2 border-stone-200 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] overflow-hidden flex flex-col md:flex-row relative select-none">
                {/* Main Ticket Body */}
                <div className="flex-1 p-6 sm:p-7 md:p-8 flex flex-col justify-between">
                  {/* Top Ticket Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-400 text-slate-950 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                          <Ticket className="w-3 h-3" /> ADMIT ONE
                        </span>
                        <span className="text-xs font-black tracking-widest text-slate-400 uppercase hidden sm:inline">
                          SIT KOLKATA 2026
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        #SITKOL-0829
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Regular Admission Pass
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Official all-access pass for keynotes, breakout tracks, and community zones.
                      </p>
                    </div>
                  </div>

                  {/* Metadata Specs Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 py-3 border-y border-stone-100">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">DATE</div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">29 AUG 2026</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TIME</div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">09:00 AM IST</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">VENUE</div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">SNU Campus, Kol</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">FEE</div>
                      <div className="text-xs sm:text-sm font-black text-[#0070F2] mt-0.5">FREE / RSVP</div>
                    </div>
                  </div>

                  {/* Bottom Perks & CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 50+ Talks
                      </span>
                      <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Lunch & High Tea
                      </span>
                      <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Official Swag
                      </span>
                    </div>
                    <a
                      href="#tickets"
                      className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-[#0070F2] text-white px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-md hover:scale-105 shrink-0"
                    >
                      <span>Claim Free Pass</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Perforated Divider with Circular Ticket Cutouts */}
                <div className="relative flex md:flex-col items-center justify-center">
                  <div className="w-full md:w-0 md:h-full border-t-2 md:border-t-0 md:border-r-2 border-dashed border-stone-300" />

                  {/* Desktop notches (top & bottom) */}
                  <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-b-2 border-stone-300 z-10" />
                  <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-t-2 border-stone-300 z-10" />

                  {/* Mobile notches (left & right) */}
                  <div className="block md:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-r-2 border-stone-300 z-10" />
                  <div className="block md:hidden absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-l-2 border-stone-300 z-10" />
                </div>

                {/* Tear-Off Ticket Stub */}
                <div className="md:w-64 sm:md:w-72 shrink-0 p-6 flex flex-col justify-between bg-stone-50/80 rounded-b-[2rem] md:rounded-b-none md:rounded-r-[2rem]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">BOARDING STUB</span>
                      <span className="px-2 py-0.5 rounded bg-yellow-400/90 text-slate-950 font-black text-[9px] uppercase tracking-wider">ADMIT 1</span>
                    </div>

                    <div className="flex items-center justify-around bg-white p-2.5 rounded-xl border border-stone-200/90 shadow-sm text-center">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">GATE</div>
                        <div className="text-xs font-black text-slate-900">01</div>
                      </div>
                      <div className="h-6 w-px bg-stone-200" />
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">ZONE</div>
                        <div className="text-xs font-black text-slate-900">TECH</div>
                      </div>
                      <div className="h-6 w-px bg-stone-200" />
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">SEAT</div>
                        <div className="text-xs font-black text-slate-900">OPEN</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Barcode className="h-9 w-full text-slate-900" />
                      <p className="text-[9px] font-mono font-bold text-center tracking-[0.25em] text-slate-400 mt-1">
                        *SIT-KOL-2026-0829*
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 shadow-xs">
                      <Sparkles className="w-3 h-3 text-yellow-500" /> Hover to preview Swag Pass
                    </span>
                  </div>
                </div>
              </div>
            }
            secondContent={
              /* ── SWAG KIT & PERKS PASS (BACK / HOVER) ── */
              <div className="w-full bg-slate-950 text-white rounded-[2rem] border-2 border-slate-800 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] overflow-hidden flex flex-col md:flex-row relative select-none">
                {/* Main Ticket Body */}
                <div className="flex-1 p-6 sm:p-7 md:p-8 flex flex-col justify-between">
                  {/* Top Ticket Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-400 text-slate-950 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3 h-3 text-slate-950" /> SWAG UNLOCKED
                        </span>
                        <span className="text-xs font-black tracking-widest text-slate-400 uppercase hidden sm:inline">
                          OFFICIAL MERCH PASS
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-emerald-400">
                        STATUS: INCLUDED
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Attendee Welcome Kit & Perks
                      </h3>
                      <p className="text-xs sm:text-sm text-yellow-300 font-bold uppercase tracking-wider mt-0.5">
                        Collect at Event Registration Desk · SNU Campus
                      </p>
                    </div>
                  </div>

                  {/* Swag Perks Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 py-3 border-y border-slate-800">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                      <span className="text-xl">👕</span>
                      <div>
                        <div className="text-xs font-black text-white leading-tight">Event T-Shirt</div>
                        <div className="text-[10px] text-slate-400">Exclusive 2026</div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                      <span className="text-xl">🎒</span>
                      <div>
                        <div className="text-xs font-black text-white leading-tight">Canvas Tote</div>
                        <div className="text-[10px] text-slate-400">Eco Material</div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                      <span className="text-xl">🏷️</span>
                      <div>
                        <div className="text-xs font-black text-white leading-tight">Sticker Pack</div>
                        <div className="text-[10px] text-slate-400">Kolkata & SAP</div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
                      <span className="text-xl">☕</span>
                      <div>
                        <div className="text-xs font-black text-white leading-tight">High Tea Pass</div>
                        <div className="text-[10px] text-slate-400">Chai & Snacks</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info & CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Complimentary for every registered attendee</span>
                    </div>
                    <a
                      href="#tickets"
                      className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-md hover:scale-105 shrink-0"
                    >
                      <span>Claim Spot & Kit</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Perforated Divider with Circular Ticket Cutouts */}
                <div className="relative flex md:flex-col items-center justify-center">
                  <div className="w-full md:w-0 md:h-full border-t-2 md:border-t-0 md:border-r-2 border-dashed border-slate-800" />

                  {/* Desktop notches (top & bottom) */}
                  <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-b-2 border-stone-300 z-10" />
                  <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-t-2 border-stone-300 z-10" />

                  {/* Mobile notches (left & right) */}
                  <div className="block md:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-r-2 border-stone-300 z-10" />
                  <div className="block md:hidden absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF8F5] border-l-2 border-stone-300 z-10" />
                </div>

                {/* Tear-Off Ticket Stub */}
                <div className="md:w-64 sm:md:w-72 shrink-0 p-6 flex flex-col justify-between bg-slate-900/90 rounded-b-[2rem] md:rounded-b-none md:rounded-r-[2rem]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">MERCH VOUCHER</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-400/90 text-slate-950 font-black text-[9px] uppercase tracking-wider">FULL KIT</span>
                    </div>

                    <div className="flex items-center justify-around bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 shadow-sm text-center">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">DESK</div>
                        <div className="text-xs font-black text-white">REG-01</div>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">BADGE</div>
                        <div className="text-xs font-black text-emerald-400">INCL</div>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <div className="text-[9px] font-bold text-slate-400">TEA</div>
                        <div className="text-xs font-black text-yellow-400">INCL</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Barcode className="h-9 w-full text-slate-300" />
                      <p className="text-[9px] font-mono font-bold text-center tracking-[0.25em] text-emerald-400 mt-1">
                        *SWAG-KOL-2026-CLAIM*
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                      Move cursor away to view pass
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* Bottom Helper Note */}
        <div className="mt-4 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span>Hover over the ticket to flip between Admission Pass and Swag Kit</span>
        </div>
      </div>
    </section>
  );
};

const SponsorsSection = () => {
  const partnersList = [
    {
      role: "Venue Partner",
      name: "Sister Nivedita University & Techno India Group",
      logo: "/partners/venue-partner-snu.png",
      tag: "Academic & Campus Host",
      description: "Host campus providing world-class auditorium, tech labs, and academic infrastructure for SIT Kolkata 2026."
    },
    {
      role: "SAP Partner",
      name: "SAP PRESS",
      logo: "/partners/sap-press-logo.png",
      tag: "Official SAP Publishing Partner",
      description: "Leading technical publisher providing authoritative SAP books, e-books, and developer reference guides."
    },
    {
      role: "Media Partner",
      name: "Wiki Kolkata",
      logo: "/partners/media-partner-wikikolkata.png",
      tag: "Official Digital Media Partner",
      description: "Kolkata's premier digital media network capturing and amplifying tech stories across the region."
    },
    {
      role: "Official Sponsor",
      name: "We",
      logo: "/partners/sponsor-we.png",
      tag: "Ecosystem & Community Sponsor",
      description: "Supporting community tech initiatives and empowering developer engagement."
    }
  ];

  return (
    <section id="sponsors" className="py-24 bg-[#080d1a] text-white relative border-t border-slate-800 scroll-mt-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <Reveal direction="up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3 bg-amber-400/10 border border-amber-400/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            EVENT SUPPORTERS & ECOSYSTEM
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F2] via-blue-400 to-amber-400">Partners & Sponsors</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto mt-3 text-base sm:text-lg">
            Heartfelt gratitude to the visionary partners and sponsors making SAP Inside Track Kolkata 2026 possible.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {partnersList.map((partner, idx) => (
            <Reveal key={idx} direction="up" delay={`delay-${idx * 100}`} className="h-full">
              <div className="h-full bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-amber-400/60 transition-all duration-300 shadow-xl hover:-translate-y-1.5 flex flex-col justify-between group backdrop-blur-md">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mb-4">
                    {partner.role}
                  </div>

                  {/* Clean Logo Box with light container for crisp vector contrast */}
                  <div className="w-full h-36 bg-white rounded-2xl p-4 flex items-center justify-center border border-slate-700/50 shadow-inner mb-5 group-hover:scale-[1.02] transition-transform">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-24 max-w-full object-contain"
                    />
                  </div>

                  <h3 className="text-lg font-black text-white leading-snug mb-1 group-hover:text-amber-300 transition-colors">
                    {partner.name}
                  </h3>
                  <div className="text-xs font-mono font-semibold text-blue-400 mb-2">
                    {partner.tag}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {partner.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const CommunityPartnersSection = () => {
  const partners = [
    "Apex Circle", "GDG On Campus", "Digital Dominators",
    "EDC", "HITian Inside", "Imperio Coders", "LNC Community",
    "Postman Kolkata", "Samarth", "InnovateX", "Wiki Kolkata",
    "AWS Usergroup", "Databricks Usergroup", "Kolkata WordPress"
  ];

  return (
    <section className="py-16 bg-white overflow-hidden relative border-t border-slate-200">
      <div className="container mx-auto px-6 relative z-10 mb-10 text-center">
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
          Our <span className="text-blue-600">Community Partners</span>
        </h3>
        <div className="w-16 h-1 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="relative flex flex-col gap-6 w-full max-w-[100vw] overflow-hidden">
        {/* Marquee Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center">
          {[...partners, ...partners, ...partners].map((partner, idx) => (
            <div key={idx} className="mx-8 flex items-center group cursor-pointer">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-widest text-slate-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-yellow-500 transition-all duration-300">
                {partner}
              </span>
              <span className="mx-8 text-yellow-400 font-black text-2xl opacity-50">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqData = [
  {
    id: 1,
    number: "01",
    question: "What is SAP Inside Track Kolkata?",
    answer: "SAP Inside Track Kolkata is a community-driven event where SAP professionals, experts, and enthusiasts come together to share knowledge, insights, and real-world experiences around SAP technologies.",
    tag: "Event Overview",
    perk: "Community-Driven · Knowledge Sharing · Networking"
  },
  {
    id: 2,
    number: "02",
    question: "Who should attend this event?",
    answer: "This event is ideal for students, developers, SAP professionals, and anyone interested in learning about SAP and enterprise technologies.",
    tag: "Eligibility",
    perk: "Students · Developers · SAP Professionals"
  },
  {
    id: 3,
    number: "03",
    question: "How can I register for the event?",
    answer: "You can register through the official event website using the registration link provided on the homepage. Follow our social media channels to stay updated on upcoming events and announcements.",
    tag: "Registration",
    perk: "Online Pass · Instant Confirmation · Event Updates"
  },
  {
    id: 4,
    number: "04",
    question: "Is the event free or paid?",
    answer: "SAP Inside Track events usually have a minimal registration fee. Please check the registration page for exact details.",
    tag: "Ticket Details",
    perk: "Minimal Registration Fee · Complete Access"
  },
  {
    id: 5,
    number: "05",
    question: "What is the date and venue of the event?",
    answer: "The event date, time, and venue details are mentioned on the website and will also be shared in your registration confirmation email. For this event, it will be held at Sister Nivedita University.",
    tag: "Date & Venue",
    perk: "Sister Nivedita University · 14 Nov 2026"
  },
  {
    id: 6,
    number: "06",
    question: "What kind of sessions or topics will be covered?",
    answer: "The event will feature expert talks, real-world use cases, technical sessions, and discussions on various SAP technologies and industry trends.",
    tag: "Tracks & Agenda",
    perk: "Expert Talks · Real-World Use Cases · Tech Sessions"
  },
  {
    id: 7,
    number: "07",
    question: "Who are the speakers at the event?",
    answer: "Speakers are experienced SAP professionals, industry experts, and community leaders who bring practical insights and real-world experience.",
    tag: "Speakers & Leaders",
    perk: "SAP Directors · VP Analytics · SDN Hall of Famers"
  },
  {
    id: 8,
    number: "08",
    question: "Do I need prior SAP knowledge to attend?",
    answer: "No, prior SAP knowledge is not mandatory. The event is designed for both beginners and experienced attendees.",
    tag: "Prerequisites",
    perk: "Open to All Skill Levels · Beginner Friendly"
  },
  {
    id: 9,
    number: "09",
    question: "How can I contact the organizers for queries?",
    answer: "You can reach out to the organizers through the contact section on the website or via the official email info@sitkolkata.org and social media channels.",
    tag: "Contact & Support",
    perk: "info@sitkolkata.org · Social Channels · Direct Support"
  }
];

const ScratchCardCapsule = ({ item, globalResetTrigger }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [percent, setPercent] = useState(0);
  const lastPos = useRef(null);

  // Helper to wrap text cleanly on canvas
  const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        linesDrawn++;
        if (linesDrawn === maxLines) {
          let truncated = line.trim();
          while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
          }
          ctx.fillText(truncated + '...', x, currentY);
          return;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  };

  const paintCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    // 1. Metallic Silver/Platinum Scratch Foil Surface
    const foilGrad = ctx.createLinearGradient(0, 0, w, h);
    foilGrad.addColorStop(0, '#D1D8E2');
    foilGrad.addColorStop(0.25, '#E2E8F0');
    foilGrad.addColorStop(0.5, '#F1F5F9');
    foilGrad.addColorStop(0.6, '#CBD5E1');
    foilGrad.addColorStop(0.85, '#E2E8F0');
    foilGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = foilGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Micro-texture: lottery security cross-hatching
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;
    for (let x = -h; x < w + h; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    for (let x = w + h; x > -h; x -= 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - h, h);
      ctx.stroke();
    }

    // Outer refined border
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // 3. Question Number Pill (top-left) - Compact
    const pillX = 18;
    const pillY = 24;
    const pillR = 12;
    ctx.beginPath();
    ctx.arc(pillX + pillR, pillY, pillR, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.number, pillX + pillR, pillY);

    // Category Tag Pill
    const tagX = pillX + pillR * 2 + 10;
    const tagY = pillY - 3;
    ctx.fillStyle = '#0070F2';
    ctx.font = '900 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.tag.toUpperCase(), tagX, tagY);

    // Scratch Prompt Badge (top-right)
    if (w > 460) {
      const badgeW = 138;
      const badgeH = 24;
      const badgeX = w - badgeW - 16;
      const badgeY = 12;
      const radius = 12;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fillStyle = '#FEF3C7';
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪙 Scratch with mouse', badgeX + badgeW / 2, badgeY + badgeH / 2);
    }

    // 4. Question Title on Foil - Sleek and compact
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 13.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const maxQuestionW = w - tagX - (w > 460 ? 155 : 20);
    drawWrappedText(ctx, item.question, tagX, pillY + 8, maxQuestionW, 18, 2);

    // 5. Dedicated Scratch Prompt Zone at Bottom
    const promptBoxY = h - 26;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(16, promptBoxY, w - 32, 18);
    ctx.setLineDash([]);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ HOLD & SCRATCH MOUSE HERE TO REVEAL ANSWER ✦', w / 2, promptBoxY + 9);

    setIsRevealed(false);
    setPercent(0);
  }, [item]);

  useEffect(() => {
    paintCanvas();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      paintCanvas();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [paintCanvas, globalResetTrigger]);

  const scratch = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Direct stroke between positions
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Erase circle directly under cursor
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Organic flaky scratch flecks
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 24;
      const offsetY = (Math.random() - 0.5) * 24;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, 3 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    lastPos.current = { x, y };
    calculatePercent();
  };

  const calculatePercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    let transparent = 0;
    const stride = 48;
    const totalSamples = data.length / 4 / stride;

    for (let i = 3; i < data.length; i += 4 * stride) {
      if (data[i] < 128) {
        transparent++;
      }
    }

    const pct = Math.round((transparent / totalSamples) * 100);
    setPercent(pct);

    if (pct > 38 && !isRevealed) {
      setIsRevealed(true);
      ctx.clearRect(0, 0, w, h);
    }
  };

  const handlePointerDown = (e) => {
    setIsScratching(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) { }
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    setIsScratching(false);
    lastPos.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) { }
  };

  const handleUnscratch = () => {
    paintCanvas();
  };

  const handleInstantReveal = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsRevealed(true);
      setPercent(100);
    }
  };

  // Custom golden coin cursor SVG
  const coinCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='13' fill='%23F59E0B' stroke='%2378350F' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='9' fill='%23FDE68A' stroke='%23D97706' stroke-width='1.5' stroke-dasharray='2,2'/%3E%3Ctext x='16' y='20' font-size='11' font-weight='900' text-anchor='middle' fill='%2378350F' font-family='sans-serif'%3E%C2%A2%3C/text%3E%3C/svg%3E") 16 16, crosshair`;

  return (
    <div
      ref={containerRef}
      className="relative rounded-[1.5rem] border-2 border-stone-200/90 bg-white shadow-xs hover:border-yellow-400/80 transition-all duration-300 overflow-hidden select-none min-h-[135px] flex flex-col justify-between group/card"
    >
      {/* ── UNDERLYING ANSWER LAYER (REVEALED BENEATH SCRATCH) ── */}
      <div className="p-4 sm:p-5 relative z-0 flex flex-col justify-between h-full bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-stone-200/70">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-mono font-black text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                {item.number}
              </span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#0070F2]">
                  {item.tag}
                </span>
                <h4 className="text-slate-950 font-black text-xs sm:text-sm tracking-tight leading-snug">
                  {item.question}
                </h4>
              </div>
            </div>

            {/* Unscratch Button */}
            <button
              onClick={handleUnscratch}
              title="Unscratch and cover answer back up"
              className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 text-slate-800 px-2.5 py-1 rounded-full text-[11px] font-black transition-all hover:scale-105 border border-stone-300/90 shadow-2xs cursor-pointer shrink-0 group/btn"
            >
              <RotateCcw className="w-3 h-3 text-yellow-600 transition-transform group-hover/btn:-rotate-90" />
              <span>Unscratch</span>
            </button>
          </div>

          {/* Answer Text */}
          <div className="pt-2 text-slate-700 text-xs sm:text-[13px] font-medium leading-relaxed">
            <p className="mb-2">{item.answer}</p>
          </div>
        </div>

        {/* Perk Check Pill */}
        <div className="inline-flex items-center gap-1.5 bg-white/95 border border-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-800 shadow-2xs w-fit mt-1">
          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{item.perk}</span>
        </div>
      </div>

      {/* ── TOP SCRATCH-OFF CANVAS LAYER ── */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: coinCursor }}
        className={`absolute inset-0 z-10 touch-none select-none transition-opacity duration-300 ${isRevealed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
      />

      {/* Real-time Scratch Progress Badge */}
      {percent > 0 && !isRevealed && (
        <div className="absolute bottom-2.5 right-3 z-20 pointer-events-none bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/50 shadow-xs animate-fade-in flex items-center gap-1">
          <span>🪙</span>
          <span>{percent}% Scratched</span>
        </div>
      )}

      {/* Quick Reveal Button on Hover (Top-Right) */}
      {!isRevealed && (
        <div className="absolute top-1.5 right-1.5 z-20 pointer-events-auto opacity-0 group-hover/card:opacity-100 transition-opacity">
          <button
            onClick={handleInstantReveal}
            title="Scratch all instantly"
            className="bg-black/75 hover:bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-md cursor-pointer shadow-xs transition-transform hover:scale-105"
          >
            Quick Reveal
          </button>
        </div>
      )}
    </div>
  );
};

const FAQSection = () => {
  const [resetKey, setResetKey] = useState(0);

  const unscratchAll = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#FAF8F5] border-t border-stone-200/80 relative overflow-hidden scroll-mt-16">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-yellow-100/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
          {/* ── LEFT SIDE (FAQ TEXT & ACTIONS) ── */}
          <div className="lg:w-5/12 lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 mb-3 bg-yellow-100/90 border border-yellow-300 text-yellow-900 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
              GOT QUESTIONS?
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Questions</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8">
              Everything you need to know about tickets, venue directions, speaking, food, and attending SIT Kolkata 2026.
            </p>

            {/* Interactive Scratch Card Guide Box */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-100 border border-yellow-300 flex items-center justify-center shrink-0 text-yellow-800 text-lg">
                  🪙
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Scratch-to-Reveal Cards</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Click and drag your mouse across any question to scratch off the foil surface and uncover the answer beneath it!
                  </div>
                </div>
              </div>

              {/* Global Control Button */}
              <div className="pt-2">
                <button
                  onClick={unscratchAll}
                  className="inline-flex items-center gap-2 bg-slate-950 hover:bg-[#0070F2] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-105 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Unscratch All Cards</span>
                </button>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Have an unanswered question?</span>
                <a
                  href="mailto:info@sitkolkata.org"
                  className="font-bold text-[#0070F2] hover:underline"
                >
                  Email Team ➔
                </a>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE (SCRATCH CARD CAPSULES) ── */}
          <div className="lg:w-7/12 w-full space-y-3">
            {faqData.map((item) => (
              <ScratchCardCapsule
                key={item.id}
                item={item}
                globalResetTrigger={resetKey}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const footerRef = useRef(null);
  const footerContentRef = useRef(null);
  const footerWatermarkRef = useRef(null);

  useEffect(() => {
    // ==========================================
    // 7. FOOTER PARALLAX
    // ==========================================
    // Content block rises up as you scroll into footer
    if (footerContentRef.current) {
      gsap.fromTo(
        footerContentRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerContentRef.current,
            start: "top 85%",
            toggleActions: "play none none reset",
          },
        }
      );
    }

    // Watermark moves at a slower rate than scroll — classic parallax
    if (footerWatermarkRef.current && footerRef.current) {
      gsap.to(footerWatermarkRef.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    /* ==========================================
        FOOTER WITH TOP ACETERNITY LAMP (YELLOW LIGHT)
    ========================================== */
    <footer
      id="contact"
      ref={footerRef}
      className="relative w-full bg-[#0a0a0a] pb-8 overflow-hidden border-t-[4px] border-[#FFD200]"
    >
      {/* ==========================================
          ACETERNITY LAMP CONTAINER (YELLOW LIGHT)
      ========================================== */}
      <LampContainer className="pt-8 md:pt-14 pb-0">
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="text-center select-none max-w-4xl mx-auto px-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-[#FFD200] border border-[#FFD200]/40 bg-[#FFD200]/10 mb-3 uppercase">
            ✦ SAP INSIDE TRACK KOLKATA 2026 ✦
          </span>
          <h2 className="mt-2 bg-gradient-to-br from-white via-amber-100 to-amber-300 py-3 bg-clip-text text-center text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent leading-[1.1]">
            See You In Kolkata <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD200] via-yellow-300 to-amber-400">
              November 14, 2026
            </span>
          </h2>
          <p className="text-white/50 text-xs sm:text-sm font-medium mt-3 max-w-md mx-auto">
            Eastern India&apos;s premier enterprise community tech gathering for architects, developers & consultants.
          </p>
        </motion.div>
      </LampContainer>

      {/* Glow blobs */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#FFD200]/15 to-transparent blur-3xl pointer-events-none rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#FFD200]/10 to-transparent blur-3xl pointer-events-none rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div
        ref={footerContentRef}
        className="relative z-10 max-w-6xl mx-auto px-6 w-full text-white mb-12 md:mb-16 opacity-0"
      >
        {/* Mobile: logo top-center. Desktop: hidden (logo is in the middle of the row) */}
        <div className="flex justify-center mb-6 md:hidden">
          <Image
            src="/sap-logo.png"
            alt="SAP Inside Track Kolkata"
            width={140}
            height={80}
            className="object-contain"
          />
        </div>

        {/* Mobile: contact left + socials right. Desktop: contact | logo | socials */}
        <div className="flex flex-row justify-between md:flex-row md:items-start md:justify-between gap-6 md:gap-12">
          {/* Contact */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="font-bebas text-[#FFD200] tracking-[0.2em] text-lg">
              CONTACT
            </h4>
            <ul className="flex flex-col gap-2 md:gap-3">
              {[
                {
                  label: 'info@sitkolkata.org',
                  href: 'mailto:info@sitkolkata.org',
                  icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
                },
                {
                  label: 'Sponsor Us',
                  icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
                },
                {
                  label: 'Call for Speakers',
                  icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
                },
              ].map(({ label, href, icon }) => (
                <li key={label} className="list-none">
                  <a
                    href={href || '#'}
                    target={href?.startsWith('mailto') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs md:text-sm text-white/50 hover:text-[#FFD200] transition-colors duration-300"
                  >
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={icon}
                      />
                    </svg>
                    <span className="truncate max-w-[120px] md:max-w-none">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-white/30 text-[10px] md:text-xs mt-2 md:mt-4">
              © 2026 SAP Inside Track Kolkata.
              <br />
              All rights reserved.
            </p>
          </div>

          {/* Logo — center, desktop only */}
          <div className="hidden md:flex flex-col items-center gap-3 mx-auto mt-6 md:mt-12">
            <Image
              src="/sap-logo.png"
              alt="SAP Inside Track Kolkata"
              width={160}
              height={90}
              className="object-contain md:w-[220px] md:h-[124px]"
            />
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="font-bebas text-[#FFD200] tracking-[0.2em] text-lg">
              SOCIALS
            </h4>
            <ul className="flex flex-col gap-2 md:gap-3">
              {[
                {
                  label: 'LinkedIn',
                  href: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
                  icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
                },
                {
                  label: 'Instagram',
                  href: 'https://www.instagram.com/sitkolkata?igsh=MXFidTkweDNjd3d4dg==',
                  icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z',
                },
              ].map(({ label, href, icon }) => (
                <li key={label} className="list-none">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs md:text-sm text-white/50 hover:text-[#FFD200] transition-colors duration-300"
                  >
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={icon}
                      />
                    </svg>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Big KOLKATA watermark */}
      <div
        ref={footerWatermarkRef}
        className="relative w-full overflow-hidden flex justify-center items-end pointer-events-none select-none"
      >
        <h1 className="font-koyoto text-[12vw] md:text-[15vw] text-transparent bg-clip-text bg-gradient-to-b from-[#FFD200]/10 to-[#FFD200]/0 leading-[0.85] tracking-[0.05em] whitespace-nowrap">
          SIT KOLKATA
        </h1>
      </div>
    </footer>
  );
};

export default function App() {
  // Enforce starting at top Hero section on reload
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (window.location.hash && window.location.hash !== '#hero') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Ultra-Smooth Inertial Scrolling with Lenis synchronized to GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    window.lenis = lenis;

    // Start at top on initial load
    lenis.scrollTo(0, { immediate: true });

    lenis.on('scroll', ScrollTrigger.update);

    const rafCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    // Smooth scroll for all hash anchor links without polluting URL hash
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (targetEl && window.lenis) {
        e.preventDefault();
        window.history.replaceState(null, '', window.location.pathname);
        window.lenis.scrollTo(targetEl, {
          offset: -70,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-300 selection:text-slate-900 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (hover: hover) and (pointer: fine) {
          html.custom-cursor-active,
          html.custom-cursor-active body,
          html.custom-cursor-active a,
          html.custom-cursor-active button,
          html.custom-cursor-active [role="button"] {
            cursor: none !important;
          }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-20px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(-3deg); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(4deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(16px) rotate(0deg); }
          50% { transform: rotate(180deg) translateX(16px) rotate(-180deg); }
          100% { transform: rotate(360deg) translateX(16px) rotate(-360deg); }
        }
        @keyframes tram-ride {
          0% {
            left: -130px;
            opacity: 1;
          }
          85% {
            left: 100%;
            opacity: 1;
          }
          85.1% {
            left: 100%;
            opacity: 0;
          }
          99.9% {
            left: -130px;
            opacity: 0;
          }
          100% {
            left: -130px;
            opacity: 1;
          }
        }
        @keyframes tram-rumble {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-1px);
          }
        }
        .animate-tram {
          animation: tram-ride 8s linear infinite;
        }
        .animate-tram-rumble {
          animation: tram-rumble 0.6s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 25s linear infinite;
        }
        .animate-orbit {
          animation: orbit 12s ease-in-out infinite;
        }
        @keyframes scribble-draw {
          0% {
            stroke-dashoffset: 700;
            opacity: 0.5;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        .animate-scribble {
          stroke-dasharray: 700;
          animation: scribble-draw 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .premium-grid {
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 32px 32px;
          color: rgba(148, 163, 184, 0.35);
          mask-image: linear-gradient(to bottom, transparent, black 16%, black 84%, transparent);
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
        html { scroll-behavior: smooth; }
      `}} />

      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <EventEssentials />
      <AboutSection />
      <VenueSection />
      <AgendaSection />
      <PastEventsSection />
      <SpeakersSection />
      <TicketsSection />
      <SponsorsSection />
      <CommunityPartnersSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
