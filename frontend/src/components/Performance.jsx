import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../api/api";

function Performance() {
  const [summary, setSummary] = useState(null);
  const [exerciseStats, setExerciseStats] = useState([]);
  const [maxWeightPrs, setMaxWeightPrs] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);

  useEffect(() => {
    getPerformanceData();
  }, []);

  const getPerformanceData = async () => {
    try {
      const [summaryRes, exerciseRes, prRes, muscleRes] = await Promise.all([
        api.get("/performance/1/summary"),
        api.get("/performance/1/exercises"),
        api.get("/performance/1/max-weight"),
        api.get("/performance/1/muscle-groups"),
      ]);

      setSummary(summaryRes.data);
      setExerciseStats(exerciseRes.data);
      setMaxWeightPrs(prRes.data);
      setMuscleGroups(muscleRes.data);
    } catch (error) {
      console.error("Performans verileri alınamadı:", error);
    }
  };

  return (
    <div className="performance-page">
      <div className="dashboard-actions">
        <button type="button" onClick={getPerformanceData}>
          Performansı Yenile
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Toplam Antrenman</span>
          <strong>{summary ? summary.total_workouts : 0}</strong>
        </div>

        <div className="stat-card">
          <span>Toplam Set</span>
          <strong>{summary ? summary.total_sets : 0}</strong>
        </div>

        <div className="stat-card">
          <span>Toplam Hacim</span>
          <strong>{summary ? `${summary.total_volume_kg} kg` : "0 kg"}</strong>
        </div>

        <div className="stat-card">
          <span>En Yüksek Ağırlık</span>
          <strong>{summary ? `${summary.max_weight_kg} kg` : "0 kg"}</strong>
        </div>
      </div>

      <div className="two-column">
        <div className="card chart-card">
          <h2>Kas Grubu Hacmi</h2>

          {muscleGroups.length === 0 ? (
            <p className="muted">Henüz kas grubu verisi yok.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={muscleGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="muscle_group" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_volume_kg" name="Toplam Hacim kg" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card chart-card">
          <h2>En Çok Çalışılan Hareketler</h2>

          {exerciseStats.length === 0 ? (
            <p className="muted">Henüz hareket verisi yok.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exerciseStats.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exercise_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sets" name="Toplam Set" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Hareket Bazlı Performans</h2>

        {exerciseStats.length === 0 ? (
          <p className="muted">Henüz performans kaydı yok.</p>
        ) : (
          <div className="performance-table">
            <div className="performance-row performance-head">
              <span>Hareket</span>
              <span>Kas Grubu</span>
              <span>Toplam Set</span>
              <span>Toplam Hacim</span>
              <span>Max Kg</span>
              <span>Max Tekrar</span>
              <span>En İyi Set Hacmi</span>
              <span>Son Tarih</span>
            </div>

            {exerciseStats.map((item) => (
              <div className="performance-row" key={item.exercise_id}>
                <span>
                  <strong>{item.exercise_name}</strong>
                </span>
                <span>{item.muscle_group || "Genel"}</span>
                <span>{item.total_sets}</span>
                <span>{item.total_volume_kg} kg</span>
                <span>{item.max_weight_kg} kg</span>
                <span>{item.max_reps}</span>
                <span>{item.best_set_volume_kg} kg</span>
                <span>{formatDate(item.last_performed_date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>En Yüksek Ağırlık PR Listesi</h2>

        {maxWeightPrs.length === 0 ? (
          <p className="muted">Henüz PR kaydı yok.</p>
        ) : (
          <div className="pr-grid">
            {maxWeightPrs.map((item, index) => (
              <div
                className="pr-card"
                key={`${item.exercise_id}-${item.weight_kg}-${index}`}
              >
                <div className="pr-rank">#{index + 1}</div>

                <div>
                  <span>{item.muscle_group || "Genel"}</span>
                  <h3>{item.exercise_name}</h3>
                  <p>{formatDate(item.workout_date)}</p>
                </div>

                <div className="pr-value">
                  <strong>{item.weight_kg} kg</strong>
                  <span>{item.reps} tekrar</span>
                  <span>{item.volume_kg} kg hacim</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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

export default Performance;