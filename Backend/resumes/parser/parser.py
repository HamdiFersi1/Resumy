# resumes/parser/parser.py
import pdfplumber
import re
import json
import numpy as np
import pandas as pd
from datetime import datetime


import torch
# Import shared models
from .model import nlp


from .extract import extract_text_with_pdfplumber, clean_text, extract_candidate_name, extract_profile_summary, extract_contact_info, extract_named_entities
from .helpers import split_by_headings, _section_lines
from .sections import (
    parse_experience_lines, parse_projects_lines,
    parse_education_lines, parse_certifications_lines
    
)


def parse_resume(pdf_path):
    """Main function to extract structured resume data."""
    raw = extract_text_with_pdfplumber(pdf_path)
    lines = clean_text(raw)
    blocks = split_by_headings(lines)

    contact = extract_contact_info(lines)
    name = extract_candidate_name(lines)
    profile = extract_profile_summary(lines, name)

    exp_lines = _section_lines(blocks, "Work Experience", "Experience",
                               "Professional Experience")
    proj_lines = _section_lines(blocks, "Projects", "Project Experience",
                                "Key Projects", "Major Projects")
    edu_lines = _section_lines(blocks, "Education")
    skills = _section_lines(blocks, "Skills")
    cert_lines = _section_lines(blocks, "Certifications")

    experience = parse_experience_lines(exp_lines)
    projects = parse_projects_lines(proj_lines)
    education = parse_education_lines(edu_lines)
    certifications = parse_certifications_lines(cert_lines)

    parsed_resume = {
        "name": name,
        "profile": profile,
        "contact": contact,
        "experience": experience,
        "projects": projects,
        "education": education,
        "skills": skills,
        "certifications": certifications
    }

    return parsed_resume