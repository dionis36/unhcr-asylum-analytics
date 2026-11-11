"use client";

import { DashboardViewLayout } from "@/components/DashboardViewLayout";
import { ViewCorridors } from "@/components/ViewCorridors";

export default function CorridorsPage() {
  return (
    <DashboardViewLayout
      title="Migration Routes"
      subtitle="Where asylum seekers travel from and to, and how the same origin nationality faces different decisions across destination countries."
    >
      {({ corridors }) => <ViewCorridors corridors={corridors} />}
    </DashboardViewLayout>
  );
}
