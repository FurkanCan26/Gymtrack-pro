import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import api from "../api/api";

function WorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [dayName, setDayName] = useState("");
  const [planName, setPlanName] = useState("");

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getPlans();
    getExercises();
  }, []);

  const getPlans = async () => {
    try {
      const response = await api.get("/workout-plans/1");
      setPlans(response.data);
    } catch (error) {
      console.error("Program getirme hatası:", error);
      toast.error("Programlar alınamadı.");
    }
  };

  const getExercises = async () => {
    try {
      const response = await api.get("/exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Egzersiz getirme hatası:", error);
      toast.error("Egzersizler alınamadı.");
    }
  };

  const createPlan = async (e) => {
    e.preventDefault();

    if (!dayName.trim() || !planName.trim()) {
      toast.warning("Gün adı ve program adı zorunlu.");
      return;
    }

    try {
      setIsProcessing(true);

      await api.post("/workout-plans", {
        user_id: 1,
        day_name: dayName,
        plan_name: planName,
      });

      setDayName("");
      setPlanName("");

      await getPlans();

      toast.success("Program oluşturuldu.");
    } catch (error) {
      console.error("Program oluşturma hatası:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Program oluşturulamadı.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const addExerciseToPlan = async (e) => {
    e.preventDefault();

    if (!selectedPlanId || !selectedExerciseId) {
      toast.warning("Program ve hareket seçmelisin.");
      return;
    }

    try {
      setIsProcessing(true);

      const selectedPlan = plans.find(
        (plan) => Number(plan.id) === Number(selectedPlanId)
      );

      const order = selectedPlan ? selectedPlan.exercises.length + 1 : 1;

      await api.post(`/workout-plans/${selectedPlanId}/exercises`, {
        exercise_id: Number(selectedExerciseId),
        exercise_order: order,
        target_sets: targetSets ? Number(targetSets) : null,
        target_reps: targetReps || null,
        target_weight: null,
        note: "",
      });

      setSelectedExerciseId("");
      setTargetSets("");
      setTargetReps("");

      await getPlans();

      toast.success("Hareket programa eklendi.");
    } catch (error) {
      console.error("Programa hareket ekleme hatası:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Programa hareket eklenemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestDeletePlanExercise = (planExerciseId) => {
    setConfirmAction({
      type: "delete-plan-exercise",
      title: "Hareket silinsin mi?",
      description: "Bu hareket program şablonundan kaldırılacak.",
      confirmText: "Evet, Sil",
      payload: planExerciseId,
    });
  };

  const deletePlanExercise = async (planExerciseId) => {
    try {
      setIsProcessing(true);

      await api.delete(`/workout-plans/exercise/${planExerciseId}`);
      await getPlans();

      toast.success("Hareket programdan silindi.");
      setConfirmAction(null);
    } catch (error) {
      console.error("Program hareketi silinemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Hareket silinemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestDeletePlan = (planId, planName) => {
    setConfirmAction({
      type: "delete-plan",
      title: "Program silinsin mi?",
      description: `${planName} programı silinecek. Geçmiş antrenman kayıtların silinmez.`,
      confirmText: "Evet, Programı Sil",
      payload: planId,
    });
  };

  const deletePlan = async (planId) => {
    try {
      setIsProcessing(true);

      await api.delete(`/workout-plans/${planId}`);
      await getPlans();

      if (Number(selectedPlanId) === Number(planId)) {
        setSelectedPlanId("");
      }

      toast.success("Program silindi.");
      setConfirmAction(null);
    } catch (error) {
      console.error("Program silinemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Program silinemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "delete-plan-exercise") {
      await deletePlanExercise(confirmAction.payload);
      return;
    }

    if (confirmAction.type === "delete-plan") {
      await deletePlan(confirmAction.payload);
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Toplam Program"
          value={plans.length}
          description="Aktif şablon"
          tone="blue"
        />

        <SummaryStat
          label="Planlı Hareket"
          value={getTotalPlanExercises(plans)}
          description="Toplam hareket"
          tone="violet"
        />

        <SummaryStat
          label="Egzersiz Havuzu"
          value={exercises.length}
          description="Kullanılabilir"
          tone="emerald"
        />

        <SummaryStat
          label="Başlatma"
          value="Kayıt"
          description="Antrenman Kaydı"
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative">
            <SectionTitle
              eyebrow="Yeni Şablon"
              title="Program Günü Oluştur"
              description="Haftalık antrenman düzenin için program şablonu oluştur."
            />

            <form className="space-y-4" onSubmit={createPlan}>
              <FormField label="Gün Adı">
                <input
                  type="text"
                  placeholder="Örn: Pazartesi"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Program Adı">
                <input
                  type="text"
                  placeholder="Örn: Push Günü"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <button
                type="submit"
                disabled={isProcessing}
                className={primaryButtonClass}
              >
                Program Oluştur
              </button>
            </form>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative">
            <SectionTitle
              eyebrow="Hareket Ekle"
              title="Programa Hareket Ekle"
              description="Seçili programa hedef set ve tekrar bilgisiyle hareket ekle."
            />

            <form className="space-y-4" onSubmit={addExerciseToPlan}>
              <FormField label="Program">
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Program seç</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.day_name} - {plan.plan_name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Hareket">
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Hareket seç</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} - {exercise.muscle_group}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Hedef Set">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Örn: 4"
                    value={targetSets}
                    onChange={(e) =>
                      setTargetSets(e.target.value.replace(/[^\d]/g, ""))
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Hedef Tekrar">
                  <input
                    type="text"
                    placeholder="Örn: 8-10"
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={primaryButtonClass}
              >
                Hareket Ekle
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Şablonlar
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Antrenman Programları
            </h2>

            <p className="mt-1 max-w-3xl text-xs font-semibold leading-5 text-slate-400">
              Burada sadece program şablonlarını yönetirsin. Program başlatma
              işlemi Antrenman Kaydı sayfasından yapılır.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 text-xs font-black text-slate-300">
            {plans.length} program
          </span>
        </div>

        {plans.length === 0 ? (
          <EmptyState text="Henüz antrenman programı oluşturmadın." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="overflow-hidden rounded-[22px] border border-slate-700/60 bg-slate-950/45 shadow-lg shadow-black/15"
              >
                <div className="flex flex-col gap-4 border-b border-slate-700/60 p-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1.5 text-[11px] font-black text-blue-200">
                      {plan.day_name}
                    </span>

                    <h3 className="mt-3 text-xl font-black text-slate-50">
                      {plan.plan_name}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {plan.exercises.length} hareket
                    </p>
                  </div>

                  <button
                    type="button"
                    className={dangerButtonClass}
                    onClick={() => requestDeletePlan(plan.id, plan.plan_name)}
                  >
                    Programı Sil
                  </button>
                </div>

                {plan.exercises.length === 0 ? (
                  <p className="p-4 text-xs font-semibold text-slate-400">
                    Henüz hareket eklenmedi.
                  </p>
                ) : (
                  <div className="space-y-2 p-4">
                    {plan.exercises.map((exercise) => (
                      <div
                        key={exercise.plan_exercise_id}
                        className="grid gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 md:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <div className="min-w-0">
                          <strong className="block break-words text-sm font-black text-slate-50">
                            {exercise.exercise_order}. {exercise.name}
                          </strong>

                          <span className="mt-1 block text-xs font-semibold text-slate-500">
                            {exercise.muscle_group}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <TargetBadge value={`${exercise.target_sets || "-"} set`} />
                          <TargetBadge
                            value={`${exercise.target_reps || "-"} tekrar`}
                          />

                          <button
                            type="button"
                            className={miniDangerButtonClass}
                            onClick={() =>
                              requestDeletePlanExercise(
                                exercise.plan_exercise_id
                              )
                            }
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {confirmAction &&
        createPortal(
          <ConfirmModal
            confirmAction={confirmAction}
            isProcessing={isProcessing}
            onCancel={() => setConfirmAction(null)}
            onConfirm={handleConfirm}
          />,
          document.body
        )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const primaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500 hover:text-white";

const miniDangerButtonClass =
  "rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-black text-red-200 hover:bg-red-500 hover:text-white";

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
        {eyebrow}
      </span>

      <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
        {title}
      </h2>

      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

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

function TargetBadge({ value }) {
  return (
    <span className="rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1.5 text-[11px] font-black text-slate-300">
      {value}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
        ▦
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function ConfirmModal({ confirmAction, isProcessing, onCancel, onConfirm }) {
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

        <h3 className="mt-4 text-xl font-black text-slate-50">
          {confirmAction.title}
        </h3>

        <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
          {confirmAction.description}
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
            {isProcessing ? "İşleniyor..." : confirmAction.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTotalPlanExercises(plans) {
  return plans.reduce((total, plan) => total + plan.exercises.length, 0);
}

export default WorkoutPlans;