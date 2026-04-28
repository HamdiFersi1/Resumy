import re
from collections import OrderedDict
from datetime import datetime

def calculate_experience_duration(job_title):
    """
    Extracts job start and end years from the job title and calculates job duration.
    Handles 'Present' dynamically and ensures proper singular/plural formatting.
    """
    current_year = datetime.now().year
    # Extract all 4-digit years from the title
    date_matches = re.findall(r'\b(19\d{2}|20\d{2})\b', job_title)

    if len(date_matches) == 2:
        start_year, end_year = map(int, date_matches)
    elif len(date_matches) == 1:
        start_year = int(date_matches[0])
        end_year = current_year  # Assume current if only one year found
    else:
        return "Unknown"

    duration = max(0, end_year - start_year)  # Prevents negative values

    if duration == 1:
        return "1 year"
    elif duration > 1:
        return f"{duration} years"
    else:
        return "Less than a year"


_heading_patterns = {
    "Work Experience":   re.compile(r"^(?:[-•*]\s*)?(?:WORK\s*EXPERIENCE|EXPERIENCE|PROFESSIONAL\s*EXPERIENCE)\s*:?", re.IGNORECASE),
    "Education":         re.compile(r"^(?:[-•*]\s*)?EDUCATION\s*:?", re.IGNORECASE),
    "Projects":          re.compile(r"^(?:[-•*]\s*)?(?:PROJECTS?|PROJECT\s*EXPERIENCE|KEY\s*PROJECTS|MAJOR\s*PROJECTS|KEY\s*ACHIEVEMENTS)\s*:?", re.IGNORECASE),
    "Skills":            re.compile(r"^(?:[-•*]\s*)?SKILLS\s*:?", re.IGNORECASE),
    "Certifications":    re.compile(r"^(?:[-•*]\s*)?CERTIFICATIONS?\s*:?", re.IGNORECASE),
}


def _detect_heading(ln):
    """Return section name if ln matches a heading pattern."""
    for name, pat in _heading_patterns.items():
        if pat.match(ln):
            return name
    return None


def split_by_headings(lines):

    blocks = OrderedDict()
    current = "MISC"
    blocks[current] = []
    for ln in lines:
        hd = _detect_heading(ln)
        if hd:
            current = hd
            blocks[current] = []
        else:
            if ln.strip():
                blocks[current].append(ln)
    return blocks

# Helper: get first non-empty block by keys


def _section_lines(blocks, *keys):
    for k in keys:
        if k in blocks and blocks[k]:
            return blocks[k]
    return []

# === Step 7: Parsers on segmented lines ===


# Experience parser
_date_regex = re.compile(
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
    r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{4})"
    r"\b.*(?:Present|\d{4})?", re.IGNORECASE
)
_at_dash_re = re.compile(r"\s+(?:at|@|[-–])\s+", re.IGNORECASE)
