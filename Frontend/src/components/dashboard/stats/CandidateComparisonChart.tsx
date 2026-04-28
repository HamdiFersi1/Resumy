"use client";

import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, BarChart, Bar, XAxis } from "recharts";
import { Application } from "@/apis/HR/applicationApi";

interface Props {
  candidates: Application[];
  selectedJobTitle: string;
  height?: number;
}

export const CandidateComparisonChart: React.FC<Props> = ({
  candidates,
  selectedJobTitle,
  height = 140,
}) => {
  const chartData = [
    "experience_score",
    "skills_score",
    "projects_score",
    "education_score",
    "total_score",
  ].map((key) => {
    const row: any = { metric: key.replace("_score", "") };
    candidates.forEach((c) => {
      row[c.applicant] = (c as any)[key] * 100;
    });
    return row;
  });

  const chartConfig = Object.fromEntries(
    candidates.map((c, idx) => [
      c.applicant,
      {
        label: c.applicant,
        color: `var(--chart-${(idx % 4) + 1})`,
      },
    ])
  );

  return (
    <div className="mt-2 px-2 py-1">
      <div className="mb-2">
        <h3 className="text-base font-semibold">Candidate Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Score breakdown for <strong>{selectedJobTitle || "all jobs"}</strong>
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <ChartContainer config={chartConfig}>
          <BarChart width={480} height={height} data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="metric"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {candidates.map((c, idx) => (
              <Bar
                key={c.id}
                dataKey={c.applicant}
                fill={`var(--chart-${(idx % 4) + 1})`}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col gap-1 text-sm mt-2">
        <div className="font-medium">Comparison of experience, skills, education, etc.</div>
        <div className="text-muted-foreground">
          Based on application score breakdown
        </div>
      </div>
    </div>
  );
};