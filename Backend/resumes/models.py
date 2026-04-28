from django.db import models
from django.conf import settings
from jobs.models import JobPosting

class UploadedResume(models.Model):
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='uploaded_resumes'
    )
    def __str__(self):
        return self.file.name
    
    
class ParsedResume(models.Model):
    uploaded_resume = models.OneToOneField(
        UploadedResume,
        on_delete=models.CASCADE,
        related_name="parsed_data"
    )
    # your existing JSONField (useful for filtering/querying)
    parsed_json = models.JSONField()  
    # new TextField to store the exact JSON string in insertion order
    raw_json = models.TextField(null=True, blank=True)

    score_json = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=50, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parsed data for {self.uploaded_resume.file.name}"
    

class ScoredResume(models.Model):
    parsed_resume = models.OneToOneField(
        ParsedResume,
        on_delete=models.CASCADE,
        related_name="scored_data"
    )
    job_posting = models.ForeignKey(  # ← ADD THIS
        JobPosting,
        on_delete=models.CASCADE,
        related_name="scored_resumes",
        null=True,  # optional based on your use
        blank=True
    )
    score_json = models.JSONField(null=True, blank=True)  
    status = models.CharField(max_length=50, default="pending")  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Scored resume for {self.parsed_resume.uploaded_resume.file.name}"