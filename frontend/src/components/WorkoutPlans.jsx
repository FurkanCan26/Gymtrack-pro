import React, { useEffect, useState } from "react";
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
    }
  };

  const getExercises = async () => {
    try {
      const response = await api.get("/exercises");
      setExercises(response.data);
    } catch (error) {
      console.error("Egzersiz getirme hatası:", error);
    }
  };

  const createPlan = async (e) => {
    e.preventDefault();

    if (!dayName.trim() || !planName.trim()) {
      alert("Gün adı ve program adı zorunlu.");
      return;
    }

    try {
      await api.post("/workout-plans", {
        user_id: 1,
        day_name: dayName,
        plan_name: planName,
      });

      setDayName("");
      setPlanName("");

      await getPlans();
    } catch (error) {
      console.error("Program oluşturma hatası:", error);

      if (error.response) {
        alert(error.response.data.message || "Program oluşturulamadı.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  const addExerciseToPlan = async (e) => {
    e.preventDefault();

    if (!selectedPlanId || !selectedExerciseId) {
      alert("Program ve hareket seçmelisin.");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Programa hareket ekleme hatası:", error);

      if (error.response) {
        alert(error.response.data.message || "Programa hareket eklenemedi.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  const deletePlanExercise = async (planExerciseId) => {
    const ok = window.confirm("Bu hareket programdan silinsin mi?");
    if (!ok) return;

    try {
      await api.delete(`/workout-plans/exercise/${planExerciseId}`);
      await getPlans();
    } catch (error) {
      console.error("Program hareketi silinemedi:", error);
    }
  };

  const deletePlan = async (planId) => {
    const ok = window.confirm(
      "Bu program komple silinsin mi? Geçmiş antrenman kayıtların silinmez."
    );

    if (!ok) return;

    try {
      await api.delete(`/workout-plans/${planId}`);
      await getPlans();

      if (Number(selectedPlanId) === Number(planId)) {
        setSelectedPlanId("");
      }
    } catch (error) {
      console.error("Program silinemedi:", error);
    }
  };

  return (
    <div className="workout-plans-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span>Toplam Program</span>
          <strong>{plans.length}</strong>
        </div>

        <div className="stat-card">
          <span>Toplam Planlı Hareket</span>
          <strong>{getTotalPlanExercises(plans)}</strong>
        </div>

        <div className="stat-card">
          <span>Egzersiz Havuzu</span>
          <strong>{exercises.length}</strong>
        </div>

        <div className="stat-card">
          <span>Başlatma</span>
          <strong>Antrenman Kaydı</strong>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h2>Program Günü Oluştur</h2>

          <form className="panel-form" onSubmit={createPlan}>
            <label>Gün Adı</label>
            <input
              type="text"
              placeholder="Örn: Pazartesi"
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
            />

            <label>Program Adı</label>
            <input
              type="text"
              placeholder="Örn: Push Günü"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />

            <button type="submit">Program Oluştur</button>
          </form>
        </div>

        <div className="card">
          <h2>Programa Hareket Ekle</h2>

          <form className="panel-form" onSubmit={addExerciseToPlan}>
            <label>Program</label>
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

            <label>Hareket</label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
            >
              <option value="">Hareket seç</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} - {exercise.muscle_group}
                </option>
              ))}
            </select>

            <div className="form-grid two">
              <div>
                <label>Hedef Set</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 4"
                  value={targetSets}
                  onChange={(e) =>
                    setTargetSets(e.target.value.replace(/[^\d]/g, ""))
                  }
                />
              </div>

              <div>
                <label>Hedef Tekrar</label>
                <input
                  type="text"
                  placeholder="Örn: 8-10"
                  value={targetReps}
                  onChange={(e) => setTargetReps(e.target.value)}
                />
              </div>
            </div>

            <button type="submit">Hareket Ekle</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="plans-toolbar">
          <div>
            <h2>Antrenman Programları</h2>
            <p className="muted">
              Burada sadece program şablonlarını yönetirsin. Program başlatma
              işlemi Antrenman Kaydı sayfasından yapılır.
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <p className="muted">Henüz antrenman programı oluşturmadın.</p>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div className="plan-card" key={plan.id}>
                <div className="plan-header">
                  <div>
                    <span>{plan.day_name}</span>
                    <h3>{plan.plan_name}</h3>
                  </div>

                  <div className="plan-actions">
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => deletePlan(plan.id)}
                    >
                      Programı Sil
                    </button>
                  </div>
                </div>

                {plan.exercises.length === 0 ? (
                  <p className="empty-text">Henüz hareket eklenmedi.</p>
                ) : (
                  <div className="plan-exercises">
                    {plan.exercises.map((exercise) => (
                      <div
                        className="plan-exercise"
                        key={exercise.plan_exercise_id}
                      >
                        <div>
                          <strong>
                            {exercise.exercise_order}. {exercise.name}
                          </strong>
                          <span>{exercise.muscle_group}</span>
                        </div>

                        <div className="target-info">
                          <span>{exercise.target_sets || "-"} set</span>
                          <span>{exercise.target_reps || "-"} tekrar</span>

                          <button
                            type="button"
                            className="danger-btn mini-danger"
                            onClick={() =>
                              deletePlanExercise(exercise.plan_exercise_id)
                            }
                          >
                            Sil
                          </button>
                        </div>
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

function getTotalPlanExercises(plans) {
  return plans.reduce((total, plan) => total + plan.exercises.length, 0);
}

export default WorkoutPlans;