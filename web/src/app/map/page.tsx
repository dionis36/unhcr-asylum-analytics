"use client";

import { DashboardViewLayout } from "@/components/DashboardViewLayout";
import { ViewGlobalMap } from "@/components/ViewGlobalMap";

export default function MapPage() {
  return (
    <DashboardViewLayout
      title="National Capacity"
      subtitle="Pending backlogs, processing pace, and decision authorities across 186 host countries."
    >
      {({ countries, corridors }) => (
        <ViewGlobalMap countries={countries} corridors={corridors} />
      )}
    </DashboardViewLayout>
  );
}
