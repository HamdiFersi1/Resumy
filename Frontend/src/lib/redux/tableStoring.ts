/* eslint-disable @typescript-eslint/no-explicit-any */
/* ────────────────────────────────────────────────────────────────
   RTK Query slice – wraps the shared Axios client (`API`)
   ──────────────────────────────────────────────────────────────── */
import { createApi } from "@reduxjs/toolkit/query/react";
import type { AxiosError, AxiosRequestConfig } from "axios";
import API from "@/apis/client";
import type { PaginatedApplications } from "@/apis/HR/applicationApi";

/* --- tiny adapter so RTK-Query can call Axios ------------------ */
type RtkAxiosArgs = {
    url: string;
    method?: AxiosRequestConfig["method"];
    params?: any;
    data?: any;
    /* allow arbitrary extras without tripping TS */
    [key: string]: unknown;
};
  

const axiosBaseQuery =
    () =>
        async ({ url, method = "get", data, params }: RtkAxiosArgs) => {
            try {
                const res = await API.request({ url, method, data, params });
                return { data: res.data };
            } catch (err) {
                const e = err as AxiosError;
                return {
                    error: {
                        status: e.response?.status ?? "FETCH_ERROR",
                        data: e.response?.data ?? e.message,
                    },
                };
            }
        };

/* --------------------------------------------------------------- */
export interface LeaderboardArgs {
    jobId: number;
    page: number;
    ordering: string;
    pageSize?: number;
  }

export const leaderboardApi = createApi({
    reducerPath: "leaderboardApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Leaderboard"],

    endpoints: (build) => ({
        getLeaderboard: build.query<PaginatedApplications, LeaderboardArgs>({
            /* this object now fully satisfies `RtkAxiosArgs` */
            query: ({ jobId, page, ordering, pageSize }) => ({
                url: "/applications/ApplicationViewSet/",
                method: "get",
                params: {
                    job: jobId,
                    page,
                    ordering,
                    page_size: pageSize,
                    status: "scored",
                },
            }),
            keepUnusedDataFor: 120,
            providesTags: (_r, _e, { jobId }) => [
                { type: "Leaderboard", id: jobId },
            ],
        }),
    }),
});

export const { useGetLeaderboardQuery } = leaderboardApi;
   