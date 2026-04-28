import { Form, FormSection } from "../ResumeForm/Form";
import { Input, BulletListTextarea } from "../ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "../../../lib/redux/hooks";
import {
  changeWorkExperiences,
  selectWorkExperiences,
} from "../../../lib/redux/resumeSlice";
import type { ResumeWorkExperience } from "../../../lib/redux/types";

export const WorkExperiencesForm = () => {
  const workExperiences = useAppSelector(selectWorkExperiences);
  const dispatch = useAppDispatch();
  const showDelete = workExperiences.length > 1;

  return (
    <Form form="workExperiences" addButtonText="Add Job">
      {workExperiences.map(
        (
          { company, jobTitle, date, descriptions }: ResumeWorkExperience,
          idx: number
        ) => {
          const handleWorkExperienceChange = (
            field: keyof ResumeWorkExperience,
            value: string | string[]
          ) => {
            if (field === "descriptions") {
              // descriptions must be string[]
              dispatch(
                changeWorkExperiences({
                  idx,
                  field: "descriptions",
                  value: value as string[],
                })
              );
            } else {
              // other fields are string
              dispatch(
                changeWorkExperiences({
                  idx,
                  field: field as Exclude<
                    keyof ResumeWorkExperience,
                    "descriptions"
                  >,
                  value: value as string,
                })
              );
            }
          };

          const showMoveUp = idx !== 0;
          const showMoveDown = idx !== workExperiences.length - 1;

          return (
            <FormSection
              key={idx}
              form="workExperiences"
              idx={idx}
              showMoveUp={showMoveUp}
              showMoveDown={showMoveDown}
              showDelete={showDelete}
              deleteButtonTooltipText="Delete job"
            >
              <Input
                label="Company"
                labelClassName="col-span-full"
                name="company"
                placeholder="Khan Academy"
                value={company}
                onChange={handleWorkExperienceChange}
              />
              <Input
                label="Job Title"
                labelClassName="col-span-4"
                name="jobTitle"
                placeholder="Software Engineer"
                value={jobTitle}
                onChange={handleWorkExperienceChange}
              />
              <Input
                label="Date"
                labelClassName="col-span-2"
                name="date"
                placeholder="Jun 2022 - Present"
                value={date}
                onChange={handleWorkExperienceChange}
              />
              <BulletListTextarea
                label="Description"
                labelClassName="col-span-full"
                name="descriptions"
                placeholder="Bullet points"
                value={descriptions}
                onChange={handleWorkExperienceChange}
              />
            </FormSection>
          );
        }
      )}
    </Form>
  );
};
