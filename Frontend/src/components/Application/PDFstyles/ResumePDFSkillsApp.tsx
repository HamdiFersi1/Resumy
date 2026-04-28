// src/components/Application/PDFstyles/ResumePDFSkillsApp.tsx
"use client";

import { View } from "@react-pdf/renderer";
import {
  ResumePDFSection,
  ResumePDFBulletList,
  ResumeFeaturedSkill,
} from "../../Builder/Resume/ResumePDF/common";
import { styles, spacing } from "../../Builder/Resume/ResumePDF/styles";
import type { ResumeSkills } from "../../../lib/redux/types";

export const ResumePDFSkillsApp = ({
  heading,
  skills,
  themeColor,
  showBulletPoints,
}: {
  heading: string;
  skills: ResumeSkills;
  themeColor: string;
  showBulletPoints: boolean;
}) => {
  // 1) Pull out featured + parsed arrays
  const { descriptions, featuredSkills } = skills;
  const featured = featuredSkills.filter((f) => f.skill);

  // 2) Group descriptions on ":" exactly like your SkillsList
  const raw = [...descriptions];
  const grouped: string[] = [];
  let current = "";
  for (const s of raw) {
    if (s.includes(":")) {
      if (current) grouped.push(current);
      current = s;
    } else {
      current = current ? `${current}, ${s}` : s;
    }
  }
  if (current) grouped.push(current);

  // 3) Build rows of featured skills (if any)
  const rows = [
    [featured[0], featured[3]],
    [featured[1], featured[4]],
    [featured[2], featured[5]],
  ];

  return (
    <ResumePDFSection themeColor={themeColor} heading={heading}>
      {featured.length > 0 && (
        <View style={{ ...styles.flexRowBetween, marginTop: spacing["0.5"] }}>
          {rows.map((pair, ri) => (
            <View key={ri} style={styles.flexCol}>
              {pair.map((fs, ci) =>
                fs ? (
                  <ResumeFeaturedSkill
                    key={ci}
                    skill={fs.skill}
                    rating={fs.rating}
                    themeColor={themeColor}
                    style={{ justifyContent: "flex-end" }}
                  />
                ) : null
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.flexCol}>
        {/* Use the grouped array here, not the raw descriptions */}
        <ResumePDFBulletList
          items={grouped}
          showBulletPoints={showBulletPoints}
        />
      </View>
    </ResumePDFSection>
  );
};
