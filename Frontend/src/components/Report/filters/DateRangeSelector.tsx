//src/components/Report/filters/DateRangeSelector.tsx

"use client";

import  { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatISO } from "date-fns";

export interface DateRange {
  start: string; // "YYYY-MM-DD"
  end: string;
}

export function DateRangeSelector({
  onChange,
}: {
  onChange: (range: DateRange) => void;
}) {
  // use the shape DayPickerRangeProps wants:
  const [selected, setSelected] = useState<
    | {
        from: Date;
        to?: Date;
      }
    | undefined
  >(undefined);

  const apply = () => {
    if (selected?.from && selected.to) {
      onChange({
        start: formatISO(selected.from, { representation: "date" }),
        end: formatISO(selected.to, { representation: "date" }),
      });
    }
  };

  const label =
    selected?.from && selected.to
      ? `${selected.from.toLocaleDateString()} – ${selected.to.toLocaleDateString()}`
      : "Select date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-auto">
        <div className="space-y-2">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={(range) => {
              // `range` may be undefined or {from, to}
              if (range && range.from) {
                setSelected({ from: range.from, to: range.to });
              } else {
                setSelected(undefined);
              }
            }}
          />
          <Button
            size="sm"
            className="w-full"
            onClick={apply}
            disabled={!selected?.from || !selected?.to}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
