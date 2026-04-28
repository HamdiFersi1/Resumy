"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Resume } from "./SnapshotSections";
import {
  ContactInfo,
  SummarySection,
  SkillsList,
  ProjectsSection,
  EducationSection,
  ExperienceSection,
} from "./SnapshotSections";

export function ResumeTextCard({ resume }: { resume?: Resume }) {
  if (!resume || !resume.profile) return null;

  const workList = resume.workExperiences ?? [];
  const eduList = resume.educations ?? [];
  const projList = resume.projects ?? [];
  const skills = resume.skills;
  const certList = resume.custom?.descriptions ?? [];

  return (
    <Card className="bg-muted/50 border border-border rounded-2xl shadow-lg w-[700px] max-w-5xl mx-auto">
      <CardHeader className="p-8">
        <CardTitle className="text-3xl font-bold">Resume Text</CardTitle>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {/* Contact Information */}
        <section className="space-y-2">
          <h3 className="text-2xl font-semibold">Contact Information</h3>
          <div className="text-justify leading-relaxed">
            <ContactInfo profile={resume.profile} />
          </div>
        </section>

        <Separator />

        {/* Summary */}
        {resume.profile.summary && (
          <section className="space-y-2">
            <h3 className="text-2xl font-semibold">Summary</h3>
            <div className="text-justify leading-relaxed">
              <SummarySection summary={resume.profile.summary} />
            </div>
          </section>
        )}

        {resume.profile.summary && <Separator />}

        {/* Experience */}
        {workList.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-2xl font-semibold">Experience</h3>
            <div className="text-justify leading-relaxed">
              <ExperienceSection workExperiences={workList} />
            </div>
          </section>
        )}

        {workList.length > 0 && <Separator />}

        {/* Projects */}
        {projList.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-2xl font-semibold">Projects</h3>
            <div className="text-justify leading-relaxed">
              <ProjectsSection projects={projList} />
            </div>
          </section>
        )}

        {projList.length > 0 && <Separator />}

        {/* Education */}
        {eduList.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-2xl font-semibold">Education</h3>
            <div className="text-justify leading-relaxed">
              <EducationSection educations={eduList} />
            </div>
          </section>
        )}

        {eduList.length > 0 && <Separator />}

        {/* Skills */}
        {skills?.descriptions?.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-2xl font-semibold">Skills</h3>
            <div className="text-justify leading-relaxed">
              <SkillsList skills={skills} />
            </div>
          </section>
        )}

        {skills?.descriptions?.length > 0 && <Separator />}

        {/* Certifications */}
        {certList.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-2xl font-semibold">Certifications</h3>
            <ul className="list-disc pl-5 space-y-1 text-justify leading-relaxed">
              {certList.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
