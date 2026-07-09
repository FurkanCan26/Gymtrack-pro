import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import api from "../api/api";

function WorkoutLogger() {
  const today = getTodayDate();

  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dailyVolume, setDailyVolume] = useState(null);

  const [workoutDate, setWorkoutDate] = useState(today);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNote, setWorkoutNote] = useState("");

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [activeWorkoutLogId, setActiveWorkoutLogId] = useState("");

  const [exerciseId, setExerciseId] = useState("");
  const [setCount, setSetCount] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [setNote, setSetNote] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getExercises();
    getPlans();
  }, []);

  useEffect(() => {
    getLogsByDate();
    getDailyVolume();
  }, [workoutDate]);

  const getExercises = async () => {
    try {
      const response = await api.get("/exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Egzersizler alınamadı:", error);
      toast.error("Egzersizler alınamadı.");
    }
  };

  const getPlans = async () => {
    try {
      const response = await api.get("/workout-plans/1");
      setPlans(response.data);
    } catch (error) {
      console.error("Programlar alınamadı:", error);
      toast.error("Programlar alınamadı.");
    }
  };

  const getLogsByDate = async () => {
    try {
      const response = await api.get(`/workout-logs/1/date/${workoutDate}`);
      setLogs(response.data);

      if (response.data.length > 0) {
        setActiveWorkoutLogId(String(response.data[0].id));
      } else {
        setActiveWorkoutLogId("");
      }

      resetSetForm();
    } catch (error) {
      console.error("Antrenman kayıtları alınamadı:", error);
      toast.error("Antrenman kayıtları alınamadı.");
    }
  };

  const getDailyVolume = async () => {
    try {
      const response = await api.get(
        `/workout-logs/1/daily-volume/${workoutDate}`
      );
      setDailyVolume(response.data);
    } catch (error) {
      console.error("Günlük hacim alınamadı:", error);
      toast.error("Günlük hacim alınamadı.");
    }
  };

  const createFreeWorkoutLog = async (e) => {
    e.preventDefault();

    if (!workoutDate) {
      toast.warning("Tarih seçmelisin.");
      return;
    }

    if (!workoutName.trim()) {
      toast.warning("Antrenman adı yazmalısın.");
      return;
    }

    try {
      setIsProcessing(true);

      const response = await api.post("/workout-logs", {
        user_id: 1,
        workout_plan_id: null,
        workout_date: workoutDate,
        workout_name: workoutName,
        note: workoutNote,
      });

      setActiveWorkoutLogId(String(response.data.workoutLogId));
      setWorkoutName("");
      setWorkoutNote("");
      setSelectedPlanId("");

      await getLogsByDate();
      await getDailyVolume();

      toast.success("Serbest antrenman başlatıldı.");
    } catch (error) {
      console.error("Serbest antrenman oluşturulamadı:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Antrenman oluşturulamadı.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestStartWorkoutFromPlan = () => {
    if (!workoutDate) {
      toast.warning("Tarih seçmelisin.");
      return;
    }

    if (!selectedPlanId) {
      toast.warning("Başlatmak için bir program seçmelisin.");
      return;
    }

    const selectedPlan = plans.find(
      (plan) => Number(plan.id) === Number(selectedPlanId)
    );

    if (!selectedPlan) {
      toast.error("Seçilen program bulunamadı.");
      return;
    }

    setConfirmAction({
      type: "start-plan",
      title: "Program başlatılsın mı?",
      description: `${selectedPlan.plan_name} programı ${formatDate(
        workoutDate
      )} tarihi için başlatılacak.`,
      confirmText: "Evet, Başlat",
      payload: selectedPlan,
    });
  };

  const startWorkoutFromSelectedPlan = async (selectedPlan) => {
    try {
      setIsProcessing(true);

      const response = await api.post("/workout-logs", {
        user_id: 1,
        workout_plan_id: selectedPlan.id,
        workout_date: workoutDate,
        workout_name: selectedPlan.plan_name,
        note: `${selectedPlan.day_name} programından başlatıldı.`,
      });

      setActiveWorkoutLogId(String(response.data.workoutLogId));
      setSelectedPlanId("");

      await getLogsByDate();
      await getDailyVolume();

      toast.success("Program antrenmanı başlatıldı. Setlerini girebilirsin.");
      setConfirmAction(null);
    } catch (error) {
      console.error("Programdan antrenman başlatılamadı:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Antrenman başlatılamadı.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const addSet = async (e) => {
    e.preventDefault();

    if (!activeWorkoutLogId) {
      toast.warning("Önce bir antrenman başlatmalısın.");
      return;
    }

    if (!exerciseId || !setCount || weightKg === "" || !reps) {
      toast.warning("Hareket, set sayısı, ağırlık ve tekrar zorunlu.");
      return;
    }

    const parsedSetCount = Number(setCount);

    if (parsedSetCount <= 0) {
      toast.warning("Set sayısı 1 veya daha fazla olmalı.");
      return;
    }

    try {
      setIsProcessing(true);

      const selectedLog = logs.find(
        (log) => Number(log.id) === Number(activeWorkoutLogId)
      );

      const sameExerciseSets = selectedLog
        ? selectedLog.sets.filter(
            (set) => Number(set.exercise_id) === Number(exerciseId)
          )
        : [];

      const startSetNumber = sameExerciseSets.length + 1;
      const requests = [];

      for (let i = 0; i < parsedSetCount; i++) {
        requests.push(
          api.post(`/workout-logs/${activeWorkoutLogId}/sets`, {
            exercise_id: Number(exerciseId),
            set_number: startSetNumber + i,
            weight_kg: Number(String(weightKg).replace(",", ".")),
            reps: Number(reps),
            note: setNote,
          })
        );
      }

      await Promise.all(requests);

      setSetCount("");
      setWeightKg("");
      setSetNote("");

      await getLogsByDate();
      await getDailyVolume();

      toast.success(`${parsedSetCount} set eklendi.`);
    } catch (error) {
      console.error("Set eklenemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Set eklenemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestDeleteSet = (setId) => {
    setConfirmAction({
      type: "delete-set",
      title: "Set silinsin mi?",
      description: "Bu set antrenman kaydından kaldırılacak.",
      confirmText: "Evet, Sil",
      payload: setId,
    });
  };

  const deleteSet = async (setId) => {
    try {
      setIsProcessing(true);

      await api.delete(`/workout-logs/sets/${setId}`);
      await getLogsByDate();
      await getDailyVolume();

      toast.success("Set silindi.");
      setConfirmAction(null);
    } catch (error) {
      console.error("Set silinemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Set silinemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestDeleteWorkoutLog = (workoutLogId, workoutName) => {
    setConfirmAction({
      type: "delete-workout",
      title: "Antrenman silinsin mi?",
      description: `${workoutName} antrenmanı ve bu antrenmana ait tüm setler kalıcı olarak silinecek.`,
      confirmText: "Evet, Antrenmanı Sil",
      payload: { workoutLogId, workoutName },
    });
  };

  const deleteWorkoutLog = async (workoutLogId) => {
    try {
      setIsProcessing(true);

      await api.delete(`/workout-logs/${workoutLogId}`);

      if (Number(activeWorkoutLogId) === Number(workoutLogId)) {
        setActiveWorkoutLogId("");
        resetSetForm();
      }

      await getLogsByDate();
      await getDailyVolume();

      toast.success("Antrenman silindi.");
      setConfirmAction(null);
    } catch (error) {
      console.error("Antrenman silinemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Antrenman silinemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "start-plan") {
      await startWorkoutFromSelectedPlan(confirmAction.payload);
      return;
    }

    if (confirmAction.type === "delete-set") {
      await deleteSet(confirmAction.payload);
      return;
    }

    if (confirmAction.type === "delete-workout") {
      await deleteWorkoutLog(confirmAction.payload.workoutLogId);
    }
  };

  const resetSetForm = () => {
    setExerciseId("");
    setSetCount("");
    setWeightKg("");
    setReps("");
    setSetNote("");
  };

  const selectedLog = logs.find(
    (log) => Number(log.id) === Number(activeWorkoutLogId)
  );

  const activePlan = selectedLog?.workout_plan_id
    ? plans.find(
        (plan) => Number(plan.id) === Number(selectedLog.workout_plan_id)
      )
    : null;

  const exerciseOptions = getExerciseOptions(activePlan, exercises);

  const handleActiveLogChange = (value) => {
    setActiveWorkoutLogId(value);
    resetSetForm();
  };

  const handleExerciseSelect = (selectedExerciseId) => {
    setExerciseId(selectedExerciseId);

    if (!selectedLog || !selectedExerciseId) {
      setSetCount("");
      setReps("");
      return;
    }

    const plannedExercise = activePlan?.exercises.find(
      (exercise) => Number(exercise.exercise_id) === Number(selectedExerciseId)
    );

    if (plannedExercise?.target_sets) {
      setSetCount(String(plannedExercise.target_sets));
    } else {
      setSetCount("1");
    }

    if (plannedExercise?.target_reps) {
      const firstNumber = String(plannedExercise.target_reps).match(/\d+/)?.[0];
      setReps(firstNumber || "");
    } else {
      setReps("");
    }

    setWeightKg("");
    setSetNote("");
  };

  const selectPlannedExercise = (plannedExercise) => {
    handleExerciseSelect(String(plannedExercise.exercise_id));
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Seçili Tarih" value={formatDate(workoutDate)} tone="blue" />

        <SummaryStat
          label="Günlük Toplam Hacim"
          value={dailyVolume ? `${dailyVolume.total_volume_kg} kg` : "0 kg"}
          tone="violet"
        />

        <SummaryStat
          label="Toplam Set"
          value={dailyVolume ? dailyVolume.total_sets : 0}
          tone="emerald"
        />

        <SummaryStat
          label="Aktif Antrenman"
          value={selectedLog ? selectedLog.workout_name : "Yok"}
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <SectionTitle
            eyebrow="Başlat"
            title="Programdan Antrenman Başlat"
            description="Program seç, tarihi belirle ve antrenmanı o plana bağlı başlat."
          />

          <div className="space-y-4">
            <FormField label="Tarih">
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="Program Seç">
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

            <button
              type="button"
              onClick={requestStartWorkoutFromPlan}
              disabled={isProcessing}
              className={primaryButtonClass}
            >
              Seçili Programı Başlat
            </button>
          </div>

          <div className="mt-5 rounded-[22px] border border-slate-700/60 bg-slate-950/45 p-4">
            <h3 className="text-lg font-black text-slate-50">
              Serbest Antrenman Başlat
            </h3>

            <form className="mt-4 space-y-4" onSubmit={createFreeWorkoutLog}>
              <FormField label="Antrenman Adı">
                <input
                  type="text"
                  placeholder="Örn: Serbest Antrenman"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Not">
                <textarea
                  placeholder="Bugünkü enerji, ağrı, tempo vs."
                  value={workoutNote}
                  onChange={(e) => setWorkoutNote(e.target.value)}
                  className={textareaClass}
                />
              </FormField>

              <button type="submit" disabled={isProcessing} className={primaryButtonClass}>
                Serbest Antrenman Başlat
              </button>
            </form>
          </div>

          {logs.length > 0 && (
            <div className="mt-5 rounded-[22px] border border-slate-700/60 bg-slate-950/45 p-4">
              <h3 className="text-lg font-black text-slate-50">
                Bugünkü Antrenmanlar
              </h3>

              <select
                value={activeWorkoutLogId}
                onChange={(e) => handleActiveLogChange(e.target.value)}
                className={`${inputClass} mt-4`}
              >
                {logs.map((log) => (
                  <option key={log.id} value={log.id}>
                    {log.workout_name} - {Number(log.total_volume_kg || 0)} kg
                  </option>
                ))}
              </select>

              {activePlan ? (
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
                  Bu antrenman{" "}
                  <strong className="text-sky-300">{activePlan.plan_name}</strong>{" "}
                  programından başlatılmış. Set eklerken sadece bu programın
                  hareketleri listelenir.
                </p>
              ) : (
                selectedLog && (
                  <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
                    Bu serbest antrenman. Set eklerken tüm egzersiz havuzu
                    listelenir.
                  </p>
                )
              )}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <SectionTitle
            eyebrow="Set Kaydı"
            title="Set Ekle"
            description="Aktif antrenmana set, tekrar, ağırlık ve not ekle."
          />

          {activePlan && (
            <div className="mb-5 rounded-[22px] border border-blue-400/20 bg-blue-500/10 p-4">
              <h3 className="text-lg font-black text-slate-50">
                {activePlan.plan_name} Hareketleri
              </h3>

              <div className="mt-3 grid gap-2">
                {activePlan.exercises.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400">
                    Bu programda henüz hareket yok.
                  </p>
                ) : (
                  activePlan.exercises.map((exercise) => {
                    const selected =
                      Number(exerciseId) === Number(exercise.exercise_id);

                    return (
                      <button
                        key={exercise.plan_exercise_id}
                        type="button"
                        className={`rounded-xl border p-3 text-left ${
                          selected
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-slate-700/60 bg-slate-950/45 text-slate-300 hover:border-sky-400/40"
                        }`}
                        onClick={() => selectPlannedExercise(exercise)}
                      >
                        <strong className="block text-sm font-black">
                          {exercise.exercise_order}. {exercise.name}
                        </strong>

                        <span className="mt-1 block text-xs font-semibold text-slate-400">
                          {exercise.target_sets || "-"} set /{" "}
                          {exercise.target_reps || "-"} tekrar
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {!activeWorkoutLogId && (
            <p className="mb-4 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-3 text-xs font-semibold text-yellow-200">
              Set eklemek için önce bu tarihte bir antrenman başlat veya mevcut
              antrenmanı seç.
            </p>
          )}

          <form className="space-y-4" onSubmit={addSet}>
            <FormField label="Hareket">
              <select
                value={exerciseId}
                onChange={(e) => handleExerciseSelect(e.target.value)}
                className={inputClass}
              >
                <option value="">Hareket seç</option>

                {exerciseOptions.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name} - {exercise.muscle_group}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid gap-3 md:grid-cols-3">
              <FormField label="Set Sayısı">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 4"
                  value={setCount}
                  onChange={(e) =>
                    setSetCount(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Ağırlık kg">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 30"
                  value={weightKg}
                  onChange={(e) =>
                    setWeightKg(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Tekrar">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="8"
                  value={reps}
                  onChange={(e) =>
                    setReps(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Set Notu">
              <input
                type="text"
                placeholder="Rahat çıktı, zorladı, form bozuldu vs."
                value={setNote}
                onChange={(e) => setSetNote(e.target.value)}
                className={inputClass}
              />
            </FormField>

            <button type="submit" disabled={isProcessing} className={primaryButtonClass}>
              Setleri Ekle
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Kayıtlar
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Seçili Günün Kayıtları
            </h2>
          </div>

          <span className="w-fit rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 text-xs font-black text-slate-300">
            {logs.length} antrenman
          </span>
        </div>

        {logs.length === 0 ? (
          <EmptyState text="Bu tarihte henüz antrenman kaydı yok." />
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <article
                key={log.id}
                className="overflow-hidden rounded-[22px] border border-slate-700/60 bg-slate-950/45 shadow-lg shadow-black/15"
              >
                <div className="flex flex-col gap-4 border-b border-slate-700/60 p-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-black text-slate-300">
                      {formatDate(log.workout_date)}
                    </span>

                    <h3 className="mt-3 text-xl font-black text-slate-50">
                      {log.workout_name}
                    </h3>

                    {log.note && (
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                        {log.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                    <div className="rounded-xl bg-blue-500/10 px-4 py-2 text-center text-xs font-black text-blue-200">
                      {Number(log.total_volume_kg || 0)} kg
                    </div>

                    <button
                      type="button"
                      className={dangerButtonClass}
                      onClick={() =>
                        requestDeleteWorkoutLog(log.id, log.workout_name)
                      }
                    >
                      Antrenmanı Sil
                    </button>
                  </div>
                </div>

                {log.sets.length === 0 ? (
                  <p className="p-4 text-xs font-semibold text-slate-400">
                    Bu antrenmana henüz set eklenmedi.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-[2fr_0.6fr_0.8fr_0.8fr_1fr_0.8fr] border-b border-slate-700/60 bg-slate-900/80 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                        <span>Hareket</span>
                        <span>Set</span>
                        <span>Kg</span>
                        <span>Tekrar</span>
                        <span>Hacim</span>
                        <span>İşlem</span>
                      </div>

                      {log.sets.map((set) => (
                        <div
                          key={set.set_id}
                          className="grid grid-cols-[2fr_0.6fr_0.8fr_0.8fr_1fr_0.8fr] items-center border-b border-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 last:border-b-0"
                        >
                          <span>
                            <strong className="block text-slate-100">
                              {set.exercise_name}
                            </strong>
                            <small className="text-slate-500">
                              {set.muscle_group}
                            </small>
                          </span>

                          <span>{set.set_number}</span>
                          <span>{set.weight_kg}</span>
                          <span>{set.reps}</span>
                          <span className="font-black text-sky-300">
                            {set.volume_kg} kg
                          </span>

                          <span>
                            <button
                              className={dangerButtonClass}
                              type="button"
                              onClick={() => requestDeleteSet(set.set_id)}
                            >
                              Sil
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
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

const textareaClass =
  "min-h-24 w-full resize-y rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-semibold leading-5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const primaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500 hover:text-white";

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

function SummaryStat({ label, value, tone = "blue" }) {
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

      <span className="relative text-xs font-bold text-slate-400">{label}</span>

      <strong className="relative mt-2 block break-words text-xl font-black text-slate-50">
        {value}
      </strong>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
        ◎
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

function getExerciseOptions(activePlan, exercises) {
  if (!activePlan) {
    return exercises;
  }

  return activePlan.exercises.map((exercise) => ({
    id: exercise.exercise_id,
    name: exercise.name,
    muscle_group: exercise.muscle_group,
  }));
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

  if (!year || !month || !day) {
    return cleanDate;
  }

  return `${day}.${month}.${year}`;
}

export default WorkoutLogger;