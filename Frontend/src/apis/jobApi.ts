// src/apis/jobApi.ts
import API from "./client";

export interface Job {
  id: number;
  title: string;
  company_name: string;
  job_description: string;
  required_skills: string;
  required_experience: string;
  required_education: string;
  category: string;
  location: string;
  experience_level: string;
  contract_type: "Full time" | "Part Time" | "Internship" | "Contract" | "Freelance";
  application_start: string;
  application_deadline: string | null;
  is_open: boolean;
  created_at: string;
}

export interface JobQueryParams {
  category?: string;
  location?: string;
  experience_level?: string;
  contract_type?: string;
  open?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

interface PaginatedJobs {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

export interface Favorite {
  id: number;
  job: number;
  added_at: string;
}

const jobApi = {
  async getPaginated(params: JobQueryParams = {}) {
    const res = await API.get<PaginatedJobs>("/jobs/JobPosting/", { params });
    return { results: res.data.results, count: res.data.count };
  },

  async getOne(id: number) {
    const res = await API.get<Job>(`/jobs/JobPosting/${id}/`);
    return res.data;
  },

  async create(job: Omit<Job, "id" | "created_at" | "is_open">) {
    const res = await API.post<Job>("/jobs/JobPosting/", job);
    return res.data;
  },

  async update(id: number, job: Partial<Omit<Job, "id" | "created_at" | "is_open">>) {
    const res = await API.put<Job>(`/jobs/JobPosting/${id}/`, job);
    return res.data;
  },

  async delete(id: number) {
    await API.delete<void>(`/jobs/JobPosting/${id}/`);
  },

  async closeJob(id: number) {
    await API.post(`/jobs/JobPosting/${id}/close/`);
  },

  async reopenJob(id: number) {
    await API.post(`/jobs/JobPosting/${id}/reopen/`);
  },

  async getFavorites(): Promise<Favorite[]> {
    const res = await API.get("/jobs/favorites/");
    return Array.isArray(res.data) ? res.data : res.data.results;
  },

  async addFavorite(jobId: number): Promise<Favorite> {
    const res = await API.post<Favorite>("/jobs/favorites/", { job: jobId });
    return res.data;
  },

  async removeFavorite(favoriteId: number): Promise<void> {
    await API.delete(`/jobs/favorites/${favoriteId}/`);
  },

  async getFavoritedJobs(): Promise<Job[]> {
    const favorites = await jobApi.getFavorites();
    const jobIds = favorites.map((f) => f.job);
    const res = await API.get<PaginatedJobs>("/jobs/JobPosting/");
    return res.data.results.filter((job) => jobIds.includes(job.id));
  },
};

export default jobApi;
