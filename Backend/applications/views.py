# applications/views.py

from django.db import IntegrityError
import hashlib
import logging
from django.shortcuts import get_object_or_404
from django.db.models.functions import Cast, TruncDate
from django.db.models.fields.json import KeyTextTransform

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sklearn import logger

from accounts.models import Notification
from resumes.models import ParsedResume, ScoredResume
from jobs.models import JobPosting
from .models import ApplicationFeedback, JobApplication, Interview
from .serializers import FeedbackSerializer, JobApplicationSerializer, ApplicationStatsSerializer, JobApplicationDetailSerializer, InterviewSerializer, DecisionApplicationSerializer, JobPopularitySerializer, JobPostingDetailSerializer, InterviewContextSerializer, JobPostingNestedSerializer
from accounts.permissions import HRGetPostPermission
from datetime import date, timedelta, timezone
from prompt_toolkit import Application
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone as time
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as drf_filters
from .filters import DecisionApplicationFilter
from applications.chatbot.services import generate_interview_questions
from django.utils.dateparse import parse_date
import csv
from django.http import HttpResponse
from django.http import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from rest_framework.decorators import action

# charts /report
import io
import math
from django.db.models import Avg, Count, Q, FloatField,F, ExpressionWrapper
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from django.db.models.functions import Cast
from reportlab.graphics.charts.piecharts import Pie
from reportlab.lib import colors
# ---------------------------------------------------------------



class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    Standard CRUD for applying to jobs.
    Only HR or admins can create applications.
    """
    queryset = JobApplication.objects.all().order_by("-applied_at")
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        job_id = request.data.get("job")
        parsed_id = request.data.get("parsed_resume")
        if not job_id or not parsed_id:
            return Response(
                {"detail": "Missing job or parsed_resume ID"},
                status=status.HTTP_400_BAD_REQUEST
            )

        job = get_object_or_404(JobPosting, pk=job_id)
        parsed = get_object_or_404(ParsedResume, pk=parsed_id)

        if JobApplication.objects.filter(job=job, applicant=request.user).exists():
            return Response(
                {"detail": "You have already applied to this job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            scored = ScoredResume.objects.get(
                parsed_resume=parsed, job_posting=job)
            score_json = scored.score_json
            status_value = "scored" if scored.status == "scored" else "submitted"
        except ScoredResume.DoesNotExist:
            score_json = None
            status_value = "submitted"

        snapshot = request.data.get("snapshot_json") or parsed.parsed_json
        app = JobApplication.objects.create(
            job=job,
            parsed_resume=parsed,
            applicant=request.user,
            snapshot_json=snapshot,
            score_json=score_json,
            status=status_value,
        )

        serializer = self.get_serializer(app)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

# ---------------------------------------------------------------
#  Interview management
# ---------------------------------------------------------------

class DecisionViewSet(viewsets.ViewSet):
    """
    Accept or decline a scored application.
    """
    permission_classes = [HRGetPostPermission]

    def get_application(self, pk):
        return get_object_or_404(JobApplication, pk=pk)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def accept(self, request, pk=None):
        app = self.get_application(pk)
        if app.status != "scored":
            return Response({"detail": "Can only accept scored apps."},
                            status=status.HTTP_400_BAD_REQUEST)

        app.status = "accepted"
        app.decided_at = time.now()
        app.handled_by = request.user
        app.save(update_fields=["status", "decided_at", "handled_by"])

        # Create the Interview object if not already created
        interview, created = Interview.objects.get_or_create(
            application=app,
            defaults={
                "scheduled_at": None,
                "questions": []
            }
        )

        send_mail(
            subject="Your application has been accepted!",
            message=(
                f"Hi {app.applicant.get_username()},\n\n"
                f"Congratulations! Your application for {app.job.title} has been accepted.\n\n"
                "We will be in touch shortly to schedule an interview.\n\n"
                "Best,\nThe HR Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.applicant.email],
        )
        

        # Include interview ID in response
        data = JobApplicationDetailSerializer(app).data
        data["interview_id"] = interview.id
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        app = self.get_application(pk)
        if app.status != "scored":
            return Response({"detail": "Can only decline scored apps."},
                            status=status.HTTP_400_BAD_REQUEST)

        app.status = "declined"
        app.decided_at = time.now()
        app.handled_by = request.user
        app.save(update_fields=["status", "decided_at", "handled_by"])

        send_mail(
            subject="Your application status",
            message=(
                f"Hi {app.applicant.get_username()},\n\n"
                f"We appreciate your interest in {app.job.title}. "
                "At this time, we will not be moving forward with your application.\n\n"
                "Best of luck,\nThe HR Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[app.applicant.email],
        )
        
        return Response(JobApplicationDetailSerializer(app).data, status=status.HTTP_200_OK)

#
# 3) Interview scheduling / CRUD
#


class InterviewViewSet(viewsets.ModelViewSet):
    """
    Manage interviews (only for accepted applications).
    """
    queryset = Interview.objects.all()
    permission_classes = [IsAuthenticated, HRGetPostPermission]
    serializer_class = InterviewSerializer

    def get_serializer_class(self):
        if self.action in ("retrieve", "generate"):
            return InterviewContextSerializer
        return InterviewSerializer

    def create(self, request, *args, **kwargs):
        app_pk = request.data.get("application")
        application = get_object_or_404(
            JobApplication, pk=app_pk, status="accepted")
        data = {**request.data, "application": application.pk}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="generate")
    def generate(self, request, pk=None):
        interview = self.get_object()
        app = interview.application
        if app.status != "accepted":
            return Response(
                {"detail": "Only accepted applications can be interviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # build context
        job_details = JobPostingDetailSerializer(app.job).data
        resume_json = app.snapshot_json or getattr(
            app.parsed_resume, "parsed_json", None)
        if not resume_json:
            return Response(
                {"detail": "Resume JSON is missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # call AI to generate questions
        try:
            raw = generate_interview_questions(job_details, resume_json)
        except Exception as exc:
            logger.exception("Error generating via Gemini")
            return Response(
                {"detail": f"Error generating questions: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # normalize to dict-of-lists
        if isinstance(raw, dict):
            qmap = raw
        elif isinstance(raw, list):
            qmap = {"general": raw}
        else:
            logger.error("Unexpected AI response shape: %r", raw)
            return Response(
                {"detail": "AI returned unexpected format."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # append to history
        history = interview.questions_generated or []
        history.append({
            "session_at": time.now().isoformat(),
            "questions":  qmap,
        })
        interview.questions_generated = history
        interview.save(update_fields=["questions_generated"])

        serializer = self.get_serializer(interview)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        iv = self.get_object()
        data = request.data

        # Lock edits if interview is marked as done
        if iv.done and ("done" not in data or data.get("done") is not False):
            return Response(
                {"detail": "This interview is marked done and cannot be modified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sending_link = "meeting_link" in data and bool(data["meeting_link"])

        serializer = self.get_serializer(iv, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if sending_link:
            candidate = iv.application.applicant
            link = serializer.validated_data.get("meeting_link")
            send_mail(
                subject=f"Your interview link for {iv.application.job.title}",
                message=(
                    f"Hello {candidate.get_short_name()},\n\n"
                    f"Your interview is scheduled. Please join using this link:\n\n"
                    f"{link}\n\n"
                    "Good luck!"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[candidate.email],
                fail_silently=False,
            )

        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="generated-history")
    def generated_history(self, request):
        interviews = self.get_queryset()
        sessions = []

        for iv in interviews:
            job_data = JobPostingDetailSerializer(iv.application.job).data
            applicant = iv.application.applicant.username
            for sess in iv.questions_generated or []:
                raw_q = sess.get("questions")
                qmap = raw_q if isinstance(raw_q, dict) else {
                    "general": raw_q} if isinstance(raw_q, list) else {}

                sessions.append({
                    "interview_id":  iv.id,
                    "job_title":     job_data["title"],
                    "company_name":  job_data["company_name"],
                    "applicant":     applicant,
                    "session_at":    sess.get("session_at"),
                    "questions":     qmap,
                })

        sessions.sort(key=lambda x: x["session_at"], reverse=True)
        return Response(sessions, status=status.HTTP_200_OK)
# --------------------------------------
# user applications
# --------------------------------------


class PublicApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns detailed applications belonging only to the authenticated user.
    """
    serializer_class = JobApplicationDetailSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get"]

    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user).order_by("-applied_at")

    @action(detail=False, methods=["get"], url_path="my-applications")
    def my_applications(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data})

# --------------------------------------
#user Notifications 
# --------------------------------------
class UserInterviewViewSet(viewsets.ViewSet):
    """
    Authenticated jobseekers can view their accepted applications and interviews.
    GET /applications/user-interviews/
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user

        apps = JobApplication.objects.filter(applicant=user, status="accepted")
        results = []

        for app in apps:
            try:
                interview = Interview.objects.get(application=app)
                results.append({
                    "application": JobApplicationDetailSerializer(app).data,
                    "interview": InterviewSerializer(interview).data,
                })
            except Interview.DoesNotExist:
                continue

        return Response(results, status=status.HTTP_200_OK)


# ---------------------------------------------------------------
# List of applicants 
# ---------------------------------------------------------------
class ApplicationViewSet(viewsets.ModelViewSet):
    """
    View and list applications (only status='scored' on GET).
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Always start by filtering to scored only:
        qs = JobApplication.objects.filter(status="scored")

        # Optional job filter (further restrict to one job if given)
        job_id = self.request.query_params.get("job")
        if job_id:
            qs = qs.filter(job_id=job_id)

        # Safe ordering map
        order_param = self.request.query_params.get("ordering")  # may be None
        allowed = {
            "applied_at":   "applied_at",
            "-applied_at":  "-applied_at",
            "score":        "score_json__total_score",
            "-score":       "-score_json__total_score",
        }
        qs = qs.order_by(allowed.get(order_param, "-applied_at"))

        return qs

    def create(self, request, *args, **kwargs):
        job_id = request.data.get("job")
        parsed_id = request.data.get("parsed_resume")

        if not job_id or not parsed_id:
            return Response(
                {"detail": "Missing job or parsed_resume ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        job = get_object_or_404(JobPosting, pk=job_id)
        parsed = get_object_or_404(ParsedResume, pk=parsed_id)

        if JobApplication.objects.filter(job=job, parsed_resume=parsed).exists():
            return Response(
                {"detail": "Already applied to this job with this resume."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            scored = ScoredResume.objects.get(
                parsed_resume=parsed, job_posting=job
            )
            score_json = scored.score_json
            status_value = "scored" if scored.status == "scored" else "submitted"
        except ScoredResume.DoesNotExist:
            score_json = None
            status_value = "submitted"

        snapshot = request.data.get("snapshot_json") or parsed.parsed_json

        app = JobApplication.objects.create(
            job=job,
            parsed_resume=parsed,
            applicant=request.user,
            snapshot_json=snapshot,
            score_json=score_json,
            status=status_value,
        )

        serializer = self.get_serializer(app)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# STATS
class ApplicationStatsViewSet(viewsets.ViewSet):
   
    permission_classes = [IsAuthenticated, HRGetPostPermission]

    def list(self, request):
        qs = JobApplication.objects.all()
        # optional ?job=
        if job := request.query_params.get("job"):
            qs = qs.filter(job_id=job)

        total = qs.count()
        scored = qs.filter(status="scored").count()
        agg = qs.filter(status="scored").aggregate(
            average_total_score=Avg(
                Cast("score_json__total_score", FloatField())),
            average_experience_score=Avg(
                Cast("score_json__experience_score", FloatField())),
            average_skills_score=Avg(
                Cast("score_json__skills_score", FloatField())),
            average_projects_score=Avg(
                Cast("score_json__projects_score", FloatField())),
            average_education_score=Avg(
                Cast("score_json__education_score", FloatField())),
        )

        payload = {
            "total_applications":    total,
            "scored_applications":   scored,
            "unscored_applications": total - scored,
            **{k: v or 0.0 for k, v in agg.items()},
        }
        serializer = ApplicationStatsSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=False, methods=['get'])
    def daily_counts(self, request):
        job_id = request.query_params.get('job', None)
        days = int(request.query_params.get('days', 30))

        date_from = timezone.now() - timedelta(days=days)

        queryset = Application.objects.filter(
            applied_at__gte=date_from,
            **({'job_id': job_id} if job_id else {})
        )

        # Group by date
        counts = queryset.annotate(
            date=TruncDate('applied_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        # Fill in missing dates
        result = []
        for i in range(days):
            current_date = (timezone.now() - timedelta(days=days - 1 - i)).date()
            count_obj = next(
                (item for item in counts if item['date'] == current_date), None)
            result.append({
                'date': current_date.isoformat(),
                'count': count_obj['count'] if count_obj else 0
            })

        return Response(result)

    @action(detail=False, methods=["get"], url_path="daily-avg-score")
    def daily_avg_score(self, request):
        """
        GET /applications/stats/daily-avg-score/?job=<id>&days=<n>
        Returns daily average total_score (0–100) over the last `days`.
        """
        job_id = request.query_params.get("job", None)
        days   = int(request.query_params.get("days", 30))

        # Use timezone.now(), not time.now()
        date_from = time.now() - timedelta(days=days - 1)

        qs = JobApplication.objects.filter(
            status="scored",
            applied_at__date__gte=date_from.date(),
            **({"job_id": job_id} if job_id else {})
        )

        daily = (
            qs
            .annotate(day=TruncDate("applied_at"))
            .values("day")
            .annotate(avg_score=Avg(Cast("score_json__total_score", FloatField())))
            .order_by("day")
        )

        result = []
        for i in range(days):
            d = (date_from + timedelta(days=i)).date()
            # Find the record for that day, if any
            rec = next((r for r in daily if r["day"] == d), None)

            # Safely extract avg_score, defaulting to 0.0
            avg_score = rec["avg_score"] if (rec and rec["avg_score"] is not None) else 0.0
            result.append({
                "date": d.isoformat(),
                "avg": round(avg_score * 100, 2)
            })

        return Response({"time_series": result}, status=status.HTTP_200_OK)

# Analytic
class ApplicationAnalyticsViewSet(viewsets.ViewSet):
    """
    GET /applications/analytics/ → time series, distribution, percentiles, top-N
    """
    permission_classes = [IsAuthenticated, HRGetPostPermission]

    def list(self, request):
        qs = JobApplication.objects.all()
        if job := request.query_params.get("job"):
            qs = qs.filter(job_id=job)
        if applicant := request.query_params.get("applicant"):
            qs = qs.filter(applicant_id=applicant)
        if start := request.query_params.get("start_date"):
            qs = qs.filter(applied_at__date__gte=start)
        if end := request.query_params.get("end_date"):
            qs = qs.filter(applied_at__date__lte=end)

        # annotate for numeric filtering
        qs = qs.annotate(
            _total_score=Cast(KeyTextTransform(
                "total_score", "score_json"), FloatField())
        )
        if mi := request.query_params.get("min_score"):
            qs = qs.filter(_total_score__gte=float(mi))
        if ma := request.query_params.get("max_score"):
            qs = qs.filter(_total_score__lte=float(ma))

        # 1) Time-series
        daily = (
            qs.annotate(day=TruncDate("applied_at"))
            .values("day")
            .annotate(count=Count("id"), avg_score=Avg("_total_score"))
            .order_by("day")
        )
        time_series = [
            {"date": d["day"].isoformat(), "count": d["count"],
             "avg_score": d["avg_score"] or 0.0}
            for d in daily
        ]

        # 2) Score distribution
        scored_vals = list(qs.filter(status="scored").values_list(
            "_total_score", flat=True))
        bins = [i/5 for i in range(6)]
        dist = {f"{bins[i]:.1f}-{bins[i+1]:.1f}": 0 for i in range(5)}
        for s in scored_vals:
            for i in range(5):
                if (s >= bins[i] and (s < bins[i+1] or i == 4)):
                    dist[f"{bins[i]:.1f}-{bins[i+1]:.1f}"] += 1
                    break

        # 3) Percentiles
        def pct(arr, p):
            if not arr:
                return 0.0
            a = sorted(arr)
            k = (len(a) - 1) * (p / 100)
            lo, hi = math.floor(k), math.ceil(k)
            return a[lo] if lo == hi else a[lo]*(hi-k) + a[hi]*(k-lo)

        p25, p50, p75 = pct(scored_vals, 25), pct(
            scored_vals, 50), pct(scored_vals, 75)

        # 4) Top-N jobs by volume & average score
        top_n = int(request.query_params.get("top_n", 5))
        top_vol = qs.values("job_id", "job__title").annotate(
            app_count=Count("id")).order_by("-app_count")[:top_n]
        top_avg = qs.filter(status="scored").values("job_id", "job__title").annotate(
            avg_score=Avg("_total_score")).order_by("-avg_score")[:top_n]

        return Response({
            "time_series":           time_series,
            "score_distribution":    dist,
            "percentiles":           {"p25": p25, "p50": p50, "p75": p75},
            "top_jobs_by_volume":    list(top_vol),
            "top_jobs_by_avg_score": list(top_avg),
        }, status=status.HTTP_200_OK)


class JobApplicationDetailViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Retrieve a single application, including snapshot_json.
    """
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, HRGetPostPermission]
    http_method_names = ["get"]  # only allow GET
    
    serializer_class = JobApplicationDetailSerializer



# ---------------------------------------------------------------
#  ViewSet for Status Leaderboard 
# ---------------------------------------------------------------

class FilteredApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List accepted or declined candidates, filterable by job (company/title),
    status, and score range.
    """
    queryset = JobApplication.objects.all().order_by("-applied_at")
    serializer_class = DecisionApplicationSerializer
    permission_classes = [IsAuthenticated, HRGetPostPermission]

    filter_backends = [DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = DecisionApplicationFilter

    ordering_fields = ["applied_at", "score_json__total_score"]
    ordering = ["-applied_at"]
    
# report 

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, HRGetPostPermission]

    
    @action(detail=False, methods=["get"], url_path="available-dates")
    def available_dates(self, request):
        """
        GET /applications/reports/available-dates/?job_id=<job_id>
        If job_id is omitted → counts across all jobs.

        Returns a list of:
          {
            date: "YYYY-MM-DD",
            accepted: int,
            declined: int,
            interview: int,
            scored: int
          }
        """
        # 1) Parse optional job_id
        job_id = None
        job_id_param = request.query_params.get("job_id")
        if job_id_param:
            try:
                job_id = int(job_id_param)
            except ValueError:
                return Response(
                    {"detail": "Invalid `job_id`; must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # 2) Accepted/Declined applications
        apps_qs = JobApplication.objects.filter(status__in=["accepted", "declined"])
        if job_id is not None:
            apps_qs = apps_qs.filter(job_id=job_id)
        app_counts = (
            apps_qs
            .annotate(day=TruncDate("applied_at"))
            .values("day", "status")
            .annotate(count=Count("id"))
        )

        # 3) Interviews
        iv_qs = Interview.objects.filter(scheduled_at__isnull=False)
        if job_id is not None:
            iv_qs = iv_qs.filter(application__job_id=job_id)
        iv_counts = (
            iv_qs
            .annotate(day=TruncDate("scheduled_at"))
            .values("day")
            .annotate(count=Count("id"))
        )

        # 4) Scored (no decision yet)
        scored_qs = JobApplication.objects.exclude(status__in=["accepted", "declined"])
        if job_id is not None:
            scored_qs = scored_qs.filter(job_id=job_id)
        scored_counts = (
            scored_qs
            .annotate(day=TruncDate("applied_at"))
            .values("day")
            .annotate(count=Count("id"))
        )

        # 5) Merge into a date → counts map
        data = {}
        for rec in app_counts:
            day = rec["day"].isoformat()
            data.setdefault(day, {
                "accepted": 0,
                "declined": 0,
                "interview": 0,
                "scored": 0,
            })
            data[day][rec["status"]] = rec["count"]

        for rec in iv_counts:
            day = rec["day"].isoformat()
            data.setdefault(day, {
                "accepted": 0,
                "declined": 0,
                "interview": 0,
                "scored": 0,
            })
            data[day]["interview"] = rec["count"]

        for rec in scored_counts:
            day = rec["day"].isoformat()
            data.setdefault(day, {
                "accepted": 0,
                "declined": 0,
                "interview": 0,
                "scored": 0,
            })
            data[day]["scored"] = rec["count"]

        # 6) Serialize to a sorted list (newest first)
        out = [
            {"date": date, **counts}
            for date, counts in sorted(data.items(), reverse=True)
        ]
        return Response(out, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        """
        GET /applications/reports/export/
            ?date=YYYY-MM-DD
            &type=accepted|declined|interview|scored
            [&job_id=<job_id>]

        Returns a CSV file of all applications/interviews on that date,
        filtered by job_id if provided.
        """
        date_str = request.query_params.get("date")
        rpt_type = request.query_params.get("type")
        job_id   = request.query_params.get("job_id", None)

        # 1) Validate required parameters
        if not date_str or rpt_type not in ("accepted", "declined", "interview", "scored"):
            return Response(
                {"detail": "Missing or invalid 'date' and/or 'type'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2) Parse date
        d = parse_date(date_str)
        if not d:
            return Response(
                {"detail": "Invalid date format; use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3) Build the queryset depending on rpt_type
        if rpt_type in ("accepted", "declined"):
            # Only applications with that exact status on that day
            qs = JobApplication.objects.filter(
                status=rpt_type,
                applied_at__date=d
            )
            if job_id is not None:
                qs = qs.filter(job_id=job_id)
            qs = qs.select_related("applicant", "job")

            header = ["Applicant", "Job", "Score", "Applied At", "Status"]
            rows = [
                [
                    a.applicant.username,
                    a.job.title,
                    (a.score_json.get("total_score", 0) if a.score_json else 0),
                    a.applied_at.isoformat(),
                    a.status,
                ]
                for a in qs
            ]

        elif rpt_type == "interview":
            # All interviews scheduled on that date
            iv_qs = Interview.objects.filter(scheduled_at__date=d)
            if job_id is not None:
                iv_qs = iv_qs.filter(application__job_id=job_id)
            iv_qs = iv_qs.select_related("application__applicant", "application__job")

            header = ["Applicant", "Job", "Scheduled At", "Created At", "Questions"]
            rows = [
                [
                    iv.application.applicant.username,
                    iv.application.job.title,
                    (iv.scheduled_at.isoformat() if iv.scheduled_at else ""),
                    iv.created_at.isoformat(),
                    len(iv.questions or []),
                ]
                for iv in iv_qs
            ]

        else:  # rpt_type == "scored"
            # All “scored” applications (i.e. status NOT in accepted/declined) that came in on that day
            qs = JobApplication.objects.exclude(status__in=["accepted", "declined"]).filter(
                applied_at__date=d
            )
            if job_id is not None:
                qs = qs.filter(job_id=job_id)
            qs = qs.select_related("applicant", "job")

            header = ["Applicant", "Job", "Score", "Applied At", "Status"]
            rows = [
                [
                    a.applicant.username,
                    a.job.title,
                    (a.score_json.get("total_score", 0) if a.score_json else 0),
                    a.applied_at.isoformat(),
                    a.status or "scored",  
                ]
                for a in qs
            ]

        # 4) Write out CSV into a buffer
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(header)
        writer.writerows(rows)

        # 5) Return as HttpResponse attachment
        resp = HttpResponse(buf.getvalue(), content_type="text/csv")
        suffix = f"_job_{job_id}" if job_id is not None else ""
        resp["Content-Disposition"] = (
            f'attachment; filename="report_{rpt_type}_{date_str}{suffix}.csv"'
        )
        return resp

    @action(detail=False, methods=["get"], url_path="export-pdf")
    def export_pdf(self, request):
        """
        GET /applications/reports/export-pdf/
            ?start=YYYY-MM-DD
            &end=YYYY-MM-DD
            [&job_id=<job_id>]

        Returns a PDF summarizing accepted/declined/interviews between start and end dates,
        filtered by job_id if provided.
        """
        start = request.query_params.get("start")
        end = request.query_params.get("end")
        job_id = request.query_params.get("job_id", None)

        # Validate start/end
        if not start or not end:
            return Response(
                {"detail": "Missing 'start' and/or 'end' parameters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build QuerySets for applications & interviews
        apps = JobApplication.objects.filter(
            applied_at__date__gte=start,
            applied_at__date__lte=end,
            status__in=["accepted", "declined"],
        )
        if job_id is not None:
            apps = apps.filter(job_id=job_id)
        apps = apps.select_related("applicant", "job")

        ivs = Interview.objects.filter(
            scheduled_at__date__gte=start,
            scheduled_at__date__lte=end,
        )
        if job_id is not None:
            ivs = ivs.filter(application__job_id=job_id)
        ivs = ivs.select_related("application__applicant", "application__job")

        # Begin building PDF into an in-memory buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elems = []

        # Title & summary paragraph
        elems.append(
            Paragraph(f"HR Report: {start} to {end}", styles["Title"]))
        elems.append(Spacer(1, 12))

        total = apps.count()
        acc = apps.filter(status="accepted").count()
        dec = apps.filter(status="declined").count()
        ivc = ivs.count()

        elems.append(
            Paragraph(
                f"Between {start} and {end}: {total} applications "
                f"({acc} accepted, {dec} declined), {ivc} interviews scheduled.",
                styles["BodyText"],
            )
        )
        elems.append(Spacer(1, 12))

        # Bar chart of accepted vs. declined
        drawing = Drawing(400, 200)
        chart = VerticalBarChart()
        chart.x, chart.y = 50, 50
        chart.width, chart.height = 300, 125
        chart.data = [[acc, dec]]
        chart.categoryAxis.categoryNames = ["Accepted", "Declined"]
        chart.valueAxis.valueMin = 0
        drawing.add(chart)
        elems.append(drawing)
        elems.append(Spacer(1, 12))

        # List first 20 interviews
        elems.append(Paragraph("Upcoming Interviews", styles["Heading2"]))
        elems.append(Spacer(1, 6))
        data = [["Applicant", "Scheduled At"]]
        for iv in ivs[:20]:
            data.append(
                [
                    iv.application.applicant.username,
                    iv.scheduled_at.strftime(
                        "%Y-%m-%d %H:%M") if iv.scheduled_at else "",
                ]
            )
        table = Table(data, repeatRows=1)
        elems.append(table)

        # Build the PDF
        doc.build(elems)
        buffer.seek(0)

        # Return as FileResponse
        suffix = f"_job_{job_id}" if job_id is not None else ""
        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"hr_report_{start}_{end}{suffix}.pdf",
        )
    @action(detail=False, methods=["get"], url_path="job-options")
    def job_options(self, request):
        """
        GET /applications/reports/job-options/
        → [{id, label}, …] for all jobs that have at least one application.
        """
        qs = (
            JobPosting.objects.filter(applications__isnull=False)
            .distinct()
            .order_by("company_name", "title")
        )
        out = [
            {"id": j.id, "label": f"{j.company_name} — {j.title}"} for j in qs
        ]
        return Response(out)

    @action(detail=False, methods=["get"], url_path="export-popularity")
    def export_popularity(self, request):
        """
        GET /applications/reports/export-popularity/
            ?format=csv|pdf
            [&top_n=10]         – when no ?job=… is given
            [&job=<job_id>]     – export one job only
        """
        fmt = request.query_params.get("format", "csv").lower()
        top_n = int(request.query_params.get("top_n", 10))
        job_id = request.query_params.get("job")       # str|None

        # ------------------------------------------------------------------ #
        # 1)  aggregate *directly* from JobApplication
        # ------------------------------------------------------------------ #
        total_apps = JobApplication.objects.count() or 1

        apps_aggr = (                 # one row per job_id
            JobApplication.objects
            .values("job")            # group-by job foreign-key
            .annotate(
                app_count=Count("id"),
                avg_score=Avg(
                    Cast("score_json__total_score", FloatField())
                ),
            )
        )

        if job_id:
            apps_aggr = apps_aggr.filter(job=job_id)
        else:
            apps_aggr = apps_aggr.order_by("-app_count")[:top_n]

        if not apps_aggr:                         # nothing to export
            return Response({"detail": "No data."}, status=204)

        # map job_id → metrics
        metrics = {
            row["job"]: {
                "app_count": row["app_count"],
                "avg_score": round(row["avg_score"] or 0.0, 4),
                "popularity": round(row["app_count"] / total_apps, 4),
            }
            for row in apps_aggr
        }

        # ------------------------------------------------------------------ #
        # 2)  fetch the JobPosting rows we need & enrich w/ metrics
        # ------------------------------------------------------------------ #
        postings = (
            JobPosting.objects
            .filter(id__in=metrics.keys())
            .select_related()                     # just in case
            .order_by("company_name", "title")
        )

        data = JobPostingDetailSerializer(postings, many=True).data
        # inject metrics + applicants list
        for obj in data:
            m = metrics[obj["id"]]
            obj.update(m)
            obj["applicants"] = [
                a.applicant.username
                for a in JobApplication.objects
                .filter(job_id=obj["id"])
                .select_related("applicant")
            ]

        # ------------------------------------------------------------------ #
        # 3)  stream CSV ---------------------------------------------------- #
        # ------------------------------------------------------------------ #
        if fmt == "csv":
            buf = io.StringIO()
            writer = csv.writer(buf)

            header = (
                ["Job ID", "Company", "Title"]
                + JobPostingDetailSerializer.Meta.fields
                + ["Applications", "Avg Score", "Popularity", "Applicants"]
            )
            writer.writerow(header)

            for j in data:
                writer.writerow([
                    j["id"], j["company_name"], j["title"],
                    *[j[f] for f in JobPostingDetailSerializer.Meta.fields],
                    j["app_count"], j["avg_score"], j["popularity"],
                    ";".join(j["applicants"]),
                ])

            resp = HttpResponse(buf.getvalue(), content_type="text/csv")
            name = f'job_{job_id}_popularity.csv' if job_id else "top_jobs_popularity.csv"
            resp["Content-Disposition"] = f'attachment; filename="{name}"'
            return resp

        # ------------------------------------------------------------------ #
        # 4)  PDF  (unchanged except that it now uses *data*) -------------- #
        # ------------------------------------------------------------------ #
        elif fmt == "pdf":
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib.pagesizes import letter
            from reportlab.graphics.shapes import Drawing
            from reportlab.graphics.charts.barcharts import VerticalBarChart

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            elems = [Paragraph("Job Popularity Report", styles["Title"]),
                    Spacer(1, 12)]

            # bar chart
            drawing = Drawing(400, 200)
            chart = VerticalBarChart()
            chart.x, chart.y = 50, 50
            chart.width, chart.height = 300, 125
            chart.data = [[j["app_count"] for j in data]]
            chart.categoryAxis.categoryNames = [
                f"{j['company_name']} — {j['title']}"[:22] for j in data
            ]
            chart.valueAxis.valueMin = 0
            drawing.add(chart)
            elems += [drawing, Spacer(1, 12)]

            # table
            table_rows = [
                ["ID", "Company", "Title", "#Apps",
                "Avg Score", "Popularity", "Applicants"]
            ]
            for j in data:
                table_rows.append([
                    j["id"], j["company_name"], j["title"],
                    j["app_count"], j["avg_score"], j["popularity"],
                    ", ".join(j["applicants"]),
                ])
            elems.append(Table(table_rows, repeatRows=1))

            doc.build(elems)
            buffer.seek(0)
            resp = HttpResponse(buffer, content_type="application/pdf")
            name = f'job_{job_id}_popularity.pdf' if job_id else "top_jobs_popularity.pdf"
            resp["Content-Disposition"] = f'attachment; filename="{name}"'
            return resp

        # ------------------------------------------------------------------ #
        return Response({"detail": "format must be csv or pdf"},
                        status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="total-applications")
    def total_applications(self, request):
        """
        GET /applications/reports/total-applications/?job_id=<job_id>
        → {"job_id": int, "total_applications": int}
        """
        job_id = request.query_params.get("job_id")
        if not job_id:
            return Response(
                {"detail": "Missing 'job_id' parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
            return Response(
                {"detail": f"Job with id {job_id} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        total_apps = JobApplication.objects.filter(job=job).count()

        return Response(
            {"job_id": job.id, "total_applications": total_apps},
            status=status.HTTP_200_OK,
        )

class PopularityReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, HRGetPostPermission]

    def _annotated_queryset(self):
        total_apps = JobApplication.objects.count() or 1
        return (
            JobPosting.objects
            .annotate(
                applicant_count=Count("applications", distinct=True),
                avg_score=Avg(
                    Cast("applications__score_json__total_score", FloatField())
                ),
            )
            .annotate(
                popularity=ExpressionWrapper(
                    F("applicant_count") * 1.0 / total_apps,
                    output_field=FloatField(),
                )
            )
            .prefetch_related("applications__applicant")
            .order_by("-applicant_count")
        )

    def _make_token(self, pk: int) -> str:
        """
        Creates an 8-character hex token based on SECRET_KEY+pk.
        """
        raw = f"{settings.SECRET_KEY}{pk}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()[:8]

    def _serialise(self, qs):
        out = []
        for job in qs:
            row = JobPopularitySerializer(job).data

            # insert obfuscated job token instead of numeric ID
            row["token"] = self._make_token(job.id)

            # full names
            full_names = []
            for app in job.applications.select_related("applicant"):
                user = app.applicant
                if user:
                    full_names.append(user.get_full_name())
            row["applicants"] = full_names

            row["avg_score"]  = round(row["avg_score"] or 0.0, 4)
            row["popularity"] = round(row["popularity"] or 0.0, 4)
            out.append(row)
        return out

    def list(self, request):
        top_n = int(request.query_params.get("top_n", 10))
        qs    = self._annotated_queryset()[:top_n]
        return Response(self._serialise(qs))

    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        fmt = request.query_params.get("file_format", "csv").lower()
        qs  = self._annotated_queryset().filter(pk=pk)
        data = self._serialise(qs)
        if not data:
            return Response({"detail": "No data."}, status=status.HTTP_204_NO_CONTENT)

        job = data[0]
        token = job["token"]

        # ---- CSV ----
        if fmt == "csv":
            buf    = io.StringIO()
            writer = csv.writer(buf)
            header = [
                "Job ID", "Company", "Title", "Total Applications",
                "Average Score (%)", "Popularity (%)", "Applicants"
            ]
            writer.writerow(header)
            writer.writerow([
                token,
                job["company_name"],
                job["title"],
                job["applicant_count"],
                f"{job['avg_score']*100:.1f}",
                f"{job['popularity']*100:.1f}",
                "; ".join(job["applicants"]),
            ])
            resp = HttpResponse(buf.getvalue(), content_type="text/csv")
            resp[
                "Content-Disposition"
            ] = f'attachment; filename="job_{token}_popularity.csv"'
            return resp

        # ---- PDF ----
        if fmt == "pdf":
            buffer = io.BytesIO()
            doc    = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=36, leftMargin=36,
                topMargin=36, bottomMargin=36
            )
            styles = getSampleStyleSheet()
            elems  = []

            # Title
            elems.append(Paragraph("📊 Job Popularity Report", styles["Title"]))
            elems.append(Spacer(1, 12))

            # Job header with token
            elems.append(Paragraph(
                f"<b>Job ID:</b> {token}<br/>"
                f"<b>Position:</b> {job['company_name']} – {job['title']}",
                styles["Heading2"]
            ))
            elems.append(Spacer(1, 12))

            # Narrative
            elems.append(Paragraph(
                "This report shows how many candidates applied for this position "
                "and its share of total applications.",
                styles["BodyText"]
            ))
            elems.append(Spacer(1, 12))

            # Key metrics
            summary = [
                ["Metric", "Value"],
                ["Total Applications", str(job["applicant_count"])],
                ["Average Score", f"{job['avg_score']*100:.1f}%"],
                ["Popularity", f"{job['popularity']*100:.1f}%"],
            ]
            elems.append(Paragraph("Key Metrics", styles["Heading3"]))
            elems.append(Spacer(1, 6))
            elems.append(Table(summary, hAlign="LEFT", repeatRows=1))
            elems.append(Spacer(1, 18))

            # Pie chart
            elems.append(Paragraph("Popularity Breakdown", styles["Heading3"]))
            elems.append(Spacer(1, 6))
            drawing = Drawing(300, 150)
            pie     = Pie()
            pie.x, pie.y = 75, 15
            pie.width, pie.height = 150, 150
            pct = job["popularity"]
            pie.data   = [pct, 1 - pct]
            pie.labels = [
                f"This job: {pct*100:.1f}%",
                f"Others: {(1-pct)*100:.1f}%"
            ]
            pie.slices[0].fillColor = colors.HexColor("#4F81BD")
            pie.slices[1].fillColor = colors.HexColor("#C0504D")
            drawing.add(pie)
            elems.append(drawing)
            elems.append(Spacer(1, 24))

            # Applicants list
            elems.append(Paragraph("Applicants (top 20)", styles["Heading3"]))
            elems.append(Spacer(1, 6))
            table_data = [["#", "Full Name"]]
            for idx, name in enumerate(job["applicants"][:20], start=1):
                table_data.append([str(idx), name])
            elems.append(Table(table_data, repeatRows=1))

            doc.build(elems)
            buffer.seek(0)
            return FileResponse(
                buffer,
                as_attachment=True,
                filename=f"job_{token}_popularity.pdf"
            )

        return Response(
            {"detail": 'file_format must be "csv" or "pdf"'},
            status=status.HTTP_400_BAD_REQUEST
        )



# ---------------------------------------------------------------
# MLOPS



class FeedbackViewSet(viewsets.GenericViewSet):
    """
    POST   /applications/feedback/             → create feedback
    GET    /applications/feedback/             → list feedback (filtered)
    GET    /applications/feedback/summary/     → summary per-application
    """
    queryset = ApplicationFeedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            serializer.save(applicant=request.user)
        except IntegrityError:
            return Response(
                {"detail": "You already submitted feedback for this application."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_201_CREATED)

    def list(self, request):
        """
        GET /applications/feedback/?application=<id>
        → raw feedback records for that application
        """
        app_id = request.query_params.get("application")
        qs = self.get_queryset()
        if app_id:
            qs = qs.filter(application_id=app_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        """
        GET /applications/feedback/mine/?application=<id>
        → only your own feedback record
        """
        app_id = request.query_params.get("application")
        qs = self.get_queryset().filter(applicant=request.user)
        if app_id:
            qs = qs.filter(application_id=app_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """
        GET /applications/feedback/summary/?application=<id>
        → aggregated per-application summary
        """
        app_id = request.query_params.get("application")
        qs = ApplicationFeedback.objects.select_related(
            "application__job", "application__applicant"
        )
        if app_id:
            qs = qs.filter(application_id=app_id)

        summary = {}
        for fb in qs:
            app = fb.application
            key = app.id
            e = summary.setdefault(key, {
                "application_id": key,
                "job_id":         app.job_id,
                "company_name":   app.job.company_name,
                "title":          app.job.title,
                "total":          0,
                "positive":       0,
                "negative":       0,
                "reasons":        {},
                "custom_comments": [],
            })
            e["total"] += 1
            if fb.positive:
                e["positive"] += 1
            else:
                e["negative"] += 1
                # collect custom text on negative feedback
                if fb.custom:
                    e["custom_comments"].append(fb.custom)

            for r in fb.reasons or []:
                e["reasons"][r] = e["reasons"].get(r, 0) + 1

        out = []
        for e in summary.values():
            e["positivity_rate"] = (
                round(e["positive"] / e["total"], 4) if e["total"] else 0.0
            )
            out.append(e)

        return Response(out, status=status.HTTP_200_OK)
