"use client";

import {
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface InterviewStatusChartProps {
  doneCount: number;
  notDoneCount: number;
}

export function InterviewStatusChart({
  doneCount,
  notDoneCount,
}: InterviewStatusChartProps) {
  const total = doneCount + notDoneCount;

  const chartData = [
    {
      name: "Interviews",
      done: doneCount,
      not_done: notDoneCount,
    },
  ];

  const chartConfig = {
    done: { label: "Done", color: "var(--chart-1)" },        // ✅ green
    not_done: { label: "Pending", color: "var(--chart-2)" }, // ✅ orange
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Interview Completion</CardTitle>
        <CardDescription>Progress overview</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[180px] w-full max-w-[180px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={60}
            outerRadius={90}
          >
            <ChartTooltip content={<ChartTooltipContent />} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-foreground text-xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-sm"
                        >
                          Interviews
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>

            <RadialBar
              dataKey="done"
              stackId="a"
              cornerRadius={5}
              fill="var(--chart-2)" // ✅ green
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="not_done"
              fill="var(--chart-1)" // ✅ orange
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 text-center text-sm pt-2">
        <div className="flex items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-1" style={{ color: "var(--chart-2)" }}>
            <span className="text-xl leading-none">●</span> Done
          </div>
          <div className="flex items-center gap-1" style={{ color: "var(--chart-1)" }}>
            <span className="text-xl leading-none">●</span> Pending
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          This chart shows the number of completed versus pending interviews.
        </p>
      </CardFooter>
    </Card>
  );
}
