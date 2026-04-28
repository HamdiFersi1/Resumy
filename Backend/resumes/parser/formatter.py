# resumes/parser/formatter.py

def format_resume(parsed):
   
    # Experience
    exps = parsed.get("experience", [])
    exp_sents = []
    for e in exps:
        title = e.get("title", "").strip()
        comp = e.get("company", "").strip()
        dur = e.get("duration", "").strip()
        desc = "; ".join(e.get("description", []))
        seg = []
        if title and comp:
            seg.append(f"{title} at {comp}")
        elif title:
            seg.append(title)
        if dur:
            seg.append(f"({dur})")
        if desc:
            seg.append(desc)
        if seg:
            exp_sents.append(" ".join(seg))
    resume_experience = "\n".join(
        exp_sents) if exp_sents else "No experience found"

    # Skills
    sk = parsed.get("skills", [])
    if isinstance(sk, list):
        resume_skills = ", ".join(sk) if sk else "No skills found"
    else:
        resume_skills = str(parsed.get("skills", "No skills found"))

    # Projects
    projs = parsed.get("projects", [])
    proj_sents = []
    for p in projs:
        title = p.get("title", "").strip()
        desc = "; ".join(p.get("description", []))
        if title and desc:
            proj_sents.append(f"{title}: {desc}")
        elif title:
            proj_sents.append(title)
        elif desc:
            proj_sents.append(desc)
    resume_projects = proj_sents if proj_sents else ["No projects found"]

    # Education
    edu = parsed.get("education")
    if isinstance(edu, dict):
        seg = []
        if edu.get("school"):
            seg.append(edu["school"])
        if edu.get("degree"):
            seg.append(edu["degree"])
        if edu.get("date"):
            seg.append(f"({edu['date']})")
        resume_education = " ".join(seg) if seg else "No education found"
    elif isinstance(edu, list):
        eds = []
        for it in edu:
            seg = []
            if it.get("school"):
                seg.append(it["school"])
            if it.get("degree"):
                seg.append(it["degree"])
            if it.get("date"):
                seg.append(f"({it['date']})")
            if seg:
                eds.append(" ".join(seg))
        resume_education = " / ".join(eds) if eds else "No education found"
    else:
        resume_education = str(edu or "No education found")

    return {
        "resume_experience": resume_experience,
        "resume_skills": resume_skills,
        "resume_projects": resume_projects,
        "resume_education": resume_education
    }
