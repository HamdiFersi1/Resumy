// src/components/jobHR/JobPostingForm/types.ts

export interface JobForm {
  // Basic Info
  title: string;
  company_name: string;
  location: string;
  contract_type: "FT" | "PT" | "IN" | "CT" | "FL";
  category: string;
  experience_level: string;

  // Description
  job_description: string;

  // Requirements
  required_skills: string;
  required_experience: string;
  required_education: string;

  // Dates
  application_start: string;
  application_deadline: string | null;
}

export const initialJobForm: JobForm = {
  title: "",
  company_name: "",
  location: "",
  contract_type: "FT", 
  category: "",
  experience_level: "",
  job_description: "",
  required_skills: "",
  required_experience: "",
  required_education: "",
  application_start: "",
  application_deadline: "",
};
