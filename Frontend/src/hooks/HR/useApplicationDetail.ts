import { useEffect, useState } from "react";
import { fetchApplicationDetail, ApplicationDetail } from "@/apis/HR/applicationApi";

export function useApplicationDetail(id?: string) {
    const [app, setApp] = useState<ApplicationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        fetchApplicationDetail(Number(id))
            .then(setApp)
            .catch(() => setError("Failed to load application details."))
            .finally(() => setLoading(false));
    }, [id]);

    const pct = (v?: number) => (v ?? 0) * 100;

    return {
        app,
        loading,
        error,
        totalPct: pct(app?.score_json?.total_score),
        expPct: pct(app?.score_json?.experience_score),
        skillsPct: pct(app?.score_json?.skills_score),
        projPct: pct(app?.score_json?.projects_score),
        eduPct: pct(app?.score_json?.education_score),
    };
}