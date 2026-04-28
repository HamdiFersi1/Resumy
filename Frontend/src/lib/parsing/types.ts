// src/lib/parsing/types.ts


export interface ParsedEducationEntry {
    school: string;
    degree: string;
    date: string;
    additional_info: string[];
}
export interface RawExperienceEntry {
    job_title: string;
    company: string;
    dates?: string | null;
    descriptions: string[];
}

export interface RawProjectEntry {
    project: string;
    date?: string;
    descriptions: string[];
}

export interface RawParsed {
    summary: string;
    name: string;
    profile?: string;
    contact: {
        email?: string;
        phone?: string;
        linkedin?: string;
    };
    experience?: RawExperienceEntry[];
    projects?: RawProjectEntry[];
    education?: string;
    skills?: string;
    certifications?: string[];
    leadership?: string[];
    additional_information?: string[];
}

export interface RawParsedResume {
    name: string;
    profile?: string;
    contact: {
        url: string;
    website: string;
    location: string; email?: string; phone?: string; linkedin?: string 
};
    experience?: Array<{
        company: string;
        date: string;
        title: string; 
        duration?: string;
        description: string[];
    }>;
    projects?: Array<{
        date: string;
        title: string;
        description: string[];
    }>;
    education?: ParsedEducationEntry[];
    skills?: string;
    certifications?: string[];
    leadership?: string[];
    additional_information?: string[];
}

