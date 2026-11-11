"use client";

import { DashboardViewLayout } from "@/components/DashboardViewLayout";
import { ViewMethodology } from "@/components/ViewMethodology";

export default function MethodologyPage() {
  return (
    <DashboardViewLayout
      title="Project Methodology"
      subtitle="Analytical framework, data provenance, operational metrics, and structural findings."
    >
      {() => <ViewMethodology />}
    </DashboardViewLayout>
  );
}
