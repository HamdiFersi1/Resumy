import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import resumeApi from "@/apis/resumeApi";
import type { RawParsedResume } from "@/lib/parsing/types";
import { normalizeParsed } from "@/lib/parsing/normalizeParsedResume";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setResume } from "@/lib/redux/resumeSlice";
import { clearResume } from "@/lib/redux/resumeSlice";

export function useParsedResume() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        dispatch(clearResume());
        setLoading(true);
        setError(null);

        resumeApi.getParsedResume(Number(id))
            .then((raw: RawParsedResume) => {
                const normalized = normalizeParsed(raw);
                console.log("📝 normalized.profile:", normalized.profile);
                dispatch(setResume(normalized));
            })
            .catch(err => {
                console.error("Failed to load parsed resume:", err);
                setError("Failed to load resume");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id, dispatch]);

    return { loading, error };
}
