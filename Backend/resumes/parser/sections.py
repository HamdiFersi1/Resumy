import re

from .helpers import calculate_experience_duration,_date_regex,_at_dash_re
from datetime import datetime


def parse_experience_lines(lines):
    jobs = []
    current = None
    pending_title = None

    for i, ln in enumerate(lines):
        s = ln.strip()
        nxt = lines[i+1] if i+1 < len(lines) else ""

        # 1) detect a two–line header (title then date next)
        if (not s.startswith(("•", "-", "*"))
                and not _date_regex.search(s)
                and _date_regex.search(nxt)
                ):
            pending_title = s
            continue

        # 2) detect a date line
        if _date_regex.search(s):
            # close out previous job
            if current:
                current['duration'] = calculate_experience_duration(
                    current['date'])
                jobs.append(current)

            # parse out title/company and date
            m = _date_regex.search(s)
            before = s[:m.start()].strip()
            date_part = s[m.start():].strip()

            title = pending_title or before.split("@")[0].split("-")[0].strip()
            comp = pending_title \
                and before \
                or (before.split("@")[1].strip() if "@" in before else "")

            current = {
                "company": title,
                "title":   comp,
                "date":    date_part,
                "description": [],
                "duration": "Unknown",
            }
            pending_title = None

        # 3) description lines
        elif current:
            # If this line looks like a continuation (starts with lowercase or a stray dot),
            # merge it into the last bullet rather than starting a new one.
            if current['description'] and (s.startswith('.') or s[0].islower()):
                # strip leading dots/spaces so we don't get ".policy-making"
                clean = s.lstrip('.').lstrip()
                current['description'][-1] += ' ' + clean
            else:
                current['description'].append(s)

    # finalize the last job
    if current:
        current['duration'] = calculate_experience_duration(current['date'])
        jobs.append(current)

    return jobs

# Projects parser


def parse_projects_lines(lines):
    projects = []
    current = None

    for ln in lines:
        s = ln.strip()

        # 1) New project title if it’s a “long enough” headline
        if len(s.split()) > 3 and not s.startswith(("•", "-", "*")):
            if current:
                projects.append(current)
            current = {"title": s, "description": []}

        # 2) Otherwise it’s part of the current project’s details
        elif current:
            # If this line looks like a continuation of the last bullet
            # (it starts with a stray dot or lowercase letter),
            # then we merge it into the previous description entry.
            if current["description"] and (s.startswith(".") or s[:1].islower()):
                clean = s.lstrip(".").lstrip()
                current["description"][-1] += " " + clean
            else:
                # Otherwise it really is a new bullet/line
                current["description"].append(s)

    # 3) Don’t forget the last one
    if current:
        projects.append(current)

    return projects


# Education parser
_deg_keywords = ["Bachelor", "Master", "PhD", "Degree", "Diploma"]
_date_re2 = re.compile(
    r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})"
    r"(?:\s?[–-]\s?(?:Present|\d{4}))?\b", re.IGNORECASE
)


def parse_education_lines(lines):
    entries = []
    current = None
    pending_school = None
    for i, ln in enumerate(lines):
        s = ln.strip()
        m = _date_re2.search(s)
        nxt = lines[i+1] if i+1 < len(lines) else ""
        nxt_has = bool(_date_re2.search(nxt))
        # two-line school header
        if not m and nxt_has:
            pending_school = s
            continue
        if m:
            if current:
                entries.append(current)
            date_part = m.group(0).strip()
            before = s[:m.start()].strip().rstrip(',')
            if pending_school:
                school = pending_school
                degree = before
            else:
                idx = None
                for kw in _deg_keywords:
                    mo = re.search(kw, before, re.IGNORECASE)
                    if mo:
                        idx = mo.start()
                        break
                if idx is not None:
                    school = before[:idx].strip().rstrip(',')
                    degree = before[idx:].strip()
                else:
                    school = before
                    degree = ""
            current = {"school": school, "degree": degree,
                       "date": date_part, "additional_info": []}
            pending_school = None
        elif current:
            current['additional_info'].append(s)
    if current:
        entries.append(current)
    return entries[0] if len(entries) == 1 else entries


def parse_certifications_lines(lines):
    """Simple parser for certifications: returns list of certifications."""
    return [ln.strip() for ln in lines if ln.strip()]


def calculate_experience_duration(date_str):
    current_year = datetime.now().year
    yrs = re.findall(r"\b(19\d{2}|20\d{2})\b", date_str)
    if len(yrs) == 2:
        start, end = map(int, yrs)
    elif len(yrs) == 1:
        start = int(yrs[0])
        end = current_year
    else:
        return "Unknown"
    diff = max(0, end - start)
    if diff == 1:
        return "1 year"
    return f"{diff} years" if diff > 1 else "Less than a year"
