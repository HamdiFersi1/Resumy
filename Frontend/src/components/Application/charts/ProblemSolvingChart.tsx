// src/components/dashboard/charts/ProblemSolvingChart.tsx
"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, CartesianGrid, Cell } from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  fetchApplicationDetail,
  ApplicationDetail,
} from "@/apis/HR/applicationApi";
import { computeMicroSkillScores } from "../../../lib/application/softSkills";

// Only one entry in your config, using a CSS variable you already have:
const chartConfig = {
  problem_solving: {
    label: "Problem Solving",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

interface Props {
  applicationId: number;
}

export function ProblemSolvingChart({ applicationId }: Props) {
  const [app, setApp] = React.useState<ApplicationDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchApplicationDetail(applicationId)
      .then(setApp)
      .catch(() => setError("Failed to load application details."));
  }, [applicationId]);

  const data = React.useMemo(() => {
    if (!app) return [];
    const scores = computeMicroSkillScores(app.snapshot_json);
    return [
      {
        metric: chartConfig.problem_solving.label,
        value: scores.problem_solving,
        fill: chartConfig.problem_solving.color,
      },
    ];
  }, [app]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!app) return <p>Loading problem-solving chart…</p>;

  return (
    <Card>
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div>
          <CardTitle>Problem Solving</CardTitle>
          <CardDescription>Micro-skill breakdown</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="h-56">
        <ChartContainer config={chartConfig} className="h-full">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            barCategoryGap="30%"
          >
            {/* light grid lines behind the bar */}
            <CartesianGrid
              stroke="#9DB2BF" /* Tailwind gray-200 */
              strokeDasharray="4 4" /* dashed lines */
              horizontal={true}
              vertical={true}
              opacity={0.6}
            />

            <XAxis
              dataKey="metric"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Bar dataKey="value" barSize={40} radius={6}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-1 text-sm">
        <div className="font-medium">Problem-solving</div>
        <div className="text-muted-foreground">
          Estimate on job seeker problem-solving skill
        </div>
      </CardFooter>
    </Card>
  );
}
