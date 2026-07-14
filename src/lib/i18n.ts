export type Language = "fr" | "ar";
export type DocumentLanguage = "fr" | "ar" | "bilingual";

export const translations = {
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    receiptVouchers: "Bons de Recette",
    paymentVouchers: "Bons de Caisse",
    receipts: "Reçus",
    receiptRegister: "Registre des Recettes",
    paymentRegister: "Registre des Dépenses",
    cashBook: "Livre de Caisse",
    reports: "Rapports",
    archive: "Archives",
    settings: "Paramètres",
    backup: "Sauvegarde",
    financialSeasons: "Exercices Financiers",

    // Dashboard
    currentBalance: "Solde Actuel",
    totalIncome: "Total Recettes",
    totalExpenses: "Total Dépenses",
    currentSeason: "Exercice en cours",
    statistics: "Statistiques",

    // Common
    save: "Enregistrer",
    edit: "Modifier",
    delete: "Supprimer",
    duplicate: "Dupliquer",
    print: "Imprimer",
    exportPDF: "Exporter PDF",
    exportWord: "Exporter Word",
    exportExcel: "Exporter Excel",
    cancel: "Annuler",
    confirm: "Confirmer",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    add: "Ajouter",
    new: "Nouveau",
    close: "Fermer",
    back: "Retour",
    loading: "Chargement...",
    noData: "Aucune donnée",
    success: "Succès",
    error: "Erreur",
    warning: "Avertissement",

    // Receipt Voucher fields
    voucherNumber: "Numéro de Bon",
    date: "Date",
    receivedFrom: "Reçu de",
    nationalId: "CIN",
    position: "Qualité",
    amount: "Montant",
    amountInWords: "Montant en lettres",
    reason: "Motif",
    paymentMethod: "Mode de paiement",
    cash: "Espèces",
    cheque: "Chèque",
    transfer: "Virement",
    deposit: "Dépôt",
    chequeNumber: "N° Chèque",
    attachments: "Pièces jointes",
    notes: "Notes",

    // Payment Voucher fields
    paidTo: "Payé à",
    purpose: "Objet",

    // Receipt fields
    fullName: "Nom complet",
    address: "Adresse",
    receivedFromAssociation: "Reçu de l'association",

    // Signatures
    president: "Le Président",
    treasurer: "Le Trésorier",
    payer: "Le Payeur",
    beneficiary: "Le Bénéficiaire",
    signature: "Signature",

    // Attachment types
    invoice: "Facture",
    contract: "Contrat",
    receipt: "Reçu",
    missionOrder: "Ordre de mission",
    transferNotice: "Avis de virement",
    depositReceipt: "Reçu de dépôt",
    grantDecision: "Décision de subvention",
    agreement: "Convention",
    other: "Autre",

    // Financial Season
    seasonName: "Nom de l'exercice",
    startDate: "Date de début",
    endDate: "Date de fin",
    openingBalance: "Solde d'ouverture",
    closingBalance: "Solde de clôture",
    activeSeason: "Exercice actif",
    closedSeason: "Exercice clôturé",
    newSeason: "Nouvel exercice",
    closeSeason: "Clôturer l'exercice",
    carryForwardBalance: "Reporter le solde de clôture?",

    // Settings
    associationName: "Nom de l'association",
    associationNameAr: "Nom de l'association (Arabe)",
    logo: "Logo",
    phone: "Téléphone",
    email: "Email",
    legalRegNumber: "N° d'enregistrement légal",
    taxNumber: "N° fiscal",
    bankName: "Banque",
    bankAccount: "Compte bancaire",
    iban: "IBAN",
    presidentName: "Nom du Président",
    treasurerName: "Nom du Trésorier",
    secretaryName: "Nom du Secrétaire",
    currency: "Devise",
    interfaceLanguage: "Langue de l'interface",
    documentLanguage: "Langue des documents",
    registerLanguage: "Langue des registres",
    numberingSystem: "Système de numérotation",
    numberFormat: "Format de numéro",
    numberingMode: "Mode de numérotation",
    french: "Français",
    arabic: "Arabe",
    custom: "Personnalisé",
    bilingual: "Bilingue",
    restartEverySeason: "Redémarrer chaque exercice",
    continuous: "Numérotation continue",

    // Cash Book columns
    cbDate: "Date",
    cbReference: "Référence",
    cbDescription: "Libellé",
    cbIncome: "Recettes",
    cbExpense: "Dépenses",
    cbBalance: "Solde",

    // Document titles
    receiptVoucherTitle: "BON DE RECETTE",
    paymentVoucherTitle: "BON DE CAISSE",
    receiptTitle: "REÇU",
    receiptVoucherRegisterTitle: "REGISTRE DES BONS DE RECETTE",
    paymentVoucherRegisterTitle: "REGISTRE DES BONS DE CAISSE",
    cashBookTitle: "LIVRE DE CAISSE",

    // Reports
    incomeReport: "Rapport des Recettes",
    expenseReport: "Rapport des Dépenses",
    financialReport: "Rapport Financier",
    annualReport: "Rapport Annuel",

    // Backup
    exportBackup: "Exporter la sauvegarde",
    importBackup: "Importer une sauvegarde",
    backupSuccess: "Sauvegarde exportée avec succès",
    importSuccess: "Données importées avec succès",

    // Messages
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cet élément?",
    closeSeasonConfirm: "Êtes-vous sûr de vouloir clôturer cet exercice?",
    saveSuccess: "Enregistré avec succès",
    deleteSuccess: "Supprimé avec succès",
    formError: "Veuillez corriger les erreurs du formulaire",
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    receiptVouchers: "سندات القبض",
    paymentVouchers: "سندات الصرف",
    receipts: "الوصولات",
    receiptRegister: "سجل سندات القبض",
    paymentRegister: "سجل سندات الصرف",
    cashBook: "دفتر الصندوق",
    reports: "التقارير",
    archive: "الأرشيف",
    settings: "الإعدادات",
    backup: "النسخ الاحتياطي",
    financialSeasons: "السنوات المالية",

    // Dashboard
    currentBalance: "الرصيد الحالي",
    totalIncome: "إجمالي المداخيل",
    totalExpenses: "إجمالي المصاريف",
    currentSeason: "السنة المالية الحالية",
    statistics: "الإحصائيات",

    // Common
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    duplicate: "تكرار",
    print: "طباعة",
    exportPDF: "تصدير PDF",
    exportWord: "تصدير Word",
    exportExcel: "تصدير Excel",
    cancel: "إلغاء",
    confirm: "تأكيد",
    search: "بحث",
    filter: "تصفية",
    sort: "ترتيب",
    add: "إضافة",
    new: "جديد",
    close: "إغلاق",
    back: "رجوع",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات",
    success: "نجاح",
    error: "خطأ",
    warning: "تحذير",

    // Receipt Voucher fields
    voucherNumber: "رقم السند",
    date: "التاريخ",
    receivedFrom: "استلمنا من",
    nationalId: "رقم البطاقة الوطنية",
    position: "الصفة",
    amount: "المبلغ",
    amountInWords: "المبلغ بالحروف",
    reason: "البيان",
    paymentMethod: "طريقة الدفع",
    cash: "نقداً",
    cheque: "شيك",
    transfer: "تحويل",
    deposit: "إيداع",
    chequeNumber: "رقم الشيك",
    attachments: "المرفقات",
    notes: "ملاحظات",

    // Payment Voucher fields
    paidTo: "صرفنا إلى",
    purpose: "موضوع الصرف",

    // Receipt fields
    fullName: "الاسم الكامل",
    address: "العنوان",
    receivedFromAssociation: "استلمنا من الجمعية",

    // Signatures
    president: "الرئيس",
    treasurer: "أمين المال",
    payer: "المؤدي",
    beneficiary: "المستفيد",
    signature: "التوقيع",

    // Attachment types
    invoice: "فاتورة",
    contract: "عقد",
    receipt: "وصل",
    missionOrder: "أمر بمهمة",
    transferNotice: "إشعار تحويل",
    depositReceipt: "وصل إيداع",
    grantDecision: "قرار منحة",
    agreement: "اتفاقية",
    other: "أخرى",

    // Financial Season
    seasonName: "اسم السنة المالية",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    openingBalance: "الرصيد الافتتاحي",
    closingBalance: "الرصيد الختامي",
    activeSeason: "السنة النشطة",
    closedSeason: "السنة المغلقة",
    newSeason: "سنة مالية جديدة",
    closeSeason: "إغلاق السنة المالية",
    carryForwardBalance: "نقل الرصيد الختامي؟",

    // Settings
    associationName: "اسم الجمعية",
    associationNameAr: "اسم الجمعية (عربي)",
    logo: "الشعار",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    legalRegNumber: "رقم التسجيل القانوني",
    taxNumber: "الرقم الضريبي",
    bankName: "البنك",
    bankAccount: "رقم الحساب البنكي",
    iban: "IBAN",
    presidentName: "اسم الرئيس",
    treasurerName: "اسم أمين المال",
    secretaryName: "اسم الكاتب العام",
    currency: "العملة",
    interfaceLanguage: "لغة الواجهة",
    documentLanguage: "لغة الوثائق",
    registerLanguage: "لغة السجلات",
    numberingSystem: "نظام الترقيم",
    numberFormat: "صيغة الرقم",
    numberingMode: "نمط الترقيم",
    french: "فرنسي",
    arabic: "عربي",
    custom: "مخصص",
    bilingual: "ثنائي اللغة",
    restartEverySeason: "إعادة البدء كل سنة",
    continuous: "ترقيم مستمر",

    // Cash Book columns
    cbDate: "التاريخ",
    cbReference: "رقم الوثيقة",
    cbDescription: "البيان",
    cbIncome: "المداخيل",
    cbExpense: "المصاريف",
    cbBalance: "الرصيد",

    // Document titles
    receiptVoucherTitle: "سند القبض",
    paymentVoucherTitle: "سند الصرف",
    receiptTitle: "وصل استلام",
    receiptVoucherRegisterTitle: "سجل سندات القبض",
    paymentVoucherRegisterTitle: "سجل سندات الصرف",
    cashBookTitle: "دفتر الصندوق",

    // Reports
    incomeReport: "تقرير المداخيل",
    expenseReport: "تقرير المصاريف",
    financialReport: "التقرير المالي",
    annualReport: "التقرير السنوي",

    // Backup
    exportBackup: "تصدير النسخة الاحتياطية",
    importBackup: "استيراد نسخة احتياطية",
    backupSuccess: "تم تصدير النسخة الاحتياطية بنجاح",
    importSuccess: "تم استيراد البيانات بنجاح",

    // Messages
    deleteConfirm: "هل أنت متأكد من حذف هذا العنصر؟",
    closeSeasonConfirm: "هل أنت متأكد من إغلاق السنة المالية؟",
    saveSuccess: "تم الحفظ بنجاح",
    deleteSuccess: "تم الحذف بنجاح",
    formError: "يرجى تصحيح أخطاء النموذج",
  },
};

export function t(lang: Language, key: keyof typeof translations.fr): string {
  return translations[lang]?.[key] ?? translations.fr[key] ?? key;
}

export const registerColumnLabels = {
  fr: {
    date: "Date",
    reference: "Référence",
    description: "Libellé",
    income: "Recettes",
    expense: "Dépenses",
    balance: "Solde",
    payer: "Payeur",
    beneficiary: "Bénéficiaire",
    position: "Qualité",
    reason: "Motif",
    purpose: "Objet",
    paymentMethod: "Mode",
    amount: "Montant",
    voucherNumber: "N° Bon",
    receiptNumber: "N° Reçu",
    fullName: "Nom",
    nationalId: "CIN",
    address: "Adresse",
  },
  ar: {
    date: "التاريخ",
    reference: "رقم الوثيقة",
    description: "البيان",
    income: "المداخيل",
    expense: "المصاريف",
    balance: "الرصيد",
    payer: "المؤدي",
    beneficiary: "المستفيد",
    position: "الصفة",
    reason: "البيان",
    purpose: "الغرض",
    paymentMethod: "طريقة الدفع",
    amount: "المبلغ",
    voucherNumber: "رقم السند",
    receiptNumber: "رقم الوصل",
    fullName: "الاسم",
    nationalId: "ب.ت.و",
    address: "العنوان",
  },
};

export function getRegisterLabel(
  lang: DocumentLanguage,
  key: keyof typeof registerColumnLabels.fr
): string {
  if (lang === "fr") return registerColumnLabels.fr[key];
  if (lang === "ar") return registerColumnLabels.ar[key];
  // bilingual
  return `${registerColumnLabels.ar[key]} (${registerColumnLabels.fr[key]})`;
}
