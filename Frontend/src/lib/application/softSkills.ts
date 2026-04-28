/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/applications/softSkills.ts

export type MicroCategory =
    | "communication"
    | "leadership"
    | "teamwork"
    | "adaptability"
    | "problem_solving";

/**
 * Substring keywords for each micro‐skill.
 * ("communicat" catches communication, communicating, etc.)
 */
export const SOFT_SKILL_KEYWORDS: Record<MicroCategory, string[]> = {
    communication: [
        "communicat",
        "present",
        "report",
        "negotiat",
        "articulat",
        "listen",
        "explain",
        "persuad",
        "interpersonal",
        "verbal",
        "written",
        "public speak",
        "directed",
        "languages",
        "speak",
        "convey",
        "Arabic",
        "English",
        "French",
        "German",
        "presentation",
        "presented",
        "talked",
        "communicated",
        "Coordinate"

    ],
    leadership: [
        "lead",
        "led",
        "manage",
        "supervis",
        "mentor",
        "coach",
        "direct",
        "organiz",
        "strateg",
        "initiativ",
        "delegat",
        "Coordinate",
        "influence",
        "vision",
    ],
    teamwork: [
        "team",
        "collaborat",
        "cooperat",
        "joint",
        "support",
        "liaise",
        "collectiv",
        "group",
        "peer",
        "together",
        "contribut",
        "assist",
        "partner",
    ],
    adaptability: [
        "adapt",
        "flexible",
        "pivot",
        "agile",
        "resilien",
        "adjust",
        "versatil",
        "tolerant",
        "innovativ",
        "resource",
        "multitask",
        "identify ",
        "Optimized",
    ],
    // ← newly added problem-solving category
    problem_solving: [
        "problem",       // problem, problems
        "solve",         // solve, solving
        "resolut",       // resolution, resolve
        "troubleshoot",  // troubleshoot, troubleshooting
        "debug",         // debug, debugging
        "issue",         // issue, issues
        "root cause",    // root cause
        "analysi",       // analysis, analytical
        "investigat",    // investigate, investigation
    ],
};

/**
 * Flatten all relevant text fields from snapshot_json into one lowercased string.
 */
export function flattenSnapshot(snapshot: any): string {
    const parts: string[] = [];

    if (snapshot.summary) parts.push(snapshot.summary);
    if (snapshot.skills) parts.push(snapshot.skills);

    snapshot.projects?.forEach((p: any) => {
        parts.push(p.title);
        parts.push(...(p.description || []));
    });

    snapshot.experience?.forEach((e: any) => {
        parts.push(e.title, e.company);
        parts.push(...(e.description || []));
    });

    snapshot.education?.forEach((ed: any) => {
        parts.push(ed.degree, ed.school);
    });

    parts.push(...(snapshot.certifications || []));

    return parts.join(" ").toLowerCase();
}

/**
 * Count keyword hits per category, then normalize so the
 * highest-hit category maps to 100 and others scale accordingly.
 */
export function computeMicroSkillScores(
    snapshot: any
): Record<MicroCategory, number> {
    const text = flattenSnapshot(snapshot);

    // initialize raw counts for all five categories
    const raw: Record<MicroCategory, number> = {
        communication: 0,
        leadership: 0,
        teamwork: 0,
        adaptability: 0,
        problem_solving: 0, // ← initialize new category
    };

    // count substring occurrences (one point per keyword)
    (Object.keys(SOFT_SKILL_KEYWORDS) as MicroCategory[]).forEach((cat) => {
        raw[cat] = SOFT_SKILL_KEYWORDS[cat].reduce((count, kw) => {
            const matches = text.match(new RegExp(kw, "gi"));
            return count + (matches?.length || 0);
        }, 0);
    });

    const totalHits = Object.values(raw).reduce((sum, v) => sum + v, 0);
    if (totalHits === 0) {
        // no keywords found, return zeros for all five
        return {
            communication: 0,
            leadership: 0,
            teamwork: 0,
            adaptability: 0,
            problem_solving: 0,
        };
    }

    // normalize each category to 0–100
    const normalized: Record<MicroCategory, number> = {
        communication: Math.round((raw.communication / totalHits) * 100),
        leadership: Math.round((raw.leadership / totalHits) * 100),
        teamwork: Math.round((raw.teamwork / totalHits) * 100),
        adaptability: Math.round((raw.adaptability / totalHits) * 100),
        problem_solving: Math.round((raw.problem_solving / totalHits) * 100), // ← compute new
    };

    return normalized;
}
