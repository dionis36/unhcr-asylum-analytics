"use client";

import { useState, useMemo } from "react";
import { MigrationCorridor } from "@/types";
import { formatNumber, formatPercent, cn } from "@/lib/utils";
import { Search, Route, Filter, ArrowUpDown, GitFork, Scale } from "lucide-react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { CHART_SEMANTICS } from "@/lib/chartTheme";
import { CountryFlagBadge } from "./CountryFlagBadge";
import { SearchableSelect, SelectOption } from "./SearchableSelect";

interface ViewCorridorsProps {
  corridors: MigrationCorridor[];
}

export function cleanCountryLabel(name: string): string {
  if (name.includes("Serbia and Kosovo") || name.includes("S/RES/1244")) return "Serbia and Kosovo";
  if (name.includes("Venezuela")) return "Venezuela";
  if (name.includes("Syrian")) return "Syria";
  if (name.includes("Russian")) return "Russia";
  if (name.includes("United States of America")) return "United States";
  if (name.includes("Democratic Republic of the Congo") || name.includes("Dem. Rep. of the Congo")) return "DR Congo";
  if (name.includes("Central African Rep.")) return "Central African Rep.";
  if (name.includes("Iran")) return "Iran";
  if (name.includes("Bolivia")) return "Bolivia";
  if (name.includes("United Kingdom")) return "United Kingdom";
  if (name.includes("Tanzania")) return "Tanzania";
  if (name.includes("Netherlands")) return "Netherlands";
  if (name.includes("Hong Kong")) return "Hong Kong";
  return name;
}

export function ViewCorridors({ corridors }: ViewCorridorsProps) {
  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState("ALL");
  const [sortField, setSortField] = useState<keyof MigrationCorridor>("applications_filed_est");
  const [sortAsc, setSortAsc] = useState(false);

  const origins = Array.from(new Set(corridors.map((c) => c.country_origin))).sort();

  // Origin to ISO lookup map for flag rendering
  const originIsoMap = useMemo(() => {
    const map: Record<string, string> = {};
    corridors.forEach((c) => {
      if (c.country_origin && c.country_origin_iso) {
        map[c.country_origin] = c.country_origin_iso;
      }
    });
    return map;
  }, [corridors]);

  const multiDestinationOrigins = useMemo(() => {
    const counts: Record<string, number> = {};
    corridors.forEach((c) => {
      counts[c.country_origin] = (counts[c.country_origin] || 0) + 1;
    });
    return Object.keys(counts)
      .filter((orig) => counts[orig] >= 2)
      .sort((a, b) => {
        if (a.includes("Venezuela")) return -1;
        if (b.includes("Venezuela")) return 1;
        return a.localeCompare(b);
      });
  }, [corridors]);

  const multiDestinationOriginOptions: SelectOption[] = useMemo(() => {
    return multiDestinationOrigins.map((orig) => ({
      value: orig,
      label: cleanCountryLabel(orig),
      iso: originIsoMap[orig],
    }));
  }, [multiDestinationOrigins, originIsoMap]);

  const originFilterOptions: SelectOption[] = useMemo(() => {
    const allOption: SelectOption = {
      value: "ALL",
      label: `All Origins (${origins.length} Nationalities in Major Routes)`,
    };
    const list = origins.map((o) => ({
      value: o,
      label: cleanCountryLabel(o),
      iso: originIsoMap[o],
    }));
    return [allOption, ...list];
  }, [origins, originIsoMap]);

  const [selectedDisparityOrigin, setSelectedDisparityOrigin] = useState<string>(() => {
    const ven = corridors.find((c) => c.country_origin.includes("Venezuela"));
    return ven ? ven.country_origin : (corridors[0]?.country_origin || "");
  });

  const disparityCorridors = useMemo(() => {
    return corridors
      .filter((c) => c.country_origin === selectedDisparityOrigin)
      .sort((a, b) => b.applications_filed_est - a.applications_filed_est)
      .slice(0, 4);
  }, [corridors, selectedDisparityOrigin]);

  const filtered = corridors
    .filter((c) => {
      const matchesSearch =
        c.country_origin.toLowerCase().includes(search.toLowerCase()) ||
        c.country_asylum.toLowerCase().includes(search.toLowerCase()) ||
        c.country_origin_iso.toLowerCase().includes(search.toLowerCase()) ||
        c.country_asylum_iso.toLowerCase().includes(search.toLowerCase());
      const matchesOrigin = originFilter === "ALL" || c.country_origin === originFilter;
      return matchesSearch && matchesOrigin;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = (field: keyof MigrationCorridor) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Top 10 bilateral corridors for Sankey flow
  const topCorridors = [...corridors]
    .sort((a, b) => b.applications_filed_est - a.applications_filed_est)
    .slice(0, 10);

  const originNames = Array.from(new Set(topCorridors.map((c) => c.country_origin)));
  const hostNames = Array.from(new Set(topCorridors.map((c) => c.country_asylum)));

  // Distinct origin palette for visual flow separation
  const ORIGIN_FLOW_PALETTE = [
    "#0284c7", // Sky
    "#6366f1", // Indigo
    "#0d9488", // Teal
    "#d97706", // Amber
    "#e11d48", // Rose
    "#059669", // Emerald
    "#8b5cf6", // Violet
    "#ea580c", // Orange
    "#0891b2", // Cyan
    "#4f46e5", // Deep Indigo
  ];

  const originColorMap = new Map(
    originNames.map((name, i) => [name, ORIGIN_FLOW_PALETTE[i % ORIGIN_FLOW_PALETTE.length]])
  );

  const sankeyNodes = [
    ...originNames.map((name) => ({
      name,
      displayName: cleanCountryLabel(name),
      color: originColorMap.get(name) || "#0284c7",
      isOrigin: true,
    })),
    ...hostNames.map((name) => ({
      name,
      displayName: cleanCountryLabel(name),
      color: "#2563eb",
      isOrigin: false,
    })),
  ];

  const sankeyLinks = topCorridors.map((c) => ({
    source: originNames.indexOf(c.country_origin),
    target: originNames.length + hostNames.indexOf(c.country_asylum),
    value: Math.round(c.applications_filed_est),
    color: originColorMap.get(c.country_origin) || "#0284c7",
    originName: c.country_origin,
    hostName: c.country_asylum,
  }));

  const sankeyData = {
    nodes: sankeyNodes,
    links: sankeyLinks,
  };

  return (
    <div className="space-y-6">
      {/* Route Disparity Insight Banner */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 shadow-xs flex items-start gap-3">
        <Route className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          <p>
            <span className="font-semibold text-foreground">Top 100 Migration Routes (≥5,000 claims, 2010–2025):</span> Applicants from the same origin country face very different legal outcomes depending on the destination country.
          </p>
          <p className="text-muted-foreground text-xs">
            For example, Venezuelan applicants in Spain receive legal protection in over 95% of cases (mostly temporary humanitarian status), while the same applicants in other destination countries face much higher rejection or closure rates.
          </p>
        </div>
      </div>

      {/* Sankey Flow Card */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 2xl:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Top Migration Routes</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Volume of claims flowing from origin countries (left) to destination countries (right).
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Origin Countries
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Destination Countries
            </span>
          </div>
        </div>

        <div className="h-[300px] sm:h-[340px] 2xl:h-[400px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              nodePadding={14}
              margin={{ top: 10, right: 86, bottom: 10, left: 74 }}
              link={(linkProps: any) => {
                const { sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload } = linkProps;
                const strokeColor = payload?.color || "#0284c7";
                return (
                  <path
                    d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={Math.max(linkWidth, 2)}
                    strokeOpacity={0.35}
                    className="transition-opacity duration-150 hover:stroke-opacity-80"
                  />
                );
              }}
              node={({ x, y, width, height, index, payload }) => {
                const isOrigin = payload.isOrigin ?? (index < originNames.length);
                const nodeColor = payload.color || (isOrigin ? "#0284c7" : "#2563eb");
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={nodeColor}
                      rx={3}
                    />
                    <text
                      x={isOrigin ? x - 8 : x + width + 8}
                      y={y + height / 2}
                      textAnchor={isOrigin ? "end" : "start"}
                      fill="hsl(var(--foreground))"
                      fontSize={11}
                      fontWeight={600}
                      alignmentBaseline="middle"
                    >
                      {payload.displayName || payload.name}
                    </text>
                  </g>
                );
              }}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    // Recharts Sankey wraps link and node props in item.payload.
                    // The underlying data row resides on item.payload?.payload or item.payload.
                    const d = item.payload?.payload || item.payload;
                    const isLink = Boolean(
                      d?.originName ||
                      d?.hostName ||
                      (d?.source !== undefined && d?.target !== undefined)
                    );

                    let title = "";
                    if (isLink) {
                      const origin = d?.originName || (typeof d?.source === "object" ? d?.source?.name : "") || "";
                      const host = d?.hostName || (typeof d?.target === "object" ? d?.target?.name : "") || "";
                      const cleanOrigin = origin ? cleanCountryLabel(origin) : "";
                      const cleanHost = host ? cleanCountryLabel(host) : "";
                      title = cleanOrigin && cleanHost
                        ? `${cleanOrigin} → ${cleanHost}`
                        : (item.name ? String(item.name).replace(" - ", " → ") : "");
                    } else {
                      title = d?.displayName || d?.name || (item.name ? String(item.name) : "");
                    }

                    const metricLabel = isLink ? "Claims Filed:" : "Total Claims:";
                    const metricValue = item.value ?? d?.value ?? 0;

                    return (
                      <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs space-y-1 min-w-[170px]">
                        {title ? (
                          <div className="font-semibold text-foreground border-b border-border pb-1">
                            {title}
                          </div>
                        ) : null}
                        <div className="text-muted-foreground flex justify-between gap-3 pt-0.5">
                          <span>{metricLabel}</span>
                          <span className="font-bold text-foreground tabular-nums">
                            {formatNumber(Number(metricValue))}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Border Outcome Comparison */}
      <div className="rounded-xl border border-border bg-card p-6 2xl:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Cross-Border Outcome Comparison
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Compare how applicants from the same country of origin receive different legal decisions depending on which country decides their claim.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <span className="text-xs font-semibold text-foreground shrink-0">Origin Country:</span>
            <SearchableSelect
              value={selectedDisparityOrigin}
              onChange={setSelectedDisparityOrigin}
              options={multiDestinationOriginOptions}
              showFlag={true}
              searchPlaceholder="Search origin country..."
              className="w-64 sm:w-72 bg-background hover:bg-accent/40 border-border hover:border-foreground/40 font-medium shadow-xs"
              menuClassName="w-72"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.refugee }} />
            Refugee Status (1951 Convention)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.complementary }} />
            Temporary / Humanitarian Stay
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.ghost }} />
            Closed Without Decision
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.rejected }} />
            Rejected
          </span>
        </div>

        {/* Grid of Destination Comparators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {disparityCorridors.map((c) => {
            const genevaPct = c.refugee_grant_rate_pct;
            const compPct = Math.max(0, c.total_protection_rate_pct - c.refugee_grant_rate_pct);
            const ghostPct = c.ghost_rate_pct;
            const rejectedPct = Math.max(0, 100 - c.total_protection_rate_pct - c.ghost_rate_pct);

            return (
              <div
                key={c.country_asylum_iso}
                className="rounded-lg border border-border/80 bg-muted/20 p-4 flex flex-col justify-between space-y-4 hover:border-border hover:bg-muted/30 transition-all duration-150"
              >
                <div>
                  {/* Host Country & Volume */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CountryFlagBadge iso={c.country_asylum_iso} name={c.country_asylum} size="sm" />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-foreground truncate">
                          {cleanCountryLabel(c.country_asylum)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium tracking-wide">
                          {c.country_asylum_iso}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold tabular-nums text-foreground">
                        {formatNumber(c.applications_filed_est)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">claims filed</div>
                    </div>
                  </div>

                  {/* Stacked Decision Breakdown Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">Outcome Breakdown</span>
                      <span className="text-foreground font-semibold tabular-nums">
                        {c.total_protection_rate_pct.toFixed(1)}% Prot.
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                      {genevaPct > 0 && (
                        <div
                          style={{ width: `${genevaPct}%`, backgroundColor: CHART_SEMANTICS.refugee }}
                          title={`Geneva Grant: ${genevaPct.toFixed(1)}%`}
                          className="h-full transition-all duration-300 ease-out"
                        />
                      )}
                      {compPct > 0 && (
                        <div
                          style={{ width: `${compPct}%`, backgroundColor: CHART_SEMANTICS.complementary }}
                          title={`Complementary Protection: ${compPct.toFixed(1)}%`}
                          className="h-full transition-all duration-300 ease-out"
                        />
                      )}
                      {ghostPct > 0 && (
                        <div
                          style={{ width: `${ghostPct}%`, backgroundColor: CHART_SEMANTICS.ghost }}
                          title={`Closed Without Decision: ${ghostPct.toFixed(1)}%`}
                          className="h-full transition-all duration-300 ease-out"
                        />
                      )}
                      {rejectedPct > 0 && (
                        <div
                          style={{ width: `${rejectedPct}%`, backgroundColor: CHART_SEMANTICS.rejected }}
                          title={`Formal Rejection: ${rejectedPct.toFixed(1)}%`}
                          className="h-full transition-all duration-300 ease-out"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Granular Breakdown Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Total Protection
                    </span>
                    <span className="font-bold text-foreground tabular-nums text-xs">
                      {c.total_protection_rate_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate tabular-nums">
                      {genevaPct.toFixed(1)}% Geneva • {compPct.toFixed(1)}% Comp
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Closed W/o Decision
                    </span>
                    <span className="font-bold text-foreground tabular-nums text-xs">
                      {c.ghost_rate_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate tabular-nums">
                      {formatNumber(c.closed_without_decision)} cases
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Rejection Rate
                    </span>
                    <span className="font-bold text-foreground tabular-nums text-xs">
                      {rejectedPct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate tabular-nums">
                      {formatNumber(c.cases_rejected)} cases
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Clearance Rate
                    </span>
                    <span className="font-bold text-foreground tabular-nums text-xs">
                      {c.clearance_rate_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {c.clearance_rate_pct >= 100 ? "Sustainable" : "Deficit"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytical takeaway */}
        <p className="text-xs text-foreground/80 leading-relaxed pt-1">
          * Note: Differences reflect national laws and court standards. For example, Spain grants temporary humanitarian stay to most Venezuelan applicants (Article 37bis), whereas the United States requires individual courtroom hearings, resulting in very different protection and closure rates.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search route, origin, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <SearchableSelect
            value={originFilter}
            onChange={setOriginFilter}
            options={originFilterOptions}
            showFlag={true}
            searchPlaceholder="Filter by origin..."
            className="w-64 sm:w-72"
            menuClassName="w-80"
          />
        </div>
      </div>

      {/* Dense Data Table matching shadcn-admin */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th
                  onClick={() => handleSort("country_origin")}
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-foreground sticky left-0 bg-muted z-20 shadow-[1px_0_0_0_hsl(var(--border))] w-36 sm:w-44 min-w-[144px] max-w-[176px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Origin</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("country_asylum")}
                  className="cursor-pointer px-4 py-3 font-semibold hover:text-foreground w-36 sm:w-44 min-w-[144px] max-w-[176px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Destination</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("applications_filed_est")}
                  className="cursor-pointer px-4 py-3 text-right font-semibold hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Claims Filed</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("cases_decided")}
                  className="cursor-pointer px-4 py-3 text-right font-semibold hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Decisions</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("clearance_rate_pct")}
                  className="cursor-pointer px-4 py-3 text-right font-semibold hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Clearance Rate</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("refugee_grant_rate_pct")}
                  className="cursor-pointer px-4 py-3 text-right font-semibold hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Refugee Grant %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("total_protection_rate_pct")}
                  className="cursor-pointer px-4 py-3 text-right font-semibold hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Protection %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ghost_rate_pct")}
                  className="cursor-pointer px-4 py-3 text-right font-semibold hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Closed W/o Decision</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs tabular-nums">
              {filtered.map((row) => (
                <tr
                  key={`${row.country_origin_iso}-${row.country_asylum_iso}`}
                  className="transition-colors duration-150 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground sticky left-0 bg-card z-10 shadow-[1px_0_0_0_hsl(var(--border))] w-36 sm:w-44 min-w-[144px] max-w-[176px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <CountryFlagBadge iso={row.country_origin_iso} name={row.country_origin} size="sm" />
                      <span className="truncate">{cleanCountryLabel(row.country_origin)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground w-36 sm:w-44 min-w-[144px] max-w-[176px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <CountryFlagBadge iso={row.country_asylum_iso} name={row.country_asylum} size="sm" />
                      <span className="truncate">{cleanCountryLabel(row.country_asylum)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {formatNumber(row.applications_filed_est)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatNumber(row.cases_decided)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span
                      className={
                        row.clearance_rate_pct >= 100
                          ? "text-teal-600 dark:text-teal-400 font-semibold"
                          : row.clearance_rate_pct >= 70
                          ? "text-blue-600 dark:text-sky-400 font-semibold"
                          : "text-amber-600 dark:text-amber-400 font-semibold"
                      }
                    >
                      {formatPercent(row.clearance_rate_pct)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {formatPercent(row.refugee_grant_rate_pct)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatPercent(row.total_protection_rate_pct)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        row.ghost_rate_pct >= 50
                          ? "text-amber-600 dark:text-amber-400 font-bold"
                          : "text-muted-foreground"
                      }
                    >
                      {formatPercent(row.ghost_rate_pct)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {corridors.length} major bilateral migration corridors (≥5,000 claims)</span>
          <span>UNHCR Asylum Operations Database (2010–2025)</span>
        </div>
      </div>
    </div>
  );
}
