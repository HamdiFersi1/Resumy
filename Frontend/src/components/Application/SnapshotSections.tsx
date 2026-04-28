/* src/components/application/SnapshotSections.tsx */
"use client";

/* ---------- Shared types (unchanged) ---------- */
interface ResumeProfile {
  name: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  url: string;
}
interface ResumeWorkExperience {
  company: string;
  jobTitle: string;
  date: string;
  descriptions: string[];
}
interface ResumeEducation {
  school: string;
  degree: string;
  date: string;
  descriptions: string[];
}
interface ResumeProject {
  project: string;
  date: string;
  descriptions: string[];
}
interface FeaturedSkill {
  skill: string;
  rating: number;
}
interface ResumeSkills {
  featuredSkills: FeaturedSkill[];
  descriptions: string[];
}
export interface Resume {
  profile: ResumeProfile;
  workExperiences: ResumeWorkExperience[];
  educations: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  custom?: { descriptions: string[] };
}

/* ─────────────────────────────────────────────── */

export function ContactInfo({ profile }: { profile: ResumeProfile }) {
  const { email, phone, location, url } = profile;
  return (
    <div className="space-y-1 text-sm">
        <p className="text-2xl font-bold">Name : {profile.name}</p>
        
      {email && (
        <p>
          Email:&nbsp;
          <a href={`mailto:${email}`} className="text-blue-600 underline">
            {email}
          </a>
        </p>
      )}
      {phone && (
        <p>
          Phone:&nbsp;
          <a href={`tel:${phone}`} className="text-blue-600 underline">
            {phone}
          </a>
        </p>
      )}
      {location && <p>Location: {location}</p>}
      {url && (
        <p>
          Website:&nbsp;
          <a href={url} target="_blank" className="text-blue-600 underline">
            {url}
          </a>
        </p>
      )}
    </div>
  );
}

export function SummarySection({ summary }: { summary: string }) {
  if (!summary) return null;
  return <p className="text-sm leading-relaxed">{summary}</p>;
}

export function SkillsList({ skills }: { skills: ResumeSkills }) {
  const raw = [
    ...skills.featuredSkills.map((f) => f.skill),
    ...skills.descriptions,
  ].filter(Boolean);

  const grouped: string[] = [];
  let cur = "";
  for (const s of raw) {
    if (s.includes(":")) {
      if (cur) grouped.push(cur);
      cur = s;
    } else {
      cur = cur ? `${cur}, ${s}` : s;
    }
  }
  if (cur) grouped.push(cur);
  if (!grouped.length) return null;

  return (
    <ul className="list-disc pl-5 space-y-1 text-sm">
      {grouped.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  );
}

export function ProjectsSection({ projects }: { projects: ResumeProject[] }) {
  if (!projects?.length) return null;
  return (
    <>
      {projects.map((p, i) => (
        <div key={i} className="mb-3">
          <h3 className="font-medium text-sm">{p.project}</h3>
          <p className="text-xs italic mb-1">{p.date}</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {p.descriptions.map((d, j) => (
              <li key={j}>{d}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function EducationSection({ educations }: { educations: ResumeEducation[] }) {
  if (!educations?.length) return null;
  return (
    <>
      {educations.map((e, i) => (
        <div key={i} className="mb-3">
          <h3 className="font-medium text-sm">{e.degree}</h3>
          <p className="text-sm italic">
            {e.school} ({e.date})
          </p>
          {e.descriptions?.length > 0 && (
            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
              {e.descriptions.map((d, j) => (
                <li key={j}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

export function ExperienceSection({
  workExperiences,
}: {
  workExperiences: ResumeWorkExperience[];
}) {
  if (!workExperiences?.length) return null;
  return (
    <>
      {workExperiences.map((w, i) => (
        <div key={i} className="mb-3">
          <h3 className="font-medium text-sm">
            {w.jobTitle}, {w.company}
          </h3>
          <p className="text-sm italic mb-1">{w.date}</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {w.descriptions.map((d, j) => (
              <li key={j}>{d}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
export function CertificationSection({
  custom,
}: {
  custom?: { descriptions: string[] };
}) {
  const certs = custom?.descriptions ?? [];
  if (!certs.length) return null;
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm">
      {certs.map((c, i) => (
        <li key={i}>{c}</li>
      ))}
    </ul>
  );
}

/* ---------- helper to access everything together ---------- */
export function PlainSnapshot({ resume }: { resume: Resume }) {
  return (
    <>
      <ContactInfo profile={resume.profile} />
      <SummarySection summary={resume.profile.summary} />
      <SkillsList skills={resume.skills} />
      <ProjectsSection projects={resume.projects} />
      <EducationSection educations={resume.educations} />
      <ExperienceSection workExperiences={resume.workExperiences} />
      <CertificationSection custom={resume.custom} />
    </>
  );
}
