// src/components/Application/Interview/InterviewForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface InterviewFormProps {
  date: Date | undefined;
  setDate: (date?: Date) => void;
  questions: string[];
  setQuestions: (qs: string[]) => void;
  loading: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function InterviewForm({
  date,
  setDate,
  questions,
  setQuestions,
  loading,
  saving,
  onSubmit,
  onCancel,
}: InterviewFormProps) {
  const handleQuestionChange =
    (idx: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const arr = [...questions];
      arr[idx] = e.target.value;
      setQuestions(arr);
    };

  const addQuestion = () => setQuestions([...questions, ""]);
  const removeQuestion = (idx: number) =>
    setQuestions(questions.filter((_, i) => i !== idx));

  if (loading) return <div className="p-6 text-center">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule / Update Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Date picker */}
            <div>
              <Label htmlFor="interview-date">Interview Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {date ? date.toLocaleDateString() : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              <Label>Interview Questions</Label>
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <Textarea
                    value={q}
                    onChange={handleQuestionChange(idx)}
                    className="flex-1"
                    placeholder={`Question ${idx + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => removeQuestion(idx)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addQuestion}>
                + Add Question
              </Button>
            </div>

            {/* Save / Cancel */}
            <CardFooter className="flex justify-end space-x-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Interview"}
              </Button>
              <Button variant="secondary" type="button" onClick={onCancel}>
                Cancel
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
