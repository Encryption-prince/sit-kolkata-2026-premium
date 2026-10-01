/**
 * Configuration for SIT Kolkata 2026 Flex Pass Google Sheet Integration.
 * 
 * Simply paste your Google Sheet URL or ID below.
 * Make sure the sheet is shared as "Anyone with the link can view".
 */

export const FLEX_PASS_CONFIG = {
  // PASTE YOUR GOOGLE SHEET URL OR SHEET ID HERE:
  // Example: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
  googleSheetUrl: '',
  googleSheetId: '',

  // Optional: Tab name if not using the first sheet (e.g. "Registrations" or "Sheet1")
  sheetName: '',

  // Optional: Specific header title for attendee name (auto-detected if blank)
  // e.g. "Name", "Attendee Name", "Full Name", "Participant Name"
  nameColumn: '',

  // Auto-sync polling interval in seconds (no manual button click needed)
  autoSyncIntervalSeconds: 30,

  // Social Share Pre-crafted Template
  socialShareText: (name) => 
    `Excited to announce that I'm attending SAP Inside Track Kolkata 2026 (SIT Kolkata) on 14 Nov 2026 at Sister Nivedita University! 🚀\n\nLooking forward to diving into SAP Business AI, SAP BTP, and networking with Eastern India's top enterprise tech community.\n\nGrab your ticket & generate your flex pass at sitkolkata.in! 👇\n#SITKolkata2026 #SAPInsideTrack #SAPCommunity #KolkataTech #SAPBTP #GenAI`,
};
