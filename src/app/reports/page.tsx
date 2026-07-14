"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart3, FileText, TrendingUp, TrendingDown, Printer, Download } from "lucide-react";
import { exportToExcel } from "@/lib/export";

interface Stats {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  openingBalance: number;
  receiptVoucherCount: number;
  paymentVoucherCount: number;
  receiptCount: number;
  monthlyStats: Record<string, { income: number; expense: number }>;
  season: { name: string; startDate: string; endDate: string } | null;
}

export default function ReportsPage() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const currency = settings?.currency || "MAD";

  useEffect(() => {
    if (!activeSeason?.id) return;
    setLoading(true);
    fetch(`/api/stats?seasonId=${activeSeason.id}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [activeSeason?.id]);

  const handlePrintFinancialReport = () => {
    if (!stats) return;
    const content = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport Financier</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; }
  .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #006233; padding-bottom: 12px; }
  h1 { color: #006233; font-size: 20px; }
  .section { margin: 20px 0; }
  .section h2 { font-size: 14px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; }
  th { background: #f5f5f5; font-weight: bold; }
  .total { font-weight: bold; background: #f0faf4; }
  .text-right { text-align: right; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>${settings?.name}</h1>
  ${settings?.nameAr ? `<div dir="rtl" style="font-size:14px">${settings.nameAr}</div>` : ""}
  <h2>RAPPORT FINANCIER – ${activeSeason?.name}</h2>
  <p>Période: ${activeSeason?.startDate} au ${activeSeason?.endDate}</p>
  <p>Généré le: ${new Date().toLocaleDateString("fr-MA")}</p>
</div>

<div class="section">
  <h2>RÉCAPITULATIF</h2>
  <table>
    <tr><td>Solde d'ouverture</td><td class="text-right">${formatCurrency(stats.openingBalance, currency)}</td></tr>
    <tr><td>Total des recettes</td><td class="text-right" style="color:#166534">${formatCurrency(stats.totalIncome, currency)}</td></tr>
    <tr><td>Total des dépenses</td><td class="text-right" style="color:#991b1b">${formatCurrency(stats.totalExpenses, currency)}</td></tr>
    <tr class="total"><td>Solde de clôture</td><td class="text-right">${formatCurrency(stats.currentBalance, currency)}</td></tr>
  </table>
</div>

<div class="section">
  <h2>STATISTIQUES</h2>
  <table>
    <tr><td>Nombre de Bons de Recette</td><td class="text-right">${stats.receiptVoucherCount}</td></tr>
    <tr><td>Nombre de Bons de Caisse</td><td class="text-right">${stats.paymentVoucherCount}</td></tr>
    <tr><td>Nombre de Reçus</td><td class="text-right">${stats.receiptCount}</td></tr>
  </table>
</div>

<div class="section">
  <h2>STATISTIQUES MENSUELLES</h2>
  <table>
    <thead>
      <tr>
        <th>Mois</th>
        <th class="text-right">Recettes</th>
        <th class="text-right">Dépenses</th>
        <th class="text-right">Différence</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(stats.monthlyStats).map(([month, data]) => `
      <tr>
        <td>${month}</td>
        <td class="text-right" style="color:#166534">${formatCurrency(data.income, currency)}</td>
        <td class="text-right" style="color:#991b1b">${formatCurrency(data.expense, currency)}</td>
        <td class="text-right">${formatCurrency(data.income - data.expense, currency)}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>

<div style="margin-top:40px;display:flex;justify-content:space-between">
  <div style="text-align:center">
    <p style="font-weight:bold">Le Trésorier</p>
    <p style="font-size:10px">${settings?.treasurerName || ""}</p>
    <div style="border-top:1px solid #999;margin-top:40px;width:120px"></div>
  </div>
  <div style="text-align:center">
    <p style="font-weight:bold">Le Président</p>
    <p style="font-size:10px">${settings?.presidentName || ""}</p>
    <div style="border-top:1px solid #999;margin-top:40px;width:120px"></div>
  </div>
</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(content);
    w.document.close();
    w.onload = () => w.print();
  };

  const handleExportExcel = () => {
    if (!stats) return;
    const data = [
      { "": "RAPPORT FINANCIER", [`${activeSeason?.name}`]: "" },
      { "": "", [`${activeSeason?.name}`]: "" },
      { "": "Solde d'ouverture", [`${activeSeason?.name}`]: stats.openingBalance },
      { "": "Total Recettes", [`${activeSeason?.name}`]: stats.totalIncome },
      { "": "Total Dépenses", [`${activeSeason?.name}`]: stats.totalExpenses },
      { "": "Solde de clôture", [`${activeSeason?.name}`]: stats.currentBalance },
      { "": "", [`${activeSeason?.name}`]: "" },
      { "": "STATISTIQUES MENSUELLES", [`${activeSeason?.name}`]: "" },
      ...Object.entries(stats.monthlyStats).map(([month, d]) => ({
        "": month,
        "Recettes": d.income,
        "Dépenses": d.expense,
        "Différence": d.income - d.expense,
      })),
    ];
    exportToExcel(data, `Rapport-Financier-${activeSeason?.name}`, "Rapport");
  };

  if (!activeSeason) {
    return (
      <AppLayout title={t(lang, "reports")}>
        <div className="text-center py-16 text-slate-400"><p>Sélectionnez un exercice financier</p></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "reports")}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">{activeSeason.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintFinancialReport}>
              <Printer className="h-4 w-4" />
              {t(lang, "print")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t(lang, "loading")}</div>
        ) : stats ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">{t(lang, "openingBalance")}</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.openingBalance, currency)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                <p className="text-xs text-emerald-600">{t(lang, "totalIncome")}</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.totalIncome, currency)}</p>
                <p className="text-xs text-emerald-500 mt-1">{stats.receiptVoucherCount} bons</p>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <p className="text-xs text-red-600">{t(lang, "totalExpenses")}</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(stats.totalExpenses, currency)}</p>
                <p className="text-xs text-red-500 mt-1">{stats.paymentVoucherCount} bons</p>
              </div>
              <div className={`rounded-xl border p-4 ${stats.currentBalance >= 0 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}`}>
                <p className="text-xs text-blue-600">{t(lang, "currentBalance")}</p>
                <p className={`text-xl font-bold ${stats.currentBalance >= 0 ? "text-blue-700" : "text-amber-700"}`}>
                  {formatCurrency(stats.currentBalance, currency)}
                </p>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Statistiques Mensuelles</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Mois</th>
                      <th className="px-4 py-3 text-right font-semibold text-emerald-600">Recettes</th>
                      <th className="px-4 py-3 text-right font-semibold text-red-600">Dépenses</th>
                      <th className="px-4 py-3 text-right font-semibold text-blue-600">Différence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.monthlyStats).map(([month, data]) => (
                      <tr key={month} className="border-b border-slate-100">
                        <td className="px-4 py-3 font-medium text-slate-700">{month}</td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                          {data.income > 0 ? formatCurrency(data.income, currency) : "–"}
                        </td>
                        <td className="px-4 py-3 text-right text-red-700 font-medium">
                          {data.expense > 0 ? formatCurrency(data.expense, currency) : "–"}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${data.income - data.expense >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatCurrency(data.income - data.expense, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(stats.totalIncome, currency)}</td>
                      <td className="px-4 py-3 text-right text-red-700">{formatCurrency(stats.totalExpenses, currency)}</td>
                      <td className="px-4 py-3 text-right text-blue-700">{formatCurrency(stats.totalIncome - stats.totalExpenses, currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
