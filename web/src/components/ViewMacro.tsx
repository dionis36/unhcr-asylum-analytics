"use client";

import { GlobalKPIs, TimelineTrend, CountryProfile } from "@/types";
import { formatNumber, formatPercent, formatCompact } from "@/lib/utils";
import { BacklogTreemap } from "./BacklogTreemap";
import { CHART_SEMANTICS } from "@/lib/chartTheme";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FileText,
  CheckCircle2,
  Clock,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

interface ViewMacroProps {
  kpis: GlobalKPIs | null;
  trends: TimelineTrend[];
  countries: CountryProfile[];
}

export function ViewMacro({ kpis, trends, countries }: ViewMacroProps) {
  if (!kpis) return null;

  // Chart data formatted for clean bar visualization
  const chartData = trends.map((t) => ({
    year: String(t.year),
    decisions: Math.round(t.cases_decided),
    intake: Math.round(t.applications_filed_est),
  }));

  return (
    <div className="space-y-6">
      {/* 4-Card Metric Ribbon: 2x2 on Mobile, 4x1 on Large Displays */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 2xl:gap-6">
        {/* Metric 1 */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Total Claims Filed</span>
              <FileText className="h-4 w-4 shrink-0 text-blue-600 dark:text-sky-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.applications_filed_est)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.applications_filed_est)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            {formatCompact(kpis.applications_filed_raw)} raw cases (std)
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Cases Decided</span>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.cases_decided)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.cases_decided)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            +{formatCompact(kpis.net_caseload_gap)} unhandled gap
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Active Backlog</span>
              <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              <span className="sm:hidden">{formatCompact(kpis.active_pending_backlog)}</span>
              <span className="hidden sm:inline">{formatNumber(kpis.active_pending_backlog)}</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground truncate">
            Global queue (186 hosts)
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-6 2xl:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">Clearance Rate</span>
              <TrendingDown className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              {formatPercent(kpis.clearance_rate_pct)}
            </div>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs 2xl:text-sm text-muted-foreground tabular-nums truncate">
            -18.8% below run-rate
          </p>
        </div>
      </div>

      {/* Analytical Context Finding */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 shadow-xs flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          Following 2021, global asylum intake surged from 1.7M to over 3.8M claims at its 2023 peak, averaging 3.4M claims annually (2022–2025) against 2.4M decisions. This persistent deficit has driven active pending inventory to 8.99 million cases, with 69.5% concentrated across five host nations.
        </p>
      </div>

      {/* Claims Filed vs Decisions (2010–2025) (Full Width) */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6 2xl:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Claims Filed vs Decisions (2010–2025)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Comparing how many claims arrived each year against how many were resolved.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.anchor }} />
              Claims Intake
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: CHART_SEMANTICS.complementary }} />
              Decisions Delivered
            </span>
          </div>
        </div>

        <div className="h-[280px] sm:h-[340px] 2xl:h-[420px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4} barCategoryGap="24%">
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
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val === 0 ? "0" : `${val / 1000000}M`)}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                width={30}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const intakeVal = Number(payload.find((p) => p.dataKey === "intake")?.value || 0);
                    const decVal = Number(payload.find((p) => p.dataKey === "decisions")?.value || 0);
                    const gap = intakeVal - decVal;
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-md text-xs space-y-1 min-w-[190px]">
                        <div className="font-semibold text-foreground border-b border-border pb-1">
                          {label} Operational Balance
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Claims Intake:</span>
                          <span className="font-semibold text-foreground tabular-nums">{formatNumber(intakeVal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Decisions Delivered:</span>
                          <span className="font-semibold text-foreground tabular-nums">{formatNumber(decVal)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-border/50 font-bold">
                          <span>Annual Caseload Gap:</span>
                          <span
                            className="tabular-nums"
                            style={{ color: gap > 0 ? CHART_SEMANTICS.ghost : CHART_SEMANTICS.complementary }}
                          >
                            {gap > 0 ? `+${formatNumber(gap)}` : formatNumber(gap)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Color 1 (Anchor): Royal Cobalt */}
              <Bar
                dataKey="intake"
                name="Claims Intake"
                radius={[4, 4, 0, 0]}
                fill={CHART_SEMANTICS.anchor}
                fillOpacity={0.95}
                maxBarSize={28}
                animationDuration={300}
                animationEasing="ease-out"
              />
              {/* Color 2 (Throughput): Deep Teal */}
              <Bar
                dataKey="decisions"
                name="Decisions Delivered"
                radius={[4, 4, 0, 0]}
                fill={CHART_SEMANTICS.complementary}
                fillOpacity={1}
                maxBarSize={28}
                animationDuration={300}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sovereign Backlog Concentration Treemap */}
      <BacklogTreemap countries={countries} kpis={kpis} />
    </div>
  );
}
