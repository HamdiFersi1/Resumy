/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/jobList/charts/BarPostingsChart.tsx
"use client";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  LabelList,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Spinner } from "@/components/ui/Spinner";

interface DataItem {
  period: string;
  count: number;
  fullDate?: string;
}

interface Props {
  data: DataItem[];
  loading: boolean;
  groupByLabel: string;
}

const config = {
  count: { label: "Postings", color: "hsl(var(--chart-1))" },
  period: { label: "" }, // label injected dynamically
} satisfies ChartConfig;

export function BarPostingsChart({ data, loading, groupByLabel }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ChartContainer
      config={{ ...config, period: { label: groupByLabel } }}
      className="mx-auto h-full"
    >
      <BarChart data={data} margin={{ top: 20 }} height={192}>
        <CartesianGrid vertical={false} opacity={0.1} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const { fullDate, count } = payload[0].payload as any;
              return (
                <div className="bg-white p-2 border rounded shadow">
                  <div className="font-semibold">{fullDate}</div>
                  <div>{count} postings</div>
                </div>
              );
            }
            return null;
          }}
          cursor={false}
        />
        <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={8}>
          <LabelList position="top" className="fill-foreground" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
