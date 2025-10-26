// ────────────────────────────────────────────────────────────────────
// In-memory seed (MVP)
// ────────────────────────────────────────────────────────────────────

export type InvRec = {
  stock: number;
  preferredSupplier: string;
  alts: string[];
};

export const INVENTORY: Record<string, InvRec> = {
  // Laptops
  "LPT-13": { stock: 0, preferredSupplier: "SUP-ACME", alts: ["LPT-14"] }, // OOS, drives substitution
  "LPT-14": { stock: 18, preferredSupplier: "SUP-ACME", alts: [] },
  "LPT-15": { stock: 6, preferredSupplier: "SUP-OMEGA", alts: ["LPT-14"] },

  // Monitors
  "MON-27": { stock: 7, preferredSupplier: "SUP-VIEW", alts: ["MON-27P"] },
  "MON-27P": { stock: 2, preferredSupplier: "SUP-VIEW", alts: [] },

  // Peripherals / SW
  "KB-ENG": { stock: 100, preferredSupplier: "SUP-KEYS", alts: [] },
  "MS-PRM": { stock: 50, preferredSupplier: "SUP-SOFT", alts: [] },

  // Video gear (used to test per-item cap in CC-MKT)
  "CAM-4K": { stock: 1, preferredSupplier: "SUP-PIX", alts: ["CAM-4KP"] },
  "CAM-4KP": { stock: 3, preferredSupplier: "SUP-PIX", alts: [] },

  // Furniture
  "CHAIR-ERG": {
    stock: 8,
    preferredSupplier: "SUP-FURN",
    alts: ["CHAIR-ERG-PRO"],
  },
  "CHAIR-ERG-PRO": { stock: 4, preferredSupplier: "SUP-FURN", alts: [] },
};

export const SUBS_PRIORITY: Record<string, string[]> = {
  "LPT-13": ["LPT-14", "LPT-15"],
  "MON-27": ["MON-27P"],
  "CAM-4K": ["CAM-4KP"],
  "CHAIR-ERG": ["CHAIR-ERG-PRO"],
};
