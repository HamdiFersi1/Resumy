// src/components/HR/ApplicationsAvgTotalScoreChart.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Line,
} from "recharts";
import { fetchDailyAverageScoreTrend } from "@/apis/HR/applicationApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  jobId?: number;
}

export default function ApplicationsAvgTotalScoreChart({
  jobId,
  jobTitle,
}: Props & { jobTitle?: string }) {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  // Reset fetch flag when jobId changes
  useEffect(() => {
    fetched.current = false;
  }, [jobId]);

  // Build last-7-day labels and fetch data (no *100)
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);

    const days: string[] = [];
    const weekdayLabels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
      weekdayLabels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    }
    setLabels(weekdayLabels);

    setLoading(true);
    fetchDailyAverageScoreTrend(jobId, 7)
      .then((res) => {
        // Assume res.time_series[].avg is already 0–100
        const m = new Map(res.time_series.map((t) => [t.date, t.avg]));
        setValues(days.map((date) => +(m.get(date) ?? 0).toFixed(2)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  // Combine into [{ day, score }, ...]
  const chartData = labels.map((label, i) => ({
    day: label,
    score: values[i],
  }));

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle className="text-base">Weekly Avg Total Score</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {jobTitle ?? (jobId ? `Job #${jobId}` : "All Jobs")}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-36">
            <Spinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="score-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="day"
                stroke="#6B7280"
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#6B7280"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickFormatter={(v) => `${v}%`}
              />
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
              <Tooltip
                formatter={(val: number) => `${val}%`}
                contentStyle={{ backgroundColor: "#fff", border: "none" }}
                labelStyle={{ display: "none" }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="none"
                fill="url(#score-gradient)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
