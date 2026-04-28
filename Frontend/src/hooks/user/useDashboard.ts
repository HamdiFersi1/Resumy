// src/hooks/useDashboard.ts
import { useState, useEffect } from "react";
import API from "@/apis/client";

export interface UsedResume {
    parsed_resume_id: number;
    filename: string;
    url: string | null;
    applied_at: string;
}

export interface AppliedJob {
    application_id: number;
    job_id: number;
    title: string;
    company: string;
    location: string;
    applied_at: string;
}

export interface DashboardData {
    profile_completeness: number;
    applications_sent: number;
    interviews_scheduled: number;
    used_resumes: UsedResume[];
    applied_jobs: AppliedJob[];
    recommended_jobs: {
        id: number;
        title: string;
        company: string;
        location: string;
    }[];
}

export function useDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        API.get<DashboardData>("/account/dashboarduser/")
            .then(res => setData(res.data))
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.detail || err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}