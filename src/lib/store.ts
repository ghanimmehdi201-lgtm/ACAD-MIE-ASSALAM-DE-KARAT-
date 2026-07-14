"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AssociationSettings, FinancialSeason } from "@/db/schema";
import type { Language } from "./i18n";

interface AppState {
  // UI State
  interfaceLanguage: Language;
  activeSeasonId: number | null;
  activeSeason: FinancialSeason | null;
  settings: AssociationSettings | null;
  sidebarOpen: boolean;

  // Actions
  setInterfaceLanguage: (lang: Language) => void;
  setActiveSeasonId: (id: number | null) => void;
  setActiveSeason: (season: FinancialSeason | null) => void;
  setSettings: (settings: AssociationSettings | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      interfaceLanguage: "fr",
      activeSeasonId: null,
      activeSeason: null,
      settings: null,
      sidebarOpen: true,

      setInterfaceLanguage: (lang) => set({ interfaceLanguage: lang }),
      setActiveSeasonId: (id) => set({ activeSeasonId: id }),
      setActiveSeason: (season) =>
        set({ activeSeason: season, activeSeasonId: season?.id ?? null }),
      setSettings: (settings) => set({ settings }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "maams-app-store",
      partialize: (state) => ({
        interfaceLanguage: state.interfaceLanguage,
        activeSeasonId: state.activeSeasonId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
