import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Gamepad2,
  X,
  Heart,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';

// ── TEAM DATA ─────────────────────────────────────────────────────
// clues: array of strings shown one at a time when user skips/asks for hint
// clue types: hashtag, riddle, org hint, fun fact — never the name/role directly
export const TEAM_MEMBERS = [
  {
    id: 'pritam-paul',
    name: 'Pritam Paul',
    role: 'SAP Integration Team',
    accentColor: '#D97706',
    photo: '/team/pritam-paul.png',
    organization: 'Visteon Corporation',
    clues: [
      'Makes cars smarter with SAP 🚗',
      'Probably has a Visteon sticker on their laptop',
      '#ChiefChaiStrategist ☕',
    ],
  },
  {
    id: 'moumita-saha',
    name: 'Moumita Saha',
    role: 'Organizer',
    accentColor: '#DB2777',
    photo: '/team/moumita-saha.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#RunsOnDeadlinesAndDreams 🚀',
      'Part of the core organizing squad',
      'Somehow keeps everyone sane',
    ],
  },
  {
    id: 'pradipto-kumar-saha',
    name: 'Pradipto Kumar Saha',
    role: 'Organizer',
    accentColor: '#0369A1',
    photo: '/team/pradipto-kumar-saha.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#SAPWhisperer 🧙',
      'Organizes things before you even ask',
      'Has "Kumar" in the name — the distinguished kind',
    ],
  },
  {
    id: 'kuntal-das',
    name: 'Kuntal Das',
    role: 'Organising Team',
    accentColor: '#0369A1',
    photo: '/team/kuntal-das.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#HiddenBossOfLogistics 📦',
      'Things just work when this person is around',
      'Part of the organising team — quietly essential',
    ],
  },
  {
    id: 'amitt-dubey',
    name: 'Amitt Dubey',
    role: 'Principal Consultant',
    accentColor: '#D97706',
    photo: '/team/amitt-dubey.png',
    organization: 'Infosys',
    clues: [
      'Works at one of India\'s biggest IT giants 🏢',
      'The "Principal" in the title is not from school',
      '#ConsultingInBloodSAPInSoul 💼',
    ],
  },
  {
    id: 'subham-maity',
    name: 'Subham Maity',
    role: 'Web Dev Lead',
    accentColor: '#0284C7',
    photo: '/team/subham-maity.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      'Built the very website you\'re playing on 💻',
      '#BuiltThisPageYoureWelcome 🙃',
      'Probably pushed a commit at 2am for this',
    ],
  },
  {
    id: 'pritam-kumar-mani',
    name: 'Pritam Kumar Mani',
    role: 'Application Developer',
    accentColor: '#16A34A',
    photo: '/team/pritam-kumar-mani.png',
    organization: 'IBM',
    clues: [
      'Works at a company that is literally a colour 🔵',
      '#IBMByDayIBMByNight',
      'Develops applications — not the job kind',
    ],
  },
  {
    id: 'tanuja-chowdhury',
    name: 'Tanuja Chowdhury',
    role: 'Cultural & Social Media Team',
    accentColor: '#9333EA',
    photo: '/team/tanuja-chowdhury.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#PostedItBeforeYouThoughtIt 📸',
      'Handles both culture AND social media — double threat',
      'Your Instagram saw this event before you did',
    ],
  },
  {
    id: 'bitan',
    name: 'Bitan',
    role: 'Associate Technical Architect',
    accentColor: '#D97706',
    photo: '/team/bitan.png',
    organization: 'Incture',
    clues: [
      'Works at Incture — not Infosys, not Accenture, Incture 🏗️',
      '#ArchitectOfChaosAndCode',
      'One name only. Like Cher, but for SAP.',
    ],
  },
  {
    id: 'subham-dutta',
    name: 'Subham Dutta',
    role: 'SAP ABAP Consultant',
    accentColor: '#0891B2',
    photo: '/team/subham-dutta.png',
    organization: 'Accenture',
    clues: [
      '#ABAPIsNotDeadFightMe ⚔️',
      'Consults in ABAP at Accenture — old school cool',
      'If ABAP dies, they go down with it',
    ],
  },
  {
    id: 'prasansa-gupta',
    name: 'Prasansa Gupta',
    role: 'Associate Manager',
    accentColor: '#9333EA',
    photo: '/team/prasansa-gupta.png',
    organization: 'Accenture',
    clues: [
      '#ManagesEverythingExceptSleep 😴',
      'Associate Manager at Accenture — manages associates',
      'Two Accenture people in this team — this is one of them',
    ],
  },
  {
    id: 'abhisikta-mukherjee',
    name: 'Abhisikta Mukherjee',
    role: 'Organizing Team',
    accentColor: '#E11D48',
    photo: '/team/abhisikta-mukherjee.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#QuietlyRunningTheShow 🎭',
      'Part of the organizing team — the unsung kind',
      'Long name. Big contribution.',
    ],
  },
  {
    id: 'sayan-ankur',
    name: 'Sayan Ankur',
    role: 'Graphics Team',
    accentColor: '#65A30D',
    photo: '/team/sayan-ankur.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#PixelPerfectOrPixelWreck 🎨',
      'Makes the posters you actually stop to look at',
      'Graphics team — probably judging your font choices right now',
    ],
  },
  {
    id: 'ankan-karmakar',
    name: 'Ankan Karmakar',
    role: 'Graphics Team',
    accentColor: '#D97706',
    photo: '/team/ankan-karmakar.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#FontsArePersonality 🖌️',
      'Also on the graphics team — yes there are multiple',
      'Karmakar by name, karma-maker by design',
    ],
  },
  {
    id: 'srijoyee-ghosh',
    name: 'Srijoyee Ghosh',
    role: 'Cultural & Social Media Team',
    accentColor: '#DB2777',
    photo: '/team/srijoyee-ghosh.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#CulturallyChaotic 🎉',
      'Cultural AND social media — two jobs, one salary',
      'The vibe of this event? Partly their fault.',
    ],
  },
  {
    id: 'sagnik-adhikary',
    name: 'Sagnik Adhikary',
    role: 'Graphics Team',
    accentColor: '#EA580C',
    photo: '/team/sagnik-adhikary.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#DesignedItAt3AM 🌙',
      'Third graphics team member — they have an army',
      'The colour palette you saw? Might be this person.',
    ],
  },
  {
    id: 'raunak-das',
    name: 'Raunak Das',
    role: 'Lead Organizer',
    accentColor: '#16A34A',
    photo: '/team/raunak-das.png',
    organization: 'GDGC MSIT Kolkata',
    clues: [
      'Leads at GDGC MSIT Kolkata 🏆',
      '#LeadingFromTheFrontRow',
      'The only Lead Organizer from outside SAP community',
    ],
  },
  {
    id: 'pranay-mukherjee',
    name: 'Pranay Mukherjee',
    role: 'Volunteer',
    accentColor: '#7C3AED',
    photo: '/team/pranay-mukherjee.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#VolunteeredBeforeCoffee ☕',
      'Showed up. No questions asked.',
      'Volunteer — the most honest job title here',
    ],
  },
  {
    id: 'rupam-mandal',
    name: 'Rupam Mandal',
    role: 'Volunteer',
    accentColor: '#059669',
    photo: '/team/rupam-mandal.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#ShowedUpAndDelivered 💪',
      'Volunteer with "Mandal" energy',
      'Does the work. Doesn\'t ask for credit.',
    ],
  },
  {
    id: 'piyush-goenka',
    name: 'Piyush Goenka',
    role: 'Volunteer',
    accentColor: '#EA580C',
    photo: '/team/piyush-goenka.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#DelegateWhisperer 🤝',
      'Handles delegates on event day — front line hero',
      'Probably the first face you\'ll see at the door',
    ],
  },
  {
    id: 'indranil-guria',
    name: 'Indranil Guria',
    role: 'Volunteer',
    accentColor: '#16A34A',
    photo: '/team/indranil-guria.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#SilentlyEssential 🔧',
      'Guria — sounds like a ninja, works like one too',
      'Another volunteer who keeps the engine running',
    ],
  },
  {
    id: 'chandika-sarkar',
    name: 'Chandika Sarkar',
    role: 'Management Team',
    accentColor: '#7C3AED',
    photo: '/team/chandika-sarkar.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#SpreadsheetSupervillain 📊',
      'Management team — the spreadsheet never lies',
      'Sarkar means government. Runs things accordingly.',
    ],
  },
  {
    id: 'koustav-singh',
    name: 'Koustav Singh',
    role: 'Social Media Team',
    accentColor: '#2563EB',
    photo: '/team/koustav-singh.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#PostedItFirstAskQuestionsLater 📱',
      'Solely on social media — laser focused',
      'If you saw it on Instagram, this person approved it',
    ],
  },
  {
    id: 'vishnu-maddheshiya',
    name: 'Vishnu Maddheshiya',
    role: 'PR & Outreach Team',
    accentColor: '#0891B2',
    photo: '/team/vishnu-maddheshiya.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#NetworkingNinja 🥷',
      'PR & Outreach — talks to humans so others don\'t have to',
      'Maddheshiya — uncommon name, unforgettable work',
    ],
  },
  {
    id: 'titli-bera',
    name: 'Titli Bera',
    role: 'Content Team',
    accentColor: '#DB2777',
    photo: '/team/titli-bera.png',
    organization: 'SAP Inside Track Kolkata',
    clues: [
      '#WordsAreMyWeapon ✍️',
      'Titli means butterfly — writes like one too',
      'Content team — turns chaos into paragraphs',
    ],
  },
];

// ── CONFETTI BURST ────────────────────────────────────────────────
const ConfettiBurst = ({ active, onDone }) => {
  const pieces = Array.from({ length: 30 });
  const colors = ['#FFD200', '#0070F2', '#E11D48', '#16A34A', '#9333EA', '#EA580C', '#0891B2', '#fff'];

  useEffect(() => {
    if (active) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-[32px]">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const dist = 55 + Math.random() * 90;
        const dx = Math.cos((angle * Math.PI) / 180) * dist;
        const dy = Math.sin((angle * Math.PI) / 180) * dist - 50;
        const color = colors[i % colors.length];
        const size = 5 + Math.random() * 7;
        return (
          <motion.div
            key={i}
            className="absolute rounded-sm"
            style={{ width: size, height: size, backgroundColor: color, left: '50%', top: '45%' }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
};

// ── TEAM CARD ─────────────────────────────────────────────────────
const LuxuryTeamCard = ({ member, index, gameMode, isRevealed, isWrong, onClick }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [showConfetti, setShowConfetti] = useState(false);

  const prevRevealed = useRef(false);
  useEffect(() => {
    if (isRevealed && !prevRevealed.current) setShowConfetti(true);
    prevRevealed.current = isRevealed;
  }, [isRevealed]);

  const handleMouseMove = (e) => {
    if (!cardRef.current || gameMode) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotateX(((y - rect.height / 2) / (rect.height / 2)) * -5);
    setRotateY(((x - rect.width / 2) / (rect.width / 2)) * 5);
    setSpotlightPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };
  const handleMouseLeave = () => { setRotateX(0); setRotateY(0); };

  // In game mode: all unguessed cards look identical — neutral border, no glow, no ring
  const borderClass = gameMode
    ? isRevealed
      ? 'border-green-400 shadow-[0_0_20px_rgba(22,163,74,0.25)]'
      : 'border-slate-200 hover:border-slate-300 cursor-pointer'
    : 'border-slate-200/90 hover:border-[#0070F2]/50';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      animate={{
        opacity: 1,
        y: 0,
        x: isWrong ? [0, -12, 12, -8, 8, -4, 4, 0] : 0,
      }}
      transition={
        isWrong
          ? { x: { duration: 0.4, ease: 'easeInOut' } }
          : { duration: 0.5, delay: index * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={gameMode && !isRevealed ? onClick : undefined}
      style={{ transformStyle: 'preserve-3d' }}
      className={`group relative ${gameMode && !isRevealed ? 'cursor-pointer' : ''}`}
    >
      <ConfettiBurst active={showConfetti} onDone={() => setShowConfetti(false)} />

      <motion.div
        animate={{ rotateX: gameMode ? 0 : rotateX, rotateY: gameMode ? 0 : rotateY, transformPerspective: 1000 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`relative bg-white rounded-[32px] p-4 sm:p-5 border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col justify-between overflow-hidden ${borderClass}`}
      >
        {/* Spotlight (normal mode only) */}
        {!gameMode && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
            style={{ background: `radial-gradient(320px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(0,112,242,0.06), transparent 80%)` }} />
        )}

        {/* Revealed tick */}
        {gameMode && isRevealed && (
          <div className="absolute top-3 right-3 z-30">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        )}

        {/* Photo area */}
        <div className="relative w-full h-[240px] sm:h-[260px] rounded-t-[70px] rounded-b-[24px] overflow-hidden bg-gradient-to-b from-[#FFFDF0] via-[#FEF9C3]/40 to-[#FAF8F5] border border-amber-200/80 group-hover:border-amber-400 transition-colors duration-500 flex items-end justify-center shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,210,0,0.30),transparent_70%)]" />
          <div className="absolute -top-12 -left-12 w-64 h-80 bg-gradient-to-br from-amber-300/20 via-yellow-200/10 to-transparent rotate-[28deg] pointer-events-none" />

          {/* Arch SVG */}
          <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-x-0 bottom-0 mx-auto w-[86%] h-[94%] max-h-[255px] pointer-events-none drop-shadow-[0_2px_10px_rgba(245,158,11,0.22)] group-hover:drop-shadow-[0_4px_18px_rgba(255,210,0,0.42)] transition-all duration-500">
            <path d="M16 268 V 85 C 16 38 52 14 100 14 C 148 14 184 38 184 85 V 268 Z" className="fill-amber-100/30 stroke-[#EAB308] group-hover:stroke-[#CA8A04] transition-colors" strokeWidth="3" />
            <path d="M26 264 V 88 C 26 46 58 24 100 24 C 142 24 174 46 174 88 V 264 Z" className="stroke-amber-400/60" strokeWidth="1.5" />
            <path d="M40 92 C 40 58 66 38 100 38 C 134 38 160 58 160 92 Z" className="fill-amber-200/35 stroke-[#EAB308]" strokeWidth="2" />
            <line x1="100" y1="38" x2="100" y2="92" stroke="#EAB308" strokeWidth="2" />
            <line x1="100" y1="92" x2="60" y2="52" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="100" y1="92" x2="140" y2="52" stroke="#EAB308" strokeWidth="1.8" />
            <line x1="100" y1="92" x2="100" y2="264" stroke="#EAB308" strokeWidth="2.5" />
            <line x1="26" y1="92" x2="174" y2="92" stroke="#EAB308" strokeWidth="2.5" />
            <line x1="26" y1="150" x2="174" y2="150" stroke="#EAB308" strokeWidth="2" />
            <line x1="26" y1="208" x2="174" y2="208" stroke="#EAB308" strokeWidth="2" />
            <rect x="34" y="98" width="58" height="46" rx="4" className="fill-amber-200/25" />
            <rect x="108" y="98" width="58" height="46" rx="4" className="fill-amber-200/25" />
            <rect x="34" y="156" width="58" height="46" rx="4" className="fill-amber-200/25" />
            <rect x="108" y="156" width="58" height="46" rx="4" className="fill-amber-200/25" />
            <rect x="34" y="214" width="58" height="46" rx="4" className="fill-amber-200/25" />
            <rect x="108" y="214" width="58" height="46" rx="4" className="fill-amber-200/25" />
            <rect x="8" y="264" width="184" height="8" rx="4" className="fill-[#F59E0B] stroke-[#D97706]" strokeWidth="1" />
          </svg>

          {/* Portrait — blurred in game until revealed */}
          <img
            src={member.photo}
            alt={isRevealed || !gameMode ? member.name : '?'}
            className={`relative z-10 w-auto h-[94%] max-h-[250px] object-contain object-bottom select-none drop-shadow-[0_12px_22px_rgba(217,119,6,0.20)] transition-all duration-500 ease-out
              ${!gameMode ? 'group-hover:scale-105 group-hover:-translate-y-2 group-hover:drop-shadow-[0_18px_28px_rgba(245,158,11,0.35)]' : ''}
              ${gameMode && !isRevealed ? 'blur-[7px] brightness-60 saturate-0' : ''}`}
            loading="lazy"
          />

          {/* Game: ? badge — purely decorative, no identity hint */}
          {gameMode && !isRevealed && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="text-6xl font-black text-white/70 drop-shadow-lg select-none"
              >
                ?
              </motion.div>
            </div>
          )}
        </div>

        {/* Card text */}
        <div className="pt-3 pb-1 px-1 flex flex-col z-20 min-h-[72px]">
          {/* Name */}
          <h3 className={`text-lg sm:text-xl font-black tracking-tight leading-snug transition-all duration-300
            ${gameMode && !isRevealed
              ? 'text-slate-200 select-none'
              : 'text-slate-900 group-hover:text-[#0070F2]'}`}>
            {gameMode && !isRevealed ? '████████' : member.name}
          </h3>

          {/* Role */}
          <p className={`text-[13px] font-bold mt-0.5 tracking-wide transition-all duration-300
            ${gameMode && !isRevealed ? 'text-slate-100 select-none' : 'text-[#0070F2]'}`}>
            {gameMode && !isRevealed ? '█████' : member.role}
          </p>

          {/* Org */}
          <p className={`text-xs font-medium mt-0.5 line-clamp-1 transition-all duration-300
            ${gameMode && !isRevealed ? 'invisible' : 'text-slate-500'}`}>
            {member.organization}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── SCORE MESSAGES ────────────────────────────────────────────────
function getScoreMessage(score, total) {
  const pct = score / total;
  if (pct === 1)   return { emoji: '🏆', title: 'Flawless Victory!',      sub: 'You basically work here. We\'re watching you.' };
  if (pct >= 0.8)  return { emoji: '🎉', title: 'Almost Perfect!',        sub: 'You clearly stalked the website. Respect.' };
  if (pct >= 0.5)  return { emoji: '😅', title: 'Not Bad!',               sub: 'Half the team recognized you back.' };
  if (pct >= 0.25) return { emoji: '🤔', title: 'Room to Grow',           sub: 'At least you showed up. That counts for something.' };
  return               { emoji: '💀', title: 'Ouch.',                     sub: 'Maybe attend the event and meet them in person?' };
}

// ── WHO'S WHO GAME ────────────────────────────────────────────────
const WhoIsWhoGame = ({ members, onExit }) => {
  const [queue] = useState(() => [...members].sort(() => Math.random() - 0.5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [clueIdx, setClueIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(new Set());
  const [wrongId, setWrongId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const currentTarget = queue[currentIdx];

  const handleGuess = useCallback((memberId) => {
    if (!currentTarget || gameOver || revealed.has(memberId)) return;

    if (memberId === currentTarget.id) {
      const newRevealed = new Set(revealed);
      newRevealed.add(memberId);
      setRevealed(newRevealed);
      setScore(s => s + 1);
      const nextIdx = currentIdx + 1;
      if (nextIdx >= queue.length) {
        setTimeout(() => setGameOver(true), 800);
      } else {
        setTimeout(() => {
          setCurrentIdx(nextIdx);
          setClueIdx(0);
          setHintUsed(false);
        }, 700);
      }
    } else {
      setWrongId(memberId);
      const newLives = lives - 1;
      setLives(newLives);
      setTimeout(() => setWrongId(null), 450);
      if (newLives <= 0) {
        // Briefly reveal then end
        const newRevealed = new Set(revealed);
        newRevealed.add(currentTarget.id);
        setRevealed(newRevealed);
        setTimeout(() => setGameOver(true), 1200);
      }
    }
  }, [currentTarget, currentIdx, lives, queue, revealed, gameOver]);

  const handleNextClue = () => {
    if (!currentTarget) return;
    const max = currentTarget.clues.length - 1;
    if (clueIdx < max) {
      setClueIdx(c => c + 1);
      setHintUsed(true);
    }
  };

  const [restartKey, setRestartKey] = useState(0);
  const restartGame = () => setRestartKey(k => k + 1);

  const scoreMsg = getScoreMessage(score, members.length);

  // Game over
  if (gameOver) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-8 mb-16 bg-white rounded-[32px] border border-slate-200 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12)] p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-amber-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="text-6xl mb-3">{scoreMsg.emoji}</div>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">{scoreMsg.title}</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">{scoreMsg.sub}</p>
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-black text-slate-950">{score}</span>
            <span className="text-slate-400 font-bold text-lg">/ {members.length}</span>
          </div>
          <div className="flex gap-3 mt-8 justify-center">
            <button onClick={restartGame}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0070F2] hover:bg-blue-700 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm">
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <button onClick={onExit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-all border border-slate-200">
              <X className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div key={restartKey}>
      {/* ── GAME HUD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-7">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">

          {/* Clue box */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Clue {clueIdx + 1} of {currentTarget?.clues.length} 🕵️
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`${currentTarget?.id}-${clueIdx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-lg sm:text-xl font-black text-slate-950 leading-tight"
              >
                {currentTarget?.clues[clueIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Hint button */}
            <button
              onClick={handleNextClue}
              disabled={!currentTarget || clueIdx >= currentTarget.clues.length - 1}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Next Clue
            </button>

            {/* Lives */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={i === lives && lives < 3 ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-5 h-5 transition-all duration-300 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-200 fill-slate-200'}`} />
                </motion.div>
              ))}
            </div>

            {/* Score */}
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Score</p>
              <p className="text-xl font-black text-[#0070F2] leading-none">
                {score}<span className="text-xs text-slate-300 font-bold">/{members.length}</span>
              </p>
            </div>

            {/* Progress indicator */}
            <div className="text-center hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Left</p>
              <p className="text-xl font-black text-slate-600 leading-none">
                {members.length - score}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {members.map((member, index) => (
            <LuxuryTeamCard
              key={member.id}
              member={member}
              index={index}
              gameMode={true}
              isRevealed={revealed.has(member.id)}
              isWrong={wrongId === member.id}
              onClick={() => handleGuess(member.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── TEAM PAGE ─────────────────────────────────────────────────────
export default function TeamPage({ onNavigateHome }) {
  const [gameActive, setGameActive] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 selection:bg-[#FFD200] selection:text-slate-950 font-sans pb-28 relative overflow-hidden">

      {/* NAV */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 hover:bg-[#0070F2] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-200">
              <img src="/sap-logo-org.jpg" alt="SIT Kolkata 2026" className="w-7 h-7 rounded-lg object-contain border border-slate-200 shadow-2xs" />
              <span className="text-xs font-black tracking-wider text-slate-950">SIT KOLKATA 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {gameActive ? (
                <motion.button key="exit"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setGameActive(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs sm:text-sm font-bold transition-all hover:scale-105 cursor-pointer">
                  <X className="w-4 h-4" /> Exit Game
                </motion.button>
              ) : (
                <motion.button key="play"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setGameActive(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFD200] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
                  <Gamepad2 className="w-4 h-4" /> Play Who&apos;s Who?
                </motion.button>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-[#0070F2] border border-blue-200/70">
              <Sparkles className="w-3.5 h-3.5" /> ORGANIZING SQUAD
            </span>
          </div>
        </div>
      </header>

      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70rem] h-[32rem] bg-gradient-to-b from-blue-100/60 via-amber-100/40 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 premium-grid opacity-25 pointer-events-none" />

      <AnimatePresence mode="wait">
        {gameActive ? (
          /* ── GAME MODE ── */
          <motion.div key="game"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }} className="relative pt-8">
            <div className="text-center px-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD200]/20 border border-[#FFD200]/60 text-amber-900 text-xs font-black uppercase tracking-widest mb-3">
                <Gamepad2 className="w-4 h-4 text-amber-600" /> WHO&apos;S WHO?
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Read the clue. Find the person. 🕵️
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                All faces are hidden. Use the clue to figure out who it is — click their card. 3 lives, no peeking.
              </p>
            </div>
            <WhoIsWhoGame members={TEAM_MEMBERS} onExit={() => setGameActive(false)} />
          </motion.div>
        ) : (
          /* ── NORMAL MODE ── */
          <motion.div key="normal"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}>

            {/* Hero */}
            <section className="relative pt-14 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-900 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                SAP COMMUNITY KOLKATA
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                The Minds Behind <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F2] via-blue-700 to-amber-600">
                  SIT Kolkata 2026
                </span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Meet the community leaders, architects, and creators powering Eastern India's flagship
                SAP conference on November 14, 2026 at Sister Nivedita University.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-6">
                <button onClick={() => setGameActive(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD200] hover:bg-amber-400 text-slate-950 text-sm font-black shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer">
                  <Gamepad2 className="w-4 h-4" />
                  Think you know them all? Play Who&apos;s Who?
                </button>
              </motion.div>
            </section>

            {/* Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
                {TEAM_MEMBERS.map((member, index) => (
                  <LuxuryTeamCard
                    key={member.id}
                    member={member}
                    index={index}
                    gameMode={false}
                    isRevealed={false}
                    isWrong={false}
                    onClick={undefined}
                  />
                ))}
              </div>
            </section>

            {/* Bottom callout */}
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
                    <button onClick={onNavigateHome}
                      className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-[#0070F2] text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer">
                      Return to Conference Overview
                    </button>
                    <a href="mailto:info@sitkolkata.org"
                      className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all border border-slate-200/80 cursor-pointer">
                      Contact Organizers
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
