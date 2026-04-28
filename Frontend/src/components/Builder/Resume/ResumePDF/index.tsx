// src/components/Resume/ResumePDF.tsx
import { Page, View, Document } from "@react-pdf/renderer";
import { styles, spacing } from "./styles";
import { ResumePDFProfile } from "./ResumePDFProfile";
import { ResumePDFWorkExperience } from "./ResumePDFWorkExperience";
import { ResumePDFEducation } from "./ResumePDFEducation";
import { ResumePDFProject } from "./ResumePDFProject";
import { ResumePDFSkills } from "./ResumePDFSkills";
import { ResumePDFCustom } from "./ResumePDFCustom";
import { DEFAULT_FONT_COLOR } from "../../../../lib/redux/settingsSlice";
import type { Settings, ShowForm } from "../../../../lib/redux/settingsSlice";
import type { Resume } from "../../../../lib/redux/types";
import type { JSX } from "react";

/**
 * Render the resume as a PDF Document. No warnings suppression here.
 */
export const ResumePDF = ({
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

  const showFormsOrder = formsOrder.filter((form) => formToShow[form]);

  // Map each form to its PDF component; child components manage their own isPDF internally if needed
  const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
    workExperiences: () => (
      <ResumePDFWorkExperience
        heading={formToHeading.workExperiences}
        workExperiences={workExperiences}
        themeColor={themeColor}
      />
    ),
    educations: () => (
      <ResumePDFEducation
        heading={formToHeading.educations}
        educations={educations}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints.educations}
      />
    ),
    projects: () => (
      <ResumePDFProject
        heading={formToHeading.projects}
        projects={projects}
        themeColor={themeColor}
      />
    ),
    skills: () => (
      <ResumePDFSkills
        heading={formToHeading.skills}
        skills={skills}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints.skills}
      />
    ),
    custom: () => (
      <ResumePDFCustom
        heading={formToHeading.custom}
        custom={custom}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints.custom}
      />
    ),
  };

  return (
    <Document title={`${name} Resume`} author={name} producer="OpenResume">
      <Page
        size={documentSize === "A4" ? "A4" : "LETTER"}
        style={{
          ...styles.flexCol,
          color: DEFAULT_FONT_COLOR,
          fontFamily,
          fontSize: fontSize + "pt",
        }}
      >
        {settings.themeColor && (
          <View
            style={{
              width: spacing.full,
              height: spacing[3.5],
              backgroundColor: themeColor,
            }}
          />
        )}
        <View
          style={{
            ...styles.flexCol,
            padding: `${spacing[0]} ${spacing[20]}`,
          }}
        >
          <ResumePDFProfile
            profile={profile}
            themeColor={themeColor}
            isPDF={isPDF}
          />
          {showFormsOrder.map((form) => {
            const Section = formTypeToComponent[form];
            return <Section key={form} />;
          })}
        </View>
      </Page>
    </Document>
  );
};
