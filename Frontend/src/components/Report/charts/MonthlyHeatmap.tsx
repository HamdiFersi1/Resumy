// src/components/Rapport/charts/MonthlyHeatmap.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  fetchAvailableDates,
  AvailableDate,
  fetchTotalApplications,
} from "@/apis/HR/reportApi";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export type CategoryType = "accepted" | "declined" | "interview" | "scored";

const COLOR_RAMPS: Record<CategoryType, [string, string]> = {
  accepted: ["#e0f3f8", "#08589e"],
  declined: ["#fde0dd", "#c51b8a"],
  interview: ["#e5f5e0", "#31a354"],
  scored: ["#f0f0f0", "#636363"],
};

interface MonthlyHeatmapProps {
  jobId: number | null;
  type: CategoryType;
  month: Date;
  noCard?: boolean; // <— new prop; if true, don’t wrap in <Card>
}

export function MonthlyHeatmap({
  jobId,
  type,
  month,
  noCard = false,
}: MonthlyHeatmapProps) {
  const [data, setData] = useState<AvailableDate[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (jobId != null) {
      Promise.all([fetchAvailableDates(jobId), fetchTotalApplications(jobId)])
        .then(([dates, tot]) => {
          setData(dates);
          setTotal(tot);
        })
        .finally(() => setLoading(false));
    } else {
      fetchAvailableDates()
        .then((dates) => {
          setData(dates);
          setTotal(null);
        })
        .finally(() => setLoading(false));
    }
  }, [jobId]);

  const { dayLabels, weekLabels, heatData, maxCount, ramp } = useMemo(() => {
    if (!data.length) {
      return {
        dayLabels: [] as string[],
        weekLabels: [] as string[],
        heatData: [] as [number, number, number][],
        maxCount: 1,
        ramp: COLOR_RAMPS[type] || ["#f0f0f0", "#636363"],
      };
    }

    const [c0, c1] = COLOR_RAMPS[type] ?? ["#f0f0f0", "#636363"];
    const mStart = startOfMonth(month);
    const mEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: mStart, end: mEnd });

    const dl = days.map((d) => format(d, "d"));
    const wl = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const hd = days.map((d) => {
      const iso = d.toISOString().slice(0, 10);
      const rec = data.find((r) => r.date === iso);
      const cnt = rec?.[type] ?? 0;
      return [dl.indexOf(format(d, "d")), d.getDay(), cnt] as [
        number,
        number,
        number
      ];
    });

    const maxCount = Math.max(1, ...hd.map((v) => v[2]));

    return {
      dayLabels: dl,
      weekLabels: wl,
      heatData: hd,
      maxCount,
      ramp: [c0, c1],
    };
  }, [data, month, type]);

  if (loading) {
    return <div className="py-8 text-center">Loading…</div>;
  }
  if (!dayLabels.length) {
    return <div className="py-8 text-center">No data to show.</div>;
  }

  const option = {
    tooltip: {
      formatter: (p: any) => `${dayLabels[p.value[0]]}: ${p.value[2]}`,
    },
    visualMap: {
      min: 0,
      max: maxCount,
      orient: "horizontal" as const,
      left: "center",
      top: 10,
      inRange: { color: ramp },
      textStyle: { color: "#333" },
    },
    xAxis: {
      type: "category" as const,
      data: dayLabels,
      axisLabel: { rotate: 45, fontSize: 10 },
      splitArea: { show: true },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "category" as const,
      data: weekLabels,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: type,
        type: "heatmap" as const,
        data: heatData,
        emphasis: {
          itemStyle: { borderColor: "#333", borderWidth: 1 },
        },
      },
    ],
    grid: { containLabel: true, left: 30, right: 30, top: 80, bottom: 30 },
  };

  // If the parent asked us to skip the card, return the bare chart
  if (noCard) {
    return (
      <div className="p-4">
        <div className="text-lg font-medium mb-2">
          {format(month, "MMMM yyyy")} —{" "}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
        {total != null && (
          <p className="text-sm text-gray-600 mb-2">
            Total this month: <strong>{total}</strong>
          </p>
        )}
        <div className="w-full h-72">
          <ReactECharts
            option={option}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    );
  }

  // Otherwise, wrap in our own Card as before
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">
          {format(month, "MMMM yyyy")} —{" "}
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
        {total != null && (
          <p className="text-sm text-gray-600">
            Total this month: <strong>{total}</strong>
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="w-full h-72">
          <ReactECharts
            option={option}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
