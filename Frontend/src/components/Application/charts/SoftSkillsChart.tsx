// src/components/dashboard/charts/SoftSkillsDetailChart.tsx
"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector, Cell } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  fetchApplicationDetail,
  ApplicationDetail,
} from "@/apis/HR/applicationApi";
import {
  computeMicroSkillScores,
  MicroCategory,
} from "../../../lib/application/softSkills";

const ALL_CATEGORIES: MicroCategory[] = [
  "communication",
  "leadership",
  "teamwork",
  "adaptability",
];

// Chart configuration mapping categories to labels and colors
const chartConfig = {
  communication: { label: "Communication", color: "hsl(var(--chart-1))" },
  leadership: { label: "Leadership", color: "hsl(var(--chart-2))" },
  teamwork: { label: "Teamwork", color: "hsl(var(--chart-3))" },
  adaptability: { label: "Adaptability", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

interface Props {
  /**
   * ID of the application to fetch details for
   */
  applicationId: number;
}

export function SoftSkillsChart({ applicationId }: Props) {
  const [app, setApp] = React.useState<ApplicationDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [activeCat, setActiveCat] = React.useState<MicroCategory>(
    ALL_CATEGORIES[0]
  );

  // Fetch application details
  React.useEffect(() => {
    fetchApplicationDetail(applicationId)
      .then(setApp)
      .catch((err) => {
        console.error(err);
        setError("Failed to load application details.");
      });
  }, [applicationId]);

  // Compute micro-skill scores from snapshot JSON
  const microScores = React.useMemo(() => {
    if (!app) return {} as Record<MicroCategory, number>;
    return computeMicroSkillScores(app.snapshot_json);
  }, [app]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!app) return <p>Loading soft-skills chart…</p>;

  // Build data array for pie chart
  const data = ALL_CATEGORIES.map((cat) => ({
    metric: cat,
    value: microScores[cat] ?? 0,
    fill: chartConfig[cat].color,
  }));

  // Determine active slice index
  const activeIndex = data.findIndex((item) => item.metric === activeCat);

  return (
    <Card data-chart="softSkillsPie" className="flex flex-col">
      <ChartStyle id="softSkillsPie" config={chartConfig} />

      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Soft Skills Breakdown</CardTitle>
          <CardDescription>Micro-skill distribution</CardDescription>
        </div>

        {/* Dropdown to select which category to highlight */}
        <Select
          value={activeCat}
          onValueChange={(val) => setActiveCat(val as MicroCategory)}
        >
          <SelectTrigger
            className="ml-auto h-7 w-[140px] rounded-lg pl-2.5"
            aria-label="Select category"
          >
            <SelectValue placeholder="Select skill" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {ALL_CATEGORIES.map((cat) => {
              const cfg = chartConfig[cat];
              return (
                <SelectItem key={cat} value={cat} className="rounded-lg">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id="softSkillsPie"
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="metric"
              innerRadius={60}
              outerRadius={100}
              activeIndex={activeIndex}
              activeShape={(props: PieSectorDataItem) => (
                <g>
                  <Sector
                    {...props}
                    outerRadius={(props.outerRadius || 0) + 10}
                  />
                  <Sector
                    {...props}
                    outerRadius={(props.outerRadius || 0) + 25}
                    innerRadius={(props.outerRadius || 0) + 12}
                  />
                </g>
              )}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.metric === activeCat
                      ? entry.fill
                      : "var(--muted-foreground)"
                  }
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (
                    viewBox &&
                    typeof viewBox.cx === "number" &&
                    typeof viewBox.cy === "number"
                  ) {
                    const active = data[activeIndex];
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {active.value}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 24}
                          className="fill-muted-foreground"
                        >
                          {chartConfig[active.metric].label}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          <span className="font-medium">Micro-skills</span> are the building
          blocks of soft skills. They are specific, observable behaviors that
          contribute to a larger skill set.
          
        </div>
      </CardFooter>
    </Card>
  );
}
