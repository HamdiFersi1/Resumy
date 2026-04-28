
    import API from "../client";

    export type ReportType = "accepted" | "declined" | "interview" | "scored";

    export interface AvailableDate {
        date: string;    // YYYY-MM-DD
        accepted: number;
        declined: number;
        interview: number;
        scored: number;  // newly added
    }

    export interface JobOption {
        id: number;
        label: string;   // e.g. "Acme Corp — Software Engineer"
    }

    // Response shape when listing popularity
    export interface JobPopularityResponse {
        id: number;
        company_name: string;
        title: string;
    }

    export interface JobPopularityWithPercent {
        id: number;
        company_name: string;
        title: string;
        avg_score: number;
        popularity: number;      // 0.0–1.0
        applicants: string[];
    }

    /** 1) Dates that have any data (optionally scoped to one job) */
    export async function fetchAvailableDates(
        jobId?: number
    ): Promise<AvailableDate[]> {
        const base = "/applications/reports/available-dates/";
        const url =
            jobId != null
                ? `${base}?job_id=${encodeURIComponent(jobId)}`
                : base;

        const res = await API.get<AvailableDate[]>(url);
        return res.data;
    }

    /** 2) Per-day CSV export (with optional job_id) */
    export function getCsvUrl(
        date: string,
        type: ReportType,
        jobId?: number
    ): string {
        const params = new URLSearchParams({
            date,
            type,
        });
        if (jobId != null) {
            params.append("job_id", String(jobId));
        }
        // Backend’s /export/ action returns CSV when no file_format=pdf is provided
        return `/applications/reports/export/?${params.toString()}`;
    }

    /** 3) Per-day PDF export (with optional job_id) */
    export function getPdfUrl(
        date: string,
        type: ReportType,
        jobId?: number
    ): string {
        const params = new URLSearchParams({
            date,
            type,
            file_format: "pdf",   // <--- use `file_format=pdf` to invoke PDF logic
        });
        if (jobId != null) {
            params.append("job_id", String(jobId));
        }
        return `/applications/reports/export/?${params.toString()}`;
    }

    /** 4) Fetch all jobs that have ≥1 application */
    export async function fetchJobOptions(): Promise<JobOption[]> {
        const res = await API.get<JobPopularityResponse[]>(
            "/applications/jobreports/?top_n=100"
        );
        return res.data.map((j) => ({
            id: j.id,
            label: `${j.company_name} — ${j.title}`,
        }));
    }

    /** 5a) Single-job CSV export (popularity) */
    export function getPopularityCsvUrl(job_id: number): string {
        const params = new URLSearchParams({ file_format: "csv" });
        return `/applications/jobreports/${job_id}/export/?${params.toString()}`;
    }
    export async function fetchPopularityCsv(
        job_id: number
    ): Promise<Blob> {
        const url = getPopularityCsvUrl(job_id);
        const res = await API.get<Blob>(url, { responseType: "blob" });
        return res.data;
    }

    /** 5b) Single-job PDF export (popularity) */
    export function getPopularityPdfUrl(job_id: number): string {
        const params = new URLSearchParams({ file_format: "pdf" });
        return `/applications/jobreports/${job_id}/export/?${params.toString()}`;
    }
    export async function fetchPopularityPdf(
        job_id: number
    ): Promise<Blob> {
        const url = getPopularityPdfUrl(job_id);
        const res = await API.get<Blob>(url, { responseType: "blob" });
        return res.data;
    }

    /** 6) Total applications for a single job */
    export interface TotalApplicationsResponse {
        job_id: number;
        total_applications: number;
    }

    export function getTotalApplicationsUrl(job_id: number): string {
        const params = new URLSearchParams({ job_id: String(job_id) });
        return `/applications/reports/total-applications/?${params.toString()}`;
    }

    export async function fetchTotalApplications(
        job_id: number
    ): Promise<number> {
        const res = await API.get<TotalApplicationsResponse>(
            getTotalApplicationsUrl(job_id)
        );
        return res.data.total_applications;
    }

    /** 7) Fetch a job’s popularity percentage (for radial chart, etc.) */
    export async function fetchJobPopularityPercent(
        job_id: number
    ): Promise<number> {
        // Ask for top_n=100 so our job is likely included
        const res = await API.get<JobPopularityWithPercent[]>(
            `/applications/jobreports/?top_n=100`
        );
        const job = res.data.find((j) => j.id === job_id);
        return job ? job.popularity : 0;
    }