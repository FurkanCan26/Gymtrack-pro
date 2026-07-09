import React, { useEffect, useState } from "react";
import api from "../api/api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/profile/1");
      const data = response.data;

      setProfile(data);

      setName(data.name || "");
      setAge(data.age || "");
      setGender(data.gender || "male");
      setHeightCm(data.height_cm || "");
      setWeightKg(data.weight_kg || "");
      setBodyFat(data.body_fat_percentage || "");
      setActivityLevel(data.activity_level || "moderate");
      setGoal(data.goal || "maintain");
    } catch (error) {
      console.error("Profil alınamadı:", error);
      alert("Profil bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("İsim boş olamaz.");
      return;
    }

    try {
      await api.put("/profile/1", {
        name,
        age: age ? Number(age) : null,
        gender,
        height_cm: heightCm ? Number(String(heightCm).replace(",", ".")) : null,
        weight_kg: weightKg ? Number(String(weightKg).replace(",", ".")) : null,
        body_fat_percentage: bodyFat
          ? Number(String(bodyFat).replace(",", "."))
          : null,
        activity_level: activityLevel,
        goal,
      });

      await getProfile();

      alert("Profil güncellendi.");
    } catch (error) {
      console.error("Profil güncellenemedi:", error);

      if (error.response) {
        alert(error.response.data.message || "Profil güncellenirken hata oluştu.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  if (loading) {
    return <div className="card">Profil yükleniyor...</div>;
  }

  return (
    <div className="profile-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span>BMR</span>
          <strong>{profile ? `${profile.bmr} kcal` : "-"}</strong>
        </div>

        <div className="stat-card">
          <span>TDEE</span>
          <strong>{profile ? `${profile.tdee} kcal` : "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Hedef Kalori</span>
          <strong>{profile ? `${profile.target_calories} kcal` : "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Hedef</span>
          <strong>{profile ? translateGoal(profile.goal) : "-"}</strong>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h2>Profil Bilgilerini Düzenle</h2>

          <form className="panel-form" onSubmit={updateProfile}>
            <label>İsim</label>
            <input
              type="text"
              placeholder="İsim"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="form-grid two">
              <div>
                <label>Yaş</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Örn: 23"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, ""))}
                />
              </div>

              <div>
                <label>Cinsiyet</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>

            <div className="form-grid two">
              <div>
                <label>Boy cm</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 188"
                  value={heightCm}
                  onChange={(e) =>
                    setHeightCm(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                />
              </div>

              <div>
                <label>Kilo kg</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Örn: 98.7"
                  value={weightKg}
                  onChange={(e) =>
                    setWeightKg(e.target.value.replace(/[^\d.,]/g, ""))
                  }
                />
              </div>
            </div>

            <label>Yağ Oranı %</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Örn: 20"
              value={bodyFat}
              onChange={(e) =>
                setBodyFat(e.target.value.replace(/[^\d.,]/g, ""))
              }
            />

            <label>Aktivite Seviyesi</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
            >
              <option value="sedentary">Hareketsiz</option>
              <option value="light">Hafif Aktif</option>
              <option value="moderate">Orta Aktif</option>
              <option value="active">Aktif</option>
              <option value="very_active">Çok Aktif</option>
            </select>

            <label>Hedef</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="lose">Kilo Vermek</option>
              <option value="maintain">Korumak</option>
              <option value="gain">Kilo Almak</option>
            </select>

            <button type="submit">Profili Güncelle</button>
          </form>
        </div>

        <div className="card">
          <h2>Kalori Hesabı Açıklaması</h2>

          <div className="info-stack">
            <div className="info-box">
              <span>BMR</span>
              <strong>{profile ? `${profile.bmr} kcal` : "-"}</strong>
              <p>
                Vücudunun hiçbir şey yapmadan, sadece yaşamak için harcadığı
                yaklaşık günlük enerji.
              </p>
            </div>

            <div className="info-box">
              <span>TDEE</span>
              <strong>{profile ? `${profile.tdee} kcal` : "-"}</strong>
              <p>
                Aktivite seviyen dahil edilince günlük yaklaşık koruma kalorisi.
              </p>
            </div>

            <div className="info-box">
              <span>Hedef Kalori</span>
              <strong>{profile ? `${profile.target_calories} kcal` : "-"}</strong>
              <p>
                Hedefine göre önerilen günlük kalori. Kilo verme için TDEE’den
                yaklaşık 500 kcal düşer, kilo alma için yaklaşık 300 kcal ekler.
              </p>
            </div>
          </div>
        </div>
      </div>

      {profile && (
        <div className="card">
          <h2>Mevcut Profil Özeti</h2>

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
              <span>Cinsiyet</span>
              <strong>{translateGender(profile.gender)}</strong>
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
          </div>
        </div>
      )}
    </div>
  );
}

function translateGoal(goal) {
  if (goal === "lose") return "Kilo Vermek";
  if (goal === "gain") return "Kilo Almak";
  if (goal === "maintain") return "Korumak";
  return goal || "-";
}

function translateGender(gender) {
  if (gender === "male") return "Erkek";
  if (gender === "female") return "Kadın";
  if (gender === "other") return "Diğer";
  return gender || "-";
}

export default ProfilePage;