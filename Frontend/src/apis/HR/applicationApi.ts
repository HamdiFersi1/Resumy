/* eslint-disable @typescript-eslint/no-explicit-any */
// src/apis/applicationApi.ts
import API from "../client"

export interface Application {
    id: number
    applicant: string
    status: string
    applied_at: string
    total_score: number
    experience_score: number
    skills_score: number
    projects_score: number
    education_score: number
    job_title: string
    // job : JobPostingDetail
}

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

export interface PaginatedApplications {
    results: Application[]
    count: number
}

export interface ApplicationStats {
    total_applications: number
    scored_applications: number
    unscored_applications: number
    average_total_score: number
    average_experience_score: number
    average_skills_score: number
    average_projects_score: number
    average_education_score: number
}

// export interface ApplicationDetail {
//     id: number;
//     // job_title: string;
//     parsed_resume_id: number;
//     applicant: string;
//     status: string;
//     applied_at: string;
//     snapshot_json: Record<string, string>;
//     score_json: Record<string, number> | null;
//     job : JobPostingDetail
// }

export interface ApplicationDetail {
    id: number;
    parsed_resume_id: number;
    applicant: string;
    status: string;
    applied_at: string;
    decided_at: string | null;
    interview_date: string | null;
    snapshot_json: Record<string, string>;
    score_json: Record<string, number> | null;
    job: JobPostingDetail;
  }
export interface TimeSeriesData {
    date: string;
    count: number;
    avg_score: number;
  }
export interface AnalyticsResponse {
    time_series: TimeSeriesData[];
    score_distribution: Record<string, number>;
    percentiles: {
        p25: number;
        p50: number;
        p75: number;
    };
    top_jobs_by_volume: Array<{
        job_id: number;
        job__title: string;
        app_count: number;
    }>;
    top_jobs_by_avg_score: Array<{
        job_id: number;
        job__title: string;
        avg_score: number;
    }>;
  }



export interface LeaderboardFilters {
    job?: number;
    page?: number;
    ordering?: string;      // e.g. "total_score" or "-total_score,applied_at"
}



export interface JobPostingDetail {
    id: number;
    company_name: string;
    title: string;
    application_start: string;           // ISO date string
    application_deadline: string | null; // ISO date or null
    contract_type: "FT" | "PT" | "IN" | "CT" | "FL";
    job_description: string;
    required_skills: string;
    required_experience: string;
    required_education: string;
    category: string;
    location: string;
    experience_level: string;
    is_open: boolean;
  }

export interface DecisionFilters {
    /** “accepted” or “declined” */
    status?: "accepted" | "declined";
    /** job ID to filter by */
    job?: number;
    /** minimum total_score */
    min_score?: number;
    /** maximum total_score */
    max_score?: number;
    /** page number */
    page?: number;
    /** ordering, e.g. "-score_json__total_score" or "applied_at" */
    ordering?: string;
  }


export interface ScoreTrendResponse {
    time_series: { date: string; avg: number }[];
}

export async function fetchDailyAverageScoreTrend(
    jobId?: number,
    days: number = 30
): Promise<ScoreTrendResponse> {
    const params: Record<string, any> = { days };
    if (jobId) params.job = jobId;

    const res = await API.get<ScoreTrendResponse>(
        "/applications/stats/daily-avg-score/",
        { params }
    );
    return res.data;
  }
/**
 * Leaderboard: paginated, scored applications for a single job.
 */
export async function fetchLeaderboard(
    jobId: number,
    page: number = 1,
    filters: LeaderboardFilters = {}
): Promise<PaginatedApplications> {
    const params: Record<string, any> = { job: jobId, page };
    if (filters.ordering) params.ordering = filters.ordering;
    const res = await API.get<PaginatedApplications>(
        "/applications/ApplicationViewSet/",
        { params }
    );
    return res.data;
}

/**
 * Overall stats (total / scored / averages).
 * If jobId is passed, sends it as `?job=<id>`.
 */
export async function fetchApplicationStats(
    jobId?: number
): Promise<ApplicationStats> {
    // build only-if-present query
    const params: Record<string, number> = {}
    if (typeof jobId === "number") {
        params.job = jobId   // ← must be `job`, matching your DRF action
    }

    const res = await API.get<ApplicationStats>(
        "/applications/stats/",
        { params }
    )
    const data = res.data

    // basic shape-check
    if (
        typeof data.total_applications !== "number" ||
        typeof data.scored_applications !== "number" ||
        typeof data.unscored_applications !== "number"
    ) {
        throw new Error("Unexpected stats response shape")
    }

    return data
}
export async function fetchApplicationDetail(
    applicationId: number
): Promise<ApplicationDetail> {
    const res = await API.get<ApplicationDetail>(

        `/applications/detail/${applicationId}/`
    );
    return res.data;
}

export async function fetchDailyApplicationCounts(
    jobId?: number,
    days?: number,
    startDate?: string,
    endDate?: string
): Promise<AnalyticsResponse> {
    const params: Record<string, any> = {};
    if (jobId) params.job = jobId;
    if (days) params.days = days;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const res = await API.get<AnalyticsResponse>(
        "/applications/analytics/",
        { params }
    );
    return res.data;
  }

export async function acceptApplication(appId: number) {
    const res = await API.post(`/applications/decisions/${appId}/accept/`);
    return res.data;
}

export async function declineApplication(appId: number) {
    const res = await API.post(`/applications/decisions/${appId}/decline/`);
    return res.data;
  }


export interface ApplicationFeedbackPayload {
    application_id: number;
    positive: boolean;
    reasons: string[];
}

export async function submitApplicationFeedback(
    payload: ApplicationFeedbackPayload
): Promise<void> {
    await API.post("/applications/feedback/", payload);
  }

export async function fetchMyApplications(): Promise<ApplicationDetail[]> {
    const res = await API.get<{ results: ApplicationDetail[] }>(
        "/applications/public-applications/my-applications/"
    );
    return res.data.results;
  }