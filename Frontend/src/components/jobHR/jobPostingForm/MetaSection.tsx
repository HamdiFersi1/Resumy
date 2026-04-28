"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { JobForm } from "./types";

interface Props {
  form: JobForm;
  onChange: (field: keyof JobForm, value: string) => void;
}

export function MetaSection({ form, onChange }: Props) {
  const handleInput =
    (field: keyof JobForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(field, e.target.value);

  return (
    <fieldset className="space-y-6 bg-muted/30 dark:bg-muted/40 p-6 rounded-xl border border-border">
      <legend className="text-xl font-semibold text-foreground mb-2">
        Meta Information
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Remote, Tunis, Paris"
            value={form.location}
            onChange={handleInput("location")}
          />
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contract_type">Contract Type</Label>
          <Select
            value={form.contract_type}
            onValueChange={(value) =>
              onChange("contract_type", value as JobForm["contract_type"])
            }
          >
            <SelectTrigger id="contract_type">
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FT">Full time</SelectItem>
              <SelectItem value="PT">Part Time</SelectItem>
              <SelectItem value="IN">Internship</SelectItem>
              <SelectItem value="CT">Contract</SelectItem>
              <SelectItem value="FL">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category (manual input) */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="e.g., AI, Frontend, Data"
            value={form.category}
            onChange={handleInput("category")}
          />
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience Level</Label>
          <Select
            value={form.experience_level}
            onValueChange={(value) =>
              onChange("experience_level", value as JobForm["experience_level"])
            }
          >
            <SelectTrigger id="experience_level">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry-Level">Entry-Level</SelectItem>
              <SelectItem value="Mid-Level">Mid-Level</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </fieldset>
  );
}
