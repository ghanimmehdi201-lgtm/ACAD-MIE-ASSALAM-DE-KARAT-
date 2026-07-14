"use client";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Menu, Globe } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { interfaceLanguage, setInterfaceLanguage, toggleSidebar, activeSeason } = useAppStore();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between h-16 print:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          {activeSeason && (
            <p className="text-xs text-slate-500">{activeSeason.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setInterfaceLanguage("fr")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              interfaceLanguage === "fr"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setInterfaceLanguage("ar")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              interfaceLanguage === "ar"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            عربي
          </button>
        </div>
      </div>
    </header>
  );
}
