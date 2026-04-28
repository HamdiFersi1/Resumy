/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/jobList/charts/GroupBySelector.tsx
"use client";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface Props {
    /** Current group by value */
    groupBy: "weekday" | "month";
    onChange: (v: "month" | "weekday") => void;
}

export function GroupBySelector({ groupBy = "weekday", onChange }: Props) {
    return (
        <Select
            value={groupBy}
            defaultValue="weekday"
            onValueChange={(v) => onChange(v as any)}
        >
            <SelectTrigger className="w-36">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="weekday">By Weekday</SelectItem>
            </SelectContent>
        </Select>
    );
}
