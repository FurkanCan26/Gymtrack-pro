import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import api from "../api/api";

function Measurements() {
  const today = getTodayDate();

  const [measurements, setMeasurements] = useState([]);

  const [measurementDate, setMeasurementDate] = useState(today);
  const [weightKg, setWeightKg] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [armCm, setArmCm] = useState("");
  const [shoulderCm, setShoulderCm] = useState("");
  const [note, setNote] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getMeasurements();
  }, []);

  const getMeasurements = async () => {
    try {
      const response = await api.get("/measurements/1");
      setMeasurements(response.data);
    } catch (error) {
      console.error("Ölçümler alınamadı:", error);
      toast.error("Ölçümler alınamadı.");
    }
  };

  const saveMeasurement = async (e) => {
    e.preventDefault();

    if (!measurementDate) {
      toast.warning("Tarih seçmelisin.");
      return;
    }

    if (!weightKg && !bodyFatPercentage && !waistCm && !chestCm && !armCm && !shoulderCm) {
      toast.warning("En az bir ölçüm değeri girmelisin.");
      return;
    }

    try {
      setIsProcessing(true);

      await api.post("/measurements", {
        user_id: 1,
        measurement_date: measurementDate,
        weight_kg: parseDecimalOrNull(weightKg),
        body_fat_percentage: parseDecimalOrNull(bodyFatPercentage),
        waist_cm: parseDecimalOrNull(waistCm),
        chest_cm: parseDecimalOrNull(chestCm),
        arm_cm: parseDecimalOrNull(armCm),
        shoulder_cm: parseDecimalOrNull(shoulderCm),
        note,
      });

      resetForm();
      await getMeasurements();

      toast.success("Ölçüm kaydedildi.");
    } catch (error) {
      console.error("Ölçüm kaydedilemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Ölçüm kaydedilemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestDeleteMeasurement = (measurement) => {
    setDeleteTarget(measurement);
  };

  const deleteMeasurement = async () => {
    if (!deleteTarget) return;

    try {
      setIsProcessing(true);

      await api.delete(`/measurements/${deleteTarget.id}`);
      await getMeasurements();

      toast.success("Ölçüm silindi.");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Ölçüm silinemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Ölçüm silinemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setMeasurementDate(today);
    setWeightKg("");
    setBodyFatPercentage("");
    setWaistCm("");
    setChestCm("");
    setArmCm("");
    setShoulderCm("");
    setNote("");
  };

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const previousMeasurement = measurements.length > 1 ? measurements[1] : null;

  const weightChange =
    latestMeasurement && previousMeasurement
      ? Number(latestMeasurement.weight_kg || 0) -
        Number(previousMeasurement.weight_kg || 0)
      : null;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Toplam Ölçüm"
          value={measurements.length}
          description="Kayıtlı ölçüm"
          tone="blue"
        />

        <SummaryStat
          label="Son Kilo"
          value={
            latestMeasurement?.weight_kg
              ? `${latestMeasurement.weight_kg} kg`
              : "Veri yok"
          }
          description="En güncel ölçüm"
          tone="violet"
        />

        <SummaryStat
          label="Kilo Değişimi"
          value={
            weightChange === null
              ? "Veri yok"
              : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg`
          }
          description="Son iki ölçüm"
          tone={weightChange !== null && weightChange <= 0 ? "emerald" : "cyan"}
        />

        <SummaryStat
          label="Son Yağ Oranı"
          value={
            latestMeasurement?.body_fat_percentage
              ? `${latestMeasurement.body_fat_percentage}%`
              : "Veri yok"
          }
          description="Vücut kompozisyonu"
          tone="emerald"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              Yeni Ölçüm
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Vücut Ölçümü Gir
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              Kilo, yağ oranı ve çevre ölçümlerini düzenli kaydet.
            </p>
          </div>

          <form className="relative space-y-4" onSubmit={saveMeasurement}>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Tarih">
                <input
                  type="date"
                  value={measurementDate}
                  onChange={(e) => setMeasurementDate(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Kilo kg">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 98.5"
                  value={weightKg}
                  onChange={(e) =>
                    setWeightKg(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Yağ Oranı %">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 19.5"
                  value={bodyFatPercentage}
                  onChange={(e) =>
                    setBodyFatPercentage(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Bel cm">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 88"
                  value={waistCm}
                  onChange={(e) =>
                    setWaistCm(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Göğüs cm">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 105"
                  value={chestCm}
                  onChange={(e) =>
                    setChestCm(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Kol cm">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 39"
                  value={armCm}
                  onChange={(e) =>
                    setArmCm(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Omuz cm">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 125"
                  value={shoulderCm}
                  onChange={(e) =>
                    setShoulderCm(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Not">
              <textarea
                placeholder="Sabah aç karna, pump sonrası, ölçüm detayı vs."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={textareaClass}
              />
            </FormField>

            <button
              type="submit"
              disabled={isProcessing}
              className={primaryButtonClass}
            >
              {isProcessing ? "Kaydediliyor..." : "Ölçüm Kaydet"}
            </button>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">
              Son Durum
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Güncel Ölçüm Özeti
            </h2>

            {latestMeasurement ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-[22px] border border-blue-400/20 bg-blue-500/10 p-5">
                  <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-blue-300">
                    Son ölçüm tarihi
                  </span>

                  <strong className="mt-2 block text-3xl font-black text-slate-50">
                    {formatDate(latestMeasurement.measurement_date)}
                  </strong>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniValue
                    label="Kilo"
                    value={`${latestMeasurement.weight_kg || "-"} kg`}
                  />
                  <MiniValue
                    label="Yağ"
                    value={`${latestMeasurement.body_fat_percentage || "-"}%`}
                  />
                  <MiniValue
                    label="Bel"
                    value={`${latestMeasurement.waist_cm || "-"} cm`}
                  />
                  <MiniValue
                    label="Kol"
                    value={`${latestMeasurement.arm_cm || "-"} cm`}
                  />
                </div>

                <p className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-4 text-xs font-semibold leading-5 text-slate-400">
                  {latestMeasurement.note || "Son ölçümde not bulunmuyor."}
                </p>
              </div>
            ) : (
              <EmptyState text="Henüz ölçüm yok. İlk ölçümü girince burası dolar." />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Geçmiş
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Ölçüm Geçmişi
            </h2>
          </div>

          <span className="w-fit rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 text-xs font-black text-slate-300">
            {measurements.length} ölçüm
          </span>
        </div>

        {measurements.length === 0 ? (
          <EmptyState text="Henüz ölçüm kaydı bulunmuyor." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {measurements.map((item) => (
              <article
                key={item.id}
                className="rounded-[22px] border border-slate-700/60 bg-slate-950/45 p-4 shadow-lg shadow-black/15"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-black text-slate-300">
                      {formatDate(item.measurement_date)}
                    </span>

                    <h3 className="mt-3 text-xl font-black text-slate-50">
                      {item.weight_kg ? `${item.weight_kg} kg` : "Kilo yok"}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.note || "Not yok"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => requestDeleteMeasurement(item)}
                    className={dangerButtonClass}
                  >
                    Sil
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <MiniValue
                    label="Yağ"
                    value={`${item.body_fat_percentage || "-"}%`}
                  />
                  <MiniValue label="Bel" value={`${item.waist_cm || "-"} cm`} />
                  <MiniValue
                    label="Göğüs"
                    value={`${item.chest_cm || "-"} cm`}
                  />
                  <MiniValue label="Kol" value={`${item.arm_cm || "-"} cm`} />
                  <MiniValue
                    label="Omuz"
                    value={`${item.shoulder_cm || "-"} cm`}
                  />
                  <MiniValue
                    label="Tarih"
                    value={formatDate(item.measurement_date)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteTarget &&
        createPortal(
          <ConfirmModal
            title="Ölçüm silinsin mi?"
            description={`${formatDate(
              deleteTarget.measurement_date
            )} tarihli ölçüm kaydı silinecek.`}
            confirmText="Evet, Sil"
            isProcessing={isProcessing}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={deleteMeasurement}
          />,
          document.body
        )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const textareaClass =
  "min-h-24 w-full resize-y rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-semibold leading-5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const primaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500 hover:text-white";

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryStat({ label, value, description, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600/16 to-slate-900 border-blue-400/20",
    violet: "from-violet-600/16 to-slate-900 border-violet-400/20",
    emerald: "from-emerald-600/16 to-slate-900 border-emerald-400/20",
    cyan: "from-cyan-600/16 to-slate-900 border-cyan-400/20",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border bg-gradient-to-br p-4 shadow-lg shadow-black/20 ${tones[tone]}`}
    >
      <div className="absolute -right-9 -top-9 h-24 w-24 rounded-full bg-white/5" />

      <span className="relative text-xs font-bold text-slate-400">
        {label}
      </span>

      <strong className="relative mt-2 block break-words text-xl font-black text-slate-50">
        {value}
      </strong>

      <small className="relative mt-1 block text-xs font-semibold text-slate-500">
        {description}
      </small>
    </div>
  );
}

function MiniValue({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/65 p-3 text-center">
      <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>

      <strong className="mt-1 block break-words text-sm font-black text-slate-50">
        {value}
      </strong>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
        ◇
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmText,
  isProcessing,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[99999] grid place-items-center bg-slate-950/75 p-6 backdrop-blur-xl"
      onClick={() => {
        if (!isProcessing) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-[26px] border border-slate-700/60 bg-slate-900 p-6 text-center shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-red-400/30 bg-red-500/10 text-2xl font-black text-red-200">
          !
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-50">{title}</h3>

        <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
          {description}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isProcessing}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-black text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
          >
            Vazgeç
          </button>

          <button
            type="button"
            disabled={isProcessing}
            className="rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
          >
            {isProcessing ? "İşleniyor..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function parseDecimalOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(String(value).replace(",", "."));

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const cleanDate = String(dateValue).split("T")[0];
  const [year, month, day] = cleanDate.split("-");

  if (!year || !month || !day) return cleanDate;

  return `${day}.${month}.${year}`;
}

export default Measurements;