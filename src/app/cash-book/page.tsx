"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t, getRegisterLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import type { CashBookEntry } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportCashBookToExcel } from "@/lib/export";
import { Download, Printer, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function CashBookPage() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const regLang = (settings?.registerLanguage as "fr" | "ar" | "bilingual") || "bilingual";
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currency = settings?.currency || "MAD";

  const loadEntries = useCallback(async () => {
    if (!activeSeason?.id) return;
    setLoading(true);
    const res = await fetch(`/api/cash-book?seasonId=${activeSeason.id}`);
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeSeason?.id]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handlePrint = () => {
    const isRtl = regLang === "ar";
    const content = `<!DOCTYPE html>
<html lang="${isRtl ? "ar" : "fr"}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<title>${t(lang, "cashBookTitle")}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; }
  .header { text-align: center; margin-bottom: 20px; }
  h1 { font-size: 18px; color: #333; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; }
  th { background: #f0f0f0; font-weight: bold; }
  .income { color: #166534; }
  .expense { color: #991b1b; }
  .balance { font-weight: bold; }
  tfoot td { background: #f9fafb; font-weight: bold; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>${settings?.name || "Association"}</h1>
  ${settings?.nameAr ? `<h2 dir="rtl">${settings.nameAr}</h2>` : ""}
  <h2>${t(lang, "cashBookTitle")} – ${activeSeason?.name || ""}</h2>
  <p>${t(lang, "openingBalance")}: ${formatCurrency(activeSeason?.openingBalance || "0", currency)}</p>
</div>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>${getRegisterLabel(regLang, "date")}</th>
      <th>${getRegisterLabel(regLang, "reference")}</th>
      <th>${getRegisterLabel(regLang, "description")}</th>
      <th>${getRegisterLabel(regLang, "income")}</th>
      <th>${getRegisterLabel(regLang, "expense")}</th>
      <th>${getRegisterLabel(regLang, "balance")}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="3" style="font-weight:bold">${getRegisterLabel(regLang, "balance")} ${t(lang, "openingBalance")}</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="balance">${formatCurrency(activeSeason?.openingBalance || "0", currency)}</td>
    </tr>
    ${entries.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${formatDate(e.date)}</td>
      <td>${e.referenceNumber}</td>
      <td>${regLang === "ar" ? e.descriptionAr || e.description : regLang === "bilingual" ? `${e.descriptionAr || ""} / ${e.description || ""}` : e.description}</td>
      <td class="income">${parseFloat(e.income ?? "0") > 0 ? formatCurrency(e.income ?? "0", currency) : ""}</td>
      <td class="expense">${parseFloat(e.expense ?? "0") > 0 ? formatCurrency(e.expense ?? "0", currency) : ""}</td>
      <td class="balance">${formatCurrency(e.balance ?? "0", currency)}</td>
    </tr>`).join("")}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4">Total</td>
      <td class="income">${formatCurrency(entries.reduce((s, e) => s + parseFloat(e.income ?? "0"), 0), currency)}</td>
      <td class="expense">${formatCurrency(entries.reduce((s, e) => s + parseFloat(e.expense ?? "0"), 0), currency)}</td>
      <td class="balance">${formatCurrency(activeSeason?.closingBalance || "0", currency)}</td>
    </tr>
  </tfoot>
</table>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(content);
    w.document.close();
    w.onload = () => w.print();
  };

  const totalIncome = entries.reduce((s, e) => s + parseFloat(e.income ?? "0"), 0);
  const totalExpense = entries.reduce((s, e) => s + parseFloat(e.expense ?? "0"), 0);

  if (!activeSeason) {
    return (
      <AppLayout title={t(lang, "cashBook")}>
        <div className="text-center py-16 text-slate-400"><p>Sélectionnez un exercice financier</p></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "cashBook")}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-slate-800">{activeSeason.name}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {t(lang, "print")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCashBookToExcel(entries, settings!, activeSeason.name)}>
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500">{t(lang, "openingBalance")}</p>
            <p className="font-bold text-slate-800">{formatCurrency(activeSeason.openingBalance ?? "0", currency)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <p className="text-xs text-emerald-600">{t(lang, "totalIncome")}</p>
            <p className="font-bold text-emerald-700">{formatCurrency(totalIncome, currency)}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600">{t(lang, "totalExpenses")}</p>
            <p className="font-bold text-red-700">{formatCurrency(totalExpense, currency)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-xs text-blue-600">{t(lang, "currentBalance")}</p>
            <p className="font-bold text-blue-700">{formatCurrency(activeSeason.closingBalance ?? "0", currency)}</p>
          </div>
        </div>

        {/* Cash Book Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-3 text-left font-semibold text-slate-600 w-10">#</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "date")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "reference")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "description")}</th>
                  <th className="px-3 py-3 text-right font-semibold text-emerald-600">{getRegisterLabel(regLang, "income")}</th>
                  <th className="px-3 py-3 text-right font-semibold text-red-600">{getRegisterLabel(regLang, "expense")}</th>
                  <th className="px-3 py-3 text-right font-semibold text-blue-600">{getRegisterLabel(regLang, "balance")}</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr className="bg-blue-50 border-b border-blue-100">
                  <td className="px-3 py-2" />
                  <td colSpan={3} className="px-3 py-2 font-medium text-blue-800">
                    {getRegisterLabel(regLang, "balance")} – {t(lang, "openingBalance")}
                  </td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 text-right font-bold text-blue-700">
                    {formatCurrency(activeSeason.openingBalance ?? "0", currency)}
                  </td>
                </tr>

                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">{t(lang, "loading")}</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">{t(lang, "noData")}</td></tr>
                ) : (
                  entries.map((e, i) => (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2.5 text-slate-600">{formatDate(e.date)}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-700 text-xs">{e.referenceNumber}</td>
                      <td className="px-3 py-2.5 text-slate-700 max-w-xs">
                        {regLang === "ar"
                          ? e.descriptionAr || e.description
                          : regLang === "bilingual"
                          ? <><div className="text-xs">{e.descriptionAr}</div><div className="text-xs text-slate-400">{e.description}</div></>
                          : e.description}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {parseFloat(e.income ?? "0") > 0 && (
                          <span className="font-medium text-emerald-700">
                            {formatCurrency(e.income ?? "0", currency)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {parseFloat(e.expense ?? "0") > 0 && (
                          <span className="font-medium text-red-700">
                            {formatCurrency(e.expense ?? "0", currency)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                        {formatCurrency(e.balance ?? "0", currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {entries.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold">
                    <td colSpan={4} className="px-3 py-3 text-slate-700">Total ({entries.length} opérations)</td>
                    <td className="px-3 py-3 text-right text-emerald-700">{formatCurrency(totalIncome, currency)}</td>
                    <td className="px-3 py-3 text-right text-red-700">{formatCurrency(totalExpense, currency)}</td>
                    <td className="px-3 py-3 text-right text-blue-700">{formatCurrency(activeSeason.closingBalance ?? "0", currency)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
