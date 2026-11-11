"use client";

import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { CountryProfile, GlobalKPIs } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";
import { getSovereignNavyShade, isSovereignNavyLight, SOVEREIGN_NAVY_SCALE } from "@/lib/chartTheme";
import CountryFlagBadge from "@/components/CountryFlagBadge";

interface BacklogTreemapProps {
  countries: CountryProfile[];
  kpis: GlobalKPIs | null;
}

interface CustomTreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  iso?: string;
  size?: number;
  sharePct?: number;
  ccr?: number;
  color?: string;
  value?: number;
  payload?: any;
}

const CustomTreemapContent = (props: CustomTreemapContentProps) => {
  const { x = 0, y = 0, width = 0, height = 0, name = "", iso = "", sharePct = 0, color = "#1E3A8A" } = props;
  const actualSize = props.size ?? props.value ?? props.payload?.size ?? 0;

  // Snap coordinates to exact integer pixels to eliminate sub-pixel rasterization blur
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rw = Math.round(width);
  const rh = Math.round(height);

  // Don't render text if the tile is too small
  const isLargeEnough = rw > 55 && rh > 40;
  const isMedium = rw > 40 && rh > 28;

  // Contrast-aware text color: dark slate for luminous ice blue tiers (<200k), white for deep cobalt (>=200k)
  const isLight = isSovereignNavyLight(actualSize);
  const primaryTextColor = isLight ? "#0f172a" : "#ffffff";
  const secondaryTextColor = isLight ? "#1e293b" : "#ffffff";
  const tertiaryTextColor = isLight ? "#334155" : "#ffffff";

  return (
    <g>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        fill={color}
        fillOpacity={1}
        stroke="hsl(var(--card))"
        strokeWidth={2}
        rx={4}
        className="transition-all duration-200 hover:brightness-115 cursor-pointer"
      />
      {isLargeEnough ? (
        <>
          <text
            x={rx + 8}
            y={ry + 18}
            fill={primaryTextColor}
            stroke="none"
            paintOrder="fill"
            fontSize={12}
            fontWeight={700}
            letterSpacing="0.04em"
            textRendering="optimizeLegibility"
            style={{
              fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {iso || name}
          </text>
          <text
            x={rx + 8}
            y={ry + 32}
            fill={secondaryTextColor}
            stroke="none"
            paintOrder="fill"
            fillOpacity={isLight ? 0.95 : 0.96}
            fontSize={11}
            fontWeight={600}
            textRendering="optimizeLegibility"
            style={{
              fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatNumber(actualSize)}
          </text>
          {rh > 55 && (
            <text
              x={rx + 8}
              y={ry + 46}
              fill={tertiaryTextColor}
              stroke="none"
              paintOrder="fill"
              fillOpacity={isLight ? 0.85 : 0.82}
              fontSize={10}
              fontWeight={500}
              textRendering="optimizeLegibility"
              style={{
                fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {sharePct.toFixed(1)}% of world
            </text>
          )}
        </>
      ) : isMedium ? (
        <text
          x={rx + Math.round(rw / 2)}
          y={ry + Math.round(rh / 2) + 4}
          textAnchor="middle"
          fill={primaryTextColor}
          stroke="none"
          paintOrder="fill"
          fontSize={10}
          fontWeight={700}
          letterSpacing="0.03em"
          textRendering="optimizeLegibility"
          style={{
            fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {iso || name.slice(0, 3)}
        </text>
      ) : null}
    </g>
  );
};

export function BacklogTreemap({ countries, kpis }: BacklogTreemapProps) {
  if (!kpis) return null;

  const totalBacklog = kpis.active_pending_backlog || 1;

  // Sort sovereign jurisdictions strictly descending by backlog scale
  const sorted = [...countries]
    .filter((c) => c.pending_backlog_latest > 0)
    .sort((a, b) => b.pending_backlog_latest - a.pending_backlog_latest);

  // Display top 24 sovereign nations (representing over 85% of active global queue)
  const topCountries = sorted.slice(0, 24);

  const treemapData = topCountries.map((c) => {
    const sharePct = (c.pending_backlog_latest / totalBacklog) * 100;
    // Sequential Density Shading: Sovereign Navy scale
    const color = getSovereignNavyShade(c.pending_backlog_latest);

    return {
      name: c.country_name,
      iso: c.country_iso,
      size: c.pending_backlog_latest,
      sharePct,
      ccr: c.total_clearance_rate_pct,
      yearsToClear: c.years_to_clear,
      color,
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 2xl:p-7 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Pending Backlog by Country</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            The 24 host countries holding the largest pending backlogs, sized by case volume.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier1 }} />
            &gt;2M Backlog (Dominant)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier2 }} />
            500k–2M (Heavy Queue)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier3 }} />
            200k–500k (Mid-Tier)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier4 }} />
            100k–200k (Regional)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: SOVEREIGN_NAVY_SCALE.tier5 }} />
            &lt;100k (Emerging)
          </span>
        </div>
      </div>

      <div className="h-[300px] sm:h-[360px] 2xl:h-[480px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="none"
            content={<CustomTreemapContent />}
          >
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-md text-xs space-y-1.5 min-w-[210px]">
                      <div className="flex items-center gap-2 border-b border-border pb-1.5">
                        <CountryFlagBadge iso={d.iso} name={d.name} size="md" />
                        <span className="font-bold text-foreground text-sm leading-tight">
                          {d.name} {d.iso ? `(${d.iso})` : ""}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Active Backlog:</span>
                        <span className="font-bold text-foreground tabular-nums">{formatNumber(d.size)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Share of Global Queue:</span>
                        <span className="font-bold text-foreground tabular-nums">{d.sharePct.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Clearance Rate (CCR):</span>
                        <span className="font-bold text-foreground tabular-nums">{formatPercent(d.ccr)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Years to Clear:</span>
                        <span className="font-bold text-foreground tabular-nums">
                          {d.yearsToClear > 50 ? ">50 yrs horizon" : `${d.yearsToClear.toFixed(1)} yrs`}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
