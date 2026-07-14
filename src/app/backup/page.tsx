"use client";
import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { HardDrive, Upload, Download, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function BackupPage() {
  const { interfaceLanguage } = useAppStore();
  const lang = interfaceLanguage;
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const res = await fetch("/api/backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maams-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t(lang, "backupSuccess"));
    } catch {
      toast.error(t(lang, "error"));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(t(lang, "importSuccess"));
        window.location.reload();
      } else {
        toast.error(t(lang, "error"));
      }
    } catch {
      toast.error("Fichier de sauvegarde invalide");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <AppLayout title={t(lang, "backup")}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Download className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{t(lang, "exportBackup")}</h2>
              <p className="text-sm text-slate-500">Exporter toutes les données en format JSON</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Paramètres de l'association</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Exercices financiers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Bons de recette et de caisse</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Reçus et livre de caisse</span>
            </div>
          </div>
          <Button onClick={handleExport} className="w-full">
            <Download className="h-4 w-4" />
            {t(lang, "exportBackup")}
          </Button>
        </div>

        {/* Import */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Upload className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{t(lang, "importBackup")}</h2>
              <p className="text-sm text-slate-500">Restaurer depuis un fichier JSON</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 mb-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              <strong>Attention:</strong> L'importation remplacera toutes les données existantes. Effectuez d'abord une sauvegarde.
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            loading={importing}
            className="w-full"
          >
            <Upload className="h-4 w-4" />
            {t(lang, "importBackup")}
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">MAAMS v1.0</h3>
          </div>
          <p className="text-sm text-blue-700">
            Système de Gestion Comptable pour Associations Marocaines
          </p>
          <p className="text-xs text-blue-500 mt-2">
            Pour toute assistance, consultez votre administrateur système.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
