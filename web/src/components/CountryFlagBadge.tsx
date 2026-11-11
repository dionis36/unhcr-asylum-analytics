"use client";

import React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

// Comprehensive ISO 3166-1 alpha-3 to alpha-2 translation table
export const ISO3_TO_ISO2: Record<string, string> = {
  // Americas
  USA: "US", CAN: "CA", MEX: "MX", CRI: "CR", PAN: "PA", GTM: "GT", HND: "HN", SLV: "SV",
  NIC: "NI", HTI: "HT", DOM: "DO", CUB: "CU", JAM: "JM", TTO: "TT", BHS: "BS", BRB: "BB",
  PER: "PE", COL: "CO", BRA: "BR", CHL: "CL", ARG: "AR", ECU: "EC", VEN: "VE", BOL: "BO",
  PRY: "PY", URY: "UY", GUY: "GY", SUR: "SR", BLZ: "BZ",
  // Europe
  DEU: "DE", FRA: "FR", ESP: "ES", GBR: "GB", ITA: "IT", GRC: "GR", NLD: "NL", AUT: "AT",
  CHE: "CH", SWE: "SE", NOR: "NO", POL: "PL", HUN: "HU", BEL: "BE", CYP: "CY", IRL: "IE",
  FIN: "FI", ROU: "RO", DNK: "DK", PRT: "PT", CZE: "CZ", SVK: "SK", BGR: "BG", HRV: "HR",
  SVN: "SI", LTU: "LT", LVA: "LV", EST: "EE", LUX: "LU", MLT: "MT", ISL: "IS", ALB: "AL",
  BIH: "BA", MKD: "MK", MNE: "ME", SRB: "RS", UKR: "UA", BLR: "BY", MDA: "MD", RUS: "RU",
  // Middle East & North Africa
  TUR: "TR", JOR: "JO", LBN: "LB", IRQ: "IQ", SAU: "SA", ARE: "AE", ISR: "IL", KWT: "KW",
  QAT: "QA", OMN: "OM", BHR: "BH", YEM: "YE", SYR: "SY", PSE: "PS", IRN: "IR",
  EGY: "EG", MAR: "MA", DZC: "DZ", TUN: "TN", LBY: "LY", SDN: "SD", SSD: "SS",
  // Sub-Saharan Africa
  ZAF: "ZA", KEN: "KE", UGA: "UG", ETH: "ET", RWA: "RW", NGA: "NG", GHA: "GH", CMR: "CM",
  TCD: "TD", SEN: "SN", COD: "CD", COG: "CG", AGO: "AO", MOZ: "MZ", ZWE: "ZW", ZMB: "ZM",
  MWI: "MW", TZA: "TZ", BDI: "BI", SOM: "SO", ERI: "ER", DJI: "DJ", GIN: "GN", MLI: "ML",
  BFA: "BF", NER: "NE", CIV: "CI", LBR: "LR", SLE: "SL", GMB: "GM", GNB: "GW", MRT: "MR",
  TGO: "TG", BEN: "BJ", GAB: "GA", GNQ: "GQ", CAF: "CF", MDG: "MG", MUS: "MU", SYC: "SC",
  COM: "KM", CPV: "CV", STP: "ST", NAM: "NA", BWA: "BW", LSO: "LS", SWZ: "SZ",
  // Asia-Pacific & South Asia
  PAK: "PK", IND: "IN", BGD: "BD", MYS: "MY", IDN: "ID", THA: "TH", JPN: "JP", KOR: "KR",
  PRK: "KP", AUS: "AU", NZL: "NZ", PHL: "PH", LKA: "LK", VNM: "VN", MMR: "MM", KHM: "KH",
  LAO: "LA", SGP: "SG", CHN: "CN", TWN: "TW", HKG: "HK", MNG: "MN", AFG: "AF", NPL: "NP",
  BTN: "BT", MDV: "MV", KAZ: "KZ", UZB: "UZ", TKM: "TM", KGZ: "KG", TJK: "TJ", GEO: "GE",
  ARM: "AM", AZE: "AZ", PNG: "PG", FJI: "FJ", SLB: "SB", VUT: "VU", WSM: "WS", TON: "TO",
};

interface CountryFlagBadgeProps {
  iso?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_STYLES = {
  xs: "w-3.5 h-[9px]",
  sm: "w-4 h-[11px]",
  md: "w-5 h-[14px]",
  lg: "w-6 h-[17px]",
  xl: "w-7 h-[20px]",
};

export function CountryFlagBadge({
  iso = "",
  name = "",
  size = "md",
  className,
}: CountryFlagBadgeProps) {
  const cleanIso = iso.trim().toUpperCase();

  // Guard against non-country keywords or empty ISOs
  if (!cleanIso || cleanIso === "ALL" || cleanIso === "GLOBAL" || cleanIso === "TOTAL") {
    return null;
  }

  // Resolve 2-letter ISO code strictly via translation table or standard 2-letter code
  const iso2 =
    cleanIso.length === 2
      ? cleanIso
      : ISO3_TO_ISO2[cleanIso] || "";

  // Retrieve SVG Flag Component from country-flag-icons
  const FlagComponent = iso2 ? (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iso2] : null;

  if (!FlagComponent) {
    // Only show fallback pill for legitimate 2 or 3-letter ISO codes
    if (cleanIso.length !== 2 && cleanIso.length !== 3) {
      return null;
    }
    return (
      <span
        title={name || cleanIso}
        className={cn(
          "inline-flex items-center justify-center font-bold text-[9px] uppercase tracking-tighter bg-muted text-muted-foreground border border-border/80 rounded-[2px] shrink-0 aspect-[3/2]",
          SIZE_STYLES[size],
          className
        )}
      >
        {cleanIso}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] border border-border/60 shadow-2xs aspect-[3/2]",
        SIZE_STYLES[size],
        className
      )}
      title={name || cleanIso}
    >
      <FlagComponent className="w-full h-full object-cover" />
    </span>
  );
}
export default CountryFlagBadge;
