"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { GlobalKPIs, TimelineTrend, CountryProfile, MigrationCorridor } from "@/types";

interface DashboardDataContextType {
  kpis: GlobalKPIs | null;
  trends: TimelineTrend[];
  countries: CountryProfile[];
  corridors: MigrationCorridor[];
  loading: boolean;
  missingFiles: string[];
}

const DashboardDataContext = createContext<DashboardDataContextType>({
  kpis: null,
  trends: [],
  countries: [],
  corridors: [],
  loading: true,
  missingFiles: [],
});

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [kpis, setKpis] = useState<GlobalKPIs | null>(null);
  const [trends, setTrends] = useState<TimelineTrend[]>([]);
  const [countries, setCountries] = useState<CountryProfile[]>([]);
  const [corridors, setCorridors] = useState<MigrationCorridor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [missingFiles, setMissingFiles] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        const missing: string[] = [];

        const [kpiRes, trendsRes, countriesRes, corridorsRes] = await Promise.allSettled([
          fetch("/data/global_kpis.json"),
          fetch("/data/timeline_trends.json"),
          fetch("/data/country_profiles.json"),
          fetch("/data/migration_corridors.json"),
        ]);

        if (!isMounted) return;

        if (kpiRes.status === "fulfilled" && kpiRes.value.ok) {
          setKpis(await kpiRes.value.json());
        } else {
          missing.push("global_kpis.json");
        }

        if (trendsRes.status === "fulfilled" && trendsRes.value.ok) {
          setTrends(await trendsRes.value.json());
        } else {
          missing.push("timeline_trends.json");
        }

        if (countriesRes.status === "fulfilled" && countriesRes.value.ok) {
          setCountries(await countriesRes.value.json());
        } else {
          missing.push("country_profiles.json");
        }

        if (corridorsRes.status === "fulfilled" && corridorsRes.value.ok) {
          setCorridors(await corridorsRes.value.json());
        } else {
          missing.push("migration_corridors.json");
        }

        setMissingFiles(missing);
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      kpis,
      trends,
      countries,
      corridors,
      loading,
      missingFiles,
    }),
    [kpis, trends, countries, corridors, loading, missingFiles]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}
