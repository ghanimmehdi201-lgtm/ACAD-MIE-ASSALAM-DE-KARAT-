"use client";
import * as XLSX from "xlsx";
import type { AssociationSettings, CashBookEntry, ReceiptVoucher, PaymentVoucher } from "@/db/schema";
import { formatCurrency, formatDate } from "./utils";

export function exportToExcel(
  data: Record<string, string | number | null | undefined>[],
  filename: string,
  sheetName = "Sheet1"
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportCashBookToExcel(
  entries: CashBookEntry[],
  settings: AssociationSettings,
  seasonName: string
) {
  const data = entries.map((e, i) => ({
    "#": i + 1,
    Date: formatDate(e.date),
    "Référence / رقم الوثيقة": e.referenceNumber,
    "Libellé / البيان": e.description,
    "Recettes / المداخيل": parseFloat(e.income ?? "0"),
    "Dépenses / المصاريف": parseFloat(e.expense ?? "0"),
    "Solde / الرصيد": parseFloat(e.balance ?? "0"),
  }));

  exportToExcel(data, `Livre-Caisse-${seasonName}`, "Livre de Caisse");
}

export function exportReceiptVouchersToExcel(vouchers: ReceiptVoucher[], settings: AssociationSettings, seasonName: string) {
  const data = vouchers.map((v, i) => ({
    "#": i + 1,
    "N° Bon": v.voucherNumber,
    Date: formatDate(v.date),
    "Reçu de / استلمنا من": v.receivedFrom,
    "CIN / ب.ت.و": v.nationalId,
    "Qualité / الصفة": v.position,
    "Motif / البيان": v.reason,
    "Mode / الدفع": v.paymentMethod,
    [`Montant (${settings.currency || "MAD"})`]: parseFloat(v.amount ?? "0"),
  }));
  exportToExcel(data, `Registre-Recettes-${seasonName}`, "Registre");
}

export function exportPaymentVouchersToExcel(vouchers: PaymentVoucher[], settings: AssociationSettings, seasonName: string) {
  const data = vouchers.map((v, i) => ({
    "#": i + 1,
    "N° Bon": v.voucherNumber,
    Date: formatDate(v.date),
    "Payé à / صرفنا إلى": v.paidTo,
    "CIN / ب.ت.و": v.nationalId,
    "Qualité / الصفة": v.position,
    "Objet / الغرض": v.purpose,
    "Mode / الدفع": v.paymentMethod,
    [`Montant (${settings.currency || "MAD"})`]: parseFloat(v.amount ?? "0"),
  }));
  exportToExcel(data, `Registre-Depenses-${seasonName}`, "Registre");
}
