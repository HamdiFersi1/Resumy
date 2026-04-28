"use client";

import  { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { JobPostingSummary } from "@/apis/admin/accountApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  PolarGrid,
  Label,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";

interface JobPostingTableProps {
  jobs: JobPostingSummary[];
  filter: string;
  onFilterChange: (v: string) => void;
}

export function JobPostingTable({
  jobs,
  filter,
  onFilterChange,
}: JobPostingTableProps) {
  const [selectedJob, setSelectedJob] = useState<JobPostingSummary | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(filter.toLowerCase())
  );

  const chartConfig: ChartConfig = {
    popularity: { label: "Popularity" },
  };

  const renderRadialChart = (popularity: number) => {
    const chartData = [
      { label: "popularity", popularity, fill: "hsl(var(--chart-2))" },
    ];
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Job Popularity</CardTitle>
          <CardDescription>{selectedJob?.title}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={250}
              innerRadius={80}
              outerRadius={110}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                polarRadius={[86, 74]}
              />
              <RadialBar dataKey="popularity" background cornerRadius={10} />
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
                            className="fill-foreground text-4xl font-bold"
                          >
                            {popularity.toFixed(0)}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Popularity
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing application ratio compared to all jobs
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-4 w-full">
      <Input
        placeholder="Filter by job title…"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="max-w-sm"
      />

      <div className="w-full overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Title</TableHead>
              <TableHead className="w-[140px]">Location</TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
              <TableHead className="w-[130px]">Deadline</TableHead>
              <TableHead className="w-[130px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow
                key={job.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedJob(job);
                  setOpen(true);
                }}
              >
                <TableCell className="truncate max-w-[220px]">
                  {job.title}
                </TableCell>
                <TableCell className="truncate max-w-[140px]">
                  {job.location}
                </TableCell>
                <TableCell>{job.contract_type}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {job.application_deadline}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {new Date(job.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Job Popularity Insight</DialogTitle>
          </DialogHeader>
          {selectedJob && renderRadialChart(selectedJob.popularity)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
