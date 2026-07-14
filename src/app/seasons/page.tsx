"use client";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import type { FinancialSeason } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Plus, Lock, CheckCircle, Trash2, Edit, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function SeasonsPage() {
  const { interfaceLanguage, activeSeason, setActiveSeason, settings } = useAppStore();
  const lang = interfaceLanguage;
  const [seasons, setSeasons] = useState<FinancialSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [carryForward, setCarryForward] = useState(true);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    openingBalance: "0",
  });
  const currency = settings?.currency || "MAD";

  const loadSeasons = async () => {
    const res = await fetch("/api/seasons");
    const data = await res.json();
    setSeasons(data);
    setLoading(false);
  };

  useEffect(() => { loadSeasons(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }

    // Get closing balance from current active season if carry forward
    let openingBalance = parseFloat(form.openingBalance) || 0;
    if (carryForward && activeSeason) {
      openingBalance = parseFloat(activeSeason.closingBalance ?? "0");
    }

    const res = await fetch("/api/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, openingBalance: openingBalance.toString() }),
    });

    if (res.ok) {
      const newSeason = await res.json();
      setActiveSeason(newSeason);
      toast.success(t(lang, "saveSuccess"));
      setShowNew(false);
      setForm({ name: "", startDate: "", endDate: "", openingBalance: "0" });
      loadSeasons();
    } else {
      toast.error(t(lang, "error"));
    }
  };

  const handleSetActive = async (season: FinancialSeason) => {
    await fetch(`/api/seasons/${season.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    setActiveSeason(season);
    toast.success(t(lang, "saveSuccess"));
    loadSeasons();
  };

  const handleClose = async () => {
    if (!closeId) return;
    await fetch(`/api/seasons/${closeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isClosed: true }),
    });
    toast.success("Exercice clôturé");
    loadSeasons();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/seasons/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t(lang, "deleteSuccess"));
      if (activeSeason?.id === deleteId) setActiveSeason(null);
      loadSeasons();
    }
  };

  const newSeasonYear = () => {
    const now = new Date();
    const y = now.getFullYear();
    return {
      name: `${y}/${y + 1}`,
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
    };
  };

  return (
    <AppLayout title={t(lang, "financialSeasons")}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t(lang, "financialSeasons")}</h2>
          <Button onClick={() => {
            const defaults = newSeasonYear();
            setForm({ ...defaults, openingBalance: "0" });
            setShowNew(true);
          }}>
            <Plus className="h-4 w-4" />
            {t(lang, "newSeason")}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t(lang, "loading")}</div>
        ) : seasons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Aucun exercice financier créé</p>
            <Button onClick={() => {
              const defaults = newSeasonYear();
              setForm({ ...defaults, openingBalance: "0" });
              setShowNew(true);
            }}>
              <Plus className="h-4 w-4" />
              Créer le premier exercice
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {seasons.map((season) => (
              <div
                key={season.id}
                className={`bg-white rounded-xl border p-5 transition-all ${
                  season.isActive
                    ? "border-emerald-300 shadow-md shadow-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {season.isActive && (
                      <Star className="h-5 w-5 text-emerald-500 fill-emerald-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{season.name}</h3>
                      <p className="text-sm text-slate-500">
                        {season.startDate} → {season.endDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {season.isActive && (
                        <Badge variant="success">{t(lang, "activeSeason")}</Badge>
                      )}
                      {season.isClosed && (
                        <Badge variant="warning">{t(lang, "closedSeason")}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!season.isActive && !season.isClosed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetActive(season)}
                      >
                        <Star className="h-4 w-4" />
                        Activer
                      </Button>
                    )}
                    {!season.isClosed && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCloseId(season.id)}
                      >
                        <Lock className="h-4 w-4" />
                        {t(lang, "closeSeason")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteId(season.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">{t(lang, "openingBalance")}</p>
                    <p className="font-semibold text-slate-800">{formatCurrency(season.openingBalance ?? "0", currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t(lang, "closingBalance")}</p>
                    <p className="font-semibold text-slate-800">{formatCurrency(season.closingBalance ?? "0", currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t(lang, "receiptVouchers")}</p>
                    <p className="font-semibold text-slate-800">{season.receiptVoucherCounter ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t(lang, "paymentVouchers")}</p>
                    <p className="font-semibold text-slate-800">{season.paymentVoucherCounter ?? 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Season Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={t(lang, "newSeason")} size="md">
        <div className="space-y-4">
          <Input
            label={t(lang, "seasonName")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="2025/2026"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label={t(lang, "startDate")}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              type="date"
              label={t(lang, "endDate")}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          {activeSeason && (
            <div className="bg-slate-50 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={carryForward}
                  onChange={(e) => setCarryForward(e.target.checked)}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <p className="font-medium text-slate-700">{t(lang, "carryForwardBalance")}</p>
                  <p className="text-xs text-slate-500">
                    Solde de {activeSeason.name}: {formatCurrency(activeSeason.closingBalance ?? "0", currency)}
                  </p>
                </div>
              </label>
            </div>
          )}

          {!carryForward && (
            <Input
              type="number"
              step="0.01"
              label={t(lang, "openingBalance")}
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              placeholder="0.00"
            />
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={handleCreate}>{t(lang, "save")}</Button>
          </div>
        </div>
      </Modal>

      {/* Close Confirm */}
      <ConfirmDialog
        open={!!closeId}
        onClose={() => setCloseId(null)}
        onConfirm={handleClose}
        title={t(lang, "closeSeason")}
        message={t(lang, "closeSeasonConfirm")}
        confirmText={t(lang, "confirm")}
        cancelText={t(lang, "cancel")}
        variant="warning"
      />

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
