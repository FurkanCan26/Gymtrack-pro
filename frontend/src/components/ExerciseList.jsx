import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

function ExerciseList() {
  const [exercises, setExercises] = useState([]);

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [description, setDescription] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("all");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getExercises();
  }, []);

  const getExercises = async () => {
    try {
      const response = await api.get("/exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Egzersizler alınamadı:", error);
      toast.error("Egzersizler alınamadı.");
    }
  };

  const addExercise = async (e) => {
    e.preventDefault();

    if (!name.trim() || !muscleGroup.trim()) {
      toast.warning("Hareket adı ve kas grubu zorunlu.");
      return;
    }

    try {
      setIsSaving(true);

      await api.post("/exercises", {
        name,
        muscle_group: muscleGroup,
        description,
      });

      setName("");
      setMuscleGroup("");
      setDescription("");

      await getExercises();

      toast.success("Egzersiz eklendi.");
    } catch (error) {
      console.error("Egzersiz eklenemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Egzersiz eklenemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const muscleGroups = useMemo(() => {
    const groups = exercises
      .map((exercise) => exercise.muscle_group)
      .filter(Boolean);

    return [...new Set(groups)];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const search = searchText.toLowerCase().trim();

      const matchesSearch =
        !search ||
        String(exercise.name || "").toLowerCase().includes(search) ||
        String(exercise.muscle_group || "").toLowerCase().includes(search) ||
        String(exercise.description || "").toLowerCase().includes(search);

      const matchesMuscle =
        selectedMuscleFilter === "all" ||
        exercise.muscle_group === selectedMuscleFilter;

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchText, selectedMuscleFilter]);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Toplam Egzersiz"
          value={exercises.length}
          description="Havuzdaki hareket"
          tone="blue"
        />

        <SummaryStat
          label="Kas Grubu"
          value={muscleGroups.length}
          description="Farklı kategori"
          tone="violet"
        />

        <SummaryStat
          label="Filtrelenen"
          value={filteredExercises.length}
          description="Görünen hareket"
          tone="emerald"
        />

        <SummaryStat
          label="Kullanım"
          value="Program"
          description="Şablonlarda kullanılır"
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              Yeni Hareket
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Egzersiz Ekle
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              Programlarda kullanacağın hareketleri egzersiz havuzuna ekle.
            </p>
          </div>

          <form className="relative space-y-4" onSubmit={addExercise}>
            <FormField label="Hareket Adı">
              <input
                type="text"
                placeholder="Örn: Bench Press"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Kas Grubu">
              <input
                type="text"
                placeholder="Örn: Göğüs"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Açıklama">
              <textarea
                placeholder="Form notu, dikkat edilecek noktalar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={textareaClass}
              />
            </FormField>

            <button
              type="submit"
              disabled={isSaving}
              className={primaryButtonClass}
            >
              {isSaving ? "Ekleniyor..." : "Egzersiz Ekle"}
            </button>
          </form>
        </div>

        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">
              Filtre
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Egzersiz Havuzu
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              Hareketleri isim, açıklama veya kas grubuna göre hızlıca bul.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <FormField label="Ara">
              <input
                type="text"
                placeholder="Hareket ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Kas Grubu">
              <select
                value={selectedMuscleFilter}
                onChange={(e) => setSelectedMuscleFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">Tümü</option>
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="mt-5">
            {filteredExercises.length === 0 ? (
              <EmptyState text="Bu filtreye uygun egzersiz bulunamadı." />
            ) : (
              <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
                {filteredExercises.map((exercise) => (
                  <article
                    key={exercise.id}
                    className="rounded-[22px] border border-slate-700/60 bg-slate-950/45 p-4 shadow-lg shadow-black/15"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1.5 text-[11px] font-black text-blue-200">
                          {exercise.muscle_group || "Genel"}
                        </span>

                        <h3 className="mt-3 break-words text-lg font-black text-slate-50">
                          {exercise.name}
                        </h3>
                      </div>

                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-sm font-black text-slate-300">
                        ☰
                      </div>
                    </div>

                    <p className="mt-3 min-h-10 text-xs font-semibold leading-5 text-slate-400">
                      {exercise.description || "Açıklama yok."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
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

function EmptyState({ text }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
        ☰
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

export default ExerciseList;