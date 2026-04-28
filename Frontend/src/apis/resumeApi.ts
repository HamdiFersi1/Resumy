// src/apis/resumeApi.ts
import API from './client'
import type { RawParsedResume } from "@/lib/parsing/types";
/**
 * The shape of the record returned by UploadedResumeSerializer.
 * Adjust fields to match exactly what your serializer outputs.
 */
export interface UploadedResume {
    id: number
    file: string         // URL to the stored PDF
    status: string       // e.g. "parsed", "pending"
    created_at: string   // ISO timestamp
    updated_at: string   // ISO timestamp
}

/**
 * The shape of the JSON you save in ParsedResume.parsed_json.
 * This matches your parse_resume output exactly:
 * - name: full name + title
 * - contact: { email, phone }
 * - summary: string
 * - skills: comma‑separated string
 * - experience: array of job entries
 * - education: big text blob
 */
export interface ParsedProjectEntry {
    title: string;
    description: string[];
}
export interface ParsedEducationEntry {
    school: string
    degree: string
    date: string
    additional_info: string[]
}

export interface ParsedExperienceEntry {
    company: string;
    title: string;
    date: string;
    description: string[];
    duration?: string;
}

export interface ParsedResumeData {
    name: string
    contact: {
        email: string
        phone: string
    }
    summary: string
    skills: string
    experience: ParsedExperienceEntry[]
    projects?: ParsedProjectEntry[];
    education: ParsedEducationEntry[]
}


const resumeApi = {
    async upload(file: File): Promise<UploadedResume & { id:number , parsed_json?: ParsedResumeData }> {
        const form = new FormData()
        form.append('file', file)
        const {data} = await API.post<UploadedResume & { id:number , parsed_json?: ParsedResumeData }>(
            '/resumes/ResumeUpload/',  
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data
    },
    // if you still need a separate fetch:
    async getParsedResume(id: number): Promise<RawParsedResume> {
        const { data } = await API.get<RawParsedResume>(`resumes/ParsedResume/${id}/`);
        return data;
    },
}

export async function applyToJob(jobId: number, parsedResumeId: number, resumeSnapshot: ParsedResumeData) {
    const res = await API.post<{ id: number; status: string }>(
        "/applications/JobApplication/",
        {
            job: jobId,
            parsed_resume: parsedResumeId,
            snapshot_json: resumeSnapshot,
        }
    );
    return res.data;
}

export default resumeApi
