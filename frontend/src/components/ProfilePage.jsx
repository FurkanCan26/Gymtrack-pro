import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [targetCalories, setTargetCalories] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const response = await api.get("/profile/1");
      const data = response.data;

      setProfile(data);

      setAge(data.age || "");
      setGender(data.gender || "male");
      setHeightCm(data.height_cm || "");
      setWeightKg(data.weight_kg || "");
      setActivityLevel(data.activity_level || "moderate");
      setGoal(data.goal || "maintain");
      setTargetCalories(data.target_calories || "");
    } catch (error) {
      console.error("Profil alınamadı:", error);
      toast.error("Profil bilgileri alınamadı.");
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!age || !heightCm || !weightKg) {
      toast.warning("Yaş, boy ve kilo alanları zorunlu.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        age: Number(age),
        gender,
        height_cm: Number(String(heightCm).replace(",", ".")),
        weight_kg: Number(String(weightKg).replace(",", ".")),
        activity_level: activityLevel,
        goal,
        target_calories: targetCalories ? Number(targetCalories) : null,
      };

      await api.put("/profile/1", payload);

      await getProfile();

      toast.success("Profil güncellendi.");
    } catch (error) {
      console.error("Profil kaydedilemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Profil kaydedilemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const calculatedBmr = calculateBmr({
    age,
    gender,
    heightCm,
    weightKg,
  });

  const calculatedTdee = calculateTdee(calculatedBmr, activityLevel);
  const suggestedCalories = calculateSuggestedCalories(calculatedTdee, goal);

  const handleUseSuggestedCalories = () => {
    if (!suggestedCalories) {
      toast.warning("Önce yaş, boy ve kilo bilgilerini doldurmalısın.");
      return;
    }

    setTargetCalories(String(suggestedCalories));
    toast.success("Önerilen hedef kalori forma aktarıldı.");
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="BMR"
          value={calculatedBmr ? `${calculatedBmr} kcal` : "Veri yok"}
          description="Bazal metabolizma"
          tone="blue"
        />

        <SummaryStat
          label="TDEE"
          value={calculatedTdee ? `${calculatedTdee} kcal` : "Veri yok"}
          description="Günlük harcama"
          tone="violet"
        />

        <SummaryStat
          label="Hedef Kalori"
          value={targetCalories ? `${targetCalories} kcal` : "Veri yok"}
          description="Günlük hedef"
          tone="emerald"
        />

        <SummaryStat
          label="Hedef"
          value={getGoalLabel(goal)}
          description="Kalori yönü"
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              Profil
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Kalori Profilini Güncelle
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              BMR, TDEE ve hedef kalori hesabı için temel bilgilerini gir.
            </p>
          </div>

          <form className="relative space-y-4" onSubmit={saveProfile}>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Yaş">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 23"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, ""))}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Cinsiyet">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                >
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </FormField>

              <FormField label="Boy cm">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 188"
                  value={heightCm}
                  onChange={(e) =>
                    setHeightCm(e.target.value.replace(/[^\d.,]/g, ""))
                  }
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

              <FormField label="Aktivite Seviyesi">
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className={inputClass}
                >
                  <option value="sedentary">Hareketsiz</option>
                  <option value="light">Hafif aktif</option>
                  <option value="moderate">Orta aktif</option>
                  <option value="active">Aktif</option>
                  <option value="very_active">Çok aktif</option>
                </select>
              </FormField>

              <FormField label="Hedef">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={inputClass}
                >
                  <option value="lose">Kilo vermek</option>
                  <option value="maintain">Korumak</option>
                  <option value="gain">Kilo almak</option>
                </select>
              </FormField>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <FormField label="Hedef Kalori">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 2400"
                  value={targetCalories}
                  onChange={(e) =>
                    setTargetCalories(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleUseSuggestedCalories}
                  className="w-full rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-xs font-black text-sky-200 hover:bg-sky-500 hover:text-white md:w-auto"
                >
                  Öneriyi Kullan
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={primaryButtonClass}
            >
              {isSaving ? "Kaydediliyor..." : "Profili Kaydet"}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="relative">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">
                Hesaplama
              </span>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
                Kalori Sonucu
              </h2>

              <div className="mt-5 space-y-3">
                <ResultCard
                  label="BMR"
                  value={calculatedBmr ? `${calculatedBmr} kcal` : "-"}
                  description="Hiç hareket etmesen bile vücudun yaklaşık yakacağı enerji."
                />

                <ResultCard
                  label="TDEE"
                  value={calculatedTdee ? `${calculatedTdee} kcal` : "-"}
                  description="Aktivite seviyen dahil tahmini günlük enerji harcaman."
                />

                <ResultCard
                  label="Önerilen Hedef"
                  value={suggestedCalories ? `${suggestedCalories} kcal` : "-"}
                  description={`${getGoalLabel(goal)} hedefi için önerilen kalori.`}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Güncel Profil
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Kayıtlı Bilgiler
            </h2>

            {profile ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniValue label="Yaş" value={profile.age || "-"} />
                <MiniValue
                  label="Cinsiyet"
                  value={profile.gender === "female" ? "Kadın" : "Erkek"}
                />
                <MiniValue
                  label="Boy"
                  value={profile.height_cm ? `${profile.height_cm} cm` : "-"}
                />
                <MiniValue
                  label="Kilo"
                  value={profile.weight_kg ? `${profile.weight_kg} kg` : "-"}
                />
                <MiniValue
                  label="Aktivite"
                  value={getActivityLabel(profile.activity_level)}
                />
                <MiniValue label="Hedef" value={getGoalLabel(profile.goal)} />
              </div>
            ) : (
              <EmptyState text="Profil bilgisi bulunamadı." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

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

function ResultCard({ label, value, description }) {
  return (
    <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/45 p-4">
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>

      <strong className="mt-2 block text-2xl font-black text-slate-50">
        {value}
      </strong>

      <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function MiniValue({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-3 text-center">
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
        ◉
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function calculateBmr({ age, gender, heightCm, weightKg }) {
  const parsedAge = Number(age);
  const parsedHeight = Number(String(heightCm).replace(",", "."));
  const parsedWeight = Number(String(weightKg).replace(",", "."));

  if (!parsedAge || !parsedHeight || !parsedWeight) {
    return 0;
  }

  let bmr;

  if (gender === "female") {
    bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge - 161;
  } else {
    bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + 5;
  }

  return Math.round(bmr);
}

function calculateTdee(bmr, activityLevel) {
  if (!bmr) return 0;

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

function calculateSuggestedCalories(tdee, goal) {
  if (!tdee) return 0;

  if (goal === "lose") return tdee - 500;
  if (goal === "gain") return tdee + 300;

  return tdee;
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

export default ProfilePage;