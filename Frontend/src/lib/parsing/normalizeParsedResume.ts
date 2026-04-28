import type { RawParsedResume, ParsedEducationEntry } from "./types";
import type {
    Resume,
    ResumeProfile,
    ResumeWorkExperience,
    ResumeEducation,
    ResumeProject,
    ResumeSkills,
} from "../redux/types";

export function normalizeParsed(parsed: RawParsedResume): Resume {
    // PROFILE
    const profile: ResumeProfile = {
        name: parsed.name.replace(/\n/g, " ").trim(),
        summary: parsed.profile?.trim() || "",
        email: parsed.contact.email?.trim() || "",
        phone: parsed.contact.phone?.trim() || "",
        location: parsed.contact.location?.trim() || "",
        url: (
            parsed.contact.linkedin?.trim() ||
            parsed.contact.website?.trim() ||
            parsed.contact.url?.trim() ||
            ""
        ),
    };

    // EXPERIENCE
    const workExperiences: ResumeWorkExperience[] = (parsed.experience || []).map(e => ({
        company: e.company,
        jobTitle: e.title,
        date: e.date || "",
        descriptions: e.description.map(item => item.replace(/^•\s*/, '').trim()),
    }));

    // PROJECTS
    const projects: ResumeProject[] = (parsed.projects || []).map(p => ({
        project: p.title,
        date: p.date || "",
        descriptions: p.description.map(item => item.replace(/^•\s*/, '').trim()),
    }));

    // SKILLS
    let skillsList: string[] = [];

    if (typeof parsed.skills === "string") {
        skillsList = parsed.skills
            // split only on your raw bullet marker
            .split(/•\s*/)
            // remove any stray leading bullet & trim whitespace
            .map(s => s.replace(/^•\s*/, "").trim())
            // drop any empty entries
            .filter(Boolean);
    } else if (Array.isArray(parsed.skills)) {
        // if it’s already an array, still strip any stray bullets
        skillsList = (parsed.skills as string[]).map(s => s.replace(/^•\s*/, "").trim());
    }

    const skills: ResumeSkills = {
        featuredSkills: [],
        descriptions: skillsList,
    };

    // EDUCATION: handle array, single entry, or undefined
    const educationArray: ParsedEducationEntry[] = Array.isArray(parsed.education)
        ? parsed.education
        : parsed.education
            ? [parsed.education]
            : [];

    const educations: ResumeEducation[] = educationArray.map(ed => ({
        school: ed.school || "",
        degree: ed.degree || "",
        date: ed.date || "",
        descriptions: Array.isArray(ed.additional_info)
            ? ed.additional_info.map(line => line.replace(/^•\s*/, '').trim()).filter(Boolean)
            : [],
    }));

    // CUSTOM (certifications + leadership + additional_information)
    const rawCustom = [
        ...(parsed.certifications || []),
        ...(parsed.leadership || []),
        ...(parsed.additional_information || []),
    ];
    const customDescriptions = rawCustom
        .map(item => item.replace(/^•\s*/, '').trim())
        .filter(Boolean);

    return {
        profile,
        workExperiences,
        educations,
        projects,
        skills,
        custom: { descriptions: customDescriptions },
    };
}
