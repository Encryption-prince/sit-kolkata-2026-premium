import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Linkedin,
  Twitter,
  Github,
  Mail,
  ArrowUpRight,
} from 'lucide-react';

export const TEAM_MEMBERS = [
  // ── ORGANIZERS ──
  {
    id: 'pritam-paul',
    name: 'Pritam Paul',
    role: 'SAP Integration Team',
    accentColor: '#D97706',
    photo: '/team/pritam-paul.png',
    organization: 'Visteon Corporation',
    socials: {
      linkedin: 'https://www.linkedin.com/in/pritam-paul/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'pradipto-kumar-saha',
    name: 'Pradipto Kumar Saha',
    role: 'Organizer',
    accentColor: '#0369A1',
    photo: '/team/pradipto-kumar-saha.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'raunak-das',
    name: 'Raunak Das',
    role: 'Lead Organizer',
    accentColor: '#16A34A',
    photo: '/team/raunak-das.png',
    organization: 'GDGC MSIT Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  // ── MANAGEMENT TEAM ──
  {
    id: 'subham-maity',
    name: 'Subham Maity',
    role: 'Web Dev Lead',
    accentColor: '#0284C7',
    photo: '/team/subham-maity.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/in/subham-maity/',
      github: 'https://github.com/Encryption-prince',
      email: 'mailto:subhammaity6827@gmail.com',
    },
  },
  {
    id: 'chandika-sarkar',
    name: 'Chandika Sarkar',
    role: 'Management Team',
    accentColor: '#7C3AED',
    photo: '/team/chandika-sarkar.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'titli-bera',
    name: 'Titli Bera',
    role: 'Content Team',
    accentColor: '#DB2777',
    photo: '/team/titli-bera.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'subham-dutta',
    name: 'Subham Dutta',
    role: 'SAP ABAP Consultant',
    accentColor: '#0891B2',
    photo: '/team/subham-dutta.png',
    organization: 'Accenture',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  // ── GRAPHICS TEAM ──
  {
    id: 'ankan-karmakar',
    name: 'Ankan Karmakar',
    role: 'Graphics Team',
    accentColor: '#D97706',
    photo: '/team/ankan-karmakar.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'sagnik-adhikary',
    name: 'Sagnik Adhikary',
    role: 'Graphics Team',
    accentColor: '#EA580C',
    photo: '/team/sagnik-adhikary.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'sayan-ankur',
    name: 'Sayan Ankur',
    role: 'Graphics Team',
    accentColor: '#65A30D',
    photo: '/team/sayan-ankur.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  // ── SOCIAL MEDIA TEAM ──
  {
    id: 'koustav-singh',
    name: 'Koustav Singh',
    role: 'Social Media Team',
    accentColor: '#2563EB',
    photo: '/team/koustav-singh.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  // ── CULTURAL & SOCIAL MEDIA TEAM ──
  {
    id: 'tanuja-chowdhury',
    name: 'Tanuja Chowdhury',
    role: 'Cultural & Social Media Team',
    accentColor: '#9333EA',
    photo: '/team/tanuja-chowdhury.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'srijoyee-ghosh',
    name: 'Srijoyee Ghosh',
    role: 'Cultural & Social Media Team',
    accentColor: '#DB2777',
    photo: '/team/srijoyee-ghosh.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  // ── VOLUNTEERS ──
  {
    id: 'rupam-mandal',
    name: 'Rupam Mandal',
    role: 'Volunteer',
    accentColor: '#059669',
    photo: '/team/rupam-mandal.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'kuntal-das',
    name: 'Kuntal Das',
    role: 'Organising Team SAP INSIDE TRACK KOLKATA',
    accentColor: '#0369A1',
    photo: '/team/kuntal-das.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'indranil-guria',
    name: 'Indranil Guria',
    role: 'Organising Team SAP INSIDE TRACK KOLKATA',
    accentColor: '#16A34A',
    photo: '/team/indranil-guria.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'bitan',
    name: 'Bitan',
    role: 'Organising Team SAP INSIDE TRACK KOLKATA',
    accentColor: '#D97706',
    photo: '/team/bitan.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'pranay-mukherjee',
    name: 'Pranay Mukherjee',
    role: 'Volunteer',
    accentColor: '#7C3AED',
    photo: '/team/pranay-mukherjee.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
  {
    id: 'piyush-goenka',
    name: 'Piyush Goenka',
    role: 'Volunteer',
    accentColor: '#EA580C',
    photo: '/team/piyush-goenka.png',
    organization: 'SAP Inside Track Kolkata',
    socials: {
      linkedin: 'https://www.linkedin.com/company/sap-inside-track-kolkata/',
      twitter: 'https://twitter.com/sitkolkata',
      email: 'mailto:info@sitkolkata.org',
    },
  },
];

/**
 * Editorial Light Theme Team Portrait Card
 * Features an architectural arch backdrop (identical generic shape for all),
 * geometric tech coordinate matrix & fluted light columns (no circles),
 * transparent cutout PNG with zero original photo background, and spring hover physics.
 */
const LuxuryTeamCard = ({ member, index }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth spring tilt limits
    setRotateX(((y - centerY) / centerY) * -5);
    setRotateY(((x - centerX) / centerX) * 5);
    setSpotlightPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
      }}
      className="group relative"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative bg-white rounded-[32px] p-4 sm:p-5 border border-slate-200/90 hover:border-[#0070F2]/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_24px_50px_-12px_rgba(0,112,242,0.18)] transition-all duration-500 flex flex-col justify-between overflow-hidden"
      >
        {/* Cursor-following radial light wash */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
          style={{
            background: `radial-gradient(320px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(0, 112, 242, 0.06), transparent 80%)`,
          }}
        />

        {/* ── GENERIC SCULPTED ARCH BACKDROP & CUTOUT PORTRAIT ── */}
        <div className="relative w-full h-[280px] sm:h-[300px] rounded-t-[70px] rounded-b-[24px] overflow-hidden bg-gradient-to-b from-[#FFFDF0] via-[#FEF9C3]/40 to-[#FAF8F5] border border-amber-200/80 group-hover:border-amber-400 transition-colors duration-500 flex items-end justify-center shadow-inner">
          {/* Ambient warm yellow sunlight bloom */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,210,0,0.30),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_50%_30%,rgba(255,210,0,0.48),transparent_75%)] transition-all duration-500" />

          {/* Diagonal sunlight streak across the window */}
          <div className="absolute -top-12 -left-12 w-64 h-80 bg-gradient-to-br from-amber-300/20 via-yellow-200/10 to-transparent rotate-[28deg] pointer-events-none" />

          {/* ── ARCHITECTURAL YELLOW WINDOW (HERITAGE ARCHED PANES) ── */}
          <svg
            viewBox="0 0 200 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-x-0 bottom-0 mx-auto w-[86%] h-[94%] max-h-[275px] pointer-events-none drop-shadow-[0_2px_10px_rgba(245,158,11,0.22)] group-hover:drop-shadow-[0_4px_18px_rgba(255,210,0,0.42)] transition-all duration-500"
          >
            {/* Outer Window Arch Frame (Yellow) */}
            <path
              d="M16 268 V 85 C 16 38 52 14 100 14 C 148 14 184 38 184 85 V 268 Z"
              className="fill-amber-100/30 stroke-[#EAB308] group-hover:stroke-[#CA8A04] transition-colors"
              strokeWidth="3"
            />

            {/* Inner Window Moulding */}
            <path
              d="M26 264 V 88 C 26 46 58 24 100 24 C 142 24 174 46 174 88 V 264 Z"
              className="stroke-amber-400/60"
              strokeWidth="1.5"
            />

            {/* Top Semicircular Fanlight Pane */}
            <path
              d="M40 92 C 40 58 66 38 100 38 C 134 38 160 58 160 92 Z"
              className="fill-amber-200/35 stroke-[#EAB308] group-hover:fill-amber-300/40 transition-colors"
              strokeWidth="2"
            />

            {/* Fanlight Sunburst Radiating Muntins */}
            <line x1="100" y1="38" x2="100" y2="92" stroke="#EAB308" strokeWidth="2" />
            <line x1="100" y1="92" x2="60" y2="52" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="100" y1="92" x2="140" y2="52" stroke="#EAB308" strokeWidth="1.8" />

            {/* Central Vertical Mullion Bar */}
            <line x1="100" y1="92" x2="100" y2="264" stroke="#EAB308" strokeWidth="2.5" />

            {/* Horizontal Transom Bars (Forming Window Panes) */}
            <line x1="26" y1="92" x2="174" y2="92" stroke="#EAB308" strokeWidth="2.5" />
            <line x1="26" y1="150" x2="174" y2="150" stroke="#EAB308" strokeWidth="2" />
            <line x1="26" y1="208" x2="174" y2="208" stroke="#EAB308" strokeWidth="2" />

            {/* Warm Yellow Window Panes (Reflective Glass) */}
            <rect x="34" y="98" width="58" height="46" rx="4" className="fill-amber-200/25 group-hover:fill-amber-300/35 transition-colors" />
            <rect x="108" y="98" width="58" height="46" rx="4" className="fill-amber-200/25 group-hover:fill-amber-300/35 transition-colors" />
            <rect x="34" y="156" width="58" height="46" rx="4" className="fill-amber-200/25 group-hover:fill-amber-300/35 transition-colors" />
            <rect x="108" y="156" width="58" height="46" rx="4" className="fill-amber-200/25 group-hover:fill-amber-300/35 transition-colors" />
            <rect x="34" y="214" width="58" height="46" rx="4" className="fill-amber-200/25 group-hover:fill-amber-300/35 transition-colors" />
            <rect x="108" y="214" width="58" height="46" rx="4" className="fill-amber-200/25 group-hover:fill-amber-300/35 transition-colors" />

            {/* Window Sill at Base */}
            <rect x="8" y="264" width="184" height="8" rx="4" className="fill-[#F59E0B] stroke-[#D97706]" strokeWidth="1" />
          </svg>

          {/* ── TRANSPARENT CUTOUT PORTRAIT (NO PHOTO BG) ── */}
          <img
            src={member.photo}
            alt={member.name}
            className="relative z-10 w-auto h-[94%] max-h-[280px] object-contain object-bottom select-none filter drop-shadow-[0_12px_22px_rgba(217,119,6,0.20)] group-hover:scale-108 group-hover:-translate-y-2 group-hover:drop-shadow-[0_18px_28px_rgba(245,158,11,0.35)] transition-all duration-500 ease-out"
            loading="lazy"
          />
        </div>

        {/* ── CARD INFORMATION & SOCIALS ── */}
        <div className="pt-4 pb-1 px-1 flex flex-col z-20">
          {/* Member Name */}
          <h3 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#0070F2] transition-colors duration-300">
            {member.name}
          </h3>

          {/* Role */}
          <p className="text-[13px] font-bold text-[#0070F2] mt-0.5 tracking-wide">
            {member.role}
          </p>

          {/* Organization */}
          <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
            {member.organization}
          </p>

          {/* Social Dock */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
              Connect
            </span>

            <div className="flex items-center gap-1.5">
              {member.socials.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-[#0077B5] text-slate-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs border border-slate-200/60"
                  title="LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-950 text-slate-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs border border-slate-200/60"
                  title="GitHub"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {member.socials.twitter && (
                <a
                  href={member.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-950 text-slate-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs border border-slate-200/60"
                  title="X (Twitter)"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {member.socials.email && (
                <a
                  href={member.socials.email}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-[#FFD200] text-slate-600 hover:text-slate-950 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xs border border-slate-200/60"
                  title="Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Dedicated Team Page in Light Theme
 * - Clean Ivory/White aesthetic matching the SIT Kolkata design language
 * - Zero filter clutter (all organizers presented harmoniously)
 * - Sculpted generic arch portal backdrop with tech matrix grid (no circles)
 * - Transparent cutout portraits without photo backgrounds
 */
export default function TeamPage({ onNavigateHome }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 selection:bg-[#FFD200] selection:text-slate-950 font-sans pb-28 relative overflow-hidden">
      {/* ── TOP NAV BAR (LIGHT THEME) ── */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 hover:bg-[#0070F2] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-200">
              <img
                src="/sap-logo-org.jpg"
                alt="SIT Kolkata 2026 Logo"
                className="w-7 h-7 rounded-lg object-contain border border-slate-200 shadow-2xs"
              />
              <span className="text-xs font-black tracking-wider text-slate-950">
                SIT KOLKATA 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-[#0070F2] border border-blue-200/70">
              <Sparkles className="w-3.5 h-3.5 text-[#0070F2]" />
              <span>ORGANIZING SQUAD</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── BACKGROUND LIGHTING AMBIENCE (LIGHT THEME) ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70rem] h-[32rem] bg-gradient-to-b from-blue-100/60 via-amber-100/40 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 premium-grid opacity-25 pointer-events-none" />

      {/* ── HERO BANNER ── */}
      <section className="relative pt-14 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-900 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>SAP COMMUNITY KOLKATA</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]"
        >
          The Minds Behind <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F2] via-blue-700 to-amber-600">
            SIT Kolkata 2026
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Meet the community leaders, architects, and creators powering Eastern India’s flagship
          SAP conference on November 14, 2026 at Sister Nivedita University.
        </motion.p>
      </section>

      {/* ── LUXURY TEAM GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {TEAM_MEMBERS.map((member, index) => (
            <LuxuryTeamCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </section>

      {/* ── BOTTOM COMMUNITY CALLOUT ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
              Want to join or connect with the community?
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
              SIT Kolkata is an open, volunteer-driven grassroots initiative bringing SAP practitioners together.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-[#0070F2] text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              >
                Return to Conference Overview
              </button>
              <a
                href="mailto:info@sitkolkata.org"
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all border border-slate-200/80 cursor-pointer"
              >
                Contact Organizers
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
