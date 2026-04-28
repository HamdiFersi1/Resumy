"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { JobForm } from "./types";

interface Props {
  form: JobForm;
  onChange: (field: keyof JobForm, value: string) => void;
}

export function DatesSection({ form, onChange }: Props) {
  // Convert the stored string ("YYYY-MM-DD") to a Date object (or undefined)
  const startDateValue = form.application_start
    ? parseISO(form.application_start)
    : undefined;
  const deadlineValue = form.application_deadline
    ? parseISO(form.application_deadline)
    : undefined;

  // Local state to control the popover’s open state (optional)
  const [openStart, setOpenStart] = useState(false);
  const [openDeadline, setOpenDeadline] = useState(false);

  return (
    <fieldset className="space-y-6 bg-muted/20 dark:bg-muted/30 p-6 rounded-xl border border-border">
      <legend className="text-xl font-semibold text-foreground mb-2">
        Timeline
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* ─── Start Date Picker ─── */}
        <div className="space-y-2">
          <Label htmlFor="application_start">Start Date</Label>
          <Popover open={openStart} onOpenChange={setOpenStart}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between border border-input bg-background px-3 py-2 rounded-md text-left text-sm placeholder:text-muted-foreground"
              >
                {startDateValue
                  ? format(startDateValue, "yyyy-MM-dd")
                  : "Select start date"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDateValue || new Date()}
                onSelect={(date) => {
                  if (date) {
                    const formatted = format(date, "yyyy-MM-dd");
                    onChange("application_start", formatted);
                    setOpenStart(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* ─── Deadline Picker ─── */}
        <div className="space-y-2">
          <Label htmlFor="application_deadline">Deadline</Label>
          <Popover open={openDeadline} onOpenChange={setOpenDeadline}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between border border-input bg-background px-3 py-2 rounded-md text-left text-sm placeholder:text-muted-foreground"
              >
                {deadlineValue
                  ? format(deadlineValue, "yyyy-MM-dd")
                  : "Select deadline"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadlineValue || new Date()}
                onSelect={(date) => {
                  if (date) {
                    const formatted = format(date, "yyyy-MM-dd");
                    onChange("application_deadline", formatted);
                    setOpenDeadline(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </fieldset>
  );
}
