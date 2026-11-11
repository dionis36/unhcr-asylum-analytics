"use client";

import { useEffect, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Plus, Minus, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import * as FlagStrings from "country-flag-icons/string/3x2";
import { CountryProfile } from "@/types";
import { formatNumber, formatPercent, cn } from "@/lib/utils";
import { CHART_SEMANTICS, CHART_MUTED, getSovereignNavyShade } from "@/lib/chartTheme";
import { ISO3_TO_ISO2 } from "@/components/CountryFlagBadge";
import { SOVEREIGN_GEO_REGISTRY } from "@/lib/worldGeoRegistry";

interface WorldMapCanvasProps {
  countries: CountryProfile[];
  selectedMetric: "backlog" | "ccr" | "years" | "authority";
  selectedContinent: string;
  hoveredIso: string | null;
  setHoveredIso: (iso: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onResetZoom?: () => void;
}

// Comprehensive spherical [longitude, latitude] coordinates for all 186 sovereign nations
const SOVEREIGN_GEO_COORDINATES = SOVEREIGN_GEO_REGISTRY;


// Mathematical geographical bounding boxes: [[westLng, southLat], [eastLng, northLat]]
const REGION_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  ALL: [
    [-170, -56],
    [175, 72],
  ],
  Americas: [
    [-145, -56],
    [-34, 62],
  ],
  Europe: [
    [-15, 34],
    [45, 70],
  ],
  Africa: [
    [-20, -36],
    [52, 38],
  ],
  "Middle East": [
    [32, 12],
    [63, 40],
  ],
  "Africa & Middle East": [
    [-20, -36],
    [63, 38],
  ],
  "Asia-Pacific": [
    [68, -38],
    [146, 46],
  ],
};

export default function WorldMapCanvas({
  countries,
  selectedMetric,
  selectedContinent,
  hoveredIso,
  setHoveredIso,
  isFullscreen = false,
  onToggleFullscreen,
  onResetZoom,
}: WorldMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupsRef = useRef<maplibregl.Popup[]>([]);
  const markerElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const haloElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const dotElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const selectedContinentRef = useRef(selectedContinent);
  selectedContinentRef.current = selectedContinent;
  const prevContinentRef = useRef(selectedContinent);
  const prevHoveredIsoRef = useRef<string | null>(hoveredIso);
  const hoveredIsoRef = useRef<string | null>(hoveredIso);
  hoveredIsoRef.current = hoveredIso;
  const skipCountryFlyRef = useRef(false);

  const countryMap = useMemo(() => new Map(countries.map((c) => [c.country_iso, c])), [countries]);

  // 1. Initialize MapLibre GL map with theme detection and mutation observer
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const initialStyle = isDark
      ? "https://tiles.openfreemap.org/styles/dark"
      : "https://tiles.openfreemap.org/styles/positron";

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [15, 20],
      zoom: 1.3,
      minZoom: 0.5,
      maxZoom: 9,
      attributionControl: false,
    });

    // Clean basemap layers: strip roads, provincial borders, and minor sea labels
    const stripUnwantedLayers = (targetMap: maplibregl.Map) => {
      try {
        const style = targetMap.getStyle();
        if (!style || !style.layers) return;
        const unwantedKeywords = [
          "road",
          "highway",
          "transportation",
          "tunnel",
          "bridge",
          "railway",
          "admin_sub",
          "boundary_state",
          "province",
          "boundary_disputed",
          "water_name",
          "marine",
          "ocean_label",
          "sea_label",
          "waterway",
          "motorway",
        ];
        style.layers.forEach((layer) => {
          const id = layer.id.toLowerCase();
          const rawLayer = layer as unknown as Record<string, unknown>;
          const srcLayer = typeof rawLayer["source-layer"] === "string" ? (rawLayer["source-layer"] as string).toLowerCase() : "";
          if (unwantedKeywords.some((kw) => id.includes(kw) || srcLayer.includes(kw))) {
            try {
              targetMap.setLayoutProperty(layer.id, "visibility", "none");
            } catch {
              // Ignore layer types that do not support visibility
            }
          }
        });
      } catch {
        // Safe fallback
      }
    };

    map.on("styledata", () => {
      stripUnwantedLayers(map);
    });
    map.on("load", () => {
      stripUnwantedLayers(map);
    });

    mapRef.current = map;

    // Dynamically toggle basemap style when user flips light/dark mode
    const observer = new MutationObserver(() => {
      const isNowDark = document.documentElement.classList.contains("dark");
      const targetStyle = isNowDark
        ? "https://tiles.openfreemap.org/styles/dark"
        : "https://tiles.openfreemap.org/styles/positron";
      map.setStyle(targetStyle);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Reactively render sovereign markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    // Remove existing markers & popups
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    popupsRef.current.forEach((p) => p.remove());
    popupsRef.current = [];
    markerElementsRef.current.clear();
    haloElementsRef.current.clear();
    dotElementsRef.current.clear();

    const totalBacklog = countries.reduce((acc, c) => acc + c.pending_backlog_latest, 0) || 1;

    Object.entries(SOVEREIGN_GEO_COORDINATES).forEach(([iso, pos]) => {
      const matchesContinent =
        selectedContinentRef.current === "ALL" ||
        (selectedContinentRef.current === "Africa & Middle East"
          ? pos.continent === "Africa" || pos.continent === "Middle East"
          : pos.continent === selectedContinentRef.current);

      const isCurrentCountry = hoveredIsoRef.current === iso;
      const isVisible = matchesContinent || isCurrentCountry;

      const country = countryMap.get(iso);
      const backlog = country?.pending_backlog_latest || 0;
      const ccr = country?.total_clearance_rate_pct || 0;
      const ytc = country?.years_to_clear || 0;
      const totalDec = country?.cases_decided || 1;
      const unhcrShare = country ? ((country.authority_split["UNHCR"] || 0) / totalDec) * 100 : 0;

      // Proportional Area Sizing
      let diameter = 14;
      if (backlog > 2000000) diameter = 40;
      else if (backlog > 500000) diameter = 30;
      else if (backlog > 100000) diameter = 22;
      else if (backlog > 20000) diameter = 16;

      // Color based on active metric lens
      let color: string = CHART_SEMANTICS.depth;
      if (selectedMetric === "backlog") {
        color = getSovereignNavyShade(backlog);
      } else if (selectedMetric === "ccr") {
        if (ccr >= 100) color = CHART_SEMANTICS.sustainable;
        else if (ccr >= 70) color = CHART_SEMANTICS.warning;
        else color = CHART_SEMANTICS.critical;
      } else if (selectedMetric === "years") {
        const annualDecisions = country?.recent_annual_decisions || 0;
        if (annualDecisions <= 0 && backlog > 0) color = CHART_SEMANTICS.critical;
        else if (ytc < 2) color = CHART_SEMANTICS.sustainable;
        else if (ytc < 5) color = CHART_SEMANTICS.warning;
        else color = CHART_SEMANTICS.critical;
      } else if (selectedMetric === "authority") {
        if (unhcrShare > 80) color = CHART_SEMANTICS.authorityUnhcr;
        else if (unhcrShare > 20) color = CHART_SEMANTICS.authorityShared;
        else color = CHART_SEMANTICS.authorityGov;
      }

      // Resolve country flag SVG string for popup
      const cleanIso = iso.trim().toUpperCase();
      const iso2 = cleanIso.length === 2 ? cleanIso : ISO3_TO_ISO2[cleanIso] || cleanIso.slice(0, 2);
      const flagSvg = (FlagStrings as Record<string, string>)[iso2] || "";
      const flagHtml = flagSvg
        ? `<span class="inline-flex w-4 h-[11px] shrink-0 overflow-hidden rounded-[2px] border border-border/60 aspect-[3/2]">${flagSvg}</span>`
        : `<span class="inline-flex items-center justify-center font-bold text-[9px] uppercase w-4 h-[11px] bg-muted text-muted-foreground rounded-[2px]">${cleanIso.slice(0, 2)}</span>`;

      const countryName = country?.country_name || iso;

      let metricLabel = "Active Backlog";
      let metricValue = formatNumber(backlog);
      let metricSub = "";

      if (selectedMetric === "backlog") {
        metricLabel = "Pending Backlog";
        metricValue = formatNumber(backlog);
        const sharePct = (backlog / totalBacklog) * 100;
        metricSub = `${sharePct.toFixed(1)}% of global queue`;
      } else if (selectedMetric === "ccr") {
        metricLabel = "Clearance Rate";
        metricValue = formatPercent(ccr);
        metricSub = ccr >= 100 ? "Sustainable pace (≥100%)" : "Sub-replacement pace (<100%)";
      } else if (selectedMetric === "years") {
        metricLabel = "Years to Clear";
        metricValue = ytc > 50 ? ">50 yrs horizon" : `${ytc.toFixed(1)} yrs`;
        metricSub = ytc < 2 ? "Fast runway (<2 yrs)" : ytc > 5 ? "Severe logjam (>5 yrs)" : "Sub-replacement queue (2–5 yrs)";
      } else if (selectedMetric === "authority") {
        metricLabel = "Decision Authority";
        metricValue = `${(100 - unhcrShare).toFixed(0)}% Government / ${unhcrShare.toFixed(0)}% UNHCR`;
        metricSub = unhcrShare > 80 ? "UNHCR Mandate" : unhcrShare > 20 ? "Joint System" : "National Government";
      }

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: Math.round(diameter / 2) + 6,
        className: "maplibre-custom-popup",
      });
      popupsRef.current.push(popup);

      const popupContent = `
        <div class="space-y-1 min-w-[175px] text-xs">
          <div class="flex items-center gap-1.5 font-bold text-foreground border-b border-border/70 pb-1">
            ${flagHtml}
            <span class="truncate">${countryName} (${iso})</span>
          </div>
          <div class="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
            <span>${metricLabel}:</span>
            <span class="font-bold text-foreground tabular-nums">${metricValue}</span>
          </div>
          ${metricSub ? `<div class="text-[10px] text-muted-foreground/80">${metricSub}</div>` : ""}
        </div>
      `;

      // Create interactive DOM element (clean proportional bubble with zero crammed text)
      const el = document.createElement("div");
      el.className = "group relative flex items-center justify-center cursor-pointer transition-all duration-300 ease-out";
      el.style.width = `${diameter}px`;
      el.style.height = `${diameter}px`;
      el.style.display = isVisible ? "flex" : "none";
      el.style.opacity = isVisible ? (isCurrentCountry ? "1" : "0.85") : "0";
      el.style.pointerEvents = isVisible ? "auto" : "none";

      el.innerHTML = `
        <div class="beacon-halo absolute -inset-2.5 rounded-full border-2 border-dashed animate-pulse pointer-events-none transition-opacity duration-200"
             style="border-color: ${CHART_SEMANTICS.contrast}; display: ${isCurrentCountry ? "block" : "none"};"></div>
        <div class="marker-dot rounded-full transition-transform duration-200 group-hover:scale-120"
             style="background-color: ${color}; width: ${diameter}px; height: ${diameter}px; opacity: ${
               isCurrentCountry ? "1" : "0.85"
             }; border: 1.5px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">
        </div>
      `;

      const haloEl = el.querySelector(".beacon-halo") as HTMLDivElement | null;
      const dotEl = el.querySelector(".marker-dot") as HTMLDivElement | null;
      markerElementsRef.current.set(iso, el);
      if (haloEl) haloElementsRef.current.set(iso, haloEl);
      if (dotEl) dotElementsRef.current.set(iso, dotEl);

      el.addEventListener("mouseenter", () => {
        popup.setLngLat(pos.coordinates).setHTML(popupContent).addTo(map);
      });
      el.addEventListener("mouseleave", () => {
        popup.remove();
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.remove();
        if (hoveredIsoRef.current === iso) {
          // If already selected, user clicked to re-center after panning
          const isMobile = mapContainerRef.current
            ? mapContainerRef.current.clientWidth < 640
            : typeof window !== "undefined" && window.innerWidth < 768;
          const targetZoom = isMobile ? 2.8 : 4.0;
          map.flyTo({
            center: pos.coordinates,
            zoom: targetZoom,
            speed: 0.95,
            curve: 1.38,
            essential: true,
          });
        } else {
          setHoveredIso(iso);
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(pos.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [countries, selectedMetric, setHoveredIso, countryMap]);

  // 3. Reactively update marker visibility on continent change with smooth CSS fade
  useEffect(() => {
    markerElementsRef.current.forEach((el, iso) => {
      const pos = SOVEREIGN_GEO_COORDINATES[iso];
      if (!pos) return;
      const matchesContinent =
        selectedContinent === "ALL" ||
        (selectedContinent === "Africa & Middle East"
          ? pos.continent === "Africa" || pos.continent === "Middle East"
          : pos.continent === selectedContinent);

      const isCurrentCountry = hoveredIsoRef.current === iso;

      if (matchesContinent || isCurrentCountry) {
        el.style.display = "flex";
        requestAnimationFrame(() => {
          el.style.opacity = isCurrentCountry ? "1" : "0.85";
          el.style.pointerEvents = "auto";
        });
      } else {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        setTimeout(() => {
          if (el.style.opacity === "0") {
            el.style.display = "none";
          }
        }, 300);
      }
    });
  }, [selectedContinent]);

  // 4. Reactively update active sovereign halo without rebuilding DOM markers
  useEffect(() => {
    const prevIso = prevHoveredIsoRef.current;
    if (prevIso && prevIso !== hoveredIso) {
      const prevHalo = haloElementsRef.current.get(prevIso);
      const prevDot = dotElementsRef.current.get(prevIso);
      const prevEl = markerElementsRef.current.get(prevIso);
      const prevPos = prevIso ? SOVEREIGN_GEO_COORDINATES[prevIso] : null;

      if (prevHalo) prevHalo.style.display = "none";
      if (prevDot) prevDot.style.opacity = "0.85";

      if (prevEl && prevPos && selectedContinent !== "ALL") {
        const matchesContinent =
          selectedContinent === "Africa & Middle East"
            ? prevPos.continent === "Africa" || prevPos.continent === "Middle East"
            : prevPos.continent === selectedContinent;
        if (!matchesContinent) {
          prevEl.style.opacity = "0";
          prevEl.style.pointerEvents = "none";
          prevEl.style.display = "none";
        }
      }
    }

    if (hoveredIso) {
      const nextHalo = haloElementsRef.current.get(hoveredIso);
      const nextDot = dotElementsRef.current.get(hoveredIso);
      const nextEl = markerElementsRef.current.get(hoveredIso);

      if (nextEl) {
        nextEl.style.display = "flex";
        nextEl.style.opacity = "1";
        nextEl.style.pointerEvents = "auto";
      }
      if (nextHalo) nextHalo.style.display = "block";
      if (nextDot) nextDot.style.opacity = "1";
    }

    prevHoveredIsoRef.current = hoveredIso;
  }, [hoveredIso, selectedContinent]);

  // 5. Smooth parabolic camera flight on continent change with calm enforced duration
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (prevContinentRef.current !== selectedContinent) {
      prevContinentRef.current = selectedContinent;
      skipCountryFlyRef.current = true;
    }

    const bounds = REGION_BOUNDS[selectedContinent] || REGION_BOUNDS.ALL;
    const isMobile = mapContainerRef.current
      ? mapContainerRef.current.clientWidth < 640
      : typeof window !== "undefined" && window.innerWidth < 768;

    const camera = map.cameraForBounds(bounds, {
      padding: isMobile ? 12 : 36,
      maxZoom: isMobile ? 3.0 : 4.8,
    });

    if (camera) {
      map.flyTo({
        center: camera.center,
        zoom: Math.max(camera.zoom ?? 1.3, isMobile ? 1.25 : 1.5),
        duration: isMobile ? 1250 : 1350,
        essential: true,
      });
    }
  }, [selectedContinent]);

  // 6. Smooth camera flight on country focus using kinetic distance physics
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hoveredIso) return;

    if (skipCountryFlyRef.current) {
      skipCountryFlyRef.current = false;
      return;
    }

    const pos = SOVEREIGN_GEO_COORDINATES[hoveredIso];
    if (pos) {
      const isMobile = mapContainerRef.current
        ? mapContainerRef.current.clientWidth < 640
        : typeof window !== "undefined" && window.innerWidth < 768;
      const targetZoom = isMobile ? 2.8 : 4.0;
      map.flyTo({
        center: pos.coordinates,
        zoom: targetZoom,
        speed: 0.95,
        curve: 1.38,
        essential: true,
      });
    }
  }, [hoveredIso]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.resize();
    const timer = setTimeout(() => {
      map.resize();
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  const handleResetZoom = () => {
    const map = mapRef.current;
    if (map) {
      const bounds = REGION_BOUNDS[selectedContinent] || REGION_BOUNDS.ALL;
      const isMobile = mapContainerRef.current
        ? mapContainerRef.current.clientWidth < 640
        : typeof window !== "undefined" && window.innerWidth < 768;

      const camera = map.cameraForBounds(bounds, {
        padding: isMobile ? 12 : 36,
        maxZoom: isMobile ? 3.0 : 4.8,
      });

      if (camera) {
        map.flyTo({
          center: camera.center,
          zoom: Math.max(camera.zoom ?? 1.3, isMobile ? 1.25 : 1.5),
          duration: 1100,
          essential: true,
        });
      }
    }
    if (selectedContinent === "ALL") {
      onResetZoom?.();
    }
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-border",
        isFullscreen ? "h-full" : "h-[340px] sm:h-[440px] lg:h-[580px] 2xl:h-[720px]"
      )}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Control Cluster (Zoom In, Zoom Out, Reset Zoom, Full Screen) */}
      <div className="absolute top-3 left-3 z-30 flex flex-col rounded-md border border-border bg-card/90 backdrop-blur-xs shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-[1px] bg-border w-full" />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="h-[1px] bg-border w-full" />
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          title="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        {onToggleFullscreen && (
          <>
            <div className="h-[1px] bg-border w-full hidden lg:block" />
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="hidden lg:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
