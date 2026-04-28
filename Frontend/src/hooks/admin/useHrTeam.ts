// src/hooks/useHrTeam.ts
import { useState, useEffect } from "react";
import { fetchHrTeam, HrUser } from "@/apis/admin/accountApi";

export function useHrTeam() {
    const [team, setTeam] = useState<HrUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        fetchHrTeam()
            .then(data => {
                if (!isCancelled) {
                    setTeam(data);
                }
            })
            .catch(err => {
                console.error("Failed to load HR team:", err);
                if (!isCancelled) {
                    setError("Could not load HR team.");
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    return { team, loading, error };
}