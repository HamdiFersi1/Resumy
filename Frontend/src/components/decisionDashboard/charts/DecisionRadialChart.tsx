/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/decisionDashboard/charts/DecisionRadialChart.tsx
"use client";

import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { StatusFilter } from "../DecisionFilterToolbar";

interface DecisionRadialChartProps {
  status: StatusFilter;
  count: number;
}

export function DecisionRadialChart({
  status,
  count,
}: DecisionRadialChartProps) {
  const fills: Record<StatusFilter, string> = {
    accepted: "var(--chart-1)",
    declined: "var(--chart-2)",
    all: "var(--muted-foreground)",
  };

  const labels: Record<StatusFilter, string> = {
    accepted: "Accepted",
    declined: "Declined",
    all: "All",
  };

  const data = [{ key: status, value: count, fill: fills[status] }];
  const config: ChartConfig = {
    value: { label: "Count" },
    accepted: { label: "Accepted" },
    declined: { label: "Declined" },
    all: { label: "All" },
  };

  const label = labels[status];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Decisions: {label}</CardTitle>
        <CardDescription>
          Showing {status === "all" ? "all decisions" : `only “${label}”`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={data}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />

            <RadialBar dataKey="value" background cornerRadius={10} />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  // Cast viewBox to any to access cx and cy safely
                  const { cx = 0, cy = 0 } = (viewBox as any) || {};
                  if (typeof cx !== "number" || typeof cy !== "number") return null;
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
                        className="fill-foreground text-4xl font-bold"
                      >
                        {count.toLocaleString()}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 24}
                        className="fill-muted-foreground"
                      >
                        {label}
                      </tspan>
                    </text>
                  );
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
        </div>
      </CardFooter>
    </Card>
  );
}
