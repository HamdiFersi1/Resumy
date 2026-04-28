from celery import shared_task
from .models import JobApplication
from resumes.parser.scoring import score_resume

@shared_task
def score_application_async(app_id):
    app = JobApplication.objects.select_related("job", "parsed_resume").get(pk=app_id)
    score = score_resume(app.job.full_description, app.parsed_resume.parsed_json)
    app.score_json = score
    app.status = "scored"
    app.save(update_fields=["score_json", "status"])