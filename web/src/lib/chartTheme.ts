// Centralized UNHCR Asylum Operations Color Architecture
// Multi-Dimensional Semantic System:
// 1. Volume Density: Luminous Cobalt Scale (Sequential Tier 1-5)
// 2. Operational Health: Solvency Tri-State (Teal Sustainable / Cobalt Warning / Amber Critical)
// 3. Legal Outcomes: Substantive Dispositions (Cobalt Refugee / Teal Comp / Slate Rejected / Amber Ghost)
// 4. Operating Jurisdiction: Decision Authority (Cobalt National Gov / Amber Joint System / Teal UNHCR Mandate)

export const SOVEREIGN_NAVY_SCALE = {
  tier1: "#1E40AF", // Dominant (>2M backlog - USA 3.71M): Deep Royal Cobalt Navy (White text)
  tier2: "#2563EB", // Heavy Queue (500k–2M - Egypt 878k, Peru 556k): Radiant Cobalt Sapphire (White text)
  tier3: "#3B82F6", // Mid-Tier (200k–500k - Canada, Germany, Spain, Italy): Steel Azure Blue (White text)
  tier4: "#60A5FA", // Regional (100k–200k - UK, Kenya, Mexico, Costa Rica): Luminous Sky Blue (Dark Slate text)
  tier5: "#93C5FD", // Emerging (<100k - Libya, Turkey, France, Brazil, Belgium): Ice Azure (Dark Slate text)
} as const;

export function getSovereignNavyShade(backlog: number): string {
  if (backlog >= 2000000) return SOVEREIGN_NAVY_SCALE.tier1;
  if (backlog >= 500000) return SOVEREIGN_NAVY_SCALE.tier2;
  if (backlog >= 200000) return SOVEREIGN_NAVY_SCALE.tier3;
  if (backlog >= 100000) return SOVEREIGN_NAVY_SCALE.tier4;
  return SOVEREIGN_NAVY_SCALE.tier5;
}

export function isSovereignNavyLight(backlog: number): boolean {
  return backlog < 200000;
}

export const CHART_PALETTE = [
  "#2563EB", // Color 1: Royal Sapphire (Dominant)
  "#0284C7", // Color 2: Electric Cyan / Sky Blue (Contrast)
  "#1D4ED8", // Color 3: Cobalt Sapphire
  "#3B82F6", // Color 4: Steel Blue
  "#60A5FA", // Color 5: Light Sky Blue
  "#1E3A8A", // Color 6: Deep Sovereign Navy
] as const;

export const CHART_MUTED = "#94A3B8"; // Slate 400 for neutral structural baselines

export const CHART_SEMANTICS = {
  // Operational Roles
  anchor: "#2563EB",      // Claims Intake, Sovereign Gov, Dominant (Radiant Sapphire)
  contrast: "#0284C7",    // Decisions Delivered, UNHCR Mandate, Outflow (Electric Cyan)
  depth: "#1D4ED8",       // Procedural depth, appeal levels
  muted: "#94A3B8",       // Baseline grids, unselected nodes
  subtle: "#64748B",      // Slate 500 for neutral secondary tracks

  // Status & Velocity (Operational Solvency Tri-State per SKILL.md)
  sustainable: "#0D9488", // >=100% CCR, <2 yrs horizon (Deep Teal - Solvency & Throughput)
  warning: "#2563EB",     // 70-99% CCR, 2-5 yrs horizon (Royal Cobalt Sapphire - Sub-replacement)
  critical: "#D97706",    // <70% CCR, >5 yrs horizon (Warm Amber - Critical Deficit / Stalled Queue)

  // Legal Dispositions (Multi-Dimensional Accessible Sequence per SKILL.md)
  refugee: "#2563EB",       // Radiant Cobalt Blue (1951 Geneva Convention Grants)
  complementary: "#0D9488", // Deep Teal (Complementary Protection / Temporary Stay)
  rejected: "#64748B",      // Slate Steel Charcoal (Formal Rejections)
  ghost: "#D97706",         // Muted Amber / Warm Ochre (Closed Without Decision / Procedural Attrition)

  // Decision Authority
  authorityGov: "#2563EB",    // National Government Adjudication (Cobalt Royal Blue)
  authorityShared: "#D97706", // Joint / Shared System (Warm Amber)
  authorityUnhcr: "#0D9488",  // UNHCR Mandate Adjudication (Deep Teal)

  // Geographic Regions (Harmonious Sovereign Blue Continuum)
  americas: "#1E3A8A",
  europe: "#0284C7",
  africaMena: "#2563EB",
  asiaPac: "#60A5FA",
} as const;

export const CHART_GRIDS = {
  light: "#E2E8F0", // Slate 200
  dark: "#334155",  // Slate 700
} as const;

export function getChartScheme(count: number, variant: "default" | "comparison" = "default"): string[] {
  if (count === 2 && variant === "comparison") {
    return [CHART_PALETTE[0], CHART_MUTED]; // Navy + Muted Slate
  }
  if (count === 2) {
    return [CHART_PALETTE[0], CHART_PALETTE[1]]; // Navy + Cyan
  }
  if (count === 3) {
    return [CHART_PALETTE[0], CHART_PALETTE[1], CHART_PALETTE[2]];
  }
  return CHART_PALETTE.slice(0, Math.min(count, CHART_PALETTE.length));
}
