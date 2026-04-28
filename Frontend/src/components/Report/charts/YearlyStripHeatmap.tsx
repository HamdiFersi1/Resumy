/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Rapport/charts/YearlyStripHeatmap.tsx
"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { fetchAvailableDates, AvailableDate } from "@/apis/HR/reportApi";
import { parseISO, eachDayOfInterval, startOfYear, format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function YearlyStripHeatmap({
  type,
}: {
  type: "accepted" | "declined" | "interview";
}) {
  const [data, setData] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableDates()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-8 text-center">Loading…</div>;
  if (!data.length)
    return <div className="py-8 text-center">No activity data available.</div>;

  // full year from Jan 1 to today
  const now = new Date();
  const yearStart = startOfYear(now);
  const days = eachDayOfInterval({ start: yearStart, end: now });

  // heatmap data
  const heatData: [string, number][] = days.map((day) => {
    const iso = day.toISOString().slice(0, 10);
    const rec = data.find((d) => d.date === iso);
    return [iso, rec ? rec[type] : 0];
  });

  const maxCount = Math.max(...heatData.map(([, v]) => v));

  const option = {
    tooltip: {
      formatter: (p: any) =>
        `${format(parseISO(p.value[0]), "MMM d, yyyy")}: ${p.value[1]}`,
    },
    visualMap: {
      min: 0,
      max: maxCount,
      show: false,
    },
    calendar: {
      top: 80,
      left: 80, // shift right to fit weekday labels
      right: 20,
      orient: "horizontal",
      range: [
        yearStart.toISOString().slice(0, 10),
        now.toISOString().slice(0, 10),
      ],
      cellSize: [16, 16],
      dayLabel: {
        firstDay: 1,
        nameMap: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
      monthLabel: {
        nameMap: "en",
        margin: 10,
      },
      monthLine: {
        show: true,
        lineStyle: {
          color: "#000",
          width: 2,
        },
      },
      splitLine: { show: true },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: heatData,
        emphasis: {
          itemStyle: {
            borderColor: "#555",
            borderWidth: 1,
          },
        },
      },
    ],
  };

  return (
    <Card className="max-w-5xl mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">
          Yearly Activity: {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex justify-center">
        <div className="w-full h-64">
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
