import json
import re
import os
import logging
from django.conf import settings
from google import genai
from google.genai import types

# set up logging
logger = logging.getLogger(__name__)

# 1) Configure API key
API_KEY = (
    os.environ.get("GEMINI_API_KEY")
    or getattr(settings, "GOOGLE_API_KEY", None)
    or getattr(settings, "GOOGLE_AI_STUDIO_API_KEY", None)
    or getattr(settings, "GOOGLE_STUDIO_API_KEY", None)
)
if not API_KEY:
    raise RuntimeError(
        "Google AI Studio key missing: set GEMINI_API_KEY or GOOGLE_API_KEY"
    )

genai_client = genai.Client(api_key=API_KEY)
# Model ID can be adjusted as needed
_MODEL_ID = "gemini-1.5-flash"

# Regex to extract JSON blocks
_JSON_RE = re.compile(r"\{[\s\S]*\}", re.MULTILINE)


def _extract_json(text: str) -> str:
    """
    Strip markdown fences and extract the first JSON object substring.
    """
    # Remove markdown fences
    cleaned = re.sub(r"```[\w]*", "", text).strip()
    # Find the JSON object boundaries
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        logger.error("No JSON braces found in output: %s", cleaned)
        raise RuntimeError("Model output did not contain valid JSON braces")
    return cleaned[start: end + 1]


def _clean_json(text: str) -> dict:
    """
    Parse a JSON object from text, extracting if wrapped in prose or fences.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract the JSON substring
        json_str = _extract_json(text)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            logger.error(
                "Failed to parse JSON from extracted text: %s", json_str)
            raise RuntimeError(
                "Model output did not contain valid JSON structure")


def generate_interview_questions(job_details: dict, resume_json: dict) -> dict:
    """
    Calls Gemini to generate interview questions based on job and resume.
    Returns a dict like {"technical": [...], "behavioral": [...], "culture": [...]}.
    """
    # Build the prompt
    prompt = (
        "You are an expert interview-question generator. Produce only a JSON object "
        "with keys = categories (technical, behavioral, culture) and values = arrays of questions. "
        "No extra text.\n\n"
        "Job Description JSON:\n" + json.dumps(job_details) + "\n\n"
        "Candidate Resume Snapshot JSON:\n" + json.dumps(resume_json)
    )

    logger.debug("Generating questions with prompt: %s", prompt)

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        )
    ]

    # Increase max_output_tokens to ensure full JSON
    config = types.GenerateContentConfig(
        temperature=0.6,
        top_p=0.9,
        max_output_tokens=1024,
        response_mime_type="text/plain",
    )

    output = ""
    try:
        for chunk in genai_client.models.generate_content_stream(
            model=_MODEL_ID,
            contents=contents,
            config=config,
        ):
            output += chunk.text
    except Exception as exc:
        logger.exception("Error streaming from Gemini: %s", exc)
        raise

    if not output.strip():
        logger.error("Empty response from Gemini")
        raise RuntimeError("Empty response from Gemini")

    logger.debug("Raw model output: %s", output)
    # Extract and parse JSON
    return _clean_json(_extract_json(output))