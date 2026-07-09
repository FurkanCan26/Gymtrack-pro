import React, { useEffect, useState } from "react";
import api from "../api/api";
import ProfileCard from "./ProfileCard";

function Dashboard() {
  const today = getTodayDate();

  const [profile, setProfile] = useState(null);
  const [dailyTracking, setDailyTracking] = useState(null);
  const [dailyVolume, setDailyVolume] = useState(null);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    refreshDashboard();
  }, []);

  const refreshDashboard = async () => {
    await Promise.all([
      getProfile(),
      getTodayTracking(),
      getDailyVolume(),
      getMeasurements(),
    ]);
  };

  const getProfile = async () => {
    try {
      const response = await api.get("/profile/1");
      setProfile(response.data);
    } catch (error) {
      console.error("Profil alınamadı:", error);
    }
  };

  const getTodayTracking = async () => {
    try {
      const response = await api.get("/daily-tracking/1");

      const todayData = response.data.find((item) => {
        const cleanDate = String(item.tracking_date).split("T")[0];
        return cleanDate === today;
      });

      setDailyTracking(todayData || null);
    } catch (error) {
      console.error("Bugünkü takip alınamadı:", error);
    }
  };

  const getDailyVolume = async () => {
    try {
      const response = await api.get(`/workout-logs/1/daily-volume/${today}`);
      setDailyVolume(response.data);
    } catch (error) {
      console.error("Günlük hacim alınamadı:", error);
    }
  };

  const getMeasurements = async () => {
    try {
      const response = await api.get("/measurements/1");
      setMeasurements(response.data);
    } catch (error) {
      console.error("Ölçümler alınamadı:", error);
    }
  };

  const targetCalories = Number(profile?.target_calories || 0);
  const todayCalories = Number(dailyTracking?.calories || 0);
  const waterLiter = Number(dailyTracking?.water_ml || 0) / 1000;
  const remainingCalories = targetCalories - todayCalories;
  const caloriePercent = getCaloriePercent(todayCalories, targetCalories);
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  const calorieStatus = getCalorieStatus(profile, dailyTracking, remainingCalories);
  const isOverCalories = profile && dailyTracking && remainingCalories < 0;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[26px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/50 p-5 shadow-xl shadow-black/25">
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/16 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative grid items-center gap-5 xl:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            <div>
              <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-sky-300">
                Bugünkü Durum
              </span>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-50">
                Hedefe giden yolu sayılarla yönet.
              </h2>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-300">
                Kalori, su, antrenman hacmi ve son ölçüm bilgilerin tek yerde.
                Bugün veri girdikçe panel otomatik anlam kazanır.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={refreshDashboard}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 hover:bg-blue-500"
              >
                Paneli Yenile
              </button>

              <span
                className={`rounded-xl border px-4 py-3 text-xs font-black ${
                  isOverCalories
                    ? "border-red-400/30 bg-red-500/10 text-red-200"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {calorieStatus}
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-700/60 bg-slate-950/45 p-5 text-center shadow-xl shadow-black/25">
            <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-[conic-gradient(from_180deg,#38bdf8,#2563eb,#7c3aed,#38bdf8)] p-4 shadow-xl shadow-blue-700/25">
              <div className="grid h-full w-full place-items-center rounded-full bg-slate-950">
                <div>
                  <strong className="block text-3xl font-black text-slate-50">
                    {caloriePercent}%
                  </strong>
                  <span className="text-sm font-semibold text-slate-400">
                    Kalori
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold leading-6 text-slate-200">
              {profile && dailyTracking
                ? remainingCalories >= 0
                  ? `${remainingCalories} kcal hakkın kaldı.`
                  : `${Math.abs(remainingCalories)} kcal aştın.`
                : "Bugün için kalori kaydı bekleniyor."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bugünkü Kalori"
          value={dailyTracking ? `${todayCalories} kcal` : "Veri yok"}
          description="Günlük beslenme kaydı"
          tone="blue"
        />

        <StatCard
          label="Hedef Kalori"
          value={profile ? `${targetCalories} kcal` : "Veri yok"}
          description="BMR / TDEE hesabına göre"
          tone="violet"
        />

        <StatCard
          label={remainingCalories < 0 ? "Aşılan Kalori" : "Kalan Kalori"}
          value={profile ? `${Math.abs(remainingCalories)} kcal` : "Veri yok"}
          description="Hedef durum takibi"
          tone={remainingCalories < 0 ? "red" : "emerald"}
        />

        <StatCard
          label="Bugünkü Su"
          value={dailyTracking ? `${waterLiter.toFixed(2)} L` : "Veri yok"}
          description="Hidrasyon takibi"
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                Kalori
              </span>
              <h2 className="mt-1 text-xl font-black text-slate-50">
                Kalori Durumu
              </h2>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                isOverCalories
                  ? "bg-red-500/10 text-red-200"
                  : "bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {calorieStatus}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <MiniInfo label="Hedef" value={profile ? `${targetCalories} kcal` : "-"} />
            <MiniInfo label="Bugün" value={dailyTracking ? `${todayCalories} kcal` : "-"} />
            <MiniInfo label="Durum" value={calorieStatus} />
          </div>

          {profile && dailyTracking ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Kalori ilerlemesi</span>
                <strong className="text-slate-50">{caloriePercent}%</strong>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    isOverCalories
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gradient-to-r from-sky-400 to-blue-600"
                  }`}
                  style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                />
              </div>

              <p className="mt-3 text-xs font-medium leading-5 text-slate-400">
                {remainingCalories >= 0
                  ? `Hedef kalorine ulaşmak için yaklaşık ${remainingCalories} kcal hakkın kaldı.`
                  : `Bugün hedef kaloriyi yaklaşık ${Math.abs(remainingCalories)} kcal aştın.`}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xs font-medium leading-5 text-slate-400">
              Bugün için günlük takip kaydı girersen bu alan otomatik dolar.
            </p>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="mb-4">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">
              Antrenman
            </span>
            <h2 className="mt-1 text-xl font-black text-slate-50">
              Bugünkü Antrenman
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <MiniInfo
              label="Toplam Hacim"
              value={dailyVolume ? `${dailyVolume.total_volume_kg} kg` : "0 kg"}
            />
            <MiniInfo
              label="Toplam Set"
              value={dailyVolume ? dailyVolume.total_sets : 0}
            />
            <MiniInfo label="Tarih" value={formatDate(today)} />
            <MiniInfo
              label="Son Kilo"
              value={
                latestMeasurement?.weight_kg
                  ? `${latestMeasurement.weight_kg} kg`
                  : "Veri yok"
              }
            />
          </div>
        </div>
      </section>

      <ProfileCard />

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <h2 className="mb-4 text-xl font-black text-slate-50">
            Bugünkü Özet
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            <MiniInfo
              label="Kalori"
              value={dailyTracking ? `${todayCalories} kcal` : "-"}
            />
            <MiniInfo
              label="Su"
              value={
                dailyTracking
                  ? `${dailyTracking.water_ml} ml / ${waterLiter.toFixed(2)} L`
                  : "-"
              }
            />
            <MiniInfo
              label="Set"
              value={dailyVolume ? dailyVolume.total_sets : 0}
            />
            <MiniInfo
              label="Hacim"
              value={dailyVolume ? `${dailyVolume.total_volume_kg} kg` : "0 kg"}
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <h2 className="mb-4 text-xl font-black text-slate-50">
            Son Ölçüm
          </h2>

          {latestMeasurement ? (
            <div className="grid gap-3 md:grid-cols-2">
              <MiniInfo
                label="Tarih"
                value={formatDate(latestMeasurement.measurement_date)}
              />
              <MiniInfo
                label="Kilo"
                value={`${latestMeasurement.weight_kg || "-"} kg`}
              />
              <MiniInfo
                label="Yağ Oranı"
                value={`${latestMeasurement.body_fat_percentage || "-"}%`}
              />
              <MiniInfo
                label="Bel"
                value={`${latestMeasurement.waist_cm || "-"} cm`}
              />
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-400">
              Henüz ölçüm yok.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, description, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600/16 to-slate-900 border-blue-400/20",
    violet: "from-violet-600/16 to-slate-900 border-violet-400/20",
    emerald: "from-emerald-600/16 to-slate-900 border-emerald-400/20",
    red: "from-red-600/16 to-slate-900 border-red-400/20",
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

      <strong className="relative mt-2 block text-2xl font-black text-slate-50">
        {value}
      </strong>

      <small className="relative mt-1 block text-xs font-semibold text-slate-500">
        {description}
      </small>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-4">
      <span className="block text-xs font-bold text-slate-400">{label}</span>
      <strong className="mt-1 block break-words text-base font-black text-slate-50">
        {value}
      </strong>
    </div>
  );
}

function getCalorieStatus(profile, dailyTracking, remainingCalories) {
  if (!profile) return "Profil verisi yok";
  if (!dailyTracking) return "Bugün veri yok";

  if (remainingCalories > 300) return "Hedefin altındasın";
  if (remainingCalories >= 0) return "Hedefe yakınsın";
  return "Hedefi aştın";
}

function getCaloriePercent(todayCalories, targetCalories) {
  if (!targetCalories || targetCalories <= 0) return 0;
  return Math.round((todayCalories / targetCalories) * 100);
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

export default Dashboard;