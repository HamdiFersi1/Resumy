// src/components/jobList/ChartsSection.tsx
"use client";

import { Card, CardHeader } from "@/components/ui/card";
import type { Job } from "@/apis/jobApi";
import { GroupBySelector } from "./charts/GroupBySelector";
import { KpiPanel } from "./charts/KpiPanel";
import { RadialPostingsChart } from "./charts/RadialPostingsChart";
import { BarPostingsChart } from "./charts/BarPostingsChart";

interface Props {
  jobs: Job[];
  loading: boolean;
  groupBy: "month" | "weekday";
  onGroupByChange: (v: "month" | "weekday") => void;
}

export function ChartsSection({
  jobs,
  loading,
  groupBy,
  onGroupByChange,
}: Props) {
  const totalJobs = jobs.length;

  // build bar data & label
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const barData =
    groupBy === "month"
      ? monthLabels.map((m, idx) => ({
          period: m,
          count: jobs.filter((j) => new Date(j.created_at).getMonth() === idx)
            .length,
        }))
      : weekdayLabels.map((d, idx) => {
          const date = new Date(today);
          date.setDate(today.getDate() + (idx - today.getDay()));
          return {
            period: d,
            fullDate: date.toLocaleDateString(),
            count: jobs.filter((j) => new Date(j.created_at).getDay() === idx)
              .length,
          };
        });

  const groupByLabel = groupBy === "month" ? "Month" : "Weekday";

  return (
    <Card className="space-y-6 p-6">
      <CardHeader className="flex justify-end">
        <GroupBySelector groupBy={groupBy} onChange={onGroupByChange} />
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
        <KpiPanel totalJobs={totalJobs} />
        <div className="w-full h-48">
          <RadialPostingsChart totalJobs={totalJobs} loading={loading} />
        </div>
        <div className="w-full h-48">
          <BarPostingsChart
            data={barData}
            loading={loading}
            groupByLabel={groupByLabel}
          />
        </div>
      </div>
    </Card>
  );
}
