"use client";

import { Textarea } from "@/components/ui/textarea";
import type { JobForm } from "./types";

interface Props {
  form: JobForm;
  onChange: (field: keyof JobForm, value: string) => void;
}

export function DescriptionSection({ form, onChange }: Props) {
  const handle = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    onChange("job_description", e.target.value);

  return (
    <fieldset className="space-y-6 bg-muted/20 dark:bg-muted/30 p-6 rounded-xl border border-border">
      <legend className="text-xl font-semibold text-foreground mb-2">
        Job Description
      </legend>

      <div className="space-y-2">
        <Textarea
          id="job_description"
          rows={6}
          value={form.job_description}
          onChange={handle}
          placeholder="Describe the role, responsibilities, and expectations for this position..."
          className="resize-none"
        />
      </div>
    </fieldset>
  );
}
