"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { JobForm } from "./types";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

import { BasicInfoSection } from "./BasicInfoSection";
import { DescriptionSection } from "./DescriptionSection";
import { RequirementsSection } from "./RequirementsSection";
import { MetaSection } from "./MetaSection";
import { DatesSection } from "./DatesSection";

interface Props {
  isEdit: boolean;
  form: JobForm;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success?: boolean;
  onChange: (field: keyof JobForm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export function JobPostingForm({
  isEdit,
  form,
  loading,
  saving,
  error,
  success,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (success) {
    toast.success(`Job ${isEdit ? "updated" : "posted"} successfully!`);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="form"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* ← Back Button */}
        <motion.div
          variants={sectionVariants}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </motion.div>

        {/* Page Header */}
        <motion.div variants={sectionVariants} className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            📝 {isEdit ? "Edit Job Posting" : "Create a New Job"}
          </h1>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            variants={sectionVariants}
            className="mt-6 border border-destructive/30 bg-destructive/10 text-destructive text-sm p-3 rounded-md font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-8">
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* ─────── Left Column (50%) ─────── */}
            <motion.div variants={sectionVariants} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-card shadow-sm border border-border/40 rounded-xl p-6">
                <BasicInfoSection form={form} onChange={onChange} />
              </div>

              {/* Job Description */}
              <div className="bg-card shadow-sm border border-border/40 rounded-xl p-6">
                <DescriptionSection form={form} onChange={onChange} />
              </div>

              {/* Timeline (Dates) */}
              <div className="bg-card shadow-sm border border-border/40 rounded-xl p-6">
                <DatesSection form={form} onChange={onChange} />
              </div>
            </motion.div>

            {/* ─────── Right Column (50%) ─────── */}
            <motion.div variants={sectionVariants} className="space-y-8">
              {/* Requirements */}
              <div className="bg-card shadow-sm border border-border/40 rounded-xl p-6">
                <RequirementsSection form={form} onChange={onChange} />
              </div>

              {/* Meta Information */}
              <div className="bg-card shadow-sm border border-border/40 rounded-xl p-6">
                <MetaSection form={form} onChange={onChange} />
              </div>
            </motion.div>
          </motion.div>

          <Separator className="my-8" />

          {/* Actions */}
          <motion.div
            variants={sectionVariants}
            className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4"
          >
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 text-base transition-colors hover:bg-primary/90"
            >
              {saving && <Spinner size="sm" className="mr-2" />}
              {saving ? "Saving..." : isEdit ? "Update Job" : "Post Job"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2 text-base hover:bg-muted"
            >
              Cancel
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
