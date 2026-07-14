"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t, getRegisterLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import type { PaymentVoucher } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportPaymentVouchersToExcel } from "@/lib/export";
import { Download, Printer, Search } from "lucide-react";

export default function PaymentRegisterPage() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const regLang = (settings?.registerLanguage as "fr" | "ar" | "bilingual") || "bilingual";
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const currency = settings?.currency || "MAD";

  const loadVouchers = useCallback(async () => {
    if (!activeSeason?.id) return;
    setLoading(true);
    const res = await fetch(`/api/payment-vouchers?seasonId=${activeSeason.id}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setVouchers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeSeason?.id, search]);

  useEffect(() => { loadVouchers(); }, [loadVouchers]);

  const handlePrint = () => {
    const isRtl = regLang === "ar";
    const content = `<!DOCTYPE html>
<html lang="${isRtl ? "ar" : "fr"}" dir="${isRtl ? "rtl" : "ltr"}">
<head><meta charset="UTF-8"><title>Registre Dépenses</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; }
  .header { text-align: center; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
  th { background: #f0f0f0; font-weight: bold; }
  tfoot td { background: #f9fafb; font-weight: bold; }
</style></head>
<body>
<div class="header">
  <h1>${settings?.name}</h1>
  <h2>${t(lang, "paymentVoucherRegisterTitle")} – ${activeSeason?.name}</h2>
</div>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>${getRegisterLabel(regLang, "voucherNumber")}</th>
      <th>${getRegisterLabel(regLang, "date")}</th>
      <th>${getRegisterLabel(regLang, "beneficiary")}</th>
      <th>${getRegisterLabel(regLang, "nationalId")}</th>
      <th>${getRegisterLabel(regLang, "position")}</th>
      <th>${getRegisterLabel(regLang, "purpose")}</th>
      <th>${getRegisterLabel(regLang, "paymentMethod")}</th>
      <th>${getRegisterLabel(regLang, "amount")}</th>
    </tr>
  </thead>
  <tbody>
    ${vouchers.map((v, i) => `<tr>
      <td>${i + 1}</td>
      <td>${v.voucherNumber}</td>
      <td>${formatDate(v.date)}</td>
      <td>${v.paidTo}</td>
      <td>${v.nationalId || ""}</td>
      <td>${v.position || ""}</td>
      <td>${v.purpose || ""}</td>
      <td>${v.paymentMethod}</td>
      <td style="text-align:right">${formatCurrency(v.amount ?? "0", currency)}</td>
    </tr>`).join("")}
  </tbody>
  <tfoot>
    <tr>
      <td colspan="8" style="text-align:right">Total</td>
      <td style="text-align:right">${formatCurrency(vouchers.reduce((s, v) => s + parseFloat(v.amount ?? "0"), 0), currency)}</td>
    </tr>
  </tfoot>
</table>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(content);
    w.document.close();
    w.onload = () => w.print();
  };

  if (!activeSeason) {
    return (
      <AppLayout title={t(lang, "paymentRegister")}>
        <div className="text-center py-16 text-slate-400"><p>Sélectionnez un exercice financier</p></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "paymentRegister")}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`${t(lang, "search")}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            {t(lang, "print")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPaymentVouchersToExcel(vouchers, settings!, activeSeason.name)}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">#</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "voucherNumber")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "date")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "beneficiary")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "nationalId")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "position")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "purpose")}</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-600">{getRegisterLabel(regLang, "paymentMethod")}</th>
                  <th className="px-3 py-3 text-right font-semibold text-red-600">{getRegisterLabel(regLang, "amount")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400">{t(lang, "loading")}</td></tr>
                ) : vouchers.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-400">{t(lang, "noData")}</td></tr>
                ) : (
                  vouchers.map((v, i) => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-3 py-2.5 font-mono text-orange-700 text-xs">{v.voucherNumber}</td>
                      <td className="px-3 py-2.5 text-slate-600">{formatDate(v.date)}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{v.paidTo}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs">{v.nationalId}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs">{v.position}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-32 truncate">{v.purpose}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs capitalize">{v.paymentMethod}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-red-700">
                        {formatCurrency(v.amount ?? "0", currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {vouchers.length > 0 && (
                <tfoot>
                  <tr className="bg-red-50 border-t-2 border-red-200 font-bold">
                    <td colSpan={8} className="px-3 py-3 text-right text-slate-700">Total ({vouchers.length})</td>
                    <td className="px-3 py-3 text-right text-red-700">
                      {formatCurrency(vouchers.reduce((s, v) => s + parseFloat(v.amount ?? "0"), 0), currency)}
                    </td>
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
