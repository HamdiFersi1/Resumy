import json
from rest_framework import serializers
from .models import JobApplication, ParsedResume, Interview, ApplicationFeedback
from jobs.models import JobPosting

class JobApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.CharField(
        source="applicant.get_full_name", read_only=True)
    total_score = serializers.SerializerMethodField()
    experience_score = serializers.SerializerMethodField()
    skills_score = serializers.SerializerMethodField()
    projects_score = serializers.SerializerMethodField()
    education_score = serializers.SerializerMethodField()

    # replace the auto-field with a SerializerMethodField
    snapshot_json = serializers.SerializerMethodField()

    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_title",
            "parsed_resume",
            "snapshot_json",
            "score_json",
            "status",
            "experience_score",
            "skills_score",
            "projects_score",
            "education_score",
            "applicant",
            "total_score",
            "applied_at",
        ]

    def get_total_score(self, obj):
        return obj.score_json.get("total_score") if obj.score_json else None

    def get_experience_score(self, obj):
        return obj.score_json.get("experience_score") if obj.score_json else None

    def get_skills_score(self, obj):
        return obj.score_json.get("skills_score") if obj.score_json else None

    def get_projects_score(self, obj):
        return obj.score_json.get("projects_score") if obj.score_json else None

    def get_education_score(self, obj):
        return obj.score_json.get("education_score") if obj.score_json else None

    def get_snapshot_json(self, obj):
        """
        Return the parsed resume snapshot, but if the raw_json
        stored on ParsedResume contains a 'certifications' key,
        inject it here so the front end sees it.
        """
        parsed = obj.snapshot_json or {}
        try:
            pr = ParsedResume.objects.get(
                uploaded_resume__id=obj.parsed_resume_id)
            raw = json.loads(pr.raw_json or "{}")
            if raw.get("certifications"):
                parsed["certifications"] = raw["certifications"]
        except ParsedResume.DoesNotExist:
            pass
        except json.JSONDecodeError:
            pass
        return parsed
# serializers.py


class ApplicationStatsSerializer(serializers.Serializer):
    total_applications = serializers.IntegerField()
    scored_applications = serializers.IntegerField()
    unscored_applications = serializers.IntegerField()
    average_total_score = serializers.FloatField()
    average_experience_score = serializers.FloatField()
    average_skills_score = serializers.FloatField()
    average_projects_score = serializers.FloatField()
    average_education_score = serializers.FloatField()


class JobPostingDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for returning full job posting details.
    """
    is_open = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            "id",
            "company_name",
            "title",
            "application_start",
            "application_deadline",
            "contract_type",
            "job_description",
            "required_skills",
            "required_experience",
            "required_education",
            "category",
            "location",
            "experience_level",
            "is_open",
        ]

    def get_is_open(self, obj):
        # uses your model property
        return obj.is_open


class JobApplicationDetailSerializer(JobApplicationSerializer):
    # nest full job and expose the scheduled interview date
    job = JobPostingDetailSerializer(read_only=True)
    interview_date = serializers.SerializerMethodField()

    class Meta(JobApplicationSerializer.Meta):
        fields = JobApplicationSerializer.Meta.fields + [
            "job",
            "interview_date",
        ]

    def get_interview_date(self, obj):
        interview = getattr(obj, "interview", None)
        if interview and interview.scheduled_at:
            return interview.scheduled_at
        return None

class JobPostingNestedSerializer(serializers.ModelSerializer):
    """
    Only company_name and title.
    """
    class Meta:
        model = JobPosting
        fields = ("id", "company_name", "title")


# for the Decisions leaderboard
class DecisionApplicationSerializer(serializers.ModelSerializer):
    """
    Used for the Decisions leaderboard: includes nested job with
    company_name & title, plus the usual scores/status.
    """
    applicant = serializers.CharField(
        source="applicant.get_full_name", read_only=True)
    total_score = serializers.SerializerMethodField()
    experience_score = serializers.SerializerMethodField()
    skills_score = serializers.SerializerMethodField()
    projects_score = serializers.SerializerMethodField()
    education_score = serializers.SerializerMethodField()

    job = JobPostingNestedSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "applicant",
            "status",
            "applied_at",
            "total_score",
            "experience_score",
            "skills_score",
            "projects_score",
            "education_score",
            "job",
        ]

    def _get_score(self, obj, key):
        return obj.score_json.get(key) if obj.score_json else None

    def get_total_score(self,      obj): return self._get_score(
        obj, "total_score")

    def get_experience_score(self, obj): return self._get_score(
        obj, "experience_score")

    def get_skills_score(self,     obj): return self._get_score(
        obj, "skills_score")

    def get_projects_score(self,   obj): return self._get_score(
        obj, "projects_score")

    def get_education_score(self,  obj): return self._get_score(
        obj, "education_score")

# for showing the full job posting details
# in the interview context


class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            "id",
            "application",
            "scheduled_at",
            "questions",
            "questions_generated",
            "meeting_link",   # ← exposed
            "done",           # ← exposed
            "created_at",
        ]
        extra_kwargs = {
            "scheduled_at":    {"required": False, "allow_null": True},
            "questions":       {"required": False, "default": list},
            "meeting_link":    {"required": False, "allow_null": True},
            "done":            {"required": False},
        }
        read_only_fields = ["created_at"]


class InterviewContextSerializer(serializers.ModelSerializer):
    # nested context for retrieve & generate
    job = JobPostingDetailSerializer(source="application.job", read_only=True)
    resume_snapshot = serializers.SerializerMethodField()
    questions_generated = serializers.JSONField(read_only=True)
    meeting_link = serializers.URLField(read_only=False)
    done = serializers.BooleanField(read_only=False)

    class Meta:
        model = Interview
        fields = [
            "id",
            "scheduled_at",
            "questions",
            "created_at",
            "job",
            "questions_generated",
            "resume_snapshot",
            "meeting_link",
            "done",
        ]

    def get_resume_snapshot(self, obj):
        app = obj.application
        # Prefer the cleaned snapshot JSON, fallback to parsed_resume
        return app.snapshot_json or getattr(app.parsed_resume, "parsed_json", None)


# Report serializer

class JobPopularitySerializer(serializers.ModelSerializer):
    applicant_count = serializers.IntegerField()
    avg_score = serializers.FloatField()
    popularity = serializers.FloatField()
    applicants = serializers.SerializerMethodField()   

    class Meta:
        model = JobPosting
        fields = [
            "id", "company_name", "title", "contract_type",
            "category", "location", "experience_level",
            "applicant_count", "avg_score", "popularity", "applicants",
        ]

    def get_applicants(self, job):
        # assumes you've prefetch_related("applications__applicant") in your ViewSet
        return [
            app.applicant.get_short_name
            for app in job.applications.all()
            if app.applicant  # just in case you have nulls
        ]


# MLOPS 
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationFeedback
        fields = [
            "id",
            "application",
            "positive",
            "reasons",
            "custom",         # ← expose our free-text field
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
