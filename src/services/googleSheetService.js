import { FLEX_PASS_CONFIG } from '../config/flexPassConfig';

/**
 * Extracts a Google Sheet ID from a full URL or returns the clean ID.
 */
export function extractSheetId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  // Matches .../spreadsheets/d/<SHEET_ID>/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an alphanumeric ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Parses standard CSV text (RFC 4180 compliant) into rows of string arrays.
 */
export function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\r') {
        // ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Detects which column index contains the Attendee Name.
 */
function findNameColumnIndex(headerRow, explicitName) {
  if (!headerRow || headerRow.length === 0) return 0;

  if (explicitName) {
    const idx = headerRow.findIndex(
      (h) => h.toLowerCase().trim() === explicitName.toLowerCase().trim()
    );
    if (idx !== -1) return idx;
  }

  const nameKeywords = [
    'attendee name',
    'full name',
    'participant name',
    'delegate name',
    'first name',
    'student name',
    'name',
    'your name',
  ];

  for (const kw of nameKeywords) {
    const idx = headerRow.findIndex((h) => h.toLowerCase().trim().includes(kw));
    if (idx !== -1) return idx;
  }

  return 0; // Default to first column
}

/**
 * Detects optional Email or Ticket Type column index.
 */
function findAuxColumnIndex(headerRow, keywords) {
  if (!headerRow) return -1;
  for (const kw of keywords) {
    const idx = headerRow.findIndex((h) => h.toLowerCase().trim().includes(kw));
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Normalizes attendee name to Title Case for elegant presentation.
 */
export function formatName(name) {
  if (!name) return '';
  return name
    .trim()
    .replace(/[.]+$/, '')
    .split(/\s+/)
    .map((word) => {
      const cleanWord = word.replace(/^[.,\-]+|[.,\-]+$/g, '');
      if (!cleanWord) return '';
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Retrieves the configured Google Sheet ID directly from the code config.
 */
export function getActiveSheetId() {
  return (
    extractSheetId(FLEX_PASS_CONFIG.googleSheetUrl) ||
    extractSheetId(FLEX_PASS_CONFIG.googleSheetId) ||
    ''
  );
}

/**
 * Fetches and parses the live registered attendees list from Google Sheets.
 */
export async function fetchRegisteredAttendees() {
  const sheetId = getActiveSheetId();

  if (!sheetId) {
    return {
      source: 'unconfigured',
      sheetId: '',
      attendees: [],
      totalCount: 0,
      timestamp: new Date().toISOString(),
    };
  }

  const sheetParam = FLEX_PASS_CONFIG.sheetName
    ? `&sheet=${encodeURIComponent(FLEX_PASS_CONFIG.sheetName)}`
    : '';

  // Google Visualization API URL: works seamlessly with CORS and returns live data.
  // Explicitly passing headers=1 forces Google Sheets to treat row 1 as the single header row,
  // preventing it from mistakenly grouping attendee rows with only names into a multi-line header.
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1${sheetParam}&t=${Date.now()}`;

  try {
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: { Accept: 'text/csv' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Google Sheet request returned status ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (!rows || rows.length === 0) {
      return {
        source: 'empty',
        sheetId,
        attendees: [],
        totalCount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Determine header row and column mappings
    const headerRow = rows[0];
    const nameColIdx = findNameColumnIndex(headerRow, FLEX_PASS_CONFIG.nameColumn);
    const emailColIdx = findAuxColumnIndex(headerRow, ['email', 'e-mail', 'mail']);
    const ticketColIdx = findAuxColumnIndex(headerRow, ['ticket', 'type', 'category', 'pass']);

    const attendees = [];
    const seenNames = new Set();

    // Loop through data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let rawName = row[nameColIdx];

      // Fallback for partially filled rows where name might be in an adjacent cell
      if (!rawName || !rawName.trim()) {
        for (let c = 0; c < row.length; c++) {
          const val = (row[c] || '').trim();
          if (val && !val.includes('@') && isNaN(Number(val)) && !val.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
            rawName = val;
            break;
          }
        }
      }

      if (!rawName) continue;

      const cleanName = formatName(rawName);
      if (!cleanName || cleanName.length < 2) continue;

      const key = cleanName.toLowerCase();
      if (seenNames.has(key)) continue;
      seenNames.add(key);

      attendees.push({
        id: `att-${i}`,
        name: cleanName,
        email: emailColIdx !== -1 && row[emailColIdx] ? row[emailColIdx].trim() : '',
        ticketType: ticketColIdx !== -1 && row[ticketColIdx] && row[ticketColIdx].trim() ? row[ticketColIdx].trim() : 'Confirmed Pass',
      });
    }

    return {
      source: 'google-sheets',
      sheetId,
      attendees,
      totalCount: attendees.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Failed to load Google Sheet live data:', error);
    return {
      source: 'error',
      sheetId,
      error: error.message,
      attendees: [],
      totalCount: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Searches attendees with intelligent fuzzy matching.
 */
export function searchAttendees(attendees, rawQuery) {
  if (!rawQuery || !rawQuery.trim() || !Array.isArray(attendees)) return [];
  const query = rawQuery.trim().toLowerCase();

  return attendees
    .map((att) => {
      const name = att.name.toLowerCase();
      const email = (att.email || '').toLowerCase();

      let score = 0;
      if (name === query) score = 100;
      else if (name.startsWith(query)) score = 80;
      else if (name.includes(query)) score = 60;
      else if (email && (email === query || email.includes(query))) score = 50;
      else {
        // Match individual words / names
        const queryTokens = query.split(/\s+/);
        const nameTokens = name.split(/\s+/);
        const allMatched = queryTokens.every((token) =>
          nameTokens.some((nT) => nT.includes(token))
        );
        if (allMatched) score = 40;
      }

      return { ...att, score };
    })
    .filter((att) => att.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
