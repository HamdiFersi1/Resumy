// src/components/ResumeForm/ProjectsForm.tsx
import { Form, FormSection } from "../ResumeForm/Form";
import { Input, BulletListTextarea } from "../ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "../../../lib/redux/hooks";
import { selectProjects, changeProjects } from "../../../lib/redux/resumeSlice";
import type { ResumeProject } from "../../../lib/redux/types";

export const ProjectsForm = () => {
  const projects = useAppSelector(selectProjects);
  const dispatch = useAppDispatch();
  const showDelete = projects.length > 1;

  return (
    <Form form="projects" addButtonText="Add Project">
      {projects.map((projectItem: ResumeProject, idx: number) => {
        const { project, date, descriptions } = projectItem;

        // ↓ Replace your old rest‑tuple handler with this:
        const handleProjectChange = (
          field: keyof ResumeProject,
          value: string | string[]
        ) => {
          if (field === "descriptions") {
            // TS now knows field === "descriptions", so value must be string[]
            dispatch(
              changeProjects({
                idx,
                field: "descriptions",
                value: value as string[],
              })
            );
          } else {
            // TS knows field !== "descriptions", so value is string
            dispatch(
              changeProjects({
                idx,
                field: field as Exclude<keyof ResumeProject, "descriptions">,
                value: value as string,
              })
            );
          }
        };

        const showMoveUp = idx !== 0;
        const showMoveDown = idx !== projects.length - 1;

        return (
          <FormSection
            key={idx}
            form="projects"
            idx={idx}
            showMoveUp={showMoveUp}
            showMoveDown={showMoveDown}
            showDelete={showDelete}
            deleteButtonTooltipText={"Delete project"}
          >
            <Input
              name="project"
              label="Project Name"
              placeholder="OpenResume"
              value={project}
              onChange={handleProjectChange}
              labelClassName="col-span-4"
            />
            <Input
              name="date"
              label="Date"
              placeholder="Winter 2022"
              value={date}
              onChange={handleProjectChange}
              labelClassName="col-span-2"
            />
            <BulletListTextarea
              name="descriptions"
              label="Description"
              placeholder="Bullet points"
              value={descriptions}
              onChange={handleProjectChange}
              labelClassName="col-span-full"
            />
          </FormSection>
        );
      })}
    </Form>
  );
};
