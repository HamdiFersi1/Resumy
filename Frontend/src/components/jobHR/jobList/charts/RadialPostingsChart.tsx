// src/components/jobList/charts/RadialPostingsChart.tsx
"use client";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label as RechartsLabel,
} from "recharts";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  totalJobs: number;
  loading: boolean;
}

const config = {
  value: { label: "Total Postings" },
  Jobs: { label: "Jobs", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function RadialPostingsChart({ totalJobs, loading }: Props) {
  const data = [{ name: "Jobs", value: totalJobs }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ChartContainer
      config={config}
      className="mx-auto aspect-square max-h-[200px]"
    >
      <RadialBarChart
        data={data}
        startAngle={0}
        endAngle={250}
        innerRadius={60}
        outerRadius={80}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          polarRadius={[66, 54]}
        />
        <RadialBar
          dataKey="value"
          background
          cornerRadius={10}
          fill="var(--primary)"
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <RechartsLabel
            content={({ viewBox }) =>
              viewBox.cx != null &&
              viewBox.cy != null && (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan className="text-2xl font-bold">{totalJobs}</tspan>
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy + 20}
                    className="text-sm fill-muted-foreground"
                  >
                    Postings
                  </tspan>
                </text>
              )
            }
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
