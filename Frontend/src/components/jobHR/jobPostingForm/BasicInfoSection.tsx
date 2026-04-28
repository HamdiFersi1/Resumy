"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JobForm } from "./types";

interface Props {
  form: JobForm;
  onChange: (field: keyof JobForm, value: string) => void;
}

export function BasicInfoSection({ form, onChange }: Props) {
  const handle =
    (field: keyof JobForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(field, e.target.value);

  return (
    <fieldset className="space-y-6 bg-muted/30 dark:bg-muted/40 p-6 rounded-xl border border-border">
      <legend className="text-xl font-semibold text-foreground mb-2">
        Basic Information
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            placeholder="e.g., Frontend Developer"
            value={form.title}
            onChange={handle("title")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            placeholder="e.g., Acme Corp"
            value={form.company_name}
            onChange={handle("company_name")}
          />
        </div>
      </div>
    </fieldset>
  );
}
