import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme, selectSidebarOpen } from "./store/selectors";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import BarcodePage from "./pages/BarcodePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/404NotFound";

const Layout = ({ children }) => {
  const sidebarOpen = useSelector(selectSidebarOpen);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Header />
      <Sidebar />
      {/* On mobile: full width (sidebar is overlay).
          On desktop (lg+): shift right when sidebar is open */}
      <main
        className={`
          pt-16 transition-all duration-300
          ml-0
          ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}
        `}
      >
        <div className="p-4 sm:p-5 md:p-7 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"         element={<DashboardPage />} />
          <Route path="/barcode"  element={<BarcodePage />} />
          <Route path="/reports"  element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*"         element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppContent;
