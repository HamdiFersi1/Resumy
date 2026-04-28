import type { RootState } from "./store";

// Reference: https://dev.to/igorovic/simplest-way-to-persist-redux-state-to-localstorage-e67

const LOCAL_STORAGE_KEY = "open-resume-state";

export const loadStateFromLocalStorage = () => {
  try {
    const stringifiedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stringifiedState) return undefined;
    return JSON.parse(stringifiedState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return undefined;
  }
};

export const saveStateToLocalStorage = (state: RootState) => {
  try {
    const stringifiedState = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, stringifiedState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Ignore
  }
};

export const getHasUsedAppBefore = () => Boolean(loadStateFromLocalStorage());
