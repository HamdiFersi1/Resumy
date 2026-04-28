import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/apis/client";
import resumeApi from "@/apis/resumeApi";
import { Job } from "@/apis/jobApi";
import { useAuth } from "../useAuth";

export function useApplyJob() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    /* ─ Job data ─ */
    const [job, setJob] = useState<Job | null>(null);
    const [loadingJob, setLoadingJob] = useState(true);
    const [jobError, setJobError] = useState<string | null>(null);

    /* ─ Form state ─ */
    const defaultFullName =
        user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "";

    const [fullName, setFullName] = useState(defaultFullName);
    const [email, setEmail] = useState(user?.email ?? "");
    const [file, setFile] = useState<File | null>(null);

    /* ─ Upload state ─ */
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    /* Fetch job once */
    useEffect(() => {
        (async () => {
            try {
                const res = await API.get<Job>(`/jobs/JobPosting/${jobId}/`);
                setJob(res.data);
            } catch (err) {
                console.error(err);
                setJobError("Unable to load job details.");
            } finally {
                setLoadingJob(false);
            }
        })();
    }, [jobId]);

    /* Handlers */
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadError(null);

        try {
            // Upload returns the full upload record; extract its ID
            const uploadResp = await resumeApi.upload(file);
            const parsedId = uploadResp.id;
            // Navigate to builder with the numeric parsedId
            navigate(`/builder/${parsedId}?jobId=${jobId}`);
        } catch (err) {
            console.error(err);
            setUploadError("Upload failed, please try again.");
        } finally {
            setUploading(false);
        }
    };

    return {
        /* job */
        job,
        loadingJob,
        jobError,
        /* form fields */
        fullNameState: [fullName, setFullName] as const,
        emailState: [email, setEmail] as const,
        fileState: [file, handleFileChange] as const,
        /* upload */
        uploading,
        uploadError,
        handleUpload,
    };
}
