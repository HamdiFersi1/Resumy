# applications/management/commands/seed_data.py

import random
import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from faker import Faker

from resumes.models import ParsedResume, UploadedResume
from jobs.models import JobPosting
from applications.models import JobApplication, Interview
from resumes.views import score_resume

User = get_user_model()
fake = Faker()
fake.unique.clear()
tz = timezone.get_current_timezone()
MARCH_START = timezone.datetime(2025, 3, 1, tzinfo=tz)

DOMAINS = {
    "IT": {
        "titles": [
            "DevOps Engineer", "Full-Stack Developer", "System Administrator",
            "Network Engineer", "Site Reliability Engineer",
            "Cloud Infrastructure Architect", "Backend Software Engineer",
            "IT Support Specialist"
        ],
        "skills": [
            "Linux", "Docker", "Kubernetes", "Python", "REST APIs",
            "Terraform", "Ansible", "AWS", "CI/CD", "Monitoring"
        ]
    },
    "Data": {
        "titles": [
            "Data Analyst", "Business Intelligence Engineer", "Data Engineer",
            "Database Administrator", "ETL Developer", "BI Analyst",
            "Analytics Consultant", "Data Warehouse Architect"
        ],
        "skills": [
            "SQL", "Tableau", "Power BI", "Pandas", "NumPy",
            "ETL", "Data Warehousing", "Snowflake", "BigQuery", "Looker"
        ]
    },
    "AI": {
        "titles": [
            "Machine Learning Engineer", "AI Research Scientist",
            "Computer Vision Engineer", "NLP Scientist", "Deep Learning Engineer",
            "AI Solutions Architect", "Robotics Engineer",
            "Reinforcement Learning Specialist"
        ],
        "skills": [
            "TensorFlow", "PyTorch", "scikit-learn", "Keras", "OpenCV",
            "Transformers", "CNNs", "RNNs", "GANs", "Hyperparameter Tuning"
        ]
    },
    "HR": {
        "titles": [
            "HR Manager", "Talent Acquisition Specialist", "Recruitment Consultant",
            "HR Business Partner", "Employee Relations Specialist", "HR Coordinator",
            "Compensation & Benefits Analyst", "Learning & Development Manager"
        ],
        "skills": [
            "Onboarding", "Performance Management", "HRIS", "Interviewing",
            "Labor Law", "Compensation Planning", "Succession Planning",
            "Employee Engagement", "Training Delivery", "Conflict Resolution"
        ]
    },
}

class Command(BaseCommand):
    help = "Seed domains + real scoring (no deletes)"

    def add_arguments(self, parser):
        parser.add_argument("--users",   type=int, default=20)
        parser.add_argument("--jobs",    type=int, default=50)
        parser.add_argument("--apps",    type=int, default=100)
        parser.add_argument("--intervs", type=int, default=50)

    def handle(self, *args, **opts):
        # 1) Users
        users = []
        for _ in range(opts["users"]):
            email = fake.unique.email()
            usr, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": fake.unique.user_name(),
                    "password": "password123",
                    "first_name": fake.first_name(),
                    "last_name": fake.last_name(),
                }
            )
            users.append(usr)
        self.stdout.write(f"Users: {User.objects.count()}")

        # 2) Upload + Parse resumes in domains with full structure
        resumes = []
        for u in users:
            upload, _ = UploadedResume.objects.get_or_create(
                uploaded_by=u,
                defaults={"file": f"resumes/{fake.file_name(extension='pdf')}"}
            )

            # Build full parsed_json structure
            name = f"{u.first_name or fake.first_name()} {u.last_name or fake.last_name()}"
            profile = fake.sentence(nb_words=12)
            contact = {
                "email": u.email,
                "phone": fake.phone_number(),
                "address": fake.address()
            }
            experience = []
            for _ in range(random.randint(1, 3)):
                start = fake.date_between(start_date="-5y", end_date="-1y")
                end = fake.date_between(start_date=start, end_date="today")
                experience.append({
                    "company": fake.company(),
                    "title": fake.job(),
                    "start_date": str(start),
                    "end_date": str(end),
                    "description": fake.paragraph(nb_sentences=3),
                })
            projects = []
            for _ in range(random.randint(1, 3)):
                projects.append({
                    "name": fake.catch_phrase(),
                    "description": fake.paragraph(nb_sentences=2),
                    "link": fake.url()
                })
            education = []
            for _ in range(random.randint(1, 2)):
                education.append({
                    "institution": fake.company().replace("Inc", "University"),
                    "degree": random.choice(["BSc", "MSc", "PhD"]),
                    "field": random.choice(["Computer Science", "Data Science", "AI", "Information Systems"]),
                    "start_year": fake.year(),
                    "end_year": fake.year()
                })
            domain = random.choice(list(DOMAINS))
            skills = DOMAINS[domain]["skills"]
            certifications = []
            for _ in range(random.randint(0, 2)):
                certifications.append({
                    "name": random.choice([
                        "AWS Certified Solutions Architect",
                        "Google Professional Data Engineer",
                        "Certified Scrum Master",
                        "Cisco CCNA"
                    ]),
                    "year": fake.year()
                })

            parsed, _ = ParsedResume.objects.get_or_create(
                uploaded_resume=upload,
                defaults={
                    "parsed_json": {
                        "name": name,
                        "profile": profile,
                        "contact": contact,
                        "experience": experience,
                        "projects": projects,
                        "education": education,
                        "skills": skills,
                        "certifications": certifications
                    },
                    "raw_json": json.dumps({
                        "name": name,
                        "profile": profile,
                        "contact": contact,
                        "experience": experience,
                        "projects": projects,
                        "education": education,
                        "skills": skills,
                        "certifications": certifications
                    }),
                    "status": "parsed"
                }
            )
            resumes.append(parsed)

        # 3) Jobs in same domains
        jobs = []
        for _ in range(opts["jobs"]):
            domain = random.choice(list(DOMAINS))
            title = random.choice(DOMAINS[domain]["titles"])
            sks = DOMAINS[domain]["skills"]
            job, _ = JobPosting.objects.get_or_create(
                company_name=fake.company(),
                title=title,
                defaults={
                    "job_description": fake.paragraph(nb_sentences=4),
                    "required_skills": ", ".join(sks),
                    "required_experience": f"{random.randint(0, 5)} years",
                    "required_education": random.choice(["BSc", "MSc", "PhD"]),
                    "category": domain,
                    "location": fake.city(),
                    "experience_level": random.choice(["Junior", "Mid", "Senior"]),
                    "application_start": timezone.now().date(),
                    "application_deadline": fake.date_between(start_date="today", end_date="+60d"),
                    "contract_type": random.choice([c[0] for c in JobPosting.CONTRACT_CHOICES]),
                    "created_by": random.choice(users),
                }
            )
            jobs.append(job)
        self.stdout.write(f"Jobs: {JobPosting.objects.count()}")

        # 4) Applications + real scoring
        statuses = [s[0] for s in JobApplication.STATUS]
        apps = []
        for _ in range(opts["apps"]):
            job = random.choice(jobs)
            parsed = random.choice(resumes)
            applied_at = fake.date_time_between(start_date=MARCH_START, end_date="now", tzinfo=tz)

            app, created = JobApplication.objects.get_or_create(
                job=job,
                parsed_resume=parsed,
                defaults={
                    "applicant": random.choice(users),
                    "snapshot_json": {"text": fake.text(max_nb_chars=100)},
                    "score_json": {},
                    "status": "submitted",
                    "applied_at": applied_at,
                }
            )
            if created:
                result = score_resume(parsed.parsed_json, job)
                app.score_json = result
                app.status = "scored"
                app.decided_at = timezone.now()
                app.save(update_fields=["score_json", "status", "decided_at"])
            apps.append(app)
        self.stdout.write(f"Applications: {JobApplication.objects.count()}")

        # 5) Interviews for accepted apps
        accepted = [a for a in apps if a.status == "accepted"]
        for _ in range(min(opts["intervs"], len(accepted))):
            a = random.choice(accepted)
            sched_at = fake.date_time_between(
                start_date=MARCH_START,
                end_date=timezone.now() + timezone.timedelta(days=30),
                tzinfo=tz
            )
            Interview.objects.get_or_create(
                application=a,
                defaults={"scheduled_at": sched_at,
                          "questions": [fake.sentence() for _ in range(3)]}
            )
        self.stdout.write(f"Interviews: {Interview.objects.count()}")
        self.stdout.write(self.style.SUCCESS("✅ Done!"))
