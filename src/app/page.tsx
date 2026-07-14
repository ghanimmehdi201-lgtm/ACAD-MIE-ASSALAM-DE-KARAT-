"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  CreditCard,
  Receipt,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  openingBalance: number;
  receiptVoucherCount: number;
  paymentVoucherCount: number;
  receiptCount: number;
  season: { name: string; startDate: string; endDate: string; isClosed: boolean } | null;
  monthlyStats: Record<string, { income: number; expense: number }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  href,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  change?: { value: number; label: string };
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {change.value >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${change.value >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {change.label}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function SimpleBarChart({ data }: { data: Record<string, { income: number; expense: number }> }) {
  const entries = Object.entries(data);
  const maxVal = Math.max(...entries.flatMap(([, v]) => [v.income, v.expense]), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {entries.map(([month, val]) => {
        const incomeH = (val.income / maxVal) * 100;
        const expenseH = (val.expense / maxVal) * 100;
        const [year, m] = month.split("-");
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const monthLabel = monthNames[parseInt(m) - 1] || m;

        return (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 h-24 w-full justify-center">
              <div
                className="bg-emerald-400 rounded-t w-3 min-h-0.5 transition-all"
                style={{ height: `${incomeH}%` }}
                title={`Recettes: ${val.income.toFixed(2)}`}
              />
              <div
                className="bg-red-400 rounded-t w-3 min-h-0.5 transition-all"
                style={{ height: `${expenseH}%` }}
                title={`Dépenses: ${val.expense.toFixed(2)}`}
              />
            </div>
            <span className="text-xs text-slate-500">{monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSeason?.id) return;
    setLoading(true);
    fetch(`/api/stats?seasonId=${activeSeason.id}`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeSeason?.id]);

  const currency = settings?.currency || "MAD";

  const quickLinks = [
    { href: "/receipt-vouchers", label: t(lang, "receiptVouchers"), icon: FileText, color: "bg-emerald-500", count: stats?.receiptVoucherCount },
    { href: "/payment-vouchers", label: t(lang, "paymentVouchers"), icon: CreditCard, color: "bg-orange-500", count: stats?.paymentVoucherCount },
    { href: "/receipts", label: t(lang, "receipts"), icon: Receipt, color: "bg-blue-500", count: stats?.receiptCount },
    { href: "/cash-book", label: t(lang, "cashBook"), icon: BookOpen, color: "bg-purple-500" },
    { href: "/reports", label: t(lang, "reports"), icon: BarChart3, color: "bg-teal-500" },
    { href: "/seasons", label: t(lang, "financialSeasons"), icon: Calendar, color: "bg-indigo-500" },
  ];

  return (
    <AppLayout title={t(lang, "dashboard")}>
      {!activeSeason ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Calendar className="h-16 w-16 text-slate-300" />
          <p className="text-slate-500 text-lg">{t(lang, "noData")}</p>
          <p className="text-slate-400 text-sm">Créez d'abord un exercice financier</p>
          <Link
            href="/seasons"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            {t(lang, "newSeason")}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Season Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-emerald-100 text-sm">{t(lang, "currentSeason")}</p>
                <h2 className="text-xl font-bold">{activeSeason.name}</h2>
                <p className="text-emerald-200 text-sm mt-1">
                  {activeSeason.startDate} → {activeSeason.endDate}
                </p>
              </div>
              {activeSeason.isClosed && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {t(lang, "closedSeason")}
                </span>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
                  <div className="h-8 bg-slate-200 rounded w-32" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={t(lang, "currentBalance")}
                value={formatCurrency(stats.currentBalance, currency)}
                icon={Wallet}
                color="bg-emerald-500"
              />
              <StatCard
                title={t(lang, "totalIncome")}
                value={formatCurrency(stats.totalIncome, currency)}
                icon={TrendingUp}
                color="bg-blue-500"
                href="/receipt-vouchers"
              />
              <StatCard
                title={t(lang, "totalExpenses")}
                value={formatCurrency(stats.totalExpenses, currency)}
                icon={TrendingDown}
                color="bg-red-500"
                href="/payment-vouchers"
              />
            </div>
          ) : null}

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Accès rapide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all flex flex-col items-center gap-2 text-center"
                  >
                    <div className={`p-2.5 rounded-lg ${link.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 leading-tight">{link.label}</span>
                    {link.count !== undefined && (
                      <span className="text-xs text-slate-400">{link.count} éléments</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          {stats && Object.keys(stats.monthlyStats).length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">{t(lang, "statistics")} (6 derniers mois)</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-emerald-400 rounded" />
                    <span className="text-slate-500">{t(lang, "totalIncome")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded" />
                    <span className="text-slate-500">{t(lang, "totalExpenses")}</span>
                  </div>
                </div>
              </div>
              <SimpleBarChart data={stats.monthlyStats} />
            </div>
          )}

          {/* Count Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/receipt-vouchers" className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.receiptVoucherCount}</p>
                  <p className="text-sm text-slate-500">{t(lang, "receiptVouchers")}</p>
                </div>
              </Link>
              <Link href="/payment-vouchers" className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.paymentVoucherCount}</p>
                  <p className="text-sm text-slate-500">{t(lang, "paymentVouchers")}</p>
                </div>
              </Link>
              <Link href="/receipts" className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.receiptCount}</p>
                  <p className="text-sm text-slate-500">{t(lang, "receipts")}</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
