// src/components/Application/ResumePDFSnapshot.tsx
import { Document, Page, View } from "@react-pdf/renderer";
import { styles, spacing } from "../Builder/Resume/ResumePDF/styles";
import { ResumePDFProfile } from "../Builder/Resume/ResumePDF/ResumePDFProfile";
import { ResumePDFWorkExperience } from "../Builder/Resume/ResumePDF/ResumePDFWorkExperience";
import { ResumePDFEducation } from "../Builder/Resume/ResumePDF/ResumePDFEducation";
import { ResumePDFProject } from "../Builder/Resume/ResumePDF/ResumePDFProject";
import { ResumePDFSkillsApp } from "./PDFstyles/ResumePDFSkillsApp";
import { ResumePDFCustomApp } from "./PDFstyles/ResumePDFCustomApp";
import { DEFAULT_FONT_COLOR } from "../../lib/redux/settingsSlice";

import type { Settings, ShowForm } from "../../lib/redux/settingsSlice";
import type { Resume } from "../../lib/redux/types";
import type { JSX } from "react";

export const ResumePDFSnapshot = ({
  resume,
  settings,
  isPDF = false,
}: {
  resume: Resume;
  settings: Settings;
  isPDF?: boolean;
}) => {
  const { profile, workExperiences, educations, projects, skills, custom } =
    resume;
  const { name } = profile;
  const {
    fontFamily,
    fontSize,
    documentSize,
    formToHeading,
    formToShow,
    formsOrder,
    showBulletPoints,
  } = settings;
  const themeColor = settings.themeColor || DEFAULT_FONT_COLOR;

  // 1) normalize skills into bullets (unchanged) …
  const rawArr: string[] = Array.isArray(skills.descriptions)
    ? skills.descriptions
    : (skills.descriptions as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
  const grouped: string[] = [];
  let current = "";
  for (const s of rawArr) {
    if (s.includes(":")) {
      if (current) grouped.push(current);
      current = s;
    } else {
      current = current ? `${current}, ${s}` : s;
    }
  }
  if (current) grouped.push(current);
  const normalizedSkills = {
    featuredSkills: skills.featuredSkills,
    descriptions: grouped,
  };

  // 2) pick which forms to show
  let showForms = formsOrder.filter((f) => formToShow[f]);

  // 3) make a local copy of your headings so you can tweak `custom` safely
  const headings = { ...formToHeading };

  if (custom?.descriptions?.length) {
    if (!showForms.includes("custom")) {
      showForms = [...showForms, "custom"];
    }
    // override locally, never mutating the original
    headings.custom = "Certifications";
  }

  // 4) map each form to its component, using our new local `headings`
  const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
    workExperiences: () => (
      <ResumePDFWorkExperience
        heading={headings.workExperiences}
        workExperiences={workExperiences}
        themeColor={themeColor}
      />
    ),
    educations: () => (
      <ResumePDFEducation
        heading={headings.educations}
        educations={educations}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints.educations}
      />
    ),
    projects: () => (
      <ResumePDFProject
        heading={headings.projects}
        projects={projects}
        themeColor={themeColor}
      />
    ),
    skills: () => (
      <ResumePDFSkillsApp
        heading={headings.skills}
        skills={normalizedSkills}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints.skills}
      />
    ),
    custom: () => (
      <ResumePDFCustomApp
        heading={headings.custom}
        custom={custom!}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints.custom}
      />
    ),
  };

  return (
    <Document title={`${name} Resume`} author={name} producer="Resumake">
      <Page
        size={documentSize === "A4" ? "A4" : "LETTER"}
        style={{
          ...styles.flexCol,
          color: DEFAULT_FONT_COLOR,
          fontFamily,
          fontSize: `${fontSize}pt`,
        }}
      >
        {themeColor && (
          <View
            style={{
              width: spacing.full,
              height: spacing[3.5],
              backgroundColor: themeColor,
            }}
          />
        )}
        <View
          style={{ ...styles.flexCol, padding: `${spacing[0]} ${spacing[20]}` }}
        >
          <ResumePDFProfile
            profile={profile}
            themeColor={themeColor}
            isPDF={isPDF}
          />

          {showForms.map((form) => {
            const Section = formTypeToComponent[form];
            return <Section key={form} />;
          })}
        </View>
      </Page>
    </Document>
  );
};
