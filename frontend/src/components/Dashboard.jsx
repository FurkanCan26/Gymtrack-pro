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

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-copy">
          <span className="eyebrow">Bugünkü durum</span>
          <h3>Hedefe giden yolu sayılarla yönet.</h3>
          <p>
            Kalori, su, antrenman hacmi ve son ölçüm bilgilerin tek yerde.
            Bugün veri girdikçe panel otomatik anlam kazanır.
          </p>

          <div className="hero-actions">
            <button type="button" onClick={refreshDashboard}>
              Paneli Yenile
            </button>

            <span className={remainingCalories < 0 ? "soft-badge danger" : "soft-badge success"}>
              {getCalorieStatus(profile, dailyTracking, remainingCalories)}
            </span>
          </div>
        </div>

        <div className="hero-ring-card">
          <div className="progress-ring">
            <div>
              <strong>{caloriePercent}%</strong>
              <span>Kalori</span>
            </div>
          </div>

          <p>
            {profile && dailyTracking
              ? remainingCalories >= 0
                ? `${remainingCalories} kcal hakkın kaldı.`
                : `${Math.abs(remainingCalories)} kcal aştın.`
              : "Bugün için kalori kaydı bekleniyor."}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card premium-stat">
          <span>Bugünkü Kalori</span>
          <strong>{dailyTracking ? `${todayCalories} kcal` : "Veri yok"}</strong>
          <small>Günlük beslenme kaydı</small>
        </div>

        <div className="stat-card premium-stat">
          <span>Hedef Kalori</span>
          <strong>{profile ? `${targetCalories} kcal` : "Veri yok"}</strong>
          <small>BMR / TDEE hesabına göre</small>
        </div>

        <div className={`stat-card premium-stat ${remainingCalories < 0 ? "warning-card" : "success-card"}`}>
          <span>{remainingCalories < 0 ? "Aşılan Kalori" : "Kalan Kalori"}</span>
          <strong>{profile ? `${Math.abs(remainingCalories)} kcal` : "Veri yok"}</strong>
          <small>Hedef durum takibi</small>
        </div>

        <div className="stat-card premium-stat">
          <span>Bugünkü Su</span>
          <strong>{dailyTracking ? `${waterLiter.toFixed(2)} L` : "Veri yok"}</strong>
          <small>Hidrasyon takibi</small>
        </div>
      </div>

      <div className="two-column">
        <div className="card glow-card">
          <h2>Kalori Durumu</h2>

          <div className="calorie-status-box">
            <div>
              <span>Hedef</span>
              <strong>{profile ? `${targetCalories} kcal` : "-"}</strong>
            </div>

            <div>
              <span>Bugün</span>
              <strong>{dailyTracking ? `${todayCalories} kcal` : "-"}</strong>
            </div>

            <div>
              <span>Durum</span>
              <strong>{getCalorieStatus(profile, dailyTracking, remainingCalories)}</strong>
            </div>
          </div>

          {profile && dailyTracking ? (
            <div className="progress-wrapper">
              <div className="progress-info">
                <span>Kalori ilerlemesi</span>
                <strong>{caloriePercent}%</strong>
              </div>

              <div className="progress-bar">
                <div
                  className={remainingCalories < 0 ? "progress-fill over" : "progress-fill"}
                  style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                ></div>
              </div>

              <p className="muted">
                {remainingCalories >= 0
                  ? `Hedef kalorine ulaşmak için yaklaşık ${remainingCalories} kcal hakkın kaldı.`
                  : `Bugün hedef kaloriyi yaklaşık ${Math.abs(remainingCalories)} kcal aştın.`}
              </p>
            </div>
          ) : (
            <p className="muted">
              Bugün için günlük takip kaydı girersen bu alan otomatik dolar.
            </p>
          )}
        </div>

        <div className="card glow-card">
          <h2>Bugünkü Antrenman</h2>

          <div className="summary-list">
            <div>
              <span>Toplam Hacim</span>
              <strong>{dailyVolume ? `${dailyVolume.total_volume_kg} kg` : "0 kg"}</strong>
            </div>

            <div>
              <span>Toplam Set</span>
              <strong>{dailyVolume ? dailyVolume.total_sets : 0}</strong>
            </div>

            <div>
              <span>Tarih</span>
              <strong>{formatDate(today)}</strong>
            </div>

            <div>
              <span>Son Kilo</span>
              <strong>
                {latestMeasurement?.weight_kg ? `${latestMeasurement.weight_kg} kg` : "Veri yok"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <ProfileCard />

      <div className="two-column">
        <div className="card">
          <h2>Bugünkü Özet</h2>

          <div className="summary-list">
            <div>
              <span>Kalori</span>
              <strong>{dailyTracking ? `${todayCalories} kcal` : "-"}</strong>
            </div>

            <div>
              <span>Su</span>
              <strong>
                {dailyTracking
                  ? `${dailyTracking.water_ml} ml / ${waterLiter.toFixed(2)} L`
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Set</span>
              <strong>{dailyVolume ? dailyVolume.total_sets : 0}</strong>
            </div>

            <div>
              <span>Hacim</span>
              <strong>{dailyVolume ? `${dailyVolume.total_volume_kg} kg` : "0 kg"}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Son Ölçüm</h2>

          {latestMeasurement ? (
            <div className="summary-list">
              <div>
                <span>Tarih</span>
                <strong>{formatDate(latestMeasurement.measurement_date)}</strong>
              </div>

              <div>
                <span>Kilo</span>
                <strong>{latestMeasurement.weight_kg || "-"} kg</strong>
              </div>

              <div>
                <span>Yağ Oranı</span>
                <strong>{latestMeasurement.body_fat_percentage || "-"}%</strong>
              </div>

              <div>
                <span>Bel</span>
                <strong>{latestMeasurement.waist_cm || "-"} cm</strong>
              </div>
            </div>
          ) : (
            <p className="muted">Henüz ölçüm yok.</p>
          )}
        </div>
      </div>
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