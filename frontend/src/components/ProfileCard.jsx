import React, { useEffect, useState } from "react";
import api from "../api/api";

function ProfileCard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const response = await api.get("/profile/1");
      setProfile(response.data);
    } catch (error) {
      console.error("Profil kartı alınamadı:", error);
    }
  };

  if (!profile) {
    return (
      <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              Profil
            </span>

            <h2 className="mt-1 text-xl font-black text-slate-50">
              Profil Bilgileri
            </h2>
          </div>

          <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-black text-yellow-200">
            Veri yok
          </span>
        </div>

        <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
          Profil bilgilerin henüz yüklenmedi veya oluşturulmadı.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
            Profil / Kalori
          </span>

          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
            Kalori Profil Özeti
          </h2>

          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            BMR, TDEE ve hedef kalorinin kısa özeti.
          </p>
        </div>

        <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-200">
          {getGoalLabel(profile.goal)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniCard
          label="Yaş"
          value={profile.age || "-"}
          description="Profil yaşı"
        />

        <MiniCard
          label="Boy"
          value={profile.height_cm ? `${profile.height_cm} cm` : "-"}
          description="Boy bilgisi"
        />

        <MiniCard
          label="Kilo"
          value={profile.weight_kg ? `${profile.weight_kg} kg` : "-"}
          description="Güncel kilo"
        />

        <MiniCard
          label="Aktivite"
          value={getActivityLabel(profile.activity_level)}
          description="Harcama çarpanı"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ResultCard
          label="BMR"
          value={profile.bmr ? `${profile.bmr} kcal` : "-"}
          description="Bazal metabolizma"
          tone="blue"
        />

        <ResultCard
          label="TDEE"
          value={profile.tdee ? `${profile.tdee} kcal` : "-"}
          description="Günlük enerji harcaması"
          tone="violet"
        />

        <ResultCard
          label="Hedef"
          value={
            profile.target_calories ? `${profile.target_calories} kcal` : "-"
          }
          description="Günlük hedef kalori"
          tone="emerald"
        />
      </div>
    </section>
  );
}

function MiniCard({ label, value, description }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-4">
      <span className="block text-xs font-bold text-slate-400">{label}</span>

      <strong className="mt-1 block break-words text-lg font-black text-slate-50">
        {value}
      </strong>

      <small className="mt-1 block text-xs font-semibold text-slate-500">
        {description}
      </small>
    </div>
  );
}

function ResultCard({ label, value, description, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600/16 to-slate-900 border-blue-400/20",
    violet: "from-violet-600/16 to-slate-900 border-violet-400/20",
    emerald: "from-emerald-600/16 to-slate-900 border-emerald-400/20",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border bg-gradient-to-br p-4 shadow-lg shadow-black/15 ${tones[tone]}`}
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

function getActivityLabel(value) {
  const labels = {
    sedentary: "Hareketsiz",
    light: "Hafif aktif",
    moderate: "Orta aktif",
    active: "Aktif",
    very_active: "Çok aktif",
  };

  return labels[value] || "Orta aktif";
}

function getGoalLabel(value) {
  const labels = {
    lose: "Kilo vermek",
    maintain: "Korumak",
    gain: "Kilo almak",
  };

  return labels[value] || "Korumak";
}

export default ProfileCard;