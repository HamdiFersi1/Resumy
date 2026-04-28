import { useEffect, useState } from "react";

export interface Notification {
    id: number;
    application: {
        status: string;
        job: {
            title: string;
            company_name: string;
        };
    };
    interview?: {
        scheduled_at: string | null;
    };
}

export function useUserNotifications(pollInterval = 20000) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const fetchNotifications = () => {
            fetch("http://localhost:8000/applications/user-interviews/", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => (res.ok ? res.json() : []))
                .then((data) => setNotifications(data))
                .catch(() => setNotifications([]));
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, pollInterval);
        return () => clearInterval(intervalId);
    }, [pollInterval]);

    return {
        notifications,
        setNotifications,
    };
}