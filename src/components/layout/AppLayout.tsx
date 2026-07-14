"use client";
import { useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppStore } from "@/lib/store";
import { Toaster } from "react-hot-toast";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { setSettings, setActiveSeason, interfaceLanguage, activeSeasonId } = useAppStore();

  useEffect(() => {
    // Load settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(console.error);

    // Load seasons and set active
    fetch("/api/seasons")
      .then((r) => r.json())
      .then((seasons) => {
        if (Array.isArray(seasons)) {
          const active = seasons.find((s) => s.isActive) ?? seasons[0];
          if (active) setActiveSeason(active);
        }
      })
      .catch(console.error);
  }, []);

  const isRtl = interfaceLanguage === "ar";

  return (
    <div
      className={`flex h-screen bg-slate-50 overflow-hidden ${isRtl ? "dir-rtl" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: "14px" },
        }}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
