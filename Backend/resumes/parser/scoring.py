# jobs/scoring.py

import re
from sentence_transformers import util
from .model import model              # your SBERT instance
from .formatter import format_resume   # resume formatter returning sections


def _normalize_list(raw: str, split_pattern: str) -> str:
    """
    Helper to split a raw string by regex, strip items, and rejoin with ';'.
    """
    if not raw:
        return ""
    items = [x.strip() for x in re.split(split_pattern, raw) if x.strip()]
    return "; ".join(items)


def score_resume(parsed_resume: dict, job_posting) -> dict:
    """
    Compute per-section similarity between a parsed resume and a JobPosting
    instance with discrete fields:

      - required_experience (experience)
      - required_skills    (skills)
      - required_education (education)
      - job_description    (used for projects if no separate field)
    """
    # ── 1) Format the job’s discrete fields ───────────────────────
    exp_raw = job_posting.required_experience or ""
    skills_raw = job_posting.required_skills or ""
    edu_raw = job_posting.required_education or ""
    proj_raw = job_posting.job_description or ""

    # Normalize splitting on newlines, bullets, semicolons, or commas
    exp_text = _normalize_list(exp_raw, r"[\n;]")
    skills_text = _normalize_list(skills_raw, r"[,;]")
    edu_text = _normalize_list(edu_raw, r"[\n;]")
    proj_text = _normalize_list(proj_raw, r"[\n;]")

    # ── 2) Encode the job’s sections ───────────────────────────────
    emb_exp_req = model.encode(exp_text,    convert_to_tensor=True)
    emb_skills_req = model.encode(skills_text, convert_to_tensor=True)
    emb_edu_req = model.encode(edu_text,    convert_to_tensor=True)
    emb_proj_req = model.encode(proj_text,   convert_to_tensor=True)

    # ── 3) Format & encode the candidate’s resume ────────────────
    cand = format_resume(parsed_resume)
    cand_exp = cand.get("resume_experience", "")
    cand_skills = cand.get("resume_skills",     "")
    cand_projects = "\n".join(cand.get("resume_projects", []))
    cand_edu = cand.get("resume_education",  "")

    emb_cand_exp = model.encode(cand_exp,      convert_to_tensor=True)
    emb_cand_skills = model.encode(cand_skills,   convert_to_tensor=True)
    emb_cand_projects = model.encode(cand_projects, convert_to_tensor=True)
    emb_cand_edu = model.encode(cand_edu,      convert_to_tensor=True)

    # ── 4) Compute cosine similarities ────────────────────────────
    exp_score = util.pytorch_cos_sim(emb_exp_req,    emb_cand_exp).item()
    skills_score = util.pytorch_cos_sim(emb_skills_req, emb_cand_skills).item()
    projects_score = util.pytorch_cos_sim(
        emb_proj_req,   emb_cand_projects).item()
    education_score = util.pytorch_cos_sim(emb_edu_req,    emb_cand_edu).item()

    # ── 5) Round & weight ────────────────────────────────────────
    experience_score = round(exp_score,     4)
    skills_score = round(skills_score,  4)
    projects_score = round(projects_score, 4)
    education_score = round(education_score, 4)

    total_score = round(
        experience_score * 0.45 +
        skills_score * 0.3 +
        projects_score * 0.2 +
        education_score * 0.1,
        4
    )

    return {
        "experience_score": experience_score,
        "skills_score":     skills_score,
        "projects_score":   projects_score,
        "education_score":  education_score,
        "total_score":      total_score,
    }
