"use client";

import { DashboardViewLayout } from "@/components/DashboardViewLayout";
import { ViewMacro } from "@/components/ViewMacro";

export default function OverviewPage() {
  return (
    <DashboardViewLayout
      title="Global Asylum Overview"
      subtitle="Claims filed, decisions delivered, and growing backlogs across 186 host countries (2010–2025)."
    >
      {({ kpis, trends, countries }) => (
        <ViewMacro kpis={kpis} trends={trends} countries={countries} />
      )}
    </DashboardViewLayout>
  );
}
