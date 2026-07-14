"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { AssociationSettings } from "@/db/schema";
import { Settings, Building, CreditCard, Hash, Globe } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "association" | "banking" | "numbering" | "language";

export default function SettingsPage() {
  const { interfaceLanguage, settings, setSettings } = useAppStore();
  const lang = interfaceLanguage;
  const [activeTab, setActiveTab] = useState<Tab>("association");
  const [form, setForm] = useState<Partial<AssociationSettings>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        toast.success(t(lang, "saveSuccess"));
      }
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof AssociationSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "association", label: "Association", icon: Building },
    { key: "banking", label: "Banque", icon: CreditCard },
    { key: "numbering", label: "Numérotation", icon: Hash },
    { key: "language", label: "Langue", icon: Globe },
  ];

  if (loading) {
    return (
      <AppLayout title={t(lang, "settings")}>
        <div className="text-center py-12 text-slate-400">{t(lang, "loading")}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t(lang, "settings")}>
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Association Tab */}
          {activeTab === "association" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 mb-4">Informations de l'Association</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`${t(lang, "associationName")} (Français)`}
                  value={form.name || ""}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Nom en français"
                />
                <Input
                  label={`${t(lang, "associationName")} (عربي)`}
                  value={form.nameAr || ""}
                  onChange={(e) => set("nameAr", e.target.value)}
                  rtl
                  placeholder="الاسم بالعربية"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Adresse (Français)</label>
                  <textarea
                    value={form.address || ""}
                    onChange={(e) => set("address", e.target.value)}
                    rows={2}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Adresse complète"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">العنوان (عربي)</label>
                  <textarea
                    value={form.addressAr || ""}
                    onChange={(e) => set("addressAr", e.target.value)}
                    rows={2}
                    dir="rtl"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="العنوان الكامل"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t(lang, "phone")}
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                />
                <Input
                  label={t(lang, "email")}
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="contact@association.ma"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t(lang, "legalRegNumber")}
                  value={form.legalRegistrationNumber || ""}
                  onChange={(e) => set("legalRegistrationNumber", e.target.value)}
                />
                <Input
                  label={t(lang, "taxNumber")}
                  value={form.taxNumber || ""}
                  onChange={(e) => set("taxNumber", e.target.value)}
                />
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <h3 className="font-medium text-slate-700 mb-3">Membres du Bureau</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`${t(lang, "presidentName")} (FR)`}
                    value={form.presidentName || ""}
                    onChange={(e) => set("presidentName", e.target.value)}
                  />
                  <Input
                    label={`${t(lang, "presidentName")} (AR)`}
                    value={form.presidentNameAr || ""}
                    onChange={(e) => set("presidentNameAr", e.target.value)}
                    rtl
                  />
                  <Input
                    label={`${t(lang, "treasurerName")} (FR)`}
                    value={form.treasurerName || ""}
                    onChange={(e) => set("treasurerName", e.target.value)}
                  />
                  <Input
                    label={`${t(lang, "treasurerName")} (AR)`}
                    value={form.treasurerNameAr || ""}
                    onChange={(e) => set("treasurerNameAr", e.target.value)}
                    rtl
                  />
                  <Input
                    label={`${t(lang, "secretaryName")} (FR)`}
                    value={form.secretaryName || ""}
                    onChange={(e) => set("secretaryName", e.target.value)}
                  />
                  <Input
                    label={t(lang, "currency")}
                    value={form.currency || "MAD"}
                    onChange={(e) => set("currency", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === "banking" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 mb-4">Informations Bancaires</h2>
              <Input
                label={t(lang, "bankName")}
                value={form.bankName || ""}
                onChange={(e) => set("bankName", e.target.value)}
                placeholder="CIH Bank, Attijariwafa..."
              />
              <Input
                label={t(lang, "bankAccount")}
                value={form.bankAccount || ""}
                onChange={(e) => set("bankAccount", e.target.value)}
                placeholder="Numéro de compte"
              />
              <Input
                label={t(lang, "iban")}
                value={form.iban || ""}
                onChange={(e) => set("iban", e.target.value)}
                placeholder="MA00 0000 0000 0000 0000 0000 000"
              />
            </div>
          )}

          {/* Numbering Tab */}
          {activeTab === "numbering" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 mb-4">Système de Numérotation</h2>

              <Select
                label={t(lang, "numberingSystem")}
                value={form.numberingSystem || "french"}
                onChange={(e) => {
                  const sys = e.target.value;
                  set("numberingSystem", sys);
                  if (sys === "french") {
                    set("receiptVoucherPrefix", "BR");
                    set("paymentVoucherPrefix", "BC");
                    set("receiptPrefix", "R");
                  } else if (sys === "arabic") {
                    set("receiptVoucherPrefix", "قبض");
                    set("paymentVoucherPrefix", "صرف");
                    set("receiptPrefix", "وصل");
                  }
                }}
              >
                <option value="french">Français (BR, BC, R)</option>
                <option value="arabic">Arabe (قبض، صرف، وصل)</option>
                <option value="custom">Personnalisé</option>
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={`Préfixe ${t(lang, "receiptVouchers")}`}
                  value={form.receiptVoucherPrefix || "BR"}
                  onChange={(e) => set("receiptVoucherPrefix", e.target.value)}
                />
                <Input
                  label={`Préfixe ${t(lang, "paymentVouchers")}`}
                  value={form.paymentVoucherPrefix || "BC"}
                  onChange={(e) => set("paymentVoucherPrefix", e.target.value)}
                />
                <Input
                  label={`Préfixe ${t(lang, "receipts")}`}
                  value={form.receiptPrefix || "R"}
                  onChange={(e) => set("receiptPrefix", e.target.value)}
                />
              </div>

              <Select
                label={t(lang, "numberFormat")}
                value={form.numberFormat || "0001/YYYY"}
                onChange={(e) => set("numberFormat", e.target.value)}
              >
                <option value="0001/YYYY">BR-0001/2025</option>
                <option value="001/YYYY">BR-001/2025</option>
                <option value="1/YYYY">BR-1/2025</option>
              </Select>

              <Select
                label={t(lang, "numberingMode")}
                value={form.numberingMode || "season"}
                onChange={(e) => set("numberingMode", e.target.value)}
              >
                <option value="season">{t(lang, "restartEverySeason")}</option>
                <option value="continuous">{t(lang, "continuous")}</option>
              </Select>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800 mb-4">Paramètres de Langue</h2>

              <Select
                label={t(lang, "interfaceLanguage")}
                value={form.interfaceLanguage || "fr"}
                onChange={(e) => set("interfaceLanguage", e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </Select>

              <Select
                label={`${t(lang, "documentLanguage")} (BR, BC, Reçus)`}
                value={form.documentLanguage || "bilingual"}
                onChange={(e) => set("documentLanguage", e.target.value)}
              >
                <option value="fr">Français uniquement</option>
                <option value="ar">العربية فقط</option>
                <option value="bilingual">Bilingue (FR + AR) – Recommandé</option>
              </Select>

              <Select
                label={`${t(lang, "registerLanguage")} (Registres, Livre de Caisse)`}
                value={form.registerLanguage || "bilingual"}
                onChange={(e) => set("registerLanguage", e.target.value)}
              >
                <option value="fr">Français – Date, Référence, Libellé...</option>
                <option value="ar">Arabe – التاريخ، رقم الوثيقة، البيان...</option>
                <option value="bilingual">Bilingue – التاريخ (Date) – Recommandé</option>
              </Select>

              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <p className="font-medium mb-2">Aperçu des colonnes du registre:</p>
                {form.registerLanguage === "ar" ? (
                  <div dir="rtl" className="space-y-1">
                    <p>التاريخ | رقم الوثيقة | البيان | المداخيل | المصاريف | الرصيد</p>
                  </div>
                ) : form.registerLanguage === "fr" ? (
                  <p>Date | Référence | Libellé | Recettes | Dépenses | Solde</p>
                ) : (
                  <div className="space-y-1">
                    <p>التاريخ (Date) | رقم الوثيقة (Référence) | البيان (Libellé)</p>
                    <p>المداخيل (Recettes) | المصاريف (Dépenses) | الرصيد (Solde)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
            <Button onClick={handleSave} loading={saving}>
              <Settings className="h-4 w-4" />
              {t(lang, "save")}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
