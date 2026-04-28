from django.db import models
from django.conf import settings
from resumes.models import ParsedResume
from jobs.models import JobPosting
from django.utils import timezone
from django.core.exceptions import ValidationError


class JobApplication(models.Model):
    job = models.ForeignKey(
        JobPosting, on_delete=models.CASCADE, related_name="applications")
    parsed_resume = models.ForeignKey(
        ParsedResume, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name="applications")

    snapshot_json = models.JSONField()
    score_json = models.JSONField(null=True, blank=True)

    STATUS = [
        ("submitted", "Submitted"),
        ("scored",    "Scored"),
        ("accepted",  "Accepted"),
        ("declined",  "Declined"),
    ]
    status = models.CharField(
        max_length=10, choices=STATUS, default="submitted")
    applied_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="handled_applications",
        help_text="The HR user who accepted or declined this application"
    )

    
    class Meta:
        unique_together = ("job", "applicant")
        ordering = ["-applied_at"]

    def accept(self):
        if self.status != "scored":
            raise ValueError("Only scored applications can be accepted")
        self.status = "accepted"
        self.decided_at = timezone.now()
        self.save(update_fields=["status", "decided_at"])

    def decline(self):
        if self.status != "scored":
            raise ValueError("Only scored applications can be declined")
        self.status = "declined"
        self.decided_at = timezone.now()
        self.save(update_fields=["status", "decided_at"])

    def __str__(self):
        return f"{self.applicant} → {self.job.title} [{self.status}]"


class Interview(models.Model):
    application = models.OneToOneField(JobApplication,
                                       on_delete=models.CASCADE,
                                       related_name="interview")


    scheduled_at = models.DateTimeField(null=True, blank=True)
    questions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    questions_generated = models.JSONField(default=list, blank=True)
    meeting_link = models.URLField(null=True, blank=True)
    done = models.BooleanField(default=False)

    def clean(self):
        if self.application.status != "accepted":
            raise ValidationError(
                "Interview can only be scheduled for an accepted application.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)




# MLOPs 
class ApplicationFeedback(models.Model):
    application = models.ForeignKey(
        JobApplication, on_delete=models.CASCADE, related_name="feedbacks"
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="given_feedbacks",
        blank=True,
        null=True,
    )
    positive = models.BooleanField()
    reasons = models.JSONField(default=list)
    custom = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("application", "applicant")
