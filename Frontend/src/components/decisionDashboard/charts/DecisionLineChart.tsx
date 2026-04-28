/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/decisionDashboard/charts/DecisionEChartsLine.tsx
"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { fetchDailyApplicationCounts } from "@/apis/HR/applicationApi";

interface DecisionEChartsLineProps {
  jobId?: number;
  count: number; // ← new prop
}

export function DecisionLineChart({ jobId, count }: DecisionEChartsLineProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const fmt = (iso: string) => iso.slice(5); // “YYYY-MM-DD” → “MM-DD”

  // init / dispose
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current);
    return () => chartInstance.current?.dispose();
  }, []);

  // fetch + render
  useEffect(() => {
    if (!chartInstance.current) return;
    fetchDailyApplicationCounts(jobId, 30).then((resp) => {
      const xs = resp.time_series.map((d) => fmt(d.date));
      const ys = resp.time_series.map((d) => d.count);

      chartInstance.current!.setOption({
        title: {
          text: "Applications Over Time",
          subtext: jobId
            ? `Last 30 days for job #${jobId}`
            : "Last 30 days for all jobs",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          formatter: (params: any[]) => {
            const p = params[0];
            return `${p.axisValue}<br/>Applications: ${p.data}`;
          },
          backgroundColor: "#fff",
          textStyle: { color: "#333" },
          extraCssText: "box-shadow:0 2px 8px rgba(0,0,0,0.15);",
        },
        grid: { left: 40, right: 30, bottom: 50, top: 80 },
        xAxis: {
          type: "category",
          data: xs,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#ccc" } },
          axisTick: { alignWithLabel: true },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#eee" } },
        },
        series: [
          {
            name: "Applications",
            type: "line",
            smooth: true,
            data: ys,
            lineStyle: { width: 3, color: "hsl(var(--chart-1))" },
            symbol: "circle",
            symbolSize: 6,
            emphasis: { disabled: true },
          },
        ],
      });
    });
  }, [jobId]);

  return (
    <div className="relative rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Chart container */}
      <div ref={chartRef} style={{ width: "100%", height: 300 }} />

      {/* Floating count badge */}
      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-lg shadow flex flex-col items-center">
        <span className="text-xs text-muted-foreground">Applications</span>
        <span className="text-lg font-bold">{count}</span>
      </div>
    </div>
  );
}
