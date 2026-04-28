/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/admin/useHrUserDetail.ts

import { useState, useEffect } from "react";
import { fetchHrUserDetail, HrUserDetail } from "@/apis/admin/accountApi";

export function useHrUserDetail(id?: number) {
    const [detail, setDetail] = useState<HrUserDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id == null) return;
        let isCancelled = false;
        setLoading(true);
        setError(null);

        fetchHrUserDetail(id)
            .then((data: any) => {
                if (!isCancelled) setDetail(data);
            })
            .catch((err: any) => {
                console.error("Failed to load HR detail:", err);
                if (!isCancelled) setError("Could not load HR details.");
            })
            .finally(() => {
                if (!isCancelled) setLoading(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [id]);

    return { detail, loading, error };
}