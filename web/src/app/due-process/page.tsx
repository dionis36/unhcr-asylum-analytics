"use client";

import { DashboardViewLayout } from "@/components/DashboardViewLayout";
import { ViewDueProcess } from "@/components/ViewDueProcess";

export default function DueProcessPage() {
  return (
    <DashboardViewLayout
      title="Decision Outcomes"
      subtitle="How claims are decided: refugee status, temporary protection, rejections, and closed cases."
    >
      {({ kpis, trends, countries }) => (
        <ViewDueProcess kpis={kpis} trends={trends} countries={countries} />
      )}
    </DashboardViewLayout>
  );
}
