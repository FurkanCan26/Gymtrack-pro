import React, { useEffect, useState } from "react";
import api from "../api/api";

function DailyTracking() {
  const today = new Date().toISOString().split("T")[0];

  const [trackings, setTrackings] = useState([]);
  const [summary, setSummary] = useState(null);

  const [trackingDate, setTrackingDate] = useState(today);
  const [calories, setCalories] = useState("");
  const [waterMl, setWaterMl] = useState("");
  const [bodyWeightKg, setBodyWeightKg] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    getTrackings();
    getSummary();
  }, []);

  const getTrackings = async () => {
    try {
      const response = await api.get("/daily-tracking/1");
      setTrackings(response.data);
    } catch (error) {
      console.error("Günlük takipler alınamadı:", error);
    }
  };

  const getSummary = async () => {
    try {
      const response = await api.get("/daily-tracking/1/summary");
      setSummary(response.data);
    } catch (error) {
      console.error("Özet alınamadı:", error);
    }
  };

  const saveTracking = async (e) => {
    e.preventDefault();

    if (!trackingDate) {
      alert("Tarih seçmelisin.");
      return;
    }

    try {
      const payload = {
        user_id: 1,
        tracking_date: trackingDate,
        calories: parseWholeNumber(calories),
        water_ml: parseWholeNumber(waterMl),
        body_weight_kg: bodyWeightKg
          ? Number(String(bodyWeightKg).replace(",", "."))
          : null,
        note,
      };

      console.log("Gönderilen günlük takip:", payload);

      const response = await api.post("/daily-tracking", payload);

      console.log("Günlük takip cevabı:", response.data);

      setCalories("");
      setWaterMl("");
      setBodyWeightKg("");
      setNote("");

      await getTrackings();
      await getSummary();

      alert(response.data.message);
    } catch (error) {
      console.error("Günlük takip kaydedilemedi:", error);

      if (error.response) {
        alert(error.response.data.message || "Backend kayıt hatası.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    }
  };

  return (
    <div className="daily-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span>Toplam Takip Günü</span>
          <strong>{summary ? summary.total_tracking_days : 0}</strong>
        </div>

        <div className="stat-card">
          <span>Ortalama Kalori</span>
          <strong>{summary ? `${summary.average_calories} kcal` : "0 kcal"}</strong>
        </div>

        <div className="stat-card">
          <span>Ortalama Su</span>
          <strong>{summary ? `${summary.average_water_liter} L` : "0 L"}</strong>
        </div>

        <div className="stat-card">
          <span>Toplam Su</span>
          <strong>{summary ? `${summary.total_water_liter} L` : "0 L"}</strong>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h2>Günlük Veri Gir</h2>

          <form className="panel-form" onSubmit={saveTracking}>
            <label>Tarih</label>
            <input
              type="date"
              value={trackingDate}
              onChange={(e) => setTrackingDate(e.target.value)}
            />

            <label>Kalori</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Örn: 1850"
              value={calories}
              onChange={(e) => setCalories(e.target.value.replace(/[^\d]/g, ""))}
            />

            <label>Su ml</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Örn: 3200"
              value={waterMl}
              onChange={(e) => setWaterMl(e.target.value.replace(/[^\d]/g, ""))}
            />

            <label>Kilo kg</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Örn: 98.7"
              value={bodyWeightKg}
              onChange={(e) =>
                setBodyWeightKg(e.target.value.replace(/[^\d.,]/g, ""))
              }
            />

            <label>Not</label>
            <textarea
              placeholder="Bugünkü beslenme, enerji, kaçamak vs."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button type="submit">Kaydet</button>
          </form>
        </div>

        <div className="card">
          <h2>Su Çevirici</h2>

          <div className="info-box">
            <span>Girilen su</span>
            <strong>{waterMl ? `${waterMl} ml` : "0 ml"}</strong>
            <p>
              {waterMl
                ? `${(parseWholeNumber(waterMl) / 1000).toFixed(2)} litre`
                : "0 litre"}
            </p>
          </div>

          <p className="muted">
            Aynı güne tekrar kayıt girersen kalori ve su mevcut kaydın üstüne eklenir.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Günlük Kayıtlar</h2>

        {trackings.length === 0 ? (
          <p className="muted">Henüz günlük takip kaydı yok.</p>
        ) : (
          <div className="tracking-list">
            {trackings.map((item) => (
              <div className="tracking-card" key={item.id}>
                <div>
                  <span>{formatDate(item.tracking_date)}</span>
                  <h3>{parseWholeNumber(item.calories)} kcal</h3>
                  <p>{item.note || "Not yok"}</p>
                </div>

                <div className="tracking-values">
                  <strong>{parseWholeNumber(item.water_ml)} ml</strong>
                  <span>
                    {(parseWholeNumber(item.water_ml) / 1000).toFixed(2)} L
                  </span>
                  <strong>{item.body_weight_kg || "-"} kg</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function parseWholeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const cleaned = String(value).replace(",", ".").trim();
  const numberValue = Number(cleaned);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.round(numberValue);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  if (typeof dateValue === "string" && dateValue.includes("-")) {
    const [year, month, day] = dateValue.split("T")[0].split("-");
    return `${day}.${month}.${year}`;
  }

  return new Date(dateValue).toLocaleDateString("tr-TR");
}

export default DailyTracking;