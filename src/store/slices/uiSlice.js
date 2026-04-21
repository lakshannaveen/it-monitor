import { createSlice } from "@reduxjs/toolkit";
import { THEME_KEY } from "../../utils/constants";

const savedTheme = localStorage.getItem(THEME_KEY) || "light";
// Open by default only on large screens
const defaultSidebarOpen = typeof window !== "undefined" && window.innerWidth >= 1024;

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
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveJobType(state, action) {
      state.activeJobType = action.payload;
    },
  },
});

export const { toggleTheme, setSidebarOpen, toggleSidebar, setActiveJobType } = uiSlice.actions;
export default uiSlice.reducer;
