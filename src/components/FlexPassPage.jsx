import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  X,
  Linkedin,
  Twitter,
  MessageCircle,
  Ticket,
  ShieldCheck,
  Calendar,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  fetchRegisteredAttendees,
  searchAttendees,
  getActiveSheetId,
} from '../services/googleSheetService';
import { FLEX_PASS_CONFIG } from '../config/flexPassConfig';

export default function FlexPassPage({ onNavigateHome }) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [matchedResults, setMatchedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetSource, setSheetSource] = useState('loading');
  const [sheetError, setSheetError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [ticketRendered, setTicketRendered] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Canvas Refs
  const canvasRef = useRef(null);
  const templateImgRef = useRef(null);
  const searchInputRef = useRef(null);
  const lastFetchTimestamp = useRef(0);

  // Fetch attendees from Google Sheet (Silent background refresh supported)
  const syncAttendees = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setSheetError(null);

    try {
      const data = await fetchRegisteredAttendees();
      setAttendeesList(data.attendees || []);
      setSheetSource(data.source);
      setLastSyncTime(new Date());
      lastFetchTimestamp.current = Date.now();

      if (data.error) setSheetError(data.error);

      // If user had selected someone, update their object if still present
      setSelectedAttendee((prev) => {
        if (!prev) return null;
        const found = (data.attendees || []).find(
          (a) => a.name.toLowerCase() === prev.name.toLowerCase()
        );
        return found || prev;
      });
    } catch (err) {
      console.error('Error auto-syncing attendees:', err);
      setSheetError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // 1. Initial load
  useEffect(() => {
    syncAttendees(false);
  }, [syncAttendees]);

  // 2. AUTOMATIC LIVE SYNC:
  // - Polls in background every 30 seconds (no refresh button click required!)
  // - Auto-refreshes when user returns/focuses back to the tab
  useEffect(() => {
    const intervalSeconds = FLEX_PASS_CONFIG.autoSyncIntervalSeconds || 30;
    const intervalId = setInterval(() => {
      syncAttendees(true);
    }, intervalSeconds * 1000);

    const handleWindowFocus = () => {
      // If user switches back to tab after buying ticket on Konfhub, auto-sync immediately
      if (Date.now() - lastFetchTimestamp.current > 10000) {
        syncAttendees(true);
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [syncAttendees]);

  // Handle live search matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchedResults([]);
      return;
    }
    const results = searchAttendees(attendeesList, searchQuery);
    setMatchedResults(results);

    // If exact single match found
    if (results.length === 1 && results[0].score >= 80) {
      if (!selectedAttendee || selectedAttendee.name !== results[0].name) {
        setSelectedAttendee(results[0]);
      }
    }
  }, [searchQuery, attendeesList, selectedAttendee]);

  // Render high-res ticket onto HTML5 Canvas
  const drawTicket = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ultra-HD Master Resolution: 5529 x 1966
    const TARGET_WIDTH = 5529;
    const TARGET_HEIGHT = 1966;

    if (canvas.width !== TARGET_WIDTH) canvas.width = TARGET_WIDTH;
    if (canvas.height !== TARGET_HEIGHT) canvas.height = TARGET_HEIGHT;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const renderAttendeeOnImage = (img) => {
      // 1. Draw base Ultra-HD template
      ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      const attendeeName = selectedAttendee ? selectedAttendee.name : 'Your Name Here';

      // 2. Exact coordinate calibration for Attendee Name
      const textX = 4522;
      const textY = 595;
      const maxTextWidth = 860;

      // 3. Dynamic font size calculation to guarantee perfect fit for any name length
      let fontSize = 76;
      ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

      let measuredWidth = ctx.measureText(attendeeName).width;
      while (measuredWidth > maxTextWidth && fontSize > 36) {
        fontSize -= 2;
        ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        measuredWidth = ctx.measureText(attendeeName).width;
      }

      // 4. Draw attendee text with rich charcoal contrast
      ctx.fillStyle = selectedAttendee ? '#0F172A' : '#94A3B8';
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.letterSpacing = '-0.015em';
      ctx.fillText(attendeeName, textX, textY);

      setTicketRendered(true);
    };

    if (templateImgRef.current && templateImgRef.current.complete) {
      renderAttendeeOnImage(templateImgRef.current);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/SIT KOL 26 Boarding Pass-new.png';
      img.onload = () => {
        templateImgRef.current = img;
        renderAttendeeOnImage(img);
      };
    }
  }, [selectedAttendee]);

  // Re-draw whenever selectedAttendee changes and ensure custom fonts are loaded
  useEffect(() => {
    drawTicket();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawTicket();
      });
    }
  }, [drawTicket, selectedAttendee]);

  // Download Action
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedAttendee) return;

    setDownloading(true);
    try {
      const nameSlug = selectedAttendee.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `SIT-Kolkata-2026-FlexTicket-${nameSlug}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // Copy Social Caption
  const handleCopyCaption = () => {
    const text = FLEX_PASS_CONFIG.socialShareText(
      selectedAttendee ? selectedAttendee.name : 'SIT Kolkata Attendee'
    );
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Social Share Handlers
  const handleShareLinkedIn = () => {
    const caption = encodeURIComponent(
      FLEX_PASS_CONFIG.socialShareText(selectedAttendee?.name || 'Attendee')
    );
    const url = encodeURIComponent('https://www.sitkolkata.in/flex-pass');
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${caption}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Excited to attend SAP Inside Track Kolkata 2026 (SIT Kolkata) on 14 Nov 2026 at Sister Nivedita University! 🚀\n\nGrab your flex ticket at https://www.sitkolkata.in/flex-pass\n#SITKolkata2026 #SAPInsideTrack #SAPCommunity`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `I just generated my official Flex Ticket for SAP Inside Track Kolkata 2026! 🎉\n\nCheck yours here: https://www.sitkolkata.in/flex-pass`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const hasConfiguredSheet = Boolean(getActiveSheetId());

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 selection:bg-yellow-300 selection:text-slate-950 font-sans pb-20">
      {/* ── TOP NAV BAR ── */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-100 text-slate-700 hover:text-slate-950 text-xs sm:text-sm font-bold border border-slate-200 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src="/sap-logo-org.jpg"
                alt="SIT Kolkata 2026 Logo"
                className="w-7 h-7 rounded-lg object-contain border border-slate-200"
              />
              <span className="text-xs font-black tracking-wide text-slate-900">
                SIT KOLKATA 2026
              </span>
            </div>
          </div>

          {/* Automatic Live Sync Badge (No refresh button click needed) */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                hasConfiguredSheet
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-stone-100 text-slate-600 border border-stone-200'
              }`}
              title={
                hasConfiguredSheet
                  ? `Google Sheet auto-sync active (${attendeesList.length} registered attendees loaded). Auto-refreshes every 30s.`
                  : 'Google Sheet link can be added in src/config/flexPassConfig.js'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasConfiguredSheet ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>
                {hasConfiguredSheet ? 'Live Sync Active' : 'Connecting to Sheet...'}
              </span>
              {hasConfiguredSheet && attendeesList.length > 0 && (
                <span className="text-emerald-700 font-mono">({attendeesList.length})</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-900 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>OFFICIAL SOCIAL FLEX PASS GENERATOR</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
          Claim &amp; Flex Your <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0070F2] via-blue-600 to-amber-500">
            SIT Kolkata 2026 Ticket
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Registered for SAP Inside Track Kolkata 2026? Search your name below to download your
          customized high-definition boarding pass ready for LinkedIn, X, and Instagram!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0070F2]" />
            <span>14 November 2026</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#0070F2]" />
            <span>Sister Nivedita University</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Community Pass</span>
          </div>
        </div>
      </section>

      {/* ── SEARCH & VERIFICATION CONTAINER ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-stone-200">
          <div className="max-w-2xl mx-auto">
            <label
              htmlFor="attendee-search"
              className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-2"
            >
              Search Your Registered Name:
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="attendee-search"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => {
                  // If last sync was more than 15s ago, do a silent background sync on search focus
                  if (Date.now() - lastFetchTimestamp.current > 15000) {
                    syncAttendees(true);
                  }
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type your name (e.g. Subhamoy Bhattacharya, Rahul Sharma)..."
                className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-stone-50 border border-stone-200 text-slate-900 text-sm sm:text-base font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#0070F2] focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAttendee(null);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* When sheet is not yet linked in code */}
            {!hasConfiguredSheet && (
              <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Google Sheet Setup Notice</span>
                </div>
                <p className="mt-1 text-blue-800 leading-relaxed">
                  Please paste your Google Sheet link in <code>src/config/flexPassConfig.js</code>.
                  Once provided, all registered attendees will sync here in real time automatically!
                </p>
              </div>
            )}

            {/* Autocomplete / Multiple Matches Dropdown */}
            {searchQuery.trim().length > 1 && matchedResults.length > 0 && (
              <div className="mt-3 bg-stone-50 rounded-2xl p-2 border border-stone-200 shadow-md max-h-56 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-500 px-3 py-1 uppercase tracking-wider">
                  Matching Registrations ({matchedResults.length}):
                </div>
                {matchedResults.map((att) => (
                  <button
                    key={att.id + att.name}
                    onClick={() => {
                      setSelectedAttendee(att);
                      setSearchQuery(att.name);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                      selectedAttendee?.name === att.name
                        ? 'bg-[#0070F2] text-white'
                        : 'text-slate-800 hover:bg-stone-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          selectedAttendee?.name === att.name ? 'text-white' : 'text-emerald-600'
                        }`}
                      />
                      <span>{att.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        selectedAttendee?.name === att.name
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-200 text-slate-600 font-mono text-[11px]'
                      }`}
                    >
                      {att.ticketType || 'Confirmed'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Not Found Warning */}
            {hasConfiguredSheet &&
              searchQuery.trim().length >= 3 &&
              matchedResults.length === 0 &&
              !loading && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      No registration found matching &ldquo;{searchQuery}&rdquo;
                    </div>
                    <div className="mt-1 text-amber-800 leading-relaxed">
                      Please check the spelling or try searching your First Name only. If you just
                      booked your ticket on Konfhub, please allow ~30 seconds for automatic sheet
                      synchronization.
                    </div>
                    <div className="mt-3">
                      <a
                        href="https://konfhub.com/sap-inside-track-kolkata-2026"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-extrabold text-[#0070F2] hover:underline"
                      >
                        <span>Haven&apos;t booked your ticket yet? Book here on Konfhub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

            {/* Verified Badge */}
            {selectedAttendee && (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Registration Confirmed
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900">
                      {selectedAttendee.name}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Ready to Download
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TICKET CANVAS PREVIEW & DOWNLOAD ACTIONS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#0070F2] flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                <span>Live Flex Ticket Preview</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
                Your Official Boarding Pass
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={downloading || !selectedAttendee}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-[#0070F2] text-white px-6 py-3 rounded-full font-extrabold text-sm sm:text-base shadow-lg shadow-slate-900/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                <span>
                  {downloading
                    ? 'Preparing PNG...'
                    : selectedAttendee
                    ? 'Download Flex Ticket (HD PNG)'
                    : 'Search & Select Your Name to Download'}
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas Render */}
          <div className="relative my-6 rounded-2xl overflow-hidden shadow-2xl border border-stone-300/80 bg-stone-100 group">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block select-none pointer-events-none"
              style={{ aspectRatio: '5529 / 1966' }}
            />

            {!ticketRendered && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100/90 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0070F2]" />
                  <span>Loading ticket template...</span>
                </div>
              </div>
            )}
          </div>

          {/* ── SOCIAL SHARE BUTTONS ── */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 mt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-[#0070F2]" />
                  <span>Flex Your Ticket on Social Media</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Tag <strong className="text-slate-900 font-bold">@sitkolkata</strong> on Instagram &amp; LinkedIn with <span className="text-[#0070F2] font-semibold">#SITKolkata2026</span>!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleShareLinkedIn}
                  disabled={!selectedAttendee}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={handleShareTwitter}
                  disabled={!selectedAttendee}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Twitter className="w-4 h-4" />
                  <span>X (Twitter)</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  disabled={!selectedAttendee}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyCaption}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300 shadow-sm transition-all active:scale-95"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied Post!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS STEPS ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-12">
        <h2 className="text-center font-black text-2xl sm:text-3xl text-slate-950 mb-8">
          How to Flex Your Pass in 3 Steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              title: 'Book Your Ticket',
              desc: 'Register for SAP Inside Track Kolkata 2026. Your details automatically sync to our live roster.',
              link: 'https://konfhub.com/sap-inside-track-kolkata-2026',
              linkText: 'Book Ticket →',
            },
            {
              step: '02',
              title: 'Search & Preview',
              desc: 'Search your registered name above. Our system automatically verifies your entry and prepares your boarding pass.',
              linkText: 'Search Above ↑',
              action: () => searchInputRef.current?.focus(),
            },
            {
              step: '03',
              title: 'Download & Flex',
              desc: 'Download your high-resolution ticket PNG and flex on LinkedIn, Twitter, and WhatsApp groups with #SITKolkata2026!',
              linkText: 'Download Ticket ↓',
              action: handleDownload,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="font-bebas text-3xl text-amber-500 tracking-wider">
                  {item.step}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0070F2] hover:underline"
                  >
                    {item.linkText}
                  </a>
                ) : (
                  <button
                    onClick={item.action}
                    className="text-xs font-bold text-[#0070F2] hover:underline"
                  >
                    {item.linkText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
