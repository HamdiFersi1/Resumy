# applications/management/commands/export_applicant_features.py
import os
import json
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings

from applications.models import JobApplication


class Command(BaseCommand):
    help = "Export all JobApplication + resume snapshot + score_json to Parquet files."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            type=str,
            default=getattr(settings, "FEATURE_EXPORT_DIR", "data/exports"),
            help="Directory where Parquet files will be written",
        )
        parser.add_argument(
            "--chunk-size",
            type=int,
            default=1000,
            help="Number of rows per Parquet file chunk",
        )

    def handle(self, *args, **options):
        out_dir = options["output_dir"]
        chunk_size = options["chunk_size"]
        os.makedirs(out_dir, exist_ok=True)

        qs = JobApplication.objects.select_related(
            "job", "parsed_resume").all()
        buffer = []
        file_idx = 0

        for app in qs.iterator():
            job = app.job
            row = {
                "application_id": app.id,
                "job_id": job.id,
                "company_name": job.company_name,
                "job_title": job.title,
                "contract_type": job.contract_type,
                "category": job.category,
                "location": job.location,
                "experience_level": job.experience_level,
                "status": app.status,
                "applied_at": app.applied_at.isoformat(),
            }

            # Flatten snapshot_json
            snapshot = app.snapshot_json or {}
            if isinstance(snapshot, str):
                try:
                    snapshot = json.loads(snapshot)
                except json.JSONDecodeError:
                    snapshot = {}
            for key, val in snapshot.items():
                col = f"resume_{key}"
                # 🔧 serialize list/dict to JSON string so Parquet is happy
                if isinstance(val, (list, dict)):
                    row[col] = json.dumps(val)
                else:
                    row[col] = val

            # Flatten score_json
            score = app.score_json or {}
            for key, val in score.items():
                row[f"score_{key}"] = val

            buffer.append(row)

            if len(buffer) >= chunk_size:
                df = pd.DataFrame(buffer)
                path = os.path.join(
                    out_dir, f"applications_{file_idx:04d}.parquet")
                df.to_parquet(path, index=False)
                self.stdout.write(f"→ Wrote {len(buffer)} rows to {path}")
                buffer.clear()
                file_idx += 1

        if buffer:
            df = pd.DataFrame(buffer)
            path = os.path.join(
                out_dir, f"applications_{file_idx:04d}.parquet")
            df.to_parquet(path, index=False)
            self.stdout.write(f"→ Wrote {len(buffer)} rows to {path}")

        self.stdout.write(self.style.SUCCESS(
            "✅ export_applicant_features complete."))
