// src/components/Rapport/JobComparisonChart.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAvailableDates,
  JobOption,
  AvailableDate,
} from "@/apis/HR/reportApi";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

interface JobComparisonChartProps {
  jobs: JobOption[];
  category: "accepted" | "declined" | "interview" | "scored";
  month: Date;
}

export function JobComparisonChart({
  jobs,
  category,
  month,
}: JobComparisonChartProps) {
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [dataMap, setDataMap] = useState<Record<number, AvailableDate[]>>({});

  // Whenever a job is selected for the first time, fetch its daily data
  useEffect(() => {
    selectedJobs.forEach((jobId) => {
      if (!dataMap[jobId]) {
        fetchAvailableDates(jobId).then((dates) => {
          setDataMap((m) => ({ ...m, [jobId]: dates }));
        });
      }
    });
  }, [selectedJobs.join(","), month]);

  // Build ECharts option
  const option = useMemo(() => {
    const mStart = startOfMonth(month);
    const mEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: mStart, end: mEnd });
    const xLabels = days.map((d) => format(d, "yyyy-MM-dd"));

    const series = selectedJobs.map((jobId) => {
      const recs = dataMap[jobId] || [];
      const dailyCounts = xLabels.map((date) => {
        const rec = recs.find((r) => r.date === date);
        return rec ? rec[category] : 0;
      });
      const jobLabel =
        jobs.find((j) => j.id === jobId)?.label || `Job ${jobId}`;
      return {
        name: jobLabel,
        type: "line" as const,
        data: dailyCounts,
        smooth: true,
      };
    });

    return {
      tooltip: { trigger: "axis" },
      legend: {
        top: 32,
        data: series.map((s) => s.name),
        textStyle: { fontSize: 12 },
      },
      xAxis: {
        type: "category" as const,
        data: xLabels,
        axisLabel: { rotate: 45, fontSize: 10 },
        axisLine: { show: true },
      },
      yAxis: { type: "value" as const },
      series,
      grid: { left: 50, right: 20, bottom: 50, top: 80 },
    };
  }, [dataMap, selectedJobs, category, month]);

  // Toggle job selection
  const toggleJob = (id: number) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Jobs Over Time</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col md:flex-row gap-6">
        {/* Left: Line Chart */}
        <div className="flex-1">
          {selectedJobs.length > 0 ? (
            <div className="w-full h-64">
              <ReactECharts
                option={option}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Select one or more jobs on the right to compare.
            </p>
          )}
        </div>

        {/* Right: Job List */}
        <div className="w-full md:w-64">
          <h3 className="text-lg font-semibold mb-4  ">Jobs</h3>
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`job-compare-${job.id}`}
                  checked={selectedJobs.includes(job.id)}
                  onCheckedChange={() => toggleJob(job.id)}
                />
                <Label
                  htmlFor={`job-compare-${job.id}`}
                  className="cursor-pointer"
                >
                  {job.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
