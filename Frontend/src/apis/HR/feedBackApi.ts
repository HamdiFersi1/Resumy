    /* eslint-disable @typescript-eslint/no-explicit-any */
    // src/apis/HR/applicationApi.ts
    import API from "../client";

    export interface ApplicationFeedbackPayload {
        application_id: number;
        positive: boolean;
        reasons: string[];
        custom?: string;
    }
    export interface ApplicationFeedbackRecord {
        id: number;
        application: number;
        positive: boolean;
        reasons: string[];
        custom?: string;
        created_at: string;
    }

    /** 1) Submit user feedback on an application */
export async function submitApplicationFeedback(
    payload: ApplicationFeedbackPayload
): Promise<void> {
    const body: any = {
        application: payload.application_id,
        positive: payload.positive,
        reasons: payload.reasons,
    };
    if (payload.custom) body.custom = payload.custom;
    await API.post("/applications/feedback/", body);
}

/** 2) Fetch *your* feedback record for a given application */
export async function fetchFeedbackForApplication(
    applicationId: number
): Promise<ApplicationFeedbackRecord[]> {
    const params = new URLSearchParams({ application: String(applicationId) });
    const res = await API.get<ApplicationFeedbackRecord[]>(
        `/applications/feedback/mine/?${params.toString()}`
    );
    return res.data;
      }



        /** 2) Feedback summary types & fetcher */

        // Shape of each summary item returned by GET /applications/feedback/summary/
export interface FeedbackSummary {
    application_id: number;        
    job_id: number;
    company_name: string;
    title: string;
    total: number;
    positive: number;
    negative: number;
    positivity_rate: number;       
    reasons: Record<string, number>;
    custom_comments: string[];     
          }

        /** Build the URL for the summary endpoint */
        function getFeedbackSummaryUrl(jobId?: number): string {
            const base = "/applications/feedback/summary/";
            if (jobId != null) {
                const params = new URLSearchParams({ job: String(jobId) });
                return `${base}?${params.toString()}`;
            }
            return base;
        }

        /** Fetch aggregated feedback summary for all jobs or a single job */
        export async function fetchFeedbackSummary(
            jobId?: number
        ): Promise<FeedbackSummary[]> {
            const url = getFeedbackSummaryUrl(jobId);
            const res = await API.get<FeedbackSummary[]>(url);
            return res.data;
        }

