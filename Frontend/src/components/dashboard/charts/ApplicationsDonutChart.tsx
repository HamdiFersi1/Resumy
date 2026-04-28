"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  fetchApplicationStats,
  ApplicationStats,
} from "@/apis/HR/applicationApi";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const ApplicationsDonutChart = React.memo(function ApplicationsDonutChart({
  jobId,
  jobTitle,
}: {
  jobId?: number;
  jobTitle?: string;
}) {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    fetched.current = false;
  }, [jobId]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchApplicationStats(jobId).then(setStats).catch(console.error);
  }, [jobId]);

  if (!stats) return <div>Loading chart…</div>;

  const data = [
    { value: stats.total_applications, name: "Total" },
    { value: stats.scored_applications, name: "Scored" },
  ];

  const option: echarts.EChartsOption = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { show: false },
    series: [
      {
        name: "Applications",
        type: "pie",
        radius: ["45%", "65%"],
        center: ["50%", "65%"],
        startAngle: 180,
        endAngle: 360,
        label: {
          position: "outside",
          formatter: "{b}\n{d}%",
          fontSize: 13,
          fontWeight: "bold",
        },
        labelLine: { length: 15, length2: 10, smooth: false },
        avoidLabelOverlap: false,
        data,
      },
    ],
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-base">Application Rates</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {jobTitle ?? (jobId ? `Job #${jobId}` : "All Jobs")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 overflow-visible">
        <div
          className="relative flex justify-center overflow-visible"
          style={{ height: 240 }}
        >
          <ReactECharts
            option={option}
            style={{ width: 280, height: 240, overflow: "visible" }}
            notMerge
            lazyUpdate
          />
          <div className="absolute bottom-20 left-1/2 w-3/4 -translate-x-1/2 border-t-2 border-black" />
        </div>
      </CardContent>
    </Card>
  );
});
