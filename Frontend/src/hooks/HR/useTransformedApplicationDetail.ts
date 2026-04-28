// src/hooks/HR/useTransformedApplicationDetail.ts
import { useApplicationDetail } from "@/hooks/HR/useApplicationDetail";
import type { Resume } from "@/components/Application/SnapshotSections";

interface SnapshotJson {
    name: string;
    skills: string;
    contact: {
        email: string;
        phone: string;
    };
    summary: string;
    projects: {
        title: string;
        description: string[];
    }[];
    education: {
        date: string;
        degree: string;
        school: string;
        additional_info: string[];
    }[];
    experience: {
        date: string;
        title: string;
        company: string;
        description: string[];
    }[];
    certifications?: string[]; // ← added
}

export function useTransformedApplicationDetail(id?: string) {
    const { app, loading, error, totalPct, expPct, skillsPct, projPct, eduPct } =
        useApplicationDetail(id);

    const snapshotJson = app?.snapshot_json as SnapshotJson | undefined;

    const resume: Resume | undefined = snapshotJson
        ? {
            profile: {
                name: snapshotJson.name || "",
                summary: snapshotJson.summary || "",
                email: snapshotJson.contact?.email || "",
                phone: snapshotJson.contact?.phone || "",
                location: "", // if you have it
                url: "",      // if you have it
            },
            workExperiences:
                snapshotJson.experience?.map((exp) => ({
                    company: exp.company || "",
                    jobTitle: exp.title || "",
                    date: exp.date || "",
                    descriptions: exp.description || [],
                })) || [],
            educations:
                snapshotJson.education?.map((edu) => ({
                    school: edu.school || "",
                    degree: edu.degree || "",
                    date: edu.date || "",
                    descriptions: edu.additional_info || [],
                })) || [],
            projects:
                snapshotJson.projects?.map((proj) => ({
                    project: proj.title || "",
                    date: "", // if you have it
                    descriptions: proj.description || [],
                })) || [],
            skills: {
                featuredSkills: [],
                descriptions: snapshotJson.skills
                    .split(/[•,]/)
                    .map((s) => s.replace(/^•\s*/, "").trim())
                    .filter(Boolean),
            },
            custom: {
                descriptions:
                    snapshotJson.certifications
                        ?.map((c) => c.replace(/^•\s*/, "").trim())
                        .filter(Boolean) || [],
            },
        }
        : undefined;

    return {
        app,
        loading,
        error,
        totalPct,
        expPct,
        skillsPct,
        projPct,
        eduPct,
        resume,
    };
}
