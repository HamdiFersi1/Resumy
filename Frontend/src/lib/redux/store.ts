import { configureStore } from "@reduxjs/toolkit";
import resumeReducer from "./resumeSlice";
import settingsReducer from "./settingsSlice";
import { leaderboardApi } from "./tableStoring";

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    settings: settingsReducer,
    [leaderboardApi.reducerPath]: leaderboardApi.reducer,
  },

  middleware: (gDM) => gDM().concat(leaderboardApi.middleware),

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
