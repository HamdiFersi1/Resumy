/* eslint-disable @typescript-eslint/no-explicit-any */
import API from "../client";
import { JobPostingDetail } from "./applicationApi";

export interface Interview {
  id: number;
  application: number;
  scheduled_at: string | null;
  questions: string[];
  questions_generated: {
    session_at: string;
    questions: Record<string, string[]>;
  }[];
  created_at: string;
  meeting_link?: string | null;
  done: boolean;
}

// Full context from GET /:id/
export interface InterviewContext extends Interview {
  job: JobPostingDetail;
  resume_snapshot: Record<string, any>;
}

export interface PaginatedInterviews {
  results: Interview[];
  count: number;
}

export type InterviewForm = {
  application: number;
  scheduled_at: string | null;
  questions: string[];
};

export type InterviewUpdate = Partial<
  Pick<Interview, "scheduled_at" | "questions" | "meeting_link" | "done">
>;

export interface InterviewQueryParams {
  application?: number;
  page?: number;
}

export interface GeneratedQuestions {
  generated_questions: Record<string, string[]>;
}

export interface GeneratedSession {
  interview_id: number;
  job_title: string;
  company_name: string;
  applicant: string;
  session_at: string;
  questions: Record<string, string[]>;
}

const BASE = "/applications/interviews";

const interviewsApi = {
  async getPaginated(params: InterviewQueryParams = {}) {
    const res = await API.get<PaginatedInterviews>(`${BASE}/`, { params });
    return res.data;
  },

  async getOne(id: number) {
    const res = await API.get<InterviewContext>(`${BASE}/${id}/`);
    return res.data;
  },

  async create(data: InterviewForm) {
    const res = await API.post<Interview>(`${BASE}/`, data);
    return res.data;
  },

  async patch(id: number, body: InterviewUpdate) {
    const res = await API.patch<InterviewContext>(`${BASE}/${id}/`, body);
    return res.data;
  },

  async delete(id: number) {
    await API.delete<void>(`${BASE}/${id}/`);
  },

  async generateQuestions(interviewId: number): Promise<GeneratedQuestions> {
    const res = await API.post<GeneratedQuestions>(
      `${BASE}/${interviewId}/generate/`,
      {}
    );
    return res.data;
  },

  async generate(interviewId: number) {
    const res = await API.post<InterviewContext>(
      `${BASE}/${interviewId}/generate/`,
      {}
    );
    return res.data;
  },

  async getAllGeneratedSessions() {
    const res = await API.get<GeneratedSession[]>(`${BASE}/generated-history/`);
    return res.data;
  },
};

export default interviewsApi;
