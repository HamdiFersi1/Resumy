// src/components/dashboard/admin/HRDetailChart.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { TrendingUp, ArrowUp, ArrowDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export type ChartTab = "accepted" | "declined" | "interviews";
export type TimePeriod = "day" | "week" | "month";

interface HRDetailChartProps {
  acceptedDates?: string[];
  declinedDates?: string[];
  interviewDates?: string[];
  activeTab: ChartTab;
  onTabChange: (tab: ChartTab) => void;
  className?: string;
}

// Calculate ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const week1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getUTCDay() + 6) % 7)) /
        7
    )
  );
}

// Build grouped chart data
const makeChartData = (
  dates: string[],
  timePeriod: TimePeriod
): ChartDataItem[] => {
  const counts: Record<string, { count: number; dates: string[] }> = {};

  dates.forEach((iso) => {
    const d = new Date(iso);
    let key: string;
    let monthLabel: string | undefined;

    if (timePeriod === "day") {
      key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } else if (timePeriod === "week") {
      key = `Week ${getISOWeek(d)}`;
    } else {
      monthLabel = d.toLocaleDateString(undefined, { month: "long" });
      key = d.toLocaleDateString(undefined, { month: "short" });
    }

    if (!counts[key]) counts[key] = { count: 0, dates: [] };
    counts[key].count++;
    counts[key].dates.push(iso);
  });

  return (
    Object.entries(counts)
      .map(([period, { count, dates }]) => {
        const sorted = dates.sort();
        const start = new Date(sorted[0]).toISOString();
        const end = new Date(sorted.at(-1)!).toISOString();
        return {
          period,
          count,
          startDate: start,
          endDate: end,
          month:
            timePeriod === "month"
              ? new Date(sorted[0]).toLocaleDateString(undefined, {
                  month: "long",
                })
              : undefined,
        };
      })
      // sort all periods by startDate chronologically
      .sort(
        (a, b) =>
          new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
      )
  );
};

// Summary cards display
function SummaryCards({
  total,
  current,
  previous,
  average,
  activeTab,
  periodLabel,
}: {
  total: number;
  current: number;
  previous: number;
  average: number;
  activeTab: ChartTab;
  periodLabel: string;
}) {
  const badgeProps = (value: number) => ({
    variant: value >= 0 ? "default" : "destructive",
    className: "gap-1 text-xs mb-1",
  });
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total */}
      <Card className="p-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total {activeTab}
          </span>
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
            All time
          </span>
        </div>
        <div className="text-3xl font-bold mt-2">{total}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {activeTab === "interviews" ? "Scheduled " : ""}
          {activeTab} count
        </div>
      </Card>

      {/* Comparison */}
      <Card className="p-4">
        <span className="text-sm font-medium text-muted-foreground">
          {periodLabel} Comparison
        </span>
        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="text-3xl font-bold">{current}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="flex flex-col items-end">
            <Badge {...badgeProps(current - previous)}>
              {current - previous >= 0 ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(
                previous
                  ? Math.round(((current - previous) / previous) * 100)
                  : 100
              )}
              %
            </Badge>
            <div className="text-lg font-bold">{previous || "-"}</div>
            <div className="text-xs text-muted-foreground">Previous</div>
          </div>
        </div>
      </Card>

      {/* Average */}
      <Card className="p-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Average
          </span>
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
            {periodLabel}
          </span>
        </div>
        <div className="text-3xl font-bold mt-2">{average}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Based on {average} {periodLabel.toLowerCase()}
        </div>
      </Card>
    </div>
  );
}

export function HRDetailChart({
  acceptedDates = [],
  declinedDates = [],
  interviewDates = [],
  activeTab,
  onTabChange,
  className,
}: HRDetailChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");

  const dataMaker = useCallback(
    (dates: string[]) => makeChartData(dates, timePeriod),
    [timePeriod]
  );

  const acceptedData = useMemo(
    () => dataMaker(acceptedDates),
    [acceptedDates, dataMaker]
  );
  const declinedData = useMemo(
    () => dataMaker(declinedDates),
    [declinedDates, dataMaker]
  );
  const interviewData = useMemo(
    () => dataMaker(interviewDates),
    [interviewDates, dataMaker]
  );

  const currentData =
    activeTab === "accepted"
      ? acceptedData
      : activeTab === "declined"
      ? declinedData
      : interviewData;

  const total = useMemo(
    () => currentData.reduce((s, i) => s + i.count, 0),
    [currentData]
  );
  const cur = currentData.at(-1)?.count || 0;
  const prev = currentData.length > 1 ? currentData.at(-2)!.count : 0;
  const avg = Math.round(total / (currentData.length || 1));

  const progress = prev
    ? Math.round(((cur - prev) / prev) * 100)
    : cur
    ? 100
    : 0;

  const periodLabel =
    timePeriod === "day"
      ? "Daily"
      : timePeriod === "week"
      ? "Weekly"
      : "Monthly";

  if (!currentData.length) {
    return (
      <Card className={`${className} flex items-center justify-center py-12`}>
        <p className="text-muted-foreground">
          No {activeTab} data for {periodLabel.toLowerCase()}
        </p>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">
              Hiring Analytics Dashboard
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="hidden sm:inline">Showing</span>
              <Badge variant="outline" className="capitalize">
                {activeTab}
              </Badge>
              <span>data by</span>
              <Badge variant="outline" className="capitalize">
                {periodLabel.toLowerCase()}
              </Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={timePeriod}
              onValueChange={(v) => setTimePeriod(v as TimePeriod)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={activeTab}
              onValueChange={(v) => onTabChange(v as ChartTab)}
              variant="outline"
              className="flex-wrap"
            >
              {(["accepted", "declined", "interviews"] as ChartTab[]).map(
                (tab) => (
                  <ToggleGroupItem
                    key={tab}
                    value={tab}
                    aria-label={tab}
                    className="px-3 py-1 text-sm flex items-center gap-1.5"
                  >
                    {tab === "accepted" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : tab === "declined" ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                    {tab}
                  </ToggleGroupItem>
                )
              )}
            </ToggleGroup>
          </div>
        </CardHeader>

        <CardContent>
          <SummaryCards
            total={total}
            current={cur}
            previous={prev}
            average={avg}
            activeTab={activeTab}
            periodLabel={periodLabel}
          />
        </CardContent>

        <CardFooter className="flex-col gap-2 pt-2 border-t text-sm">
          <div className="flex items-center gap-2 text-base font-medium">
            Trending {progress >= 0 ? "up" : "down"} by {Math.abs(progress)}%
            <TrendingUp
              className={`h-5 w-5 ${
                progress >= 0 ? "text-green-600" : "text-destructive rotate-180"
              }`}
            />
          </div>
          <span className="text-muted-foreground">
            Showing {currentData.length} {periodLabel.toLowerCase()}
          </span>
        </CardFooter>
      </Card>

      {/* Charts */}
    </div>
  );
}
