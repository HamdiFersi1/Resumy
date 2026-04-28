// src/components/jobHR/JobPostingForm/RequirementsSection.tsx
"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobForm } from "./types";


interface Props {
  form: JobForm;
  onChange: (field: keyof JobForm, value: string) => void;
}
export function RequirementsSection({ form, onChange }: Props) {
  const handle =
    (field: keyof JobForm) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      onChange(field, e.target.value);

  return (
    <fieldset className="space-y-2">
      <legend className="text-lg font-semibold">Required Skills & Key Responsibilities

</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="skills">Skills</Label>
          <Textarea
            id="skills"
            rows={3}
            value={form.required_skills}
            onChange={handle("required_skills")}
          />
        </div>
        <div>
          <Label htmlFor="experience">Responsibilities</Label>
          <Textarea
            id="experience"
            rows={3}
            value={form.required_experience}
            onChange={handle("required_experience")}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="education">Education</Label>
        <Textarea
          id="education"
          rows={2}
          value={form.required_education}
          onChange={handle("required_education")}
        />
      </div>
    </fieldset>
  );
}
