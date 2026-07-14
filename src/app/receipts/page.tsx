"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import type { Receipt } from "@/db/schema";
import { formatCurrency, formatDate, numberToWordsFr, numberToWordsAr, generateVoucherNumber, getTodayString } from "@/lib/utils";
import { printDocument, generateReceiptHTML } from "@/lib/print";
import { Plus, Search, Printer, Trash2, Edit, Download } from "lucide-react";
import toast from "react-hot-toast";

interface ReceiptFormData {
  receiptNumber: string;
  date: string;
  fullName: string;
  fullNameAr: string;
  nationalId: string;
  address: string;
  addressAr: string;
  amount: string;
  amountInWords: string;
  amountInWordsAr: string;
  reason: string;
  reasonAr: string;
  paymentMethod: string;
  notes: string;
}

function ReceiptForm({ initial, onSubmit, loading, defaultNumber }: {
  initial?: Partial<ReceiptFormData>;
  onSubmit: (d: ReceiptFormData) => Promise<void>;
  loading?: boolean;
  defaultNumber: string;
}) {
  const { interfaceLanguage, settings } = useAppStore();
  const lang = interfaceLanguage;
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReceiptFormData>({
    defaultValues: {
      receiptNumber: initial?.receiptNumber ?? defaultNumber,
      date: initial?.date ?? getTodayString(),
      fullName: initial?.fullName ?? "",
      fullNameAr: initial?.fullNameAr ?? "",
      nationalId: initial?.nationalId ?? "",
      address: initial?.address ?? "",
      addressAr: initial?.addressAr ?? "",
      amount: initial?.amount ?? "",
      amountInWords: initial?.amountInWords ?? "",
      amountInWordsAr: initial?.amountInWordsAr ?? "",
      reason: initial?.reason ?? "",
      reasonAr: initial?.reasonAr ?? "",
      paymentMethod: initial?.paymentMethod ?? "cash",
      notes: initial?.notes ?? "",
    },
  });

  const amount = watch("amount");
  useEffect(() => {
    const n = parseFloat(amount);
    if (!isNaN(n) && n > 0) {
      setValue("amountInWords", numberToWordsFr(n));
      setValue("amountInWordsAr", numberToWordsAr(n));
    }
  }, [amount, setValue]);

  const submitHandler: SubmitHandler<ReceiptFormData> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="N° Reçu" {...register("receiptNumber", { required: true })} />
        <Input type="date" label={t(lang, "date")} {...register("date", { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label={`${t(lang, "fullName")} (FR)`} {...register("fullName", { required: true })} error={errors.fullName ? "Requis" : undefined} />
        <Input label={`${t(lang, "fullName")} (AR)`} {...register("fullNameAr")} rtl />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label={t(lang, "nationalId")} {...register("nationalId")} />
        <div />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label={`${t(lang, "address")} (FR)`} {...register("address")} />
        <Input label={`${t(lang, "address")} (AR)`} {...register("addressAr")} rtl />
      </div>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <Input type="number" step="0.01" min="0" label={`${t(lang, "amount")} (${settings?.currency || "MAD"})`} {...register("amount", { required: true })} placeholder="0.00" />
          <Select label={t(lang, "paymentMethod")} {...register("paymentMethod")}>
            <option value="cash">{t(lang, "cash")}</option>
            <option value="cheque">{t(lang, "cheque")}</option>
            <option value="transfer">{t(lang, "transfer")}</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Textarea label={`${t(lang, "amountInWords")} (FR)`} {...register("amountInWords")} rows={2} />
          <Textarea label={`${t(lang, "amountInWords")} (AR)`} {...register("amountInWordsAr")} rows={2} rtl />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Textarea label={`${t(lang, "reason")} (FR)`} {...register("reason")} rows={2} />
        <Textarea label={`${t(lang, "reason")} (AR)`} {...register("reasonAr")} rows={2} rtl />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>{t(lang, "save")}</Button>
      </div>
    </form>
  );
}

export default function ReceiptsPage() {
  const { interfaceLanguage, activeSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editReceipt, setEditReceipt] = useState<Receipt | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadReceipts = useCallback(async () => {
    if (!activeSeason?.id) return;
    setLoading(true);
    const res = await fetch(`/api/receipts?seasonId=${activeSeason.id}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setReceipts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeSeason?.id, search]);

  useEffect(() => { loadReceipts(); }, [loadReceipts]);

  const handleSubmit = async (data: ReceiptFormData) => {
    if (!activeSeason) return;
    setSaving(true);
    try {
      const body = { ...data, seasonId: activeSeason.id };
      const url = editReceipt ? `/api/receipts/${editReceipt.id}` : "/api/receipts";
      const method = editReceipt ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(t(lang, "saveSuccess"));
        setShowForm(false);
        setEditReceipt(null);
        loadReceipts();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/receipts/${deleteId}`, { method: "DELETE" });
    toast.success(t(lang, "deleteSuccess"));
    loadReceipts();
  };

  const handlePrint = (receipt: Receipt) => {
    if (!settings) return;
    const html = generateReceiptHTML(receipt, settings, (settings.documentLanguage as "fr" | "ar" | "bilingual") || "bilingual");
    printDocument(html);
  };

  const defaultNumber = generateVoucherNumber(
    settings?.receiptPrefix || "R",
    activeSeason?.receiptCounter || 0,
    settings?.numberFormat || "0001/YYYY",
    new Date(activeSeason?.startDate || Date.now()).getFullYear()
  );

  if (!activeSeason) {
    return (
      <AppLayout title={t(lang, "receipts")}>
        <div className="text-center py-16 text-slate-400"><p>Sélectionnez un exercice financier</p></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "receipts")}>
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
          <Button onClick={() => { setEditReceipt(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            {t(lang, "new")} Reçu
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">N° Reçu</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "date")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "fullName")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">{t(lang, "reason")}</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">{t(lang, "amount")}</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">{t(lang, "loading")}</td></tr>
                ) : receipts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">{t(lang, "noData")}</td></tr>
                ) : (
                  receipts.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-blue-700 font-medium">{r.receiptNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <div>{r.fullName}</div>
                        {r.nationalId && <div className="text-xs text-slate-400">{r.nationalId}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-32 truncate">{r.reason}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">
                        {formatCurrency(r.amount ?? "0", settings?.currency || "MAD")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handlePrint(r)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                            <Printer className="h-4 w-4" />
                          </button>
                          <button onClick={() => { setEditReceipt(r); setShowForm(true); }} className="p-1.5 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditReceipt(null); }}
        title={editReceipt ? t(lang, "edit") : `${t(lang, "new")} Reçu`}
        size="xl"
      >
        <ReceiptForm
          initial={editReceipt ? {
            receiptNumber: editReceipt.receiptNumber,
            date: editReceipt.date,
            fullName: editReceipt.fullName,
            fullNameAr: editReceipt.fullNameAr || "",
            nationalId: editReceipt.nationalId || "",
            address: editReceipt.address || "",
            addressAr: editReceipt.addressAr || "",
            amount: editReceipt.amount || "",
            amountInWords: editReceipt.amountInWords || "",
            amountInWordsAr: editReceipt.amountInWordsAr || "",
            reason: editReceipt.reason || "",
            reasonAr: editReceipt.reasonAr || "",
            paymentMethod: editReceipt.paymentMethod || "cash",
          } : undefined}
          onSubmit={handleSubmit}
          loading={saving}
          defaultNumber={defaultNumber}
        />
      </Modal>

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
