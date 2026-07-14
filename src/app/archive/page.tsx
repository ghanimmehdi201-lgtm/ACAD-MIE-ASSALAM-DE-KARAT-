"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { ReceiptVoucher, PaymentVoucher, Receipt } from "@/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { printDocument, generateReceiptVoucherHTML, generatePaymentVoucherHTML, generateReceiptHTML } from "@/lib/print";
import { Search, FileText, CreditCard, Receipt as ReceiptIcon, Printer, Filter } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type DocType = "all" | "receipt-voucher" | "payment-voucher" | "receipt";

export default function ArchivePage() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<DocType>("all");
  const [rvs, setRvs] = useState<ReceiptVoucher[]>([]);
  const [pvs, setPvs] = useState<PaymentVoucher[]>([]);
  const [recs, setRecs] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeSeason?.id) return;
    setLoading(true);
    const [rvRes, pvRes, rRes] = await Promise.all([
      fetch(`/api/receipt-vouchers?seasonId=${activeSeason.id}`),
      fetch(`/api/payment-vouchers?seasonId=${activeSeason.id}`),
      fetch(`/api/receipts?seasonId=${activeSeason.id}`),
    ]);
    setRvs(await rvRes.json());
    setPvs(await pvRes.json());
    setRecs(await rRes.json());
    setLoading(false);
  }, [activeSeason?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const filterFn = (text: string) =>
    !search || text.toLowerCase().includes(search.toLowerCase());

  const filteredRvs = rvs.filter((v) =>
    docType === "all" || docType === "receipt-voucher"
      ? filterFn(v.voucherNumber + " " + v.receivedFrom + " " + (v.reason || ""))
      : false
  );

  const filteredPvs = pvs.filter((v) =>
    docType === "all" || docType === "payment-voucher"
      ? filterFn(v.voucherNumber + " " + v.paidTo + " " + (v.purpose || ""))
      : false
  );

  const filteredRecs = recs.filter((r) =>
    docType === "all" || docType === "receipt"
      ? filterFn(r.receiptNumber + " " + r.fullName + " " + (r.reason || ""))
      : false
  );

  const handlePrintRv = (v: ReceiptVoucher) => {
    if (!settings) return;
    const html = generateReceiptVoucherHTML(v, settings, (settings.documentLanguage as "fr" | "ar" | "bilingual") || "bilingual");
    printDocument(html);
  };

  const handlePrintPv = (v: PaymentVoucher) => {
    if (!settings) return;
    const html = generatePaymentVoucherHTML(v, settings, (settings.documentLanguage as "fr" | "ar" | "bilingual") || "bilingual");
    printDocument(html);
  };

  const handlePrintRec = (r: Receipt) => {
    if (!settings) return;
    const html = generateReceiptHTML(r, settings, (settings.documentLanguage as "fr" | "ar" | "bilingual") || "bilingual");
    printDocument(html);
  };

  if (!activeSeason) {
    return (
      <AppLayout title={t(lang, "archive")}>
        <div className="text-center py-16 text-slate-400"><p>Sélectionnez un exercice financier</p></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "archive")}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`${t(lang, "search")} (N°, nom, motif...)`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(["all", "receipt-voucher", "payment-voucher", "receipt"] as DocType[]).map((type) => {
              const labels: Record<DocType, string> = {
                all: "Tous",
                "receipt-voucher": "BR",
                "payment-voucher": "BC",
                receipt: "Reçus",
              };
              return (
                <button
                  key={type}
                  onClick={() => setDocType(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    docType === type ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t(lang, "loading")}</div>
        ) : (
          <div className="space-y-4">
            {/* Receipt Vouchers */}
            {(docType === "all" || docType === "receipt-voucher") && filteredRvs.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">{t(lang, "receiptVouchers")} ({filteredRvs.length})</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredRvs.map((v) => (
                    <div key={v.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-700 font-medium text-sm">{v.voucherNumber}</span>
                        <span className="text-slate-500 text-sm">{formatDate(v.date)}</span>
                        <span className="font-medium text-slate-800">{v.receivedFrom}</span>
                        {v.reason && <span className="text-slate-400 text-sm">– {v.reason}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-emerald-700">{formatCurrency(v.amount ?? "0", settings?.currency || "MAD")}</span>
                        <button onClick={() => handlePrintRv(v)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Vouchers */}
            {(docType === "all" || docType === "payment-voucher") && filteredPvs.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-orange-50 border-b border-orange-200 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-800">{t(lang, "paymentVouchers")} ({filteredPvs.length})</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredPvs.map((v) => (
                    <div key={v.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-orange-700 font-medium text-sm">{v.voucherNumber}</span>
                        <span className="text-slate-500 text-sm">{formatDate(v.date)}</span>
                        <span className="font-medium text-slate-800">{v.paidTo}</span>
                        {v.purpose && <span className="text-slate-400 text-sm">– {v.purpose}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-700">{formatCurrency(v.amount ?? "0", settings?.currency || "MAD")}</span>
                        <button onClick={() => handlePrintPv(v)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Receipts */}
            {(docType === "all" || docType === "receipt") && filteredRecs.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
                  <ReceiptIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">{t(lang, "receipts")} ({filteredRecs.length})</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredRecs.map((r) => (
                    <div key={r.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-blue-700 font-medium text-sm">{r.receiptNumber}</span>
                        <span className="text-slate-500 text-sm">{formatDate(r.date)}</span>
                        <span className="font-medium text-slate-800">{r.fullName}</span>
                        {r.reason && <span className="text-slate-400 text-sm">– {r.reason}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700">{formatCurrency(r.amount ?? "0", settings?.currency || "MAD")}</span>
                        <button onClick={() => handlePrintRec(r)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredRvs.length === 0 && filteredPvs.length === 0 && filteredRecs.length === 0 && (
              <div className="text-center py-12 text-slate-400">{t(lang, "noData")}</div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
