"use client";

import { ReactNode, useEffect } from "react";
import { useDashboardData } from "@/context/DashboardDataContext";
import { AlertCircle } from "lucide-react";

interface DashboardViewLayoutProps {
  title: string;
  subtitle: string;
  children: (data: {
    kpis: ReturnType<typeof useDashboardData>["kpis"];
    trends: ReturnType<typeof useDashboardData>["trends"];
    countries: ReturnType<typeof useDashboardData>["countries"];
    corridors: ReturnType<typeof useDashboardData>["corridors"];
  }) => ReactNode;
}

export function DashboardViewLayout({
  title,
  subtitle,
  children,
}: DashboardViewLayoutProps) {
  const { kpis, trends, countries, corridors, loading, missingFiles } = useDashboardData();

  useEffect(() => {
    document.title = `${title} | UNHCR Asylum Operations Analytics`;
  }, [title]);

  return (
    <div className="space-y-6">
      {/* Module Title & Context Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs sm:text-sm 2xl:text-base text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Missing Files Fallback Notice */}
      {missingFiles.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>
            Missing data marts in web/public/data/: {missingFiles.join(", ")}. Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              cp data/processed/dashboard_data/*.json web/public/data/
            </code>{" "}
            to populate all views.
          </span>
        </div>
      )}

      {/* Dynamic View Canvas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-6 w-6 rounded-full border-2 border-foreground border-t-transparent animate-spin mb-3" />
          <p className="text-xs text-muted-foreground">Loading standardized data marts...</p>
        </div>
      ) : (
        <div className="animate-view-fade">
          {children({ kpis, trends, countries, corridors })}
        </div>
      )}
    </div>
  );
}
