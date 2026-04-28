"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from "recharts";

interface TotalScoreCardProps {
  totalScorePercent: number;
}

export function TotalScoreCard({ totalScorePercent }: TotalScoreCardProps) {
  const data = [{ metric: "Total", value: totalScorePercent }];
  const config = { value: { label: "Total Score" } } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Score</CardTitle>
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
            <PolarGrid gridType="circle" radialLines={false} stroke="none" />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) =>
                  viewBox.cx && viewBox.cy ? (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="text-4xl font-bold fill-foreground"
                      >
                        {totalScorePercent.toFixed(0)}%
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy + 24}
                        className="fill-muted-foreground"
                      >
                        Total
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Overall match score
        </div>
      </CardFooter>
    </Card>
  );
}
