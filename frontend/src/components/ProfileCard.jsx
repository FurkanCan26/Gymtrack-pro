import React, { useEffect, useState } from "react";
import api from "../api/api";

function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/profile/1");
      setProfile(response.data);
    } catch (error) {
      console.error("Profil getirme hatası:", error);

      if (error.response) {
        setErrorMessage(error.response.data.message || "Profil alınamadı.");
      } else {
        setErrorMessage("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Profil yükleniyor...</div>;
  }

  if (errorMessage) {
    return (
      <div className="card">
        <h2>Profil</h2>
        <p className="muted">{errorMessage}</p>
        <button type="button" onClick={getProfile}>
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card">
        <h2>Profil</h2>
        <p className="muted">Profil bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="card profile-card">
      <h2>Profil</h2>

      <div className="profile-grid">
        <div>
          <span>İsim</span>
          <strong>{profile.name}</strong>
        </div>

        <div>
          <span>Yaş</span>
          <strong>{profile.age}</strong>
        </div>

        <div>
          <span>Boy</span>
          <strong>{profile.height_cm} cm</strong>
        </div>

        <div>
          <span>Kilo</span>
          <strong>{profile.weight_kg} kg</strong>
        </div>

        <div>
          <span>Yağ Oranı</span>
          <strong>{profile.body_fat_percentage || "-"}%</strong>
        </div>

        <div>
          <span>Hedef</span>
          <strong>{translateGoal(profile.goal)}</strong>
        </div>
      </div>

      <div className="calorie-box">
        <div>
          <span>BMR</span>
          <strong>{profile.bmr} kcal</strong>
        </div>

        <div>
          <span>TDEE</span>
          <strong>{profile.tdee} kcal</strong>
        </div>

        <div>
          <span>Hedef Kalori</span>
          <strong>{profile.target_calories} kcal</strong>
        </div>
      </div>
    </div>
  );
}

function translateGoal(goal) {
  if (goal === "lose") return "Kilo Verme";
  if (goal === "gain") return "Kilo Alma";
  if (goal === "maintain") return "Koruma";
  return goal || "-";
}

export default ProfileCard;