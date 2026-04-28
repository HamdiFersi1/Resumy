/* eslint-disable @typescript-eslint/no-explicit-any */
// src/apis/HR/decisionApi.ts
import API from "../client";

/**
 * Single decision record, including nested job info.
 */
export interface Decisions {
    id: number;
    applicant: string;
    status: string;
    applied_at: string;
    total_score: number;
    experience_score: number;
    skills_score: number;
    projects_score: number;
    education_score: number;
    job: {
        id: number;
        company_name: string;
        title: string;
    };
}

/**
 * Paginated response for decisions.
 */
export interface PaginatedDecisions {
    results: Decisions[];
    count: number;
}

/**
 * Filters you can pass when fetching decisions.
 */
export interface DecisionFilters {
    status?: "accepted" | "declined";     // only these two make sense here
    job?: number;                         // job ID to filter on
    min_score?: number;
    max_score?: number;
    page?: number;
    ordering?: string;                    // e.g. "-score_json__total_score" or "applied_at"
}

/**
 * Fetch the list of decisions (accepted/declined), paginated + filterable.
 */
export async function fetchDecisions(
    filters: DecisionFilters = {}
): Promise<PaginatedDecisions> {
    const params: Record<string, any> = {};
    if (filters.status) params.status = filters.status;
    if (typeof filters.job === "number") params.job = filters.job;
    if (typeof filters.min_score === "number") params.min_score = filters.min_score;
    if (typeof filters.max_score === "number") params.max_score = filters.max_score;
    if (typeof filters.page === "number") params.page = filters.page;
    if (filters.ordering) params.ordering = filters.ordering;

    const res = await API.get<PaginatedDecisions>(
        "/applications/decisionsleaderboard/",
        { params }
    );
    return res.data;
}
