# filters.py
import django_filters
from .models import JobApplication, JobPosting


class ApplicationFilter(django_filters.FilterSet):
    
    start_date = django_filters.DateFilter(
        field_name="applied_at", lookup_expr="date__gte")
    end_date = django_filters.DateFilter(
        field_name="applied_at", lookup_expr="date__lte")
    min_score = django_filters.NumberFilter(
        field_name="score_json__total_score", lookup_expr="gte")
    max_score = django_filters.NumberFilter(
        field_name="score_json__total_score", lookup_expr="lte")
    applicant = django_filters.NumberFilter(field_name="applicant_id")

    class Meta:
        model = JobApplication
        fields = ["job", "status", "applicant", "start_date",
                  "end_date", "min_score", "max_score"]
        

class DecisionApplicationFilter(django_filters.FilterSet):
    """
    Filter accepted/declined applications, by status, job (with company+title labels),
    and score range.
    """
    status = django_filters.CharFilter(
        field_name="status", lookup_expr="exact"
    )
    job = django_filters.ModelChoiceFilter(
        field_name="job",
        queryset=JobPosting.objects.all(),
        label="Job (Company — Title)",
    )
    min_score = django_filters.NumberFilter(
        field_name="score_json__total_score", lookup_expr="gte"
    )
    max_score = django_filters.NumberFilter(
        field_name="score_json__total_score", lookup_expr="lte"
    )

    class Meta:
        model = JobApplication
        fields = ["status", "job", "min_score", "max_score"]
