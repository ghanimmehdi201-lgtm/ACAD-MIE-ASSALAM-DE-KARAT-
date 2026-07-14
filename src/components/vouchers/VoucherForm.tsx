"use client";
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { numberToWordsFr, numberToWordsAr, generateVoucherNumber, getTodayString } from "@/lib/utils";

export interface VoucherFormData {
  voucherNumber: string;
  date: string;
  personName: string;
  personNameAr: string;
  nationalId: string;
  position: string;
  positionAr: string;
  amount: string;
  amountInWords: string;
  amountInWordsAr: string;
  description: string;
  descriptionAr: string;
  paymentMethod: string;
  chequeNumber: string;
  notes: string;
}

interface VoucherFormProps {
  type: "receipt" | "payment";
  initialData?: Partial<VoucherFormData>;
  onSubmit: (data: VoucherFormData) => Promise<void>;
  loading?: boolean;
  voucherPrefix: string;
  counter: number;
  seasonYear: number;
  numberFormat: string;
}

export function VoucherForm({
  type,
  initialData,
  onSubmit,
  loading,
  voucherPrefix,
  counter,
  seasonYear,
  numberFormat,
}: VoucherFormProps) {
  const { interfaceLanguage, settings } = useAppStore();
  const lang = interfaceLanguage;

  const defaultNumber = generateVoucherNumber(voucherPrefix, counter + 1, numberFormat, seasonYear);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VoucherFormData>({
    defaultValues: {
      voucherNumber: initialData?.voucherNumber ?? defaultNumber,
      date: initialData?.date ?? getTodayString(),
      personName: initialData?.personName ?? "",
      personNameAr: initialData?.personNameAr ?? "",
      nationalId: initialData?.nationalId ?? "",
      position: initialData?.position ?? "",
      positionAr: initialData?.positionAr ?? "",
      amount: initialData?.amount ?? "",
      amountInWords: initialData?.amountInWords ?? "",
      amountInWordsAr: initialData?.amountInWordsAr ?? "",
      description: initialData?.description ?? "",
      descriptionAr: initialData?.descriptionAr ?? "",
      paymentMethod: initialData?.paymentMethod ?? "cash",
      chequeNumber: initialData?.chequeNumber ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const amountValue = watch("amount");
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    const num = parseFloat(amountValue);
    if (!isNaN(num) && num > 0) {
      setValue("amountInWords", numberToWordsFr(num));
      setValue("amountInWordsAr", numberToWordsAr(num));
    }
  }, [amountValue, setValue]);

  const submitHandler: SubmitHandler<VoucherFormData> = async (data) => {
    if (!data.personName) return;
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) return;
    await onSubmit(data);
  };

  const isReceipt = type === "receipt";
  const personLabel = isReceipt ? t(lang, "receivedFrom") : t(lang, "paidTo");
  const descLabel = isReceipt ? t(lang, "reason") : t(lang, "purpose");

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t(lang, "voucherNumber")}
          {...register("voucherNumber", { required: true })}
          error={errors.voucherNumber ? "Requis" : undefined}
        />
        <Input
          type="date"
          label={t(lang, "date")}
          {...register("date", { required: true })}
          error={errors.date ? "Requis" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={`${personLabel} (FR)`}
          {...register("personName", { required: true })}
          error={errors.personName ? "Ce champ est requis" : undefined}
          placeholder={isReceipt ? "Nom du payeur" : "Nom du bénéficiaire"}
        />
        <Input
          label={`${personLabel} (AR)`}
          {...register("personNameAr")}
          rtl
          placeholder={isReceipt ? "اسم المؤدي" : "اسم المستفيد"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t(lang, "nationalId")}
          {...register("nationalId")}
          placeholder="XX000000"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label={`${t(lang, "position")} (FR)`}
            {...register("position")}
            placeholder="Membre..."
          />
          <Input
            label={`${t(lang, "position")} (AR)`}
            {...register("positionAr")}
            rtl
            placeholder="عضو..."
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.01"
            min="0"
            label={`${t(lang, "amount")} (${settings?.currency || "MAD"})`}
            {...register("amount", { required: true, min: 0.01 })}
            error={errors.amount ? "Montant invalide" : undefined}
            placeholder="0.00"
          />
          <Select
            label={t(lang, "paymentMethod")}
            {...register("paymentMethod")}
          >
            <option value="cash">{t(lang, "cash")}</option>
            <option value="cheque">{t(lang, "cheque")}</option>
            <option value="transfer">{t(lang, "transfer")}</option>
            {isReceipt && <option value="deposit">{t(lang, "deposit")}</option>}
          </Select>
        </div>

        {paymentMethod === "cheque" && (
          <div className="mt-3">
            <Input
              label={t(lang, "chequeNumber")}
              {...register("chequeNumber")}
              placeholder="N° Chèque"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <Textarea
            label={`${t(lang, "amountInWords")} (FR)`}
            {...register("amountInWords")}
            rows={2}
            className="text-sm"
          />
          <Textarea
            label={`${t(lang, "amountInWords")} (AR)`}
            {...register("amountInWordsAr")}
            rows={2}
            rtl
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          label={`${descLabel} (FR)`}
          {...register("description")}
          rows={2}
          placeholder={isReceipt ? "Cotisation, subvention..." : "Achat, location..."}
        />
        <Textarea
          label={`${descLabel} (AR)`}
          {...register("descriptionAr")}
          rows={2}
          rtl
          placeholder={isReceipt ? "اشتراك، منحة..." : "شراء، كراء..."}
        />
      </div>

      <Textarea
        label={t(lang, "notes")}
        {...register("notes")}
        rows={2}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {t(lang, "save")}
        </Button>
      </div>
    </form>
  );
}
