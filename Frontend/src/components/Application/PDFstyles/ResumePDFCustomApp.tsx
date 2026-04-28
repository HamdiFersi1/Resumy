// src/components/Application/PDFstyles/ResumePDFCustom.tsx
import { View } from "@react-pdf/renderer";
import { ResumePDFSection, ResumePDFBulletList } from "../../Builder/Resume/ResumePDF/common";
import { styles } from "../../Builder/Resume/ResumePDF/styles";
import type { ResumeCustom } from "../../../lib/redux/types";

export const ResumePDFCustomApp = ({
  heading,
  custom,
  themeColor,
  showBulletPoints,
}: {
  heading: string;
  custom: ResumeCustom;
  themeColor: string;
  showBulletPoints: boolean;
}) => {
  const { descriptions } = custom;

  // ** EARLY RETURN if no certifications/cert-descriptions **
  if (!descriptions || descriptions.length === 0) {
    return null;
  }

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      <View style={{ ...styles.flexCol }}>
        <ResumePDFBulletList
          items={descriptions}
          showBulletPoints={showBulletPoints}
        />
      </View>
    </ResumePDFSection>
  );
};
