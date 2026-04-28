// src/components/Application/SkillBreakdownCard.tsx
"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SkillBreakdownCardProps {
  exp: number;
  skills: number;
  projects: number;
  education: number;
}

// Transform scores into chartData format
const prepareData = (
  exp: number,
  skills: number,
  projects: number,
  education: number
) => [
  { month: "Experience", desktop: exp },
  { month: "Skills", desktop: skills },
  { month: "Projects", desktop: projects },
  { month: "Education", desktop: education },
];

// Chart config matches the example theme
const chartConfig = {
  desktop: { label: "Score", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function SkillBreakdownCard({
  exp,
  skills,
  projects,
  education,
}: SkillBreakdownCardProps) {
  const chartData = prepareData(exp, skills, projects, education);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Skill Breakdown</CardTitle>
        <CardDescription>Comparison of sub-scores</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid className="fill-[--color-desktop] opacity-20" />
            <PolarAngleAxis dataKey="month" />
            <Radar
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Skill Breakdown
        </div>
      </CardFooter>
    </Card>
  );
}
