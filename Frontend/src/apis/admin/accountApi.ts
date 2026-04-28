/* eslint-disable @typescript-eslint/no-explicit-any */
// src/apis/admin/accountApi.ts

import API from "../client";

export interface HrUser {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
}
export interface JobPostingSummary {
    id: number;
    title: string;
    location: string;
    contract_type: string;
    application_deadline: string;
    created_at: string;
    application_count: number;
    popularity: number;
}

export interface ApplicationSummary {
    id: number;
    applicant: string;    // full name of the candidate
    job_title: string;
    status: string;
    decided_at: string;
}

export interface InterviewSummary {
    id: number;
    application_id: number;
    applicant: string;    // full name of the candidate
    job_title: string;
    scheduled_at: string;
}

export interface HrUserDetail extends HrUser {
    accepted_applications: ApplicationSummary[];
    declined_applications: ApplicationSummary[];
    interviews: InterviewSummary[];
    avatar?: string;
    phone?: string;
    location?: string;
    date_joined: string;
    job_postings: JobPostingSummary[]; // ✅ Add this line

}

/**
 * GET /accounts/hr-team/
 */
export async function fetchHrTeam(): Promise<HrUser[]> {
    const res = await API.get<{ results?: HrUser[] } | HrUser[]>("/account/hr-team/");
    const data = res.data as any;
    if (data && Array.isArray(data.results)) {
        return data.results;
    }
    if (Array.isArray(data)) {
        return data;
    }
    throw new Error("Unexpected response from /account/hr-team/");
}

/**
 * GET /accounts/hr-team/:id/
 */
export async function fetchHrUserDetail(id: number): Promise<HrUserDetail> {
    const res = await API.get<HrUserDetail>(`/account/hr-team/${id}/`);
    return res.data;
}