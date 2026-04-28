/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Report/JobPopularityRadial.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchJobPopularityPercent } from "@/apis/HR/reportApi";

export function JobPopularityRadial({ jobId }: { jobId: number }) {
  const [popularity, setPopularity] = useState(0);

  useEffect(() => {
    fetchJobPopularityPercent(jobId).then((p) => {
      setPopularity(Math.round(p * 100)); // convert to percent int
    });
  }, [jobId]);

  const data = [
    { name: "pop", value: popularity, fill: "hsl(var(--chart-2))" },
  ];

  return (
    <Card className="max-w-xs mx-auto flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Job Popularity</CardTitle>
        <CardDescription>Share of total applications</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <RadialBarChart
          width={180}
          height={180}
          cx="50%"
          cy="50%"
          innerRadius="75%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarGrid gridType="circle" radialLines={false} />
          <RadialBar
            minAngle={15}
            clockWise
            dataKey="value"
            cornerRadius={8}
            background={{ fill: "var(--muted)" }}
          />
          <PolarRadiusAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          >
            <Label
              position="center"
              content={({ viewBox }) => {
                const { cx, cy } = viewBox as any;
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={cx}
                      y={cy}
                      className="text-3xl font-bold fill-foreground"
                    >
                      {popularity}%
                    </tspan>
                  </text>
                );
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </CardContent>

      <CardFooter className="flex-col gap-1 text-sm">
        <div className="flex items-center gap-1 text-primary">
          Trending up <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          of all applications for this job
        </div>
      </CardFooter>
    </Card>
  );
}
