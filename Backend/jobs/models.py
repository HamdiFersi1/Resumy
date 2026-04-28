# jobs/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone


class JobPosting(models.Model):
    # ── NEW FIELDS ─────────────────────────────────────────────
    company_name = models.CharField(max_length=255, blank=True)

    application_start = models.DateField(default=timezone.now)  # when listing opens
    application_deadline = models.DateField(null=True, blank=True)
    closed = models.BooleanField(default=False, help_text="Manually close this job posting")

    CONTRACT_CHOICES = [
        ("FT", "Full-time"),
        ("PT", "Part-time"),
        ("IN", "Internship"),
        ("CT", "Contract"),
        ("FL", "Freelance"),
    ]
    contract_type = models.CharField(
        max_length=2, choices=CONTRACT_CHOICES, default="FT"
    )

    title = models.CharField(max_length=255)
    job_description = models.TextField(
        help_text="General description of the role", null=True, blank=True)
    required_skills = models.TextField(
        help_text="Comma‑separated list or bullet text", null=True, blank=True)
    required_experience = models.TextField(
        help_text="What level/years of experience is needed", null=True, blank=True)
    required_education = models.TextField(
        help_text="Degrees or certifications required", null=True, blank=True)

    category = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    experience_level = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        editable=False,
    )

    @property
    def is_open(self) -> bool:
        today = timezone.now().date()
        return (
            not self.closed and
            self.application_start <= today and
            (self.application_deadline is None or today <= self.application_deadline)
        )

    def __str__(self):
        return f"{self.company_name} — {self.title}"


class FavoriteJob(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorite_jobs"
    )
    job = models.ForeignKey(
        JobPosting, on_delete=models.CASCADE, related_name="favorited_by"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "job")  # no duplicates

    def __str__(self):
        return f"{self.user.username} → {self.job.title}"
