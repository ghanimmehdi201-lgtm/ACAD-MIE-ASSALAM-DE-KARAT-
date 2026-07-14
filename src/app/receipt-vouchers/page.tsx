"use client";
import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { VoucherForm, type VoucherFormData } from "@/components/vouchers/VoucherForm";
import { Badge } from "@/components/ui/Badge";
import type { ReceiptVoucher } from "@/db/schema";
import { formatCurrency, formatDate, generateVoucherNumber } from "@/lib/utils";
import { printDocument, generateReceiptVoucherHTML } from "@/lib/print";
import { exportReceiptVouchersToExcel } from "@/lib/export";
import {
  Plus, Search, Printer, FileDown, Trash2, Edit, Copy, FileText, Eye, Download
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReceiptVouchersPage() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const [vouchers, setVouchers] = useState<ReceiptVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editVoucher, setEditVoucher] = useState<ReceiptVoucher | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [previewVoucher, setPreviewVoucher] = useState<ReceiptVoucher | null>(null);

  const loadVouchers = useCallback(async () => {
    if (!activeSeason?.id) return;
    setLoading(true);
    const res = await fetch(`/api/receipt-vouchers?seasonId=${activeSeason.id}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setVouchers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeSeason?.id, search]);

  useEffect(() => { loadVouchers(); }, [loadVouchers]);

  const handleSubmit = async (data: VoucherFormData) => {
    if (!activeSeason) return;
    setSaving(true);
    try {
      const body = {
        seasonId: activeSeason.id,
        voucherNumber: data.voucherNumber,
        date: data.date,
        receivedFrom: data.personName,
        receivedFromAr: data.personNameAr,
        nationalId: data.nationalId,
        position: data.position,
        positionAr: data.positionAr,
        amount: data.amount,
        amountInWords: data.amountInWords,
        amountInWordsAr: data.amountInWordsAr,
        reason: data.description,
        reasonAr: data.descriptionAr,
        paymentMethod: data.paymentMethod,
        chequeNumber: data.chequeNumber,
        notes: data.notes,
      };

      const url = editVoucher ? `/api/receipt-vouchers/${editVoucher.id}` : "/api/receipt-vouchers";
      const method = editVoucher ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(t(lang, "saveSuccess"));
        setShowForm(false);
        setEditVoucher(null);
        loadVouchers();
      } else {
        toast.error(t(lang, "error"));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/receipt-vouchers/${deleteId}`, { method: "DELETE" });
    toast.success(t(lang, "deleteSuccess"));
    loadVouchers();
  };

  const handleDuplicate = (voucher: ReceiptVoucher) => {
    setEditVoucher({
      ...voucher,
      id: 0,
      voucherNumber: generateVoucherNumber(
        settings?.receiptVoucherPrefix || "BR",
        (activeSeason?.receiptVoucherCounter || 0),
        settings?.numberFormat || "0001/YYYY",
        new Date().getFullYear()
      ),
    } as ReceiptVoucher);
    setShowForm(true);
  };

  const handlePrint = (voucher: ReceiptVoucher) => {
    if (!settings) return;
    const html = generateReceiptVoucherHTML(voucher, settings, (settings.documentLanguage as "fr" | "ar" | "bilingual") || "bilingual");
    printDocument(html);
  };

  const getPaymentBadge = (method: string) => {
    const variants: Record<string, "info" | "success" | "warning" | "default"> = {
      cash: "success",
      cheque: "info",
      transfer: "warning",
      deposit: "default",
    };
    const labels: Record<string, string> = { cash: "Espèces", cheque: "Chèque", transfer: "Virement", deposit: "Dépôt" };
    return <Badge variant={variants[method] || "default"}>{labels[method] || method}</Badge>;
  };

  if (!activeSeason) {
    return (
      <AppLayout title={t(lang, "receiptVouchers")}>
        <div className="text-center py-16 text-slate-400">
          <p>Sélectionnez un exercice financier</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "receiptVouchers")}>
      <div className="space-y-4">
        {/* Toolbar */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReceiptVouchersToExcel(vouchers, settings!, activeSeason.name)}
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={() => { setEditVoucher(null); setShowForm(true); }}
          >
            <Plus className="h-4 w-4" />
            {t(lang, "new")} BR
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">N° Bon</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "date")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "receivedFrom")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "reason")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "paymentMethod")}</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">{t(lang, "amount")}</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">{t(lang, "loading")}</td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">{t(lang, "noData")}</td>
                  </tr>
                ) : (
                  vouchers.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-emerald-700 font-medium">{v.voucherNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(v.date)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div>{v.receivedFrom}</div>
                        {v.nationalId && <div className="text-xs text-slate-400">{v.nationalId}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-32 truncate">{v.reason}</td>
                      <td className="px-4 py-3">{getPaymentBadge(v.paymentMethod || "cash")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(v.amount ?? "0", settings?.currency || "MAD")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePrint(v)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            title={t(lang, "print")}
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setEditVoucher(v); setShowForm(true); }}
                            className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                            title={t(lang, "edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(v)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                            title={t(lang, "duplicate")}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(v.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                            title={t(lang, "delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {vouchers.length > 0 && (
                <tfoot>
                  <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                    <td colSpan={5} className="px-4 py-3 font-semibold text-slate-700">
                      Total ({vouchers.length} bons)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 text-base">
                      {formatCurrency(
                        vouchers.reduce((s, v) => s + parseFloat(v.amount ?? "0"), 0),
                        settings?.currency || "MAD"
                      )}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditVoucher(null); }}
        title={editVoucher?.id ? t(lang, "edit") + " BR" : t(lang, "new") + " Bon de Recette"}
        size="xl"
      >
        <VoucherForm
          type="receipt"
          initialData={editVoucher ? {
            voucherNumber: editVoucher.voucherNumber,
            date: editVoucher.date,
            personName: editVoucher.receivedFrom,
            personNameAr: editVoucher.receivedFromAr || "",
            nationalId: editVoucher.nationalId || "",
            position: editVoucher.position || "",
            positionAr: editVoucher.positionAr || "",
            amount: editVoucher.amount || "",
            amountInWords: editVoucher.amountInWords || "",
            amountInWordsAr: editVoucher.amountInWordsAr || "",
            description: editVoucher.reason || "",
            descriptionAr: editVoucher.reasonAr || "",
            paymentMethod: editVoucher.paymentMethod || "cash",
            chequeNumber: editVoucher.chequeNumber || "",
            notes: editVoucher.notes || "",
          } : undefined}
          onSubmit={handleSubmit}
          loading={saving}
          voucherPrefix={settings?.receiptVoucherPrefix || "BR"}
          counter={activeSeason?.receiptVoucherCounter || 0}
          seasonYear={new Date(activeSeason.startDate).getFullYear()}
          numberFormat={settings?.numberFormat || "0001/YYYY"}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t(lang, "delete")}
        message={t(lang, "deleteConfirm")}
        confirmText={t(lang, "delete")}
        cancelText={t(lang, "cancel")}
      />
    </AppLayout>
  );
}
