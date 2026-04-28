import re
import pdfplumber
from .model import nlp




# === Step 1: Extract Text from PDF ===
def extract_text_with_pdfplumber(pdf_path):
    text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text.extend(page_text.split("\n"))
    return text

# === Step 2: Clean Extracted Text ===
def clean_text(text):
    return [line.strip() for line in text if line.strip()]


def extract_candidate_name(text):
    """
    Extracts the candidate's name using a multi-step approach:
    
    1. Uses spaCy's NER (with en_core_web_sm) on the first 10 lines to find PERSON entities.
       - Returns the first PERSON entity that has between 1 and 4 tokens and does not match common invalid words.
    2. If no suitable PERSON entity is found, falls back to checking the first 5 lines for an isolated short line.
    """
    common_invalid = {"resume", "cv", "profile",
                      "contact", "experience", "education"}
    # Step 1: Use spaCy NER on the first 10 lines
    for line in text[:10]:
        doc = nlp(line)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                candidate = ent.text.strip()
                # Filter out very short or very long candidates and common invalids.
                token_count = len(candidate.split())
                if 1 <= token_count <= 4 and candidate.lower() not in common_invalid:
                    return candidate
    # Step 2: Fallback heuristic: pick the first line among the first 5 that is short and not a header.
    for line in text[:5]:
        line_clean = line.strip()
        tokens = line_clean.split()
        if 1 <= len(tokens) <= 4 and line_clean.lower() not in common_invalid:
            return line_clean
    return "Not Found"


# === NEW: Extract Profile Summary Excluding the Name ===
def extract_profile_summary(text, candidate_name):
    """
    Constructs a profile summary by excluding any line that matches the candidate's name.
    Returns the first three remaining lines concatenated as the summary.
    """
    remaining_lines = [
        line for line in text if line.strip().lower() != candidate_name.lower()]
    return " ".join(remaining_lines[:3]).strip()


def extract_contact_info(text):
    """Extracts email, phone number, and LinkedIn profile."""
    contact_info = {"email": None, "phone": None, "linkedin": None}
    email_regex = r"[\w\.-]+@[\w\.-]+"
    phone_regex = r"\+216\s*\d{2,3}(?:\s*\d{2,3}){2}"
    linkedin_regex = r"(linkedin\.com\/\S+|linkedin\/\S+)"
    for line in text:
        if not contact_info["email"]:
            match = re.search(email_regex, line)
            if match:
                contact_info["email"] = match.group()
        if not contact_info["phone"]:
            match = re.search(phone_regex, line)
            if match:
                contact_info["phone"] = match.group().strip()
        if not contact_info["linkedin"]:
            match = re.search(linkedin_regex, line)
            if match:
                contact_info["linkedin"] = match.group().strip()
    return contact_info

# === Step 4: NER for Additional Entities (Education & Skills) ===


def extract_named_entities(text):
    """Uses spaCy to extract education and skills information."""
    profile = {"education": [], "skills": []}
    skills_keywords = ["python", "java", "sql", "aws",
                       "tensorflow", "react", "docker", "machine learning", "TypeScript", "Java Script"]
    degree_keywords = ["bachelor", "master", "phd", "degree",
                       "diploma", "university", "institute", "college", "school"]
    for line in text:
        doc = nlp(line)
        for ent in doc.ents:
            if ent.label_ in {"ORG", "GPE"}:
                profile["education"].append(ent.text)
        if any(word in line.lower() for word in degree_keywords):
            profile["education"].append(line)
        if any(skill in line.lower() for skill in skills_keywords):
            profile["skills"].append(line)
    profile["education"] = list(set(x.strip() for x in profile["education"]))
    profile["skills"] = list(set(x.strip() for x in profile["skills"]))
    return profile
