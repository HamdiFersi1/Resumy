import { Svg, Path, View } from "@react-pdf/renderer";
import { ResumePDFIcon, type IconType } from "./common/ResumePDFIcon";
import { styles, spacing } from "./styles";
import { ResumePDFSection, ResumePDFText } from "./common";
import type { ResumeProfile } from "../../../../lib/redux/types";

<Svg viewBox="0 0 100 100" style={{ width: 20, height: 20, marginBottom: 10 }}>
  <Path d="M10 10 L90 10 L50 90 Z" fill="black" />
</Svg>;
export const ResumePDFProfile = ({
  profile,
  themeColor,
  isPDF,
}: {
  profile: ResumeProfile;
  themeColor: string;
  isPDF: boolean;
}) => {
  const { name, summary, email, phone, location, url } = profile;
  const entries: Array<{ key: IconType; value: string }> = [
    { key: "email", value: email },
    { key: "phone", value: phone },
    { key: "location", value: location },
    { key: "url", value: url },
  ];

  return (
    <ResumePDFSection style={{ marginTop: spacing["4"] }}>
      <ResumePDFText bold themeColor={themeColor} style={{ fontSize: "20pt" }}>
        {name}
      </ResumePDFText>
      {summary && <ResumePDFText>{summary}</ResumePDFText>}
      <View
        style={{
          ...styles.flexRowBetween,
          flexWrap: "wrap",
          marginTop: spacing["0.4"],
        }}
      >
        {entries.map(({ key, value }) => {
          if (!value) return null;

           let iconType = key as IconType;
           if (key === "url") {
             if (value.includes("github")) {
               iconType = "url_github";
             } else if (value.includes("linkedin")) {
               iconType = "url_linkedin";
             }
           }

          return (
            <View
              key={key}
              style={{
                ...styles.flexRow,
                alignItems: "center",
                gap: spacing["0.4"],
                marginBottom: spacing["1"],
                
              }}
            >
              <ResumePDFIcon type={iconType} isPDF={isPDF} />
              {/* Plain text for all entries to ensure rendering */}
              <ResumePDFText>{value}</ResumePDFText>
            </View>
          );
        })}
      </View>
    </ResumePDFSection>
  );
};
