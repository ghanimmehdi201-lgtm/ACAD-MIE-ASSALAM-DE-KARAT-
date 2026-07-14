import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "MAD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `0.00 ${currency}`;
  return `${num.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(dateStr: string, lang: "fr" | "ar" = "fr"): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (lang === "ar") {
      return date.toLocaleDateString("ar-MA");
    }
    return date.toLocaleDateString("fr-MA");
  } catch {
    return dateStr;
  }
}

// Convert number to words in French
export function numberToWordsFr(amount: number): string {
  if (amount === 0) return "zéro dirham";

  const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
    "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      if (ten === 7) return "soixante-" + ones[10 + one];
      if (ten === 9) return "quatre-vingt-" + (one === 0 ? "" : ones[one]).replace(/^-/, "");
      if (ten === 8) return one === 0 ? "quatre-vingts" : "quatre-vingt-" + ones[one];
      return tens[ten] + (one > 0 ? (ten === 2 ? " et " : "-") + ones[one] : (ten === 2 ? " " : ""));
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const hundredStr = hundred === 1 ? "cent" : ones[hundred] + " cent" + (rest === 0 && hundred > 1 ? "s" : "");
    return hundredStr + (rest > 0 ? " " + convertLessThanThousand(rest) : "");
  }

  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);

  let result = "";
  if (intPart === 0) {
    result = "zéro";
  } else if (intPart < 1000) {
    result = convertLessThanThousand(intPart);
  } else if (intPart < 1000000) {
    const thousands = Math.floor(intPart / 1000);
    const rest = intPart % 1000;
    result = (thousands === 1 ? "mille" : convertLessThanThousand(thousands) + " mille") +
      (rest > 0 ? " " + convertLessThanThousand(rest) : "");
  } else {
    const millions = Math.floor(intPart / 1000000);
    const rest = intPart % 1000000;
    result = convertLessThanThousand(millions) + " million" + (millions > 1 ? "s" : "") +
      (rest > 0 ? " " + numberToWordsFr(rest).replace(" dirham", "") : "");
  }

  result = result.trim() + " dirham" + (intPart > 1 ? "s" : "");
  if (decPart > 0) {
    result += " et " + convertLessThanThousand(decPart) + " centime" + (decPart > 1 ? "s" : "");
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Convert number to words in Arabic
export function numberToWordsAr(amount: number): string {
  if (amount === 0) return "صفر درهم";

  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return one > 0 ? ones[one] + " و" + tens[ten] : tens[ten];
    }
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return hundreds[hundred] + (rest > 0 ? " و" + convertLessThanThousand(rest) : "");
  }

  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);

  let result = "";
  if (intPart === 0) {
    result = "صفر";
  } else if (intPart < 1000) {
    result = convertLessThanThousand(intPart);
  } else if (intPart < 1000000) {
    const thousands = Math.floor(intPart / 1000);
    const rest = intPart % 1000;
    if (thousands === 1) result = "ألف";
    else if (thousands === 2) result = "ألفان";
    else result = convertLessThanThousand(thousands) + " آلاف";
    if (rest > 0) result += " و" + convertLessThanThousand(rest);
  } else {
    const millions = Math.floor(intPart / 1000000);
    const rest = intPart % 1000000;
    result = convertLessThanThousand(millions) + " مليون";
    if (rest > 0) result += " و" + numberToWordsAr(rest).replace(" درهم", "");
  }

  result = result.trim() + " درهم";
  if (decPart > 0) {
    result += " و" + convertLessThanThousand(decPart) + " سنتيم";
  }

  return result;
}

export function generateVoucherNumber(
  prefix: string,
  counter: number,
  format: string,
  year: number
): string {
  const yearStr = year.toString();
  let numStr = "";
  if (format === "0001/YYYY") numStr = counter.toString().padStart(4, "0");
  else if (format === "001/YYYY") numStr = counter.toString().padStart(3, "0");
  else numStr = counter.toString();
  return `${prefix}-${numStr}/${yearStr}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatAmount(val: string | number): string {
  const num = parseFloat(val as string);
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}
