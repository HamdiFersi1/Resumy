import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from resumes.models import UploadedResume, ParsedResume, ScoredResume
from jobs.models import JobPosting
from resumes.parser.scoring import score_resume
from .serializers import UploadedResumeSerializer
from rest_framework import viewsets
from resumes.models import UploadedResume, ParsedResume, ScoredResume
from resumes.serializers import UploadedResumeSerializer, ParsedResumeSerializer, ScoredResumeSerializer
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from .parser import parse_resume
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import traceback


# SECURITY IS SHIT FIX  if obj.owner != request.user: raise PermissionDenied("Not your resume")   FRONT END <Route path = "/builder/:id"

 


class ParsedResumeViewSet(viewsets.ReadOnlyModelViewSet):

    permission_classes = [IsAuthenticated]
    queryset = ParsedResume.objects.all()
    serializer_class = ParsedResumeSerializer

    def retrieve(self, request, *args, **kwargs):
        parsed = self.get_object()
        return HttpResponse(parsed.raw_json, content_type="application/json")


class ResumeUploadView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = UploadedResume.objects.all()
    serializer_class = UploadedResumeSerializer

    def create(self, request, *args, **kwargs):
        # 1) save the upload
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_resume = serializer.save(uploaded_by=request.user)
        # 2) parse the PDF
        try:
            parsed_data = parse_resume(uploaded_resume.file.path)
        except Exception as e:
            return Response(
                {"error": "Parsing failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        ParsedResume.objects.update_or_create(
            uploaded_resume=uploaded_resume,
            defaults={
                "parsed_json": parsed_data,
                "raw_json": json.dumps(parsed_data, ensure_ascii=False),
                "status": "parsed",
            },
        )

        # 4) return the pure parsed dict exactly as parse_resume() produced it
        return Response({
            "id": uploaded_resume.id,
            "parsed_json": parsed_data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='parsed')
    def parsed(self, request, pk=None):
        """
        GET /resumes/ResumeUpload/{pk}/parsed/
        """
        try:
            parsed_obj = ParsedResume.objects.get(uploaded_resume__id=pk)
        except ParsedResume.DoesNotExist:
            return Response(
                {"detail": "No parsed resume found."},
                status=status.HTTP_404_NOT_FOUND
            )
        # Return exactly the JSON blob you saved
        return Response(parsed_obj.parsed_json, status=status.HTTP_200_OK)

    # @action(detail=True, methods=['get'], url_path='parsed')
    # def parsed(self, request, pk=None):
    #     # fetch the ParsedResume tied to this upload
    #     parsed_obj = get_object_or_404(ParsedResume, uploaded_resume_id=pk)
    #     return Response(parsed_obj.parsed_json)


class ResumeConfirmationView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='confirm/(?P<job_id>[^/.]+)')
    def confirm_parsed_resume(self, request, pk=None, job_id=None):
        print(
            f"==> ResumeConfirmationView called with resume_id={pk}, job_id={job_id}")
        print(f"==> Incoming data: {request.data}")

        # 1) Fetch job and resume
        try:
            job_posting = JobPosting.objects.get(id=job_id)
            uploaded_resume = UploadedResume.objects.get(id=pk)
        except JobPosting.DoesNotExist:
            return Response(
                {"error": f"Job ID {job_id} not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except UploadedResume.DoesNotExist:
            return Response(
                {"error": f"Resume ID {pk} not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2) Validate incoming JSON
        confirmed_data = request.data
        if not isinstance(confirmed_data, dict):
            return Response(
                {"error": "Expected JSON object."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3) Save the confirmed parsing
        parsed_obj, _ = ParsedResume.objects.update_or_create(
            uploaded_resume=uploaded_resume,
            defaults={
                'parsed_json': confirmed_data,
                'status':      'confirmed'
            }
        )

        # 4) Trigger scoring using the JobPosting instance
        try:
            print("==> Scoring resume...")
            score_results = score_resume(
                parsed_obj.parsed_json,
                job_posting
            )
            print("==> Score results:", score_results)

            # 5) Save the scored result
            scored_obj, _ = ScoredResume.objects.update_or_create(
                parsed_resume=parsed_obj,
                defaults={
                    'job_posting': job_posting,
                    'score_json':  score_results,
                    'status':      'scored'
                }
            )
            print("==> Score saved.")

        except Exception as e:
            print("==> SCORING OR SAVE FAILED")
            traceback.print_exc()
            return Response(
                {
                    "error":   "Scoring or saving failed",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 6) Return the score breakdown
        return Response(score_results, status=status.HTTP_200_OK)


class ConfirmedScoredResumeView(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet that returns all scored resumes with status 'scored' (i.e., confirmed and processed).
    """
    serializer_class = ScoredResumeSerializer

    def get_queryset(self):
        queryset = ScoredResume.objects.filter(status='scored')
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(
                parsed_resume__uploaded_resume__jobposting__id=job_id)
        return queryset
