/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/HR/ApplicationsScoreRadarChart.tsx
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
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  jobId?: number;
  jobTitle?: string;
}

export const ApplicationsScoreRadarChart: React.FC<Props> = React.memo(
  function ApplicationsScoreRadarChart({ jobId, jobTitle }) {
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

    if (!stats) {
      return (
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-base ">Score Breakdown</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {jobTitle ?? (jobId ? `Job #${jobId}` : "All Jobs")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex justify-center items-center h-60">
            <Spinner size="lg" />
          </CardContent>
        </Card>
      );
    }

    const axes = [
      { key: "average_experience_score", name: "Experience" },
      { key: "average_skills_score", name: "Skills" },
      { key: "average_projects_score", name: "Projects" },
      { key: "average_education_score", name: "Education" },
    ] as const;

    const values = axes.map(({ key }) =>
      parseFloat(((stats as any)[key] * 100).toFixed(2))
    );

    const polygonSeries = {
      name: "Average Scores",
      type: "radar" as const,
      data: [
        {
          value: values,
          name: jobId ? `Job #${jobId}` : "All Jobs",
          areaStyle: { opacity: 0.2 },
          itemStyle: { color: "hsl(var(--chart-1))" },
          lineStyle: { width: 2, color: "hsl(var(--chart-1))" },
        },
      ],
      tooltip: { show: false },
      hoverAnimation: false,
      emphasis: { disabled: true },
      cursor: "default",
      zlevel: 1,
      z: 2,
    };

    const spikeSeries = axes.map((axis, idx) => ({
      name: axis.name,
      type: "radar" as const,
      radarIndex: 0,
      data: [
        {
          value: axes.map((_, i) => (i === idx ? values[idx] : 0)),
          name: axis.name,
          areaStyle: { opacity: 0 },
          lineStyle: { width: 0 },
          itemStyle: { color: "hsl(var(--chart-1))" },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
      tooltip: {
        show: true,
        trigger: "item" as const,
        formatter: (params: any) => {
          const arr: number[] = params.value;
          const v = arr.find((x) => x > 0) ?? 0;
          return `${axis.name}: ${v.toFixed(2)}%`;
        },
      },
      hoverAnimation: false,
      emphasis: { disabled: true },
      cursor: "default",
      zlevel: 2,
      z: 3,
    }));

    const option: echarts.EChartsOption = {
      tooltip: { show: false },
      radar: {
        shape: "circle",
        indicator: axes.map((a) => ({ name: a.name, max: 100 })),
        splitNumber: 4,
        // Light, white-themed styling:
        axisName: { color: "#00000", fontSize: 13 },
        splitLine: { lineStyle: { color: ["#B3C8CF"] } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: "#B3C8CF" } },
      },
      series: [polygonSeries, ...spikeSeries] as any[],
    };

    return (
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-base">Score Breakdown</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {jobTitle ?? (jobId ? `Job #${jobId}` : "All Jobs")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 overflow-visible">
          <ReactECharts
            option={option}
            style={{ width: 380, height: 240 }}
            notMerge
            lazyUpdate
            onChartReady={(chart) => chart.getZr().setCursorStyle("default")}
          />
        </CardContent>
      </Card>
    );
  }
);
