"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Receipt,
  BookOpen,
  TrendingUp,
  Archive,
  Settings,
  HardDrive,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  X,
} from "lucide-react";

const navItems = [
  { key: "dashboard", href: "/", icon: LayoutDashboard, labelKey: "dashboard" as const },
  { key: "seasons", href: "/seasons", icon: Calendar, labelKey: "financialSeasons" as const },
  { key: "receipt-vouchers", href: "/receipt-vouchers", icon: FileText, labelKey: "receiptVouchers" as const },
  { key: "payment-vouchers", href: "/payment-vouchers", icon: CreditCard, labelKey: "paymentVouchers" as const },
  { key: "receipts", href: "/receipts", icon: Receipt, labelKey: "receipts" as const },
  { key: "receipt-register", href: "/receipt-register", icon: BookOpen, labelKey: "receiptRegister" as const },
  { key: "payment-register", href: "/payment-register", icon: TrendingUp, labelKey: "paymentRegister" as const },
  { key: "cash-book", href: "/cash-book", icon: BookOpen, labelKey: "cashBook" as const },
  { key: "reports", href: "/reports", icon: BarChart3, labelKey: "reports" as const },
  { key: "archive", href: "/archive", icon: Archive, labelKey: "archive" as const },
  { key: "backup", href: "/backup", icon: HardDrive, labelKey: "backup" as const },
  { key: "settings", href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, interfaceLanguage, activeSeason } = useAppStore();
  const pathname = usePathname();
  const isRtl = interfaceLanguage === "ar";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 bg-slate-900 text-white transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16",
          "lg:relative lg:translate-x-0",
          !sidebarOpen && "max-lg:-translate-x-full max-lg:w-64 max-lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 h-16">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">م</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate">MAAMS</p>
                <p className="text-xs text-slate-400 truncate">Gestion Compta</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">م</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors",
              !sidebarOpen && "hidden lg:flex"
            )}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active Season Badge */}
        {sidebarOpen && activeSeason && (
          <div className="mx-3 my-2 px-3 py-2 bg-emerald-900/50 rounded-lg border border-emerald-700">
            <p className="text-xs text-emerald-400 font-medium truncate">{activeSeason.name}</p>
            <p className="text-xs text-slate-400">{t(interfaceLanguage, "activeSeason")}</p>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
                title={!sidebarOpen ? t(interfaceLanguage, item.labelKey) : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">
                    {t(interfaceLanguage, item.labelKey)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">MAAMS v1.0 © 2025</p>
          </div>
        )}
      </aside>
    </>
  );
}
