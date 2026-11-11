"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import dynamic from "next/dynamic";
import { CountryProfile, MigrationCorridor } from "@/types";
import { formatNumber, formatPercent, cn } from "@/lib/utils";
import { Globe, Building2, Gauge, Minimize2 } from "lucide-react";
import { CHART_SEMANTICS, SOVEREIGN_NAVY_SCALE } from "@/lib/chartTheme";
import { CountryFlagBadge } from "./CountryFlagBadge";
import { SearchableSelect, SelectOption } from "./SearchableSelect";
import { GLOBAL_CONTINENT_LOOKUP } from "@/lib/worldGeoRegistry";

// Dynamically import WorldMapCanvas with ssr: false for client-side MapLibre GL
const WorldMapCanvas = dynamic(() => import("./WorldMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[580px] 2xl:h-[720px] w-full items-center justify-center text-xs text-muted-foreground rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center gap-2.5">
        <div className="h-6 w-6 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

const CONTINENT_MAP: Record<string, string> = GLOBAL_CONTINENT_LOOKUP;


type MetricView = "backlog" | "ccr" | "years" | "authority";

interface ViewGlobalMapProps {
  countries: CountryProfile[];
  corridors?: MigrationCorridor[];
}

export function ViewGlobalMap({ countries, corridors = [] }: ViewGlobalMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricView>("backlog");
  const [selectedContinent, setSelectedContinent] = useState<string>("ALL");
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth < 1024 && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const countryMap = useMemo(() => new Map(countries.map((c) => [c.country_iso, c])), [countries]);
  const activeCountry = hoveredIso ? countryMap.get(hoveredIso) : null;

  const topOriginsForActiveCountry = useMemo(() => {
    if (!hoveredIso || !corridors || corridors.length === 0) return [];
    return corridors
      .filter((c) => c.country_asylum_iso === hoveredIso)
      .sort((a, b) => b.applications_filed_est - a.applications_filed_est)
      .slice(0, 3);
  }, [hoveredIso, corridors]);

  // Country options for unified SearchableSelect
  const countrySelectOptions: SelectOption[] = useMemo(() => {
    return countries
      .filter((c) => c.pending_backlog_latest > 0 || c.cases_decided > 0)
      .sort((a, b) => b.pending_backlog_latest - a.pending_backlog_latest)
      .map((c) => ({
        value: c.country_iso,
        label: c.country_name,
        iso: c.country_iso,
        subLabel: c.country_iso,
        badge: formatNumber(c.pending_backlog_latest),
      }));
  }, [countries]);

  // Seamless interactive regional filter handler (clicking active toggles back to ALL)
  const handleContinentChange = (continent: string) => {
    const nextContinent = selectedContinent === continent ? "ALL" : continent;
    setSelectedContinent(nextContinent);

    if (nextContinent !== "ALL") {
      const currentCountryContinent = hoveredIso ? CONTINENT_MAP[hoveredIso] : null;
      const isMatch =
        nextContinent === "Africa & Middle East"
          ? currentCountryContinent === "Africa" || currentCountryContinent === "Middle East"
          : currentCountryContinent === nextContinent;

      if (!isMatch) {
        const topInContinent = countries
          .filter((c) => {
            const cont = CONTINENT_MAP[c.country_iso] || "Other";
            return nextContinent === "Africa & Middle East"
              ? cont === "Africa" || cont === "Middle East"
              : cont === nextContinent;
          })
          .sort((a, b) => b.pending_backlog_latest - a.pending_backlog_latest)[0];
        if (topInContinent) {
          startTransition(() => {
            setHoveredIso(topInContinent.country_iso);
          });
        }
      }
    }
  };

  const handleCountryChange = (iso: string) => {
    if (!iso) return;
    setHoveredIso(iso);
    const countryContinent = CONTINENT_MAP[iso];
    // If country is outside active continent filter, reset filter to ALL so user has immediate visibility
    if (countryContinent && selectedContinent !== "ALL") {
      const isMatch =
        selectedContinent === "Africa & Middle East"
          ? countryContinent === "Africa" || countryContinent === "Middle East"
          : countryContinent === selectedContinent;
      if (!isMatch) {
        setSelectedContinent("ALL");
      }
    }
  };

  // Filter available countries based on active continent
  const availableCountries = useMemo(() => {
    let list = countries.filter((c) => c.pending_backlog_latest > 0);
    if (selectedContinent !== "ALL") {
      list = list.filter((c) => {
        const cont = CONTINENT_MAP[c.country_iso] || "Other";
        if (selectedContinent === "Africa & Middle East") {
          return cont === "Africa" || cont === "Middle East";
        }
        return cont === selectedContinent;
      });
    }
    return list.sort((a, b) => b.pending_backlog_latest - a.pending_backlog_latest).slice(0, 50);
  }, [countries, selectedContinent]);

  const totalGlobalBacklog = useMemo(
    () => countries.reduce((acc, c) => acc + c.pending_backlog_latest, 0) || 1,
    [countries]
  );

  // Dynamic 5-Region Aggregate Deck (Reactive to selectedMetric lens)
  const regionalCards = useMemo(() => {
    const raw: Record<
      string,
      {
        label: string;
        backlog: number;
        filed: number;
        decided: number;
        count: number;
        ytcSum: number;
        ytcCount: number;
        govDec: number;
        unhcrDec: number;
        totalDec: number;
      }
    > = {
      ALL: { label: "Global (All)", backlog: 0, filed: 0, decided: 0, count: 0, ytcSum: 0, ytcCount: 0, govDec: 0, unhcrDec: 0, totalDec: 0 },
      Americas: { label: "Americas", backlog: 0, filed: 0, decided: 0, count: 0, ytcSum: 0, ytcCount: 0, govDec: 0, unhcrDec: 0, totalDec: 0 },
      "Africa & Middle East": { label: "Africa & Middle East", backlog: 0, filed: 0, decided: 0, count: 0, ytcSum: 0, ytcCount: 0, govDec: 0, unhcrDec: 0, totalDec: 0 },
      Europe: { label: "Europe", backlog: 0, filed: 0, decided: 0, count: 0, ytcSum: 0, ytcCount: 0, govDec: 0, unhcrDec: 0, totalDec: 0 },
      "Asia-Pacific": { label: "Asia-Pacific", backlog: 0, filed: 0, decided: 0, count: 0, ytcSum: 0, ytcCount: 0, govDec: 0, unhcrDec: 0, totalDec: 0 },
    };

    countries.forEach((c) => {
      const cont = CONTINENT_MAP[c.country_iso] || "Other";
      const regKey =
        cont === "Americas" ? "Americas" :
        cont === "Africa" || cont === "Middle East" ? "Africa & Middle East" :
        cont === "Europe" ? "Europe" :
        cont === "Asia-Pacific" ? "Asia-Pacific" : null;

      // Accumulate global
      raw.ALL.backlog += c.pending_backlog_latest;
      raw.ALL.filed += c.applications_filed_est;
      raw.ALL.decided += c.cases_decided;
      raw.ALL.count += 1;
      if (c.years_to_clear > 0 && c.years_to_clear < 100) {
        raw.ALL.ytcSum += c.years_to_clear;
        raw.ALL.ytcCount += 1;
      }
      const gov = c.authority_split["Government"] || 0;
      const unhcr = c.authority_split["UNHCR"] || 0;
      raw.ALL.govDec += gov;
      raw.ALL.unhcrDec += unhcr;
      raw.ALL.totalDec += c.cases_decided;

      // Accumulate region
      if (regKey && raw[regKey]) {
        raw[regKey].backlog += c.pending_backlog_latest;
        raw[regKey].filed += c.applications_filed_est;
        raw[regKey].decided += c.cases_decided;
        raw[regKey].count += 1;
        if (c.years_to_clear > 0 && c.years_to_clear < 100) {
          raw[regKey].ytcSum += c.years_to_clear;
          raw[regKey].ytcCount += 1;
        }
        raw[regKey].govDec += gov;
        raw[regKey].unhcrDec += unhcr;
        raw[regKey].totalDec += c.cases_decided;
      }
    });

    const totalBacklog = raw.ALL.backlog || 1;

    return Object.keys(raw).map((key) => {
      const item = raw[key];
      const backlogPct = key === "ALL" ? "100%" : `${((item.backlog / totalBacklog) * 100).toFixed(1)}%`;
      const ccrVal = item.filed > 0 ? (item.decided / item.filed) * 100 : 0;
      const ccrText = `${ccrVal.toFixed(1)}%`;
      const avgYtc = item.ytcCount > 0 ? item.ytcSum / item.ytcCount : 0;
      const ytcText = `${avgYtc.toFixed(1)} yrs`;
      const govShare = item.totalDec > 0 ? Math.round((item.govDec / item.totalDec) * 100) : 100;
      const unhcrShare = item.totalDec > 0 ? Math.round((item.unhcrDec / item.totalDec) * 100) : 0;
      const govStatus = govShare >= 80 ? "State-Led" : govShare <= 20 ? "UNHCR-Led" : "Joint";
      const govText = `${govShare}% Government`;
      const unhcrText = `${unhcrShare}% UNHCR`;

      let dotColor: string | null = null;
      if (key === "Americas") dotColor = CHART_SEMANTICS.americas;
      else if (key === "Africa & Middle East") dotColor = CHART_SEMANTICS.africaMena;
      else if (key === "Europe") dotColor = CHART_SEMANTICS.europe;
      else if (key === "Asia-Pacific") dotColor = CHART_SEMANTICS.asiaPac;

      return {
        key,
        label: item.label,
        count: item.count,
        dotColor,
        backlog: item.backlog,
        backlogPct,
        ccrVal,
        ccrText,
        avgYtc,
        ytcText,
        govStatus,
        govText,
        unhcrText,
      };
    });
  }, [countries]);

  return (
    <div
      className={cn(
        isFullscreen
          ? "fixed inset-0 z-50 bg-background p-4 sm:p-5 lg:p-6 flex flex-col gap-3.5 sm:gap-4 h-screen w-screen overflow-hidden"
          : "space-y-4"
      )}
    >
      {/* Interactive Regional Caseload & Metric Lens Strip (5-Column Deck) */}
      {!isFullscreen && (
        <div className="flex overflow-x-auto pb-1 gap-2.5 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          {regionalCards.map((r) => {
            const isActive = selectedContinent === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleContinentChange(r.key)}
                className={cn(
                  "min-w-[145px] shrink-0 sm:min-w-0 sm:shrink rounded-xl border p-3 text-left transition-all shadow-xs flex flex-col justify-between gap-2 focus:outline-hidden",
                  isActive
                    ? "border-foreground/40 bg-accent/60 shadow-xs ring-1 ring-border"
                    : "border-border bg-card hover:bg-muted/50 hover:border-border/80 text-muted-foreground hover:text-foreground"
                )}
                title={
                  isActive
                    ? `Active filter: ${r.label}. Click to reset to Global view.`
                    : `Filter map to ${r.label}`
                }
              >
                {/* Header: Label, Dot/Icon, and Metric Pill */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {r.dotColor ? (
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.dotColor }} />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-foreground truncate">{r.label}</span>
                  </div>

                  {/* Contextual Metric Pill */}
                  {selectedMetric === "backlog" && (
                    <span
                      className={cn(
                        "text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0",
                        isActive ? "bg-background text-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {r.backlogPct}
                    </span>
                  )}
                  {selectedMetric === "ccr" && (
                    <span
                      className={cn(
                        "text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0",
                        isActive ? "bg-background text-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {r.ccrText}
                    </span>
                  )}
                  {selectedMetric === "years" && (
                    <span
                      className={cn(
                        "text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0",
                        isActive ? "bg-background text-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {r.ytcText}
                    </span>
                  )}
                  {selectedMetric === "authority" && (
                    <span
                      className={cn(
                        "text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0",
                        isActive ? "bg-background text-foreground shadow-2xs" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {r.govStatus}
                    </span>
                  )}
                </div>

                {/* Primary Metric Display */}
                <div>
                  {selectedMetric === "backlog" && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                        {formatNumber(r.backlog)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">cases</span>
                    </div>
                  )}
                  {selectedMetric === "ccr" && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                        {r.ccrText}
                      </span>
                      <span className="text-[11px] text-muted-foreground">clearance pace</span>
                    </div>
                  )}
                  {selectedMetric === "years" && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                        {r.ytcText}
                      </span>
                      <span className="text-[11px] text-muted-foreground">avg horizon</span>
                    </div>
                  )}
                  {selectedMetric === "authority" && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                        {r.govText}
                      </span>
                      <span className="text-[11px] text-muted-foreground">({r.unhcrText} mandate)</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Control Toolbar: Metric Lens on Left, Legend & Country Search on Right */}
      <div className="rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3 shrink-0">
        {/* Left: Metric Lens Selector */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/50 p-1 text-xs font-medium self-start xl:self-auto shrink-0 max-w-full overflow-x-auto">
          {(
            [
              { id: "backlog", label: "Pending Backlog" },
              { id: "ccr", label: "Clearance Rate" },
              { id: "years", label: "Years to Clear" },
              { id: "authority", label: "Decision Authority" },
            ] as const
          ).map((m) => {
            const isActive = selectedMetric === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMetric(m.id)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-xs font-medium transition-all duration-150 select-none cursor-pointer whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Right: Dynamic Legend and Searchable Country Combobox */}
        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 sm:gap-4">
          {/* Dynamic Semantic Metric Legend */}
          <div className="flex items-center text-xs text-muted-foreground">
            {selectedMetric === "backlog" && (
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier1 }} />
                  &gt;2M Dominant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier2 }} />
                  500k–2M Heavy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier3 }} />
                  200k–500k Mid
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier4 }} />
                  100k–200k Regional
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier5 }} />
                  &lt;100k Emerging
                </span>
              </div>
            )}

            {selectedMetric === "ccr" && (
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.sustainable }} />
                  ≥100% Sustainable Pace
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.warning }} />
                  70–99% Sub-Replacement
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.critical }} />
                  &lt;70% Stalled Deficit
                </span>
              </div>
            )}

            {selectedMetric === "years" && (
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.sustainable }} />
                  &lt;2 yrs Fast Runway
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.warning }} />
                  2–5 yrs Warning
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.critical }} />
                  &gt;5 yrs Severe Logjam
                </span>
              </div>
            )}

            {selectedMetric === "authority" && (
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.authorityGov }} />
                  National Government
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.authorityShared }} />
                  Joint System
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.authorityUnhcr }} />
                  UNHCR Mandate
                </span>
              </div>
            )}
          </div>

          {/* Searchable Country Combobox */}
          <SearchableSelect
            value={hoveredIso || ""}
            onChange={handleCountryChange}
            options={countrySelectOptions}
            showFlag={true}
            placeholder="Search country..."
            searchPlaceholder="Search country or ISO (e.g. USA, Peru)..."
            className="w-56 sm:w-64"
            menuClassName="w-80"
          />

          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
              title="Exit full screen (Esc)"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit Full Screen</span>
            </button>
          )}
        </div>
      </div>

      {/* Master-Detail 75/25 Split Screen Layout */}
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-12 gap-4 2xl:gap-6",
          isFullscreen ? "flex-1 min-h-0 h-full" : ""
        )}
      >
        {/* Left Column: Interactive Map Canvas (75% Width) */}
        <div className={cn("lg:col-span-9 relative", isFullscreen ? "h-full" : "")}>
          <WorldMapCanvas
            countries={countries}
            selectedMetric={selectedMetric}
            selectedContinent={selectedContinent}
            hoveredIso={hoveredIso}
            setHoveredIso={setHoveredIso}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) return;
              setIsFullscreen(!isFullscreen);
            }}
            onResetZoom={() => setSelectedContinent("ALL")}
          />
        </div>

        {/* Right Column: Docked Sovereign Country Dossier (25% Width) */}
        <div
          className={cn(
            "lg:col-span-3 rounded-xl border border-border bg-card p-4 2xl:p-5 shadow-xs flex flex-col justify-between overflow-y-auto space-y-3.5",
            isFullscreen ? "h-full min-h-0" : "h-auto lg:h-[580px] 2xl:h-[720px]"
          )}
        >
          {activeCountry ? (() => {
            const ccr = activeCountry.total_clearance_rate_pct || 0;
            const annualDecisions = Math.round(activeCountry.recent_annual_decisions || 0);
            const required3YrRate = activeCountry.pending_backlog_latest > 0 ? Math.round(activeCountry.pending_backlog_latest / 3) : 0;
            const totalStageCount = Object.values(activeCountry.court_stages || {}).reduce((acc, v) => acc + v, 0);

            // Clearance Horizon with Stalled division-by-zero safeguard
            const ytcDisplay = annualDecisions <= 0
              ? (activeCountry.pending_backlog_latest > 0 ? "Stalled" : "0 yrs")
              : (activeCountry.years_to_clear > 50 ? ">50 yrs" : `${activeCountry.years_to_clear.toFixed(1)} yrs`);

            let velocityStatusLabel = "Sustainable Pace";
            let velocityStatusStyle = "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border-teal-500/20";
            let runwayFillColor: string = CHART_SEMANTICS.sustainable;

            if (annualDecisions <= 0 && activeCountry.pending_backlog_latest > 0) {
              velocityStatusLabel = "Decisions Stalled";
              velocityStatusStyle = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20";
              runwayFillColor = CHART_SEMANTICS.critical;
            } else if (ccr < 70) {
              velocityStatusLabel = "Severe Deficit";
              velocityStatusStyle = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-500/20";
              runwayFillColor = CHART_SEMANTICS.critical;
            } else if (ccr < 100) {
              velocityStatusLabel = "Behind Inflow";
              velocityStatusStyle = "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-500/20";
              runwayFillColor = CHART_SEMANTICS.warning;
            }

            return (
              <>
                {/* Sovereign Country Header */}
                <div className="pb-2.5 border-b border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CountryFlagBadge
                        iso={activeCountry.country_iso}
                        name={activeCountry.country_name}
                        size="md"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight truncate">
                           {activeCountry.country_name}
                        </h3>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block truncate">
                          {activeCountry.country_iso} • {CONTINENT_MAP[activeCountry.country_iso] || "Sovereign State"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 shrink-0 tabular-nums">
                      {((activeCountry.pending_backlog_latest / totalGlobalBacklog) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 4 Core KPI Scorecard Tiles (2x2 Compact Grid) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/30 p-2.5">
                    <span className="text-xs text-muted-foreground block truncate">Active Backlog</span>
                    <span className="text-base sm:text-lg font-extrabold tabular-nums text-foreground block mt-0.5">
                      {formatNumber(activeCountry.pending_backlog_latest)}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">pending claims</span>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-2.5">
                    <span className="text-xs text-muted-foreground block truncate">Clearance Rate</span>
                    <span className="text-base sm:text-lg font-extrabold tabular-nums text-foreground block mt-0.5">
                      {formatPercent(activeCountry.total_clearance_rate_pct)}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">16-year average</span>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-2.5">
                    <span className="text-xs text-muted-foreground block truncate">Years to Clear</span>
                    <span className="text-base sm:text-lg font-extrabold tabular-nums text-foreground block mt-0.5">
                      {ytcDisplay}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">at current pace</span>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-2.5">
                    <span className="text-xs text-muted-foreground block truncate">Annual Decisions</span>
                    <span className="text-base sm:text-lg font-extrabold tabular-nums text-foreground block mt-0.5">
                      {formatNumber(annualDecisions)}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">decisions per year</span>
                  </div>
                </div>

                {/* Operational Run-Rate Velocity (Continuous Metric Runway) */}
                <div className="pt-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Clearance Pace</span>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${velocityStatusStyle}`}>
                      {velocityStatusLabel}
                    </span>
                  </div>

                  {/* Linear Continuous Progress Runway with 100% Target Reference */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>0%</span>
                      <span className="tabular-nums font-semibold text-foreground">
                        {formatPercent(ccr)} CCR
                      </span>
                      <span>100% (Matching Inflow)</span>
                    </div>

                    {/* Continuous Track with 100% Target Reference */}
                    <div className="relative h-2 w-full rounded-full bg-muted/80 overflow-hidden">
                      {/* 100% Replacement Benchmark Reference Tick (at 66.7% of 150% scale) */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10"
                        style={{ left: "66.7%" }}
                        title="100% Replacement Benchmark"
                      />
                      {/* Dynamic Active Fill Bar */}
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, (ccr / 150) * 100))}%`,
                          backgroundColor: runwayFillColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Velocity Comparison Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border/40 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Annual Decisions</span>
                      <span className="font-bold tabular-nums text-foreground">{formatNumber(annualDecisions)}/yr</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">3-Yr Target</span>
                      <span className="font-bold tabular-nums text-foreground">{formatNumber(required3YrRate)}/yr</span>
                    </div>
                  </div>
                </div>

                {/* Sovereign Authority Mandate Split */}
                <div className="pt-3 border-t border-border/50 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">Decision Authority</span>
                    {(() => {
                      const totalDec = activeCountry.cases_decided || 1;
                      const gov = activeCountry.authority_split["Government"] || 0;
                      const unhcr = activeCountry.authority_split["UNHCR"] || 0;
                      const govPct = Math.round((gov / totalDec) * 100);
                      const unhcrPct = Math.round((unhcr / totalDec) * 100);
                      return (
                        <span className="text-muted-foreground tabular-nums text-[11px] font-medium">
                          Government {govPct}% / UNHCR {unhcrPct}%
                        </span>
                      );
                    })()}
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
                    {(() => {
                      const totalDec = activeCountry.cases_decided || 1;
                      const gov = activeCountry.authority_split["Government"] || 0;
                      const govPct = Math.min(100, Math.round((gov / totalDec) * 100));
                      return (
                        <>
                          <div style={{ backgroundColor: CHART_SEMANTICS.authorityGov, width: `${govPct}%` }} className="transition-all duration-300 ease-out" />
                          <div style={{ backgroundColor: CHART_SEMANTICS.authorityUnhcr, width: `${100 - govPct}%` }} className="transition-all duration-300 ease-out" />
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {activeCountry.authority_split["UNHCR"] && !activeCountry.authority_split["Government"]
                      ? "UNHCR delegated status determination mandate."
                      : activeCountry.authority_split["UNHCR"] && activeCountry.authority_split["Government"]
                      ? "Joint / shared operational responsibility."
                      : "National government adjudication under domestic law."}
                  </p>
                </div>

                {/* Procedural Stages Inventory with Proportional Progress Bars */}
                <div className="pt-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Administrative Stages</span>
                    <span className="text-muted-foreground tabular-nums text-[11px] font-medium">
                      {formatNumber(totalStageCount)} cases
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.keys(activeCountry.court_stages || {}).length > 0 ? (
                      Object.entries(activeCountry.court_stages).map(([stage, count]) => {
                        let label = stage;
                        if (stage === "IN") label = "USCIS Affirmative (IN)";
                        if (stage === "EO") label = "EOIR Immigration Court (EO)";
                        if (stage === "NA") label = "First-Instance Admin (NA)";
                        if (stage === "FI") label = "First Instance (FI)";
                        if (stage === "FA") label = "First Appeal (FA)";
                        if (stage === "TA") label = "Tribunal Appeal (TA)";
                        if (stage === "JR") label = "Judicial Review (JR)";
                        if (stage === "RA") label = "Repeat Application (RA)";

                        const stagePct = totalStageCount > 0 ? (count / totalStageCount) * 100 : 0;

                        return (
                          <div key={stage} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground truncate">{label}</span>
                              <span className="font-semibold text-foreground ml-2 shrink-0 tabular-nums">
                                {formatNumber(count)} <span className="text-muted-foreground font-normal">({stagePct.toFixed(1)}%)</span>
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300 ease-out"
                                style={{
                                  width: `${stagePct}%`,
                                  backgroundColor: stage === "EO" || stage === "JR" || stage === "FA"
                                    ? CHART_SEMANTICS.anchor
                                    : CHART_SEMANTICS.contrast,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1">
                        <Building2 className="h-3.5 w-3.5 opacity-40 shrink-0" />
                        <span>Direct administrative single-stage</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Origin Caseloads for Selected Host Country */}
                {topOriginsForActiveCountry.length > 0 && (
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <span className="text-xs font-semibold text-foreground">Top Origin Caseloads</span>
                    <div className="space-y-1.5">
                      {topOriginsForActiveCountry.map((orig) => (
                        <div key={orig.country_origin_iso} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CountryFlagBadge iso={orig.country_origin_iso} name={orig.country_origin} size="xs" />
                            <span className="text-muted-foreground truncate">{orig.country_origin}</span>
                          </div>
                          <span className="font-semibold text-foreground ml-2 shrink-0 tabular-nums">
                            {formatNumber(orig.applications_filed_est)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground">
              <Globe className="h-8 w-8 mb-2 opacity-30" />
              <span>Select or click any sovereign nation on the map to inspect its operational profile.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
