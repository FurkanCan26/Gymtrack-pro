import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

function DailyTracking() {
  const today = new Date().toISOString().split("T")[0];

  const [trackings, setTrackings] = useState([]);
  const [summary, setSummary] = useState(null);

  const [trackingDate, setTrackingDate] = useState(today);
  const [calories, setCalories] = useState("");
  const [waterMl, setWaterMl] = useState("");
  const [bodyWeightKg, setBodyWeightKg] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getTrackings();
    getSummary();
  }, []);

  const getTrackings = async () => {
    try {
      const response = await api.get("/daily-tracking/1");
      setTrackings(response.data);
    } catch (error) {
      console.error("Günlük takipler alınamadı:", error);
      toast.error("Günlük takipler alınamadı.");
    }
  };

  const getSummary = async () => {
    try {
      const response = await api.get("/daily-tracking/1/summary");
      setSummary(response.data);
    } catch (error) {
      console.error("Özet alınamadı:", error);
      toast.error("Günlük özet alınamadı.");
    }
  };

  const saveTracking = async (e) => {
    e.preventDefault();

    if (!trackingDate) {
      toast.warning("Tarih seçmelisin.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        user_id: 1,
        tracking_date: trackingDate,
        calories: parseWholeNumber(calories),
        water_ml: parseWholeNumber(waterMl),
        body_weight_kg: bodyWeightKg
          ? Number(String(bodyWeightKg).replace(",", "."))
          : null,
        note,
      };

      const response = await api.post("/daily-tracking", payload);

      setCalories("");
      setWaterMl("");
      setBodyWeightKg("");
      setNote("");

      await getTrackings();
      await getSummary();

      toast.success(response.data.message || "Günlük takip kaydedildi.");
    } catch (error) {
      console.error("Günlük takip kaydedilemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Backend kayıt hatası.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const waterLiterPreview = waterMl
    ? (parseWholeNumber(waterMl) / 1000).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Takip Günü"
          value={summary ? summary.total_tracking_days : 0}
          description="Toplam kayıt"
          tone="blue"
        />

        <SummaryStat
          label="Ortalama Kalori"
          value={summary ? `${summary.average_calories} kcal` : "0 kcal"}
          description="Günlük ortalama"
          tone="violet"
        />

        <SummaryStat
          label="Ortalama Su"
          value={summary ? `${summary.average_water_liter} L` : "0 L"}
          description="Günlük ortalama"
          tone="cyan"
        />

        <SummaryStat
          label="Toplam Su"
          value={summary ? `${summary.total_water_liter} L` : "0 L"}
          description="Tüm kayıtlar"
          tone="emerald"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              Günlük Veri
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Günlük Veri Gir
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              Kalori, su, kilo ve günlük notlarını tek kayıtta takip et.
            </p>
          </div>

          <form className="relative space-y-4" onSubmit={saveTracking}>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Tarih">
                <input
                  type="date"
                  value={trackingDate}
                  onChange={(e) => setTrackingDate(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Kalori">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 1850"
                  value={calories}
                  onChange={(e) =>
                    setCalories(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Su ml">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 3200"
                  value={waterMl}
                  onChange={(e) =>
                    setWaterMl(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Kilo kg">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 98.7"
                  value={bodyWeightKg}
                  onChange={(e) =>
                    setBodyWeightKg(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Not">
              <textarea
                placeholder="Bugünkü beslenme, enerji, kaçamak vs."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={textareaClass}
              />
            </FormField>

            <button
              type="submit"
              disabled={isSaving}
              className={primaryButtonClass}
            >
              {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-600/10 blur-3xl" />

          <div className="relative">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">
              Su Takibi
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Su Çevirici
            </h2>

            <div className="mt-5 rounded-[22px] border border-cyan-400/20 bg-cyan-500/10 p-5">
              <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-cyan-300">
                Girilen su
              </span>

              <strong className="mt-2 block break-words text-3xl font-black text-slate-50">
                {waterMl ? `${waterMl} ml` : "0 ml"}
              </strong>

              <p className="mt-2 text-lg font-black text-cyan-200">
                {waterLiterPreview} litre
              </p>
            </div>

            <p className="mt-4 rounded-xl border border-slate-700/60 bg-slate-950/45 p-4 text-xs font-semibold leading-5 text-slate-400">
              Aynı güne tekrar kayıt girersen kalori ve su mevcut kaydın üstüne
              eklenir.
            </p>
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
              Günlük Kayıtlar
            </h2>
          </div>

          <span className="w-fit rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 text-xs font-black text-slate-300">
            {trackings.length} kayıt
          </span>
        </div>

        {trackings.length === 0 ? (
          <EmptyState text="Henüz günlük takip kaydı yok." />
        ) : (
          <div className="space-y-3">
            {trackings.map((item) => {
              const waterMlValue = parseWholeNumber(item.water_ml);
              const waterLiterValue = (waterMlValue / 1000).toFixed(2);

              return (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-[22px] border border-slate-700/60 bg-slate-950/45 p-4 shadow-lg shadow-black/15 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-black text-slate-300">
                      {formatDate(item.tracking_date)}
                    </span>

                    <h3 className="mt-3 text-xl font-black text-slate-50">
                      {parseWholeNumber(item.calories)} kcal
                    </h3>

                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                      {item.note || "Not yok"}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 md:min-w-[320px]">
                    <TrackingValue label="Su" value={`${waterMlValue} ml`} />
                    <TrackingValue label="Litre" value={`${waterLiterValue} L`} />
                    <TrackingValue
                      label="Kilo"
                      value={`${item.body_weight_kg || "-"} kg`}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const textareaClass =
  "min-h-24 w-full resize-y rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-semibold leading-5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const primaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60";

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
    cyan: "from-cyan-600/16 to-slate-900 border-cyan-400/20",
    emerald: "from-emerald-600/16 to-slate-900 border-emerald-400/20",
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

function TrackingValue({ label, value }) {
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
        ◌
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function parseWholeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const cleaned = String(value).replace(",", ".").trim();
  const numberValue = Number(cleaned);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.round(numberValue);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  if (typeof dateValue === "string" && dateValue.includes("-")) {
    const [year, month, day] = dateValue.split("T")[0].split("-");
    return `${day}.${month}.${year}`;
  }

  return new Date(dateValue).toLocaleDateString("tr-TR");
}

export default DailyTracking;