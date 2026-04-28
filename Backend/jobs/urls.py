from django.urls import path

from .views import FavoriteJobViewSet, JobPostingViewSet




from django.urls import path, include 

from rest_framework import routers 

router = routers.DefaultRouter()


# from .views import JobPosting
router.register(r'JobPosting', JobPostingViewSet, basename='job-posting')
router.register(r'favorites', FavoriteJobViewSet, basename="favorite")


urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

]

