import { createSlice } from "@reduxjs/toolkit";
import { THEME_KEY, SIDEBAR_OPEN_KEY } from "../../utils/constants";

const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
const savedSidebar = localStorage.getItem(SIDEBAR_OPEN_KEY);
// Default open on large screens, but prefer saved user choice when available.
const defaultSidebarOpen =
  savedSidebar !== null
    ? savedSidebar === "true"
    : (typeof window !== "undefined" && window.innerWidth >= 1024);

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    theme: savedTheme,
    sidebarOpen: defaultSidebarOpen,
    activeJobType: "All",
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, state.theme);
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(state.sidebarOpen));
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
      localStorage.setItem(SIDEBAR_OPEN_KEY, String(state.sidebarOpen));
    },
    setActiveJobType(state, action) {
      state.activeJobType = action.payload;
    },
  },
});

export const { toggleTheme, setSidebarOpen, toggleSidebar, setActiveJobType } = uiSlice.actions;
export default uiSlice.reducer;
