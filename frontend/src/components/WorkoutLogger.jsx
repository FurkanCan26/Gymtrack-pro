import React, { useEffect, useState } from "react";
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
    }
  };

  const getPlans = async () => {
    try {
      const response = await api.get("/workout-plans/1");
      setPlans(response.data);
    } catch (error) {
      console.error("Programlar alınamadı:", error);
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
    }
  };

  const getDailyVolume = async () => {
    try {
      const response = await api.get(`/workout-logs/1/daily-volume/${workoutDate}`);
      setDailyVolume(response.data);
    } catch (error) {
      console.error("Günlük hacim alınamadı:", error);
    }
  };

  const createFreeWorkoutLog = async (e) => {
    e.preventDefault();

    if (!workoutDate) {
      alert("Tarih seçmelisin.");
      return;
    }

    if (!workoutName.trim()) {
      alert("Antrenman adı yazmalısın.");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Serbest antrenman oluşturulamadı:", error);

      if (error.response) {
        alert(error.response.data.message || "Antrenman oluşturulamadı.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  const startWorkoutFromSelectedPlan = async () => {
    if (!workoutDate) {
      alert("Tarih seçmelisin.");
      return;
    }

    if (!selectedPlanId) {
      alert("Başlatmak için bir program seçmelisin.");
      return;
    }

    const selectedPlan = plans.find(
      (plan) => Number(plan.id) === Number(selectedPlanId)
    );

    if (!selectedPlan) {
      alert("Seçilen program bulunamadı.");
      return;
    }

    const ok = window.confirm(
      `${selectedPlan.plan_name} programı ${formatDate(workoutDate)} tarihi için başlatılsın mı?`
    );

    if (!ok) return;

    try {
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

      alert("Program antrenmanı başlatıldı. Şimdi setlerini girebilirsin.");
    } catch (error) {
      console.error("Programdan antrenman başlatılamadı:", error);

      if (error.response) {
        alert(error.response.data.message || "Antrenman başlatılamadı.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  const addSet = async (e) => {
    e.preventDefault();

    if (!activeWorkoutLogId) {
      alert("Önce bir antrenman başlatmalısın.");
      return;
    }

    if (!exerciseId || !setCount || weightKg === "" || !reps) {
      alert("Hareket, set sayısı, ağırlık ve tekrar zorunlu.");
      return;
    }

    const parsedSetCount = Number(setCount);

    if (parsedSetCount <= 0) {
      alert("Set sayısı 1 veya daha fazla olmalı.");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Set eklenemedi:", error);

      if (error.response) {
        alert(error.response.data.message || "Set eklenemedi.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  const deleteSet = async (setId) => {
    const confirmDelete = window.confirm("Bu set silinsin mi?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/workout-logs/sets/${setId}`);
      await getLogsByDate();
      await getDailyVolume();
    } catch (error) {
      console.error("Set silinemedi:", error);
    }
  };

  const deleteWorkoutLog = async (workoutLogId, workoutName) => {
    const confirmDelete = window.confirm(
      `${workoutName} antrenmanı komple silinsin mi? Bu işlem o antrenmana ait tüm setleri de siler.`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/workout-logs/${workoutLogId}`);

      if (Number(activeWorkoutLogId) === Number(workoutLogId)) {
        setActiveWorkoutLogId("");
        resetSetForm();
      }

      await getLogsByDate();
      await getDailyVolume();
    } catch (error) {
      console.error("Antrenman silinemedi:", error);

      if (error.response) {
        alert(error.response.data.message || "Antrenman silinemedi.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
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
    ? plans.find((plan) => Number(plan.id) === Number(selectedLog.workout_plan_id))
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
    <div className="workout-logger-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span>Seçili Tarih</span>
          <strong>{formatDate(workoutDate)}</strong>
        </div>

        <div className="stat-card">
          <span>Günlük Toplam Hacim</span>
          <strong>
            {dailyVolume ? `${dailyVolume.total_volume_kg} kg` : "0 kg"}
          </strong>
        </div>

        <div className="stat-card">
          <span>Toplam Set</span>
          <strong>{dailyVolume ? dailyVolume.total_sets : 0}</strong>
        </div>

        <div className="stat-card">
          <span>Aktif Antrenman</span>
          <strong>{selectedLog ? selectedLog.workout_name : "Yok"}</strong>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h2>Programdan Antrenman Başlat</h2>

          <div className="panel-form">
            <label>Tarih</label>
            <input
              type="date"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
            />

            <label>Program Seç</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              <option value="">Program seç</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.day_name} - {plan.plan_name}
                </option>
              ))}
            </select>

            <button type="button" onClick={startWorkoutFromSelectedPlan}>
              Seçili Programı Başlat
            </button>
          </div>

          <div className="section-block">
            <h3>Serbest Antrenman Başlat</h3>

            <form className="panel-form" onSubmit={createFreeWorkoutLog}>
              <label>Antrenman Adı</label>
              <input
                type="text"
                placeholder="Örn: Serbest Antrenman"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />

              <label>Not</label>
              <textarea
                placeholder="Bugünkü enerji, ağrı, tempo vs."
                value={workoutNote}
                onChange={(e) => setWorkoutNote(e.target.value)}
              />

              <button type="submit">Serbest Antrenman Başlat</button>
            </form>
          </div>

          {logs.length > 0 && (
            <div className="section-block">
              <h3>Bugünkü Antrenmanlar</h3>

              <select
                value={activeWorkoutLogId}
                onChange={(e) => handleActiveLogChange(e.target.value)}
              >
                {logs.map((log) => (
                  <option key={log.id} value={log.id}>
                    {log.workout_name} - {Number(log.total_volume_kg || 0)} kg
                  </option>
                ))}
              </select>

              {activePlan ? (
                <p className="muted">
                  Bu antrenman <strong>{activePlan.plan_name}</strong>{" "}
                  programından başlatılmış. Set eklerken sadece bu programın
                  hareketleri listelenir.
                </p>
              ) : (
                selectedLog && (
                  <p className="muted">
                    Bu serbest antrenman. Set eklerken tüm egzersiz havuzu
                    listelenir.
                  </p>
                )
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Set Ekle</h2>

          {activePlan && (
            <div className="planned-exercises-box">
              <h3>{activePlan.plan_name} Hareketleri</h3>

              <div className="planned-exercise-list">
                {activePlan.exercises.length === 0 ? (
                  <p className="muted">Bu programda henüz hareket yok.</p>
                ) : (
                  activePlan.exercises.map((exercise) => (
                    <button
                      key={exercise.plan_exercise_id}
                      type="button"
                      className={
                        Number(exerciseId) === Number(exercise.exercise_id)
                          ? "planned-exercise-btn active"
                          : "planned-exercise-btn"
                      }
                      onClick={() => selectPlannedExercise(exercise)}
                    >
                      <strong>
                        {exercise.exercise_order}. {exercise.name}
                      </strong>

                      <span>
                        {exercise.target_sets || "-"} set /{" "}
                        {exercise.target_reps || "-"} tekrar
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {!activeWorkoutLogId && (
            <p className="muted">
              Set eklemek için önce bu tarihte bir antrenman başlat veya mevcut
              antrenmanı seç.
            </p>
          )}

          <form className="panel-form" onSubmit={addSet}>
            <label>Hareket</label>
            <select
              value={exerciseId}
              onChange={(e) => handleExerciseSelect(e.target.value)}
            >
              <option value="">Hareket seç</option>

              {exerciseOptions.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} - {exercise.muscle_group}
                </option>
              ))}
            </select>

            <div className="three-column">
              <div>
                <label>Set Sayısı</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 4"
                  value={setCount}
                  onChange={(e) =>
                    setSetCount(e.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>

              <div>
                <label>Ağırlık kg</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 30"
                  value={weightKg}
                  onChange={(e) =>
                    setWeightKg(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                />
              </div>

              <div>
                <label>Tekrar</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="8"
                  value={reps}
                  onChange={(e) => setReps(e.target.value.replace(/[^\d]/g, ""))}
                />
              </div>
            </div>

            <label>Set Notu</label>
            <input
              type="text"
              placeholder="Rahat çıktı, zorladı, form bozuldu vs."
              value={setNote}
              onChange={(e) => setSetNote(e.target.value)}
            />

            <button type="submit">Setleri Ekle</button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>Seçili Günün Kayıtları</h2>

        {logs.length === 0 ? (
          <p className="muted">Bu tarihte henüz antrenman kaydı yok.</p>
        ) : (
          <div className="log-list">
            {logs.map((log) => (
              <div className="log-card" key={log.id}>
                <div className="log-header">
                  <div>
                    <span>{formatDate(log.workout_date)}</span>
                    <h3>{log.workout_name}</h3>
                    {log.note && <p>{log.note}</p>}
                  </div>

                  <div className="log-actions">
                    <div className="volume-badge">
                      {Number(log.total_volume_kg || 0)} kg
                    </div>

                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => deleteWorkoutLog(log.id, log.workout_name)}
                    >
                      Antrenmanı Sil
                    </button>
                  </div>
                </div>

                {log.sets.length === 0 ? (
                  <p className="empty-text">Bu antrenmana henüz set eklenmedi.</p>
                ) : (
                  <div className="sets-table">
                    <div className="sets-row sets-head">
                      <span>Hareket</span>
                      <span>Set</span>
                      <span>Kg</span>
                      <span>Tekrar</span>
                      <span>Hacim</span>
                      <span>İşlem</span>
                    </div>

                    {log.sets.map((set) => (
                      <div className="sets-row" key={set.set_id}>
                        <span>
                          <strong>{set.exercise_name}</strong>
                          <small>{set.muscle_group}</small>
                        </span>

                        <span>{set.set_number}</span>
                        <span>{set.weight_kg}</span>
                        <span>{set.reps}</span>
                        <span>{set.volume_kg} kg</span>

                        <span>
                          <button
                            className="danger-btn"
                            type="button"
                            onClick={() => deleteSet(set.set_id)}
                          >
                            Sil
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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