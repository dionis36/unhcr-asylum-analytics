"use client";

import { GlobalKPIs, TimelineTrend, CountryProfile } from "@/types";
import { formatNumber, formatPercent, formatCompact } from "@/lib/utils";
import { CHART_SEMANTICS } from "@/lib/chartTheme";
import { CountryFlagBadge } from "./CountryFlagBadge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FileX2,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface ViewDueProcessProps {
  kpis: GlobalKPIs | null;
  trends: TimelineTrend[];
  countries: CountryProfile[];
}

export function ViewDueProcess({ kpis, trends, countries }: ViewDueProcessProps) {
  if (!kpis) return null;

  // 100% stacked outcome share
  const outcomeShareTrend = trends.map((t) => ({
    year: String(t.year),
    refugee: t.refugee_share_pct,
    temp_protection: t.temp_protection_share_pct,
    rejected: t.rejection_share_pct,
    ghost_cases: t.ghost_rate_pct,
  }));

  // Top Ghost Rate outliers with > 100k decisions
  const ghostOutliers = countries
    .filter((c) => c.cases_decided >= 100000)
    .sort((a, b) => b.ghost_rate_pct - a.ghost_rate_pct)
    .slice(0, 5);

  const spain = countries.find((c) => c.country_iso === "ESP");
  const germany = countries.find((c) => c.country_iso === "DEU");

  const spainRefugee = spain?.refugee_grant_rate_pct ?? 0;
  const spainComp = spain ? Math.max(0, spain.total_protection_rate_pct - spain.refugee_grant_rate_pct) : 0;
  const germanyRefugee = germany?.refugee_grant_rate_pct ?? 0;
  const germanyComp = germany ? Math.max(0, germany.total_protection_rate_pct - germany.refugee_grant_rate_pct) : 0;

  const totalDeterminations =
    kpis.refugee_grants +
    kpis.temporary_protection +
    kpis.cases_rejected +
    kpis.closed_without_decision;

  // 4 Legal Dispositions mapped strictly to Monochromatic Cool-Tonal Sequence
  const dispositionDonutData = [
    {
      name: "Closed Without Decision",
      value: kpis.closed_without_decision,
      pct: totalDeterminations > 0 ? (kpis.closed_without_decision / totalDeterminations) * 100 : 0,
      color: CHART_SEMANTICS.ghost,
    },
    {
      name: "Formal Rejection",
      value: kpis.cases_rejected,
      pct: totalDeterminations > 0 ? (kpis.cases_rejected / totalDeterminations) * 100 : 0,
      color: CHART_SEMANTICS.rejected,
    },
    {
      name: "Geneva Refugee",
      value: kpis.refugee_grants,
      pct: totalDeterminations > 0 ? (kpis.refugee_grants / totalDeterminations) * 100 : 0,
      color: CHART_SEMANTICS.refugee,
    },
    {
      name: "Complementary Stay",
      value: kpis.temporary_protection,
      pct: totalDeterminations > 0 ? (kpis.temporary_protection / totalDeterminations) * 100 : 0,
      color: CHART_SEMANTICS.complementary,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Card Universal Disposition Ribbon: 2x2 on Mobile, 4x1 on Large Displays */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 2xl:gap-6">
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Closed W/o Decision</span>
              <FileX2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.closed_without_decision)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.closed_without_decision)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            {formatPercent(kpis.ghost_rate_pct)} closed without ruling
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Rejected Claims</span>
              <ShieldAlert className="h-4 w-4 shrink-0 text-slate-500" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.cases_rejected)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.cases_rejected)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            {formatPercent(totalDeterminations > 0 ? (kpis.cases_rejected / totalDeterminations) * 100 : 0)} rejected
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Refugee Grants</span>
              <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.refugee_grants)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.refugee_grants)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            {formatPercent(totalDeterminations > 0 ? (kpis.refugee_grants / totalDeterminations) * 100 : 0)} full refugee status
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Temporary Protection</span>
              <AlertCircle className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.temporary_protection)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.temporary_protection)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            {formatPercent(totalDeterminations > 0 ? (kpis.temporary_protection / totalDeterminations) * 100 : 0)} humanitarian stay
          </p>
        </div>
      </div>

      {/* Due Process Finding Callout */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 shadow-xs flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          Globally, {formatPercent(kpis.ghost_rate_pct)} of all resolved asylum claims ({formatNumber(kpis.closed_without_decision)} cases) were closed without deciding on protection, mostly through administrative closures, case withdrawals, or procedural dismissals. In countries like Peru (92.4%) and Hungary (90.0%), administrative closures account for the vast majority of closed files.
        </p>
      </div>

      {/* 1. Decision Breakdown Over Time (Full Width) */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 2xl:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Decision Breakdown Over Time (2010–2025)</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Annual percentage breakdown across the four decision types: refugee status, temporary stay, rejection, and closed cases (2010–2025).
            </p>
          </div>
          {/* Custom High-Fidelity Pill Indicators */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-xs font-medium text-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_SEMANTICS.refugee }} />
              <span>Refugee</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-xs font-medium text-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_SEMANTICS.complementary }} />
              <span>Temporary</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-xs font-medium text-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_SEMANTICS.rejected }} />
              <span>Rejection</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/60 text-xs font-medium text-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_SEMANTICS.ghost }} />
              <span>Closed W/o Decision</span>
            </div>
          </div>
        </div>

        <div className="h-[260px] sm:h-[320px] 2xl:h-[380px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={outcomeShareTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="meltRefugee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_SEMANTICS.refugee} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_SEMANTICS.refugee} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="meltComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_SEMANTICS.complementary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_SEMANTICS.complementary} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="meltRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_SEMANTICS.rejected} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_SEMANTICS.rejected} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="meltGhost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_SEMANTICS.ghost} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_SEMANTICS.ghost} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                minTickGap={12}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                width={36}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-md text-xs space-y-1">
                        <div className="font-semibold text-foreground mb-1">{label} Decision Breakdown</div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Closed Without Decision:</span>
                          <span className="font-semibold" style={{ color: CHART_SEMANTICS.ghost }}>{Number(payload[3]?.value).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Formal Rejection:</span>
                          <span className="font-semibold" style={{ color: CHART_SEMANTICS.rejected }}>{Number(payload[2]?.value).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Complementary Stay:</span>
                          <span className="font-semibold" style={{ color: CHART_SEMANTICS.complementary }}>{Number(payload[1]?.value).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-muted-foreground">
                          <span>Geneva Refugee Grant:</span>
                          <span className="font-semibold" style={{ color: CHART_SEMANTICS.refugee }}>{Number(payload[0]?.value).toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="refugee" stackId="1" name="Geneva Refugee" fill="url(#meltRefugee)" stroke={CHART_SEMANTICS.refugee} strokeWidth={1.5} animationDuration={300} animationEasing="ease-out" />
              <Area type="monotone" dataKey="temp_protection" stackId="1" name="Complementary" fill="url(#meltComp)" stroke={CHART_SEMANTICS.complementary} strokeWidth={1.5} animationDuration={300} animationEasing="ease-out" />
              <Area type="monotone" dataKey="rejected" stackId="1" name="Rejected" fill="url(#meltRejected)" stroke={CHART_SEMANTICS.rejected} strokeWidth={1.5} animationDuration={300} animationEasing="ease-out" />
              <Area type="monotone" dataKey="ghost_cases" stackId="1" name="Closed Without Decision" fill="url(#meltGhost)" stroke={CHART_SEMANTICS.ghost} strokeWidth={1.5} animationDuration={300} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Decision Breakdown & Protection Types (Full Width, 2-Zone) */}
      <div className="rounded-xl border border-border bg-card p-6 2xl:p-7 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Decision Breakdown & Protection Types</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">2010–2025 Standardized</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Breakdown across all {formatNumber(totalDeterminations)} decisions, comparing how countries apply refugee status versus temporary stay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-1">
          {/* Left Zone: Global Adjudication Breakdown (Donut + Tabular Accounting) */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-[180px] w-[180px] shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border bg-card p-2 shadow-md text-xs space-y-0.5">
                            <div className="font-semibold text-foreground">{data.name}</div>
                            <div className="text-muted-foreground">{formatNumber(data.value)} cases ({data.pct.toFixed(1)}%)</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={dispositionDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={350}
                    animationEasing="ease-out"
                  >
                    {dispositionDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm 2xl:text-base font-extrabold text-foreground tabular-nums">
                  {(totalDeterminations / 1000000).toFixed(1)}M
                </span>
                <span className="text-[10px] 2xl:text-xs text-muted-foreground uppercase font-medium tracking-wider">Decided</span>
              </div>
            </div>

            <div className="w-full space-y-2 text-xs">
              {dispositionDonutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground text-xs truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums text-right shrink-0">
                    <span className="text-foreground font-semibold">{formatNumber(d.value)}</span>
                    <span className="text-muted-foreground text-[11px] w-12 text-right">({d.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Zone: Protection Models Compared (Spain vs Germany Side-by-Side) */}
          <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Comparing Protection Systems: Refugee Grants vs. Temporary Stay
              </h3>
              <span className="text-[10px] text-muted-foreground">National Policy Differences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Spain Card */}
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CountryFlagBadge iso="ESP" name="Spain" size="sm" />
                    <span className="font-semibold text-foreground">Spain (ESP)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    Mostly Temporary Stay
                  </span>
                </div>

                {/* Visual Segmented Progress Bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${spainRefugee}%`, backgroundColor: CHART_SEMANTICS.refugee }}
                    title={`Geneva Refugee: ${spainRefugee.toFixed(1)}%`}
                  />
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${spainComp}%`, backgroundColor: CHART_SEMANTICS.complementary }}
                    title={`Complementary Stay: ${spainComp.toFixed(1)}%`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_SEMANTICS.refugee }} />
                      Refugee:
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">{spainRefugee.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_SEMANTICS.complementary }} />
                      Temporary:
                    </span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400 tabular-nums">{spainComp.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Germany Card */}
              <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CountryFlagBadge iso="DEU" name="Germany" size="sm" />
                    <span className="font-semibold text-foreground">Germany (DEU)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Mostly Refugee Status
                  </span>
                </div>

                {/* Visual Segmented Progress Bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${germanyRefugee}%`, backgroundColor: CHART_SEMANTICS.refugee }}
                    title={`Geneva Refugee: ${germanyRefugee.toFixed(1)}%`}
                  />
                  <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${germanyComp}%`, backgroundColor: CHART_SEMANTICS.complementary }}
                    title={`Complementary Stay: ${germanyComp.toFixed(1)}%`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_SEMANTICS.refugee }} />
                      Refugee:
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{germanyRefugee.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_SEMANTICS.complementary }} />
                      Temporary:
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">{germanyComp.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-0.5 leading-relaxed">
              Spain grants relief primarily through temporary humanitarian protection ({spainComp.toFixed(1)}%), while Germany grants legal protection almost entirely through full 1951 Convention refugee status ({germanyRefugee.toFixed(1)}%).
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Outliers Grid */}
      <div className="rounded-xl border border-border bg-card p-6 2xl:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Countries with Highest Rate of Closed Cases (&gt;100k Decided Cases)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Host countries closing the largest share of cases without an individual protection decision.</p>
          </div>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 2xl:gap-4">
          {ghostOutliers.map((c) => {
            const closedCount = Math.round(c.cases_decided * (c.ghost_rate_pct / 100));
            return (
              <div key={c.country_iso} className="rounded-lg border border-border p-3.5 flex flex-col justify-between bg-muted/20 hover:bg-muted/40 transition-colors duration-150">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CountryFlagBadge iso={c.country_iso} name={c.country_name} size="sm" />
                      <span className="text-xs font-semibold text-foreground truncate">{c.country_name}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-muted text-muted-foreground shrink-0">
                      {c.country_iso}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-xl 2xl:text-2xl font-extrabold text-foreground tabular-nums">
                      {c.ghost_rate_pct.toFixed(1)}%
                    </span>
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      No Decision
                    </span>
                  </div>
                  {/* Subtle proportional fill bar */}
                  <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.min(100, c.ghost_rate_pct)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 text-[11px] text-muted-foreground tabular-nums flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">{formatNumber(closedCount)} closed claims</span>
                  <span className="text-[10px]">of {formatNumber(c.cases_decided)} total decided</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
          High administrative closure rates usually reflect missed deadlines, permit expirations, or registry cleanups where cases are closed before reaching a formal decision.
        </p>
      </div>
    </div>
  );
}

