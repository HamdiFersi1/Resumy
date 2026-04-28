# resumes/urls.py

from django.urls import path,include
from django.conf.urls.static import static
from rest_framework import routers
from resumes.views import ResumeUploadView, ResumeConfirmationView,ParsedResumeViewSet,ConfirmedScoredResumeView,ParsedResumeViewSet
from django.urls import path, include 
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'ResumeUpload', ResumeUploadView, basename='ResumeUploadView')
router.register(r'ParsedResume', ParsedResumeViewSet, basename='ParsedResume')
router.register(r'ResumeConfirmation', ResumeConfirmationView, basename='ResumeConfirmationView')
router.register(r'ConfirmedScoredResumeView', ConfirmedScoredResumeView, basename='ConfirmedScoredResumeView')

# router.register(r'ParsedResumeViewSet', ParsedResumeViewSet, basename='ParsedResumeViewSet')
# urlpatterns = [
#     path('parse/<int:resume_id>/', run_parser_view, name='run_parser'),
#     path('confirm/<int:resume_id>/', confirm_parsed_resume, name='confirm_parsed_resume'),
#     path('confirm/<int:job_id>/<int:resume_id>/', confirm_parsed_resume, name='confirm_parsed_resume'),
#     path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
#     path('confirm/<int:job_id>/<int:resume_id>/', ConfirmParsedResumeView.as_view(), name='confirm-parsed-resume'),

# ]

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
