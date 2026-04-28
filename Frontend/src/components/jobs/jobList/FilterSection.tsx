"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // ✅ added
import type { JobQueryParams } from "@/hooks/jobs/useJobHook";

const CONTRACT_OPTIONS = [
  { value: "FT", label: "Full-time" },
  { value: "PT", label: "Part-time" },
  { value: "IN", label: "Internship" },
  { value: "CT", label: "Contract" },
  { value: "FL", label: "Freelance" },
];

const EXPERIENCE_OPTIONS = [
  { value: "Junior", label: "Junior" },
  { value: "Mid", label: "Mid-level" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
];

interface FilterSectionProps {
  filters: JobQueryParams;
  onFilterChange: (field: keyof JobQueryParams, value: string) => void;
  onReset: () => void;
}

export function FilterSection({
  filters,
  onFilterChange,
  onReset,
}: FilterSectionProps) {
  return (
    <div className="bg-background text-foreground p-8 rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Filter Jobs</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-red-600 hover:text-red-700 hover:underline"
        >
          Clear all
        </Button>
      </div>

      <Separator className="mb-6 border-border" />

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="search" className="mb-1 text-sm font-medium">
            Title
          </label>
          <Input
            id="search"
            placeholder="e.g. Developer…"
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <label htmlFor="category" className="mb-1 text-sm font-medium">
            Category
          </label>
          <Input
            id="category"
            placeholder="e.g. Engineering…"
            value={filters.category ?? ""}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label htmlFor="location" className="mb-1 text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            placeholder="e.g. Lyon, Remote…"
            value={filters.location ?? ""}
            onChange={(e) => onFilterChange("location", e.target.value)}
            className="h-12"
          />
        </div>

        {/* Experience */}
        <div className="flex flex-col">
          <label htmlFor="experience_level" className="mb-1 text-sm font-medium">
            Experience
          </label>
          <Select
            value={filters.experience_level ?? ""}
            onValueChange={(val) => onFilterChange("experience_level", val)}
          >
            <SelectTrigger id="experience_level" className="h-12">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contract */}
        <div className="flex flex-col">
          <label htmlFor="contract_type" className="mb-1 text-sm font-medium">
            Contract
          </label>
          <Select
            value={filters.contract_type ?? ""}
            onValueChange={(val) => onFilterChange("contract_type", val)}
          >
            <SelectTrigger id="contract_type" className="h-12">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
