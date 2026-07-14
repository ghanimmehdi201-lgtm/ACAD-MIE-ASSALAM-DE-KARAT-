import type { AssociationSettings, ReceiptVoucher, PaymentVoucher, Receipt } from "@/db/schema";
import type { DocumentLanguage } from "./i18n";
import { formatCurrency, formatDate } from "./utils";

function getPaymentMethodLabel(method: string, lang: DocumentLanguage): string {
  const labels: Record<string, Record<string, string>> = {
    cash: { fr: "Espèces", ar: "نقداً" },
    cheque: { fr: "Chèque", ar: "شيك" },
    transfer: { fr: "Virement", ar: "تحويل" },
    deposit: { fr: "Dépôt", ar: "إيداع" },
  };
  const label = labels[method];
  if (!label) return method;
  if (lang === "fr") return label.fr;
  if (lang === "ar") return label.ar;
  return `${label.ar} / ${label.fr}`;
}

export function printDocument(htmlContent: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export function generateReceiptVoucherHTML(
  voucher: ReceiptVoucher,
  settings: AssociationSettings,
  lang: DocumentLanguage = "bilingual"
): string {
  const currency = settings.currency || "MAD";
  const isBilingual = lang === "bilingual";
  const isFr = lang === "fr";
  const isAr = lang === "ar";

  const title = isFr ? "BON DE RECETTE" : isAr ? "سند القبض" : "سند القبض / BON DE RECETTE";

  const assocName = isFr
    ? settings.name
    : isAr
    ? settings.nameAr
    : `${settings.nameAr || settings.name}\n${settings.name}`;

  return `<!DOCTYPE html>
<html lang="${lang === "ar" ? "ar" : "fr"}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm 20mm; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #006233; padding-bottom: 10px; margin-bottom: 16px; }
  .assoc-name { font-size: 16px; font-weight: bold; color: #006233; }
  .assoc-info { font-size: 10px; color: #555; line-height: 1.6; }
  .doc-title { text-align: center; font-size: 20px; font-weight: bold; color: #006233; margin: 16px 0; text-transform: uppercase; letter-spacing: 1px; }
  .doc-number { text-align: center; font-size: 14px; margin-bottom: 20px; color: #333; }
  .field-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: baseline; }
  .field-label { font-weight: bold; white-space: nowrap; min-width: 160px; color: #333; }
  .field-value { flex: 1; border-bottom: 1px solid #aaa; padding-bottom: 2px; min-height: 20px; }
  .amount-box { border: 2px solid #006233; padding: 12px; margin: 16px 0; border-radius: 6px; background: #f0faf4; }
  .amount-label { font-weight: bold; color: #006233; }
  .amount-value { font-size: 18px; font-weight: bold; color: #111; }
  .amount-words { font-style: italic; color: #333; margin-top: 4px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
  .signature-box { text-align: center; flex: 1; }
  .signature-label { font-weight: bold; margin-bottom: 40px; color: #333; }
  .signature-line { border-top: 1px solid #888; margin-top: 40px; }
  .footer { border-top: 1px solid #ddd; padding-top: 8px; text-align: center; font-size: 10px; color: #888; margin-top: 20px; }
  .bilingual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .bilingual-ar { text-align: right; direction: rtl; }
  .bilingual-fr { text-align: left; direction: ltr; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="assoc-name">${settings.name || "Association"}</div>
      ${settings.nameAr ? `<div class="assoc-name" style="font-size:14px;direction:rtl">${settings.nameAr}</div>` : ""}
      <div class="assoc-info">
        ${settings.address ? `<div>${settings.address}</div>` : ""}
        ${settings.phone ? `<div>Tél: ${settings.phone}</div>` : ""}
        ${settings.email ? `<div>${settings.email}</div>` : ""}
        ${settings.legalRegistrationNumber ? `<div>RC: ${settings.legalRegistrationNumber}</div>` : ""}
      </div>
    </div>
    <div style="text-align:center">
      <div style="width:80px;height:80px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa">LOGO</div>
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">${title}</div>
  <div class="doc-number">${isFr ? "N°" : isAr ? "رقم" : "رقم / N°"}: <strong>${voucher.voucherNumber}</strong> &nbsp;&nbsp; 
    ${isFr ? "Date" : isAr ? "التاريخ" : "التاريخ / Date"}: <strong>${formatDate(voucher.date)}</strong>
  </div>

  <!-- Fields -->
  ${isBilingual ? `
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">Reçu de: </span><span class="field-value">${voucher.receivedFrom}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">استلمنا من: </span><span class="field-value">${voucher.receivedFromAr || voucher.receivedFrom}</span></div>
  </div>
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">CIN: </span><span class="field-value">${voucher.nationalId || ""}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">ب.ت.و: </span><span class="field-value">${voucher.nationalId || ""}</span></div>
  </div>
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">Qualité: </span><span class="field-value">${voucher.position || ""}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">الصفة: </span><span class="field-value">${voucher.positionAr || voucher.position || ""}</span></div>
  </div>
  ` : isFr ? `
  <div class="field-row"><span class="field-label">Reçu de:</span><span class="field-value">${voucher.receivedFrom}</span></div>
  <div class="field-row"><span class="field-label">CIN:</span><span class="field-value">${voucher.nationalId || ""}</span></div>
  <div class="field-row"><span class="field-label">Qualité:</span><span class="field-value">${voucher.position || ""}</span></div>
  ` : `
  <div class="field-row" dir="rtl"><span class="field-label">استلمنا من:</span><span class="field-value">${voucher.receivedFromAr || voucher.receivedFrom}</span></div>
  <div class="field-row" dir="rtl"><span class="field-label">ب.ت.و:</span><span class="field-value">${voucher.nationalId || ""}</span></div>
  <div class="field-row" dir="rtl"><span class="field-label">الصفة:</span><span class="field-value">${voucher.positionAr || voucher.position || ""}</span></div>
  `}

  <!-- Amount Box -->
  <div class="amount-box">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><span class="amount-label">${isFr ? "Montant" : isAr ? "المبلغ" : "المبلغ / Montant"}: </span>
        <span class="amount-value">${formatCurrency(voucher.amount ?? "0", currency)}</span>
      </div>
      <div><span class="amount-label">${isFr ? "Mode" : isAr ? "طريقة الدفع" : "الدفع / Mode"}: </span>
        <span>${getPaymentMethodLabel(voucher.paymentMethod || "cash", lang)}</span>
      </div>
    </div>
    ${isFr ? `<div class="amount-words">En lettres: ${voucher.amountInWords || ""}</div>` :
      isAr ? `<div class="amount-words" dir="rtl">بالحروف: ${voucher.amountInWordsAr || ""}</div>` :
      `<div class="amount-words" dir="rtl">بالحروف: ${voucher.amountInWordsAr || ""}</div>
       <div class="amount-words">En lettres: ${voucher.amountInWords || ""}</div>`
    }
  </div>

  <!-- Reason -->
  ${isBilingual ? `
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">Motif: </span><span class="field-value">${voucher.reason || ""}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">البيان: </span><span class="field-value">${voucher.reasonAr || voucher.reason || ""}</span></div>
  </div>
  ` : isFr ? `
  <div class="field-row"><span class="field-label">Motif:</span><span class="field-value">${voucher.reason || ""}</span></div>
  ` : `
  <div class="field-row" dir="rtl"><span class="field-label">البيان:</span><span class="field-value">${voucher.reasonAr || voucher.reason || ""}</span></div>
  `}

  <!-- Signatures -->
  <div class="signatures">
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Payeur" : isAr ? "المؤدي" : "المؤدي / Le Payeur"}</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Trésorier" : isAr ? "أمين المال" : "أمين المال / Le Trésorier"}</div>
      <div class="signature-label" style="font-size:10px;font-weight:normal">${settings.treasurerName || ""}</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Président" : isAr ? "الرئيس" : "الرئيس / Le Président"}</div>
      <div class="signature-label" style="font-size:10px;font-weight:normal">${settings.presidentName || ""}</div>
      <div class="signature-line"></div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    ${settings.name} ${settings.legalRegistrationNumber ? `– RC: ${settings.legalRegistrationNumber}` : ""} ${settings.address ? `– ${settings.address}` : ""}
  </div>
</div>
</body>
</html>`;
}

export function generatePaymentVoucherHTML(
  voucher: PaymentVoucher,
  settings: AssociationSettings,
  lang: DocumentLanguage = "bilingual"
): string {
  const currency = settings.currency || "MAD";
  const isBilingual = lang === "bilingual";
  const isFr = lang === "fr";
  const isAr = lang === "ar";
  const title = isFr ? "BON DE CAISSE" : isAr ? "سند الصرف" : "سند الصرف / BON DE CAISSE";

  return `<!DOCTYPE html>
<html lang="${lang === "ar" ? "ar" : "fr"}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm 20mm; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #c1400a; padding-bottom: 10px; margin-bottom: 16px; }
  .assoc-name { font-size: 16px; font-weight: bold; color: #c1400a; }
  .assoc-info { font-size: 10px; color: #555; line-height: 1.6; }
  .doc-title { text-align: center; font-size: 20px; font-weight: bold; color: #c1400a; margin: 16px 0; text-transform: uppercase; letter-spacing: 1px; }
  .doc-number { text-align: center; font-size: 14px; margin-bottom: 20px; color: #333; }
  .field-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: baseline; }
  .field-label { font-weight: bold; white-space: nowrap; min-width: 160px; color: #333; }
  .field-value { flex: 1; border-bottom: 1px solid #aaa; padding-bottom: 2px; min-height: 20px; }
  .amount-box { border: 2px solid #c1400a; padding: 12px; margin: 16px 0; border-radius: 6px; background: #fff5f0; }
  .amount-label { font-weight: bold; color: #c1400a; }
  .amount-value { font-size: 18px; font-weight: bold; color: #111; }
  .amount-words { font-style: italic; color: #333; margin-top: 4px; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
  .signature-box { text-align: center; flex: 1; }
  .signature-label { font-weight: bold; margin-bottom: 40px; color: #333; }
  .signature-line { border-top: 1px solid #888; margin-top: 40px; }
  .footer { border-top: 1px solid #ddd; padding-top: 8px; text-align: center; font-size: 10px; color: #888; margin-top: 20px; }
  .bilingual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .bilingual-ar { text-align: right; direction: rtl; }
  .bilingual-fr { text-align: left; direction: ltr; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="assoc-name">${settings.name || "Association"}</div>
      ${settings.nameAr ? `<div class="assoc-name" style="font-size:14px;direction:rtl">${settings.nameAr}</div>` : ""}
      <div class="assoc-info">
        ${settings.address ? `<div>${settings.address}</div>` : ""}
        ${settings.phone ? `<div>Tél: ${settings.phone}</div>` : ""}
        ${settings.email ? `<div>${settings.email}</div>` : ""}
      </div>
    </div>
    <div style="text-align:center">
      <div style="width:80px;height:80px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa">LOGO</div>
    </div>
  </div>

  <div class="doc-title">${title}</div>
  <div class="doc-number">${isFr ? "N°" : isAr ? "رقم" : "رقم / N°"}: <strong>${voucher.voucherNumber}</strong> &nbsp;&nbsp; 
    ${isFr ? "Date" : isAr ? "التاريخ" : "التاريخ / Date"}: <strong>${formatDate(voucher.date)}</strong>
  </div>

  ${isBilingual ? `
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">Payé à: </span><span class="field-value">${voucher.paidTo}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">صرفنا إلى: </span><span class="field-value">${voucher.paidToAr || voucher.paidTo}</span></div>
  </div>
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">CIN: </span><span class="field-value">${voucher.nationalId || ""}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">ب.ت.و: </span><span class="field-value">${voucher.nationalId || ""}</span></div>
  </div>
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">Qualité: </span><span class="field-value">${voucher.position || ""}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">الصفة: </span><span class="field-value">${voucher.positionAr || voucher.position || ""}</span></div>
  </div>
  ` : isFr ? `
  <div class="field-row"><span class="field-label">Payé à:</span><span class="field-value">${voucher.paidTo}</span></div>
  <div class="field-row"><span class="field-label">CIN:</span><span class="field-value">${voucher.nationalId || ""}</span></div>
  <div class="field-row"><span class="field-label">Qualité:</span><span class="field-value">${voucher.position || ""}</span></div>
  ` : `
  <div class="field-row" dir="rtl"><span class="field-label">صرفنا إلى:</span><span class="field-value">${voucher.paidToAr || voucher.paidTo}</span></div>
  <div class="field-row" dir="rtl"><span class="field-label">ب.ت.و:</span><span class="field-value">${voucher.nationalId || ""}</span></div>
  <div class="field-row" dir="rtl"><span class="field-label">الصفة:</span><span class="field-value">${voucher.positionAr || voucher.position || ""}</span></div>
  `}

  <div class="amount-box">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><span class="amount-label">${isFr ? "Montant" : isAr ? "المبلغ" : "المبلغ / Montant"}: </span>
        <span class="amount-value">${formatCurrency(voucher.amount ?? "0", currency)}</span>
      </div>
      <div><span class="amount-label">${isFr ? "Mode" : isAr ? "طريقة الدفع" : "الدفع / Mode"}: </span>
        <span>${getPaymentMethodLabel(voucher.paymentMethod || "cash", lang)}</span>
      </div>
    </div>
    ${isFr ? `<div class="amount-words">En lettres: ${voucher.amountInWords || ""}</div>` :
      isAr ? `<div class="amount-words" dir="rtl">بالحروف: ${voucher.amountInWordsAr || ""}</div>` :
      `<div class="amount-words" dir="rtl">بالحروف: ${voucher.amountInWordsAr || ""}</div>
       <div class="amount-words">En lettres: ${voucher.amountInWords || ""}</div>`
    }
  </div>

  ${isBilingual ? `
  <div class="bilingual-row">
    <div class="bilingual-fr"><span class="field-label">Objet: </span><span class="field-value">${voucher.purpose || ""}</span></div>
    <div class="bilingual-ar" dir="rtl"><span class="field-label">الغرض: </span><span class="field-value">${voucher.purposeAr || voucher.purpose || ""}</span></div>
  </div>
  ` : isFr ? `
  <div class="field-row"><span class="field-label">Objet:</span><span class="field-value">${voucher.purpose || ""}</span></div>
  ` : `
  <div class="field-row" dir="rtl"><span class="field-label">الغرض:</span><span class="field-value">${voucher.purposeAr || voucher.purpose || ""}</span></div>
  `}

  <div class="signatures">
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Bénéficiaire" : isAr ? "المستفيد" : "المستفيد / Le Bénéficiaire"}</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Trésorier" : isAr ? "أمين المال" : "أمين المال / Le Trésorier"}</div>
      <div class="signature-label" style="font-size:10px;font-weight:normal">${settings.treasurerName || ""}</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Président" : isAr ? "الرئيس" : "الرئيس / Le Président"}</div>
      <div class="signature-label" style="font-size:10px;font-weight:normal">${settings.presidentName || ""}</div>
      <div class="signature-line"></div>
    </div>
  </div>

  <div class="footer">
    ${settings.name} ${settings.legalRegistrationNumber ? `– RC: ${settings.legalRegistrationNumber}` : ""} ${settings.address ? `– ${settings.address}` : ""}
  </div>
</div>
</body>
</html>`;
}

export function generateReceiptHTML(
  receipt: Receipt,
  settings: AssociationSettings,
  lang: DocumentLanguage = "bilingual"
): string {
  const currency = settings.currency || "MAD";
  const isBilingual = lang === "bilingual";
  const isFr = lang === "fr";
  const isAr = lang === "ar";
  const title = isFr ? "REÇU" : isAr ? "وصل استلام" : "وصل استلام / REÇU";

  return `<!DOCTYPE html>
<html lang="${lang === "ar" ? "ar" : "fr"}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; }
  .page { width: 210mm; min-height: 148mm; margin: 0 auto; padding: 10mm 20mm; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1a56db; padding-bottom: 8px; margin-bottom: 12px; }
  .assoc-name { font-size: 14px; font-weight: bold; color: #1a56db; }
  .doc-title { text-align: center; font-size: 18px; font-weight: bold; color: #1a56db; margin: 10px 0; }
  .field-row { display: flex; gap: 8px; margin-bottom: 10px; align-items: baseline; }
  .field-label { font-weight: bold; white-space: nowrap; min-width: 160px; color: #333; }
  .field-value { flex: 1; border-bottom: 1px solid #aaa; min-height: 18px; }
  .amount-box { border: 2px solid #1a56db; padding: 10px; margin: 12px 0; border-radius: 4px; background: #f0f4ff; }
  .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
  .signature-box { text-align: center; flex: 1; }
  .signature-label { font-weight: bold; }
  .signature-line { border-top: 1px solid #888; margin-top: 30px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="assoc-name">${settings.name}</div>
      ${settings.nameAr ? `<div class="assoc-name" style="direction:rtl;font-size:12px">${settings.nameAr}</div>` : ""}
    </div>
    <div>${receipt.receiptNumber} – ${formatDate(receipt.date)}</div>
  </div>
  <div class="doc-title">${title}</div>

  ${isBilingual ? `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
    <div><span class="field-label">Nom: </span><span class="field-value">${receipt.fullName}</span></div>
    <div style="direction:rtl;text-align:right"><span class="field-label">الاسم: </span><span class="field-value">${receipt.fullNameAr || receipt.fullName}</span></div>
  </div>
  ` : isFr ? `
  <div class="field-row"><span class="field-label">Nom complet:</span><span class="field-value">${receipt.fullName}</span></div>
  <div class="field-row"><span class="field-label">CIN:</span><span class="field-value">${receipt.nationalId || ""}</span></div>
  <div class="field-row"><span class="field-label">Adresse:</span><span class="field-value">${receipt.address || ""}</span></div>
  ` : `
  <div class="field-row" dir="rtl"><span class="field-label">الاسم الكامل:</span><span class="field-value">${receipt.fullNameAr || receipt.fullName}</span></div>
  <div class="field-row" dir="rtl"><span class="field-label">ب.ت.و:</span><span class="field-value">${receipt.nationalId || ""}</span></div>
  <div class="field-row" dir="rtl"><span class="field-label">العنوان:</span><span class="field-value">${receipt.addressAr || receipt.address || ""}</span></div>
  `}

  <div class="amount-box">
    <div><strong>${isFr ? "Montant" : isAr ? "المبلغ" : "المبلغ / Montant"}:</strong> 
      <span style="font-size:16px;font-weight:bold">${formatCurrency(receipt.amount ?? "0", currency)}</span>
    </div>
    ${isFr ? `<div style="font-style:italic">En lettres: ${receipt.amountInWords || ""}</div>` :
      isAr ? `<div style="font-style:italic;direction:rtl">بالحروف: ${receipt.amountInWordsAr || ""}</div>` :
      `<div style="font-style:italic;direction:rtl">بالحروف: ${receipt.amountInWordsAr || ""}</div>
       <div style="font-style:italic">En lettres: ${receipt.amountInWords || ""}</div>`
    }
  </div>

  ${isBilingual ? `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
    <div><span class="field-label">Motif: </span><span class="field-value">${receipt.reason || ""}</span></div>
    <div style="direction:rtl;text-align:right"><span class="field-label">البيان: </span><span class="field-value">${receipt.reasonAr || receipt.reason || ""}</span></div>
  </div>
  ` : isFr ? `
  <div class="field-row"><span class="field-label">Motif:</span><span class="field-value">${receipt.reason || ""}</span></div>
  ` : `
  <div class="field-row" dir="rtl"><span class="field-label">البيان:</span><span class="field-value">${receipt.reasonAr || receipt.reason || ""}</span></div>
  `}

  <div class="signatures">
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Bénéficiaire" : isAr ? "المستفيد" : "المستفيد / Le Bénéficiaire"}</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-label">${isFr ? "Le Trésorier" : isAr ? "أمين المال" : "أمين المال / Le Trésorier"}</div>
      <div class="signature-label" style="font-size:10px;font-weight:normal">${settings.treasurerName || ""}</div>
      <div class="signature-line"></div>
    </div>
  </div>
</div>
</body>
</html>`;
}
