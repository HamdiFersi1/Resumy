/* eslint-disable @typescript-eslint/no-explicit-any */
//src/components/interviews/details/InterviewForm.tsx

"use client";

import * as React from "react";
import type {
  InterviewContext,
  InterviewForm as _InterviewForm,
} from "@/apis/HR/interviewsApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

export interface InterviewFormProps {
  interview: InterviewContext;
  onCancel: () => void;
  // only patch fields, not requiring `application`
  onSave: (vals: Partial<Omit<_InterviewForm, "application">>) => Promise<void>;
}

export const InterviewDetailsForm: React.FC<InterviewFormProps> = ({
  interview,
  onCancel,
  onSave,
}) => {
  const [editedDate, setEditedDate] = React.useState<Date | null>(
    interview.scheduled_at ? new Date(interview.scheduled_at) : null
  );
  const [questions, setQuestions] = React.useState<string[]>(
    interview.questions.slice()
  );
  const [timePickerOpen, setTimePickerOpen] = React.useState(false);

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const ampmOptions = ["AM", "PM"] as const;

  const currentHour12 = editedDate
    ? ((editedDate.getHours() + 11) % 12) + 1
    : 12;
  const currentMinute = editedDate ? editedDate.getMinutes() : 0;
  const currentAmpm = editedDate
    ? editedDate.getHours() < 12
      ? "AM"
      : "PM"
    : "AM";

  function updateTime(
    hour12: number,
    minute: number,
    ampm: (typeof ampmOptions)[number]
  ) {
    if (!editedDate) return;
    let hr = hour12 % 12;
    if (ampm === "PM") hr += 12;
    const dt = new Date(editedDate);
    dt.setHours(hr, minute, 0, 0);
    setEditedDate(dt);
  }

  const addQuestion = () => setQuestions((q) => [...q, ""]);
  const updateQuestion = (i: number, val: string) =>
    setQuestions((q) => q.map((old, idx) => (idx === i ? val : old)));
  const removeQuestion = (i: number) =>
    setQuestions((q) => q.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!editedDate) {
      toast.error("Please pick a date/time");
      return;
    }
    try {
      await onSave({
        scheduled_at: editedDate.toISOString(),
        questions,
      });
      // container will show success toast
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Interview</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date/Time */}
        <div>
          <Label>Scheduled At</Label>
          <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setTimePickerOpen(true)}
              >
                {editedDate
                  ? format(editedDate, "MMMM do, yyyy 'at' h:mm a")
                  : "Pick date & time"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 grid gap-4 w-auto">
              <Calendar
                mode="single"
                selected={editedDate ?? undefined}
                onSelect={(d) => {
                  if (!d) return;
                  const dt = editedDate || new Date();
                  dt.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                  setEditedDate(new Date(dt));
                }}
                initialFocus
              />
              <div className="flex gap-2">
                {/* hour */}
                <div className="flex-1">
                  <Label className="text-sm">Hour</Label>
                  <select
                    className="w-full rounded border p-2"
                    value={currentHour12}
                    onChange={(e) =>
                      updateTime(
                        Number(e.target.value),
                        currentMinute,
                        currentAmpm
                      )
                    }
                  >
                    {hours12.map((h) => (
                      <option key={h} value={h}>
                        {h.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                {/* minute */}
                <div className="flex-1">
                  <Label className="text-sm">Min</Label>
                  <select
                    className="w-full rounded border p-2"
                    value={
                      minutes.includes(currentMinute)
                        ? currentMinute
                        : Math.floor(currentMinute / 5) * 5
                    }
                    onChange={(e) =>
                      updateTime(
                        currentHour12,
                        Number(e.target.value),
                        currentAmpm
                      )
                    }
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                {/* AM/PM */}
                <div className="flex-1">
                  <Label className="text-sm">AM/PM</Label>
                  <select
                    className="w-full rounded border p-2"
                    value={currentAmpm}
                    onChange={(e) =>
                      updateTime(
                        currentHour12,
                        currentMinute,
                        e.target.value as any
                      )
                    }
                  >
                    {ampmOptions.map((ap) => (
                      <option key={ap} value={ap}>
                        {ap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Questions */}
        <div>
          <Label>Questions</Label>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  className="flex-1"
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeQuestion(i)}
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addQuestion}>
            + Add Question
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </CardFooter>
    </Card>
  );
};
