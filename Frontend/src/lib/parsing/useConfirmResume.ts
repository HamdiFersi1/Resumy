// src/lib/parsing/useConfirmResume.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/apis/client";
import { ParsedResumeData } from "@/apis/resumeApi";

export function useConfirmResume(parsedId: string | undefined, jobId: number | null) {
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const navigate = useNavigate();

    const confirm = async (data: ParsedResumeData) => {
        if (!parsedId || isNaN(jobId!)) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            await API.post(`/resumes/ResumeConfirmation/${parsedId}/confirm/${jobId}/`, data);
            navigate(`/application-success/${parsedId}`);
        } catch (err) {
            console.error(err);
            setSubmitError("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return { confirm, submitting, submitError };
}
