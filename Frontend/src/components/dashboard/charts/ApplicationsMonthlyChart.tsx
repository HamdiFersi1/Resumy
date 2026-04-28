// src/components/HR/ApplicationsMonthlyChart.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { fetchDailyApplicationCounts } from "@/apis/HR/applicationApi";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DataPoint = { date: string; count: number };

export const ApplicationsMonthlyChart = React.memo(function ApplicationsMonthlyChart({
  jobId,
  jobTitle,
}: {
  jobId?: number;
  jobTitle?: string;
}) {
  // build initial "YYYY-MM" for current month
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1; // 1–12

  const toYYYYMM = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // state holds "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(toYYYYMM(now));
  const selectedLabel = new Date(
    Number(selectedMonth.slice(0, 4)),
    Number(selectedMonth.slice(5)) - 1,
    1
  ).toLocaleString("en-US", { month: "long", year: "numeric" });

  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  // reset fetched whenever jobId or month changes
  useEffect(() => {
    fetched.current = false;
  }, [jobId, selectedMonth]);

  // fetch daily counts
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const [y, m] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    const daysInMonth = lastDay.getDate();

    setLoading(true);
    fetchDailyApplicationCounts(
      jobId,
      daysInMonth,
      firstDay.toISOString().split("T")[0],
      lastDay.toISOString().split("T")[0]
    )
      .then((response) => {
        const complete: DataPoint[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dt = new Date(y, m - 1, day);
          const dateStr = dt.toISOString().split("T")[0];
          const found = response.time_series.find((i) => i.date === dateStr);
          complete.push({
            date: dt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count: found ? Math.round(found.count) : 0,
          });
        }
        setChartData(complete);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId, selectedMonth]);

  // handlers for prev/next
  const goPrev = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const dt = new Date(y, m - 2, 1); // previous month
    // don't go before January of this year
    if (dt.getFullYear() === thisYear && dt.getMonth() + 1 < 1) return;
    setSelectedMonth(toYYYYMM(dt));
  };
  const goNext = () => {
    const [y, m] = selectedMonth.split("-").map(Number);
    const dt = new Date(y, m, 1); // next month
    // don't go past current month
    if (dt.getFullYear() > thisYear || dt.getMonth() + 1 > thisMonth) return;
    setSelectedMonth(toYYYYMM(dt));
  };

  const option = {
    tooltip: { trigger: "axis", formatter: "{b}<br/>Applications: {c}" },
    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
    xAxis: {
      type: "category",
      data: chartData.map((i) => i.date),
      axisLabel: { rotate: 45, fontSize: 10, interval: 0 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      minInterval: 1,
      axisLabel: {
        formatter: (v: number) => (Number.isInteger(v) ? `${v}` : ""),
      },
    },
    series: [
      {
        data: chartData.map((i) => i.count),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2, color: "#3b82f6" },
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.5)" },
              { offset: 1, color: "rgba(59,130,246,0.05)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Monthly Applications</CardTitle>
          <CardDescription>
            {jobTitle ?? (jobId ? `Job #${jobId}` : "All Jobs")} |{" "}
            {selectedLabel}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goPrev}
            disabled={selectedMonth === `${thisYear}-01`}
          >
            <ChevronLeft />
          </Button>
          <div className="px-4 py-2 bg-muted rounded-md">{selectedLabel}</div>
          <Button
            variant="outline"
            size="icon"
            onClick={goNext}
            disabled={selectedMonth === toYYYYMM(now)}
          >
            <ChevronRight />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="p-4 text-center">No data for this month</div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: "350px", width: "100%" }}
          />
        )}
      </CardContent>
    </Card>
  );
});
