"use client";

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
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { EnrichedInterview } from "./InterviewListContainer";
import { format } from "date-fns";

interface InterviewTotalChartProps {
  interviews: EnrichedInterview[];
  selectedDate?: Date | null;
  filterField?: "scheduled_at" | "created_at";
}

const chartConfig: ChartConfig = {
  interviews: {
    label: "Interviews",
    color: "var(--chart-2)",
  },
};

export function InterviewTotalChart({
  interviews,
  selectedDate,
  filterField,
}: InterviewTotalChartProps) {
  const total = interviews.length;

  const chartData = [
    {
      name: "interviews",
      interviews: total,
      fill: "var(--chart-2)",
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Interviews</CardTitle>
        <CardDescription>
          {selectedDate && filterField
            ? `Interviews ${filterField === "scheduled_at" ? "scheduled" : "accepted"} on ${format(
                selectedDate,
                "dd/MM/yyyy"
              )}`
            : "Based on applied filters"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[180px] w-full max-w-[180px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={60}
            outerRadius={90}
          >
            <PolarGrid gridType="circle" radialLines={false} stroke="none" polarRadius={[72, 60]} />
            <RadialBar dataKey="interviews" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                          className="fill-foreground text-xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
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
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 text-center text-sm pt-2">
  <p className="text-muted-foreground">
    This chart displays the total number of interviews recorded.
  </p>
 
</CardFooter>

    </Card>
  );
}
