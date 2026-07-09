import React, { useEffect, useState } from "react";
import api from "../api/api";

function Measurements() {
  const today = new Date().toISOString().split("T")[0];

  const [measurements, setMeasurements] = useState([]);

  const [measurementDate, setMeasurementDate] = useState(today);
  const [weightKg, setWeightKg] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [armCm, setArmCm] = useState("");
  const [shoulderCm, setShoulderCm] = useState("");
  const [legCm, setLegCm] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    getMeasurements();
  }, []);

  const getMeasurements = async () => {
    try {
      const response = await api.get("/measurements/1");
      setMeasurements(response.data);
    } catch (error) {
      console.error("Ölçümler alınamadı:", error);
    }
  };

  const addMeasurement = async (e) => {
    e.preventDefault();

    if (!measurementDate) {
      alert("Tarih seçmelisin.");
      return;
    }

    try {
      await api.post("/measurements", {
        user_id: 1,
        measurement_date: measurementDate,
        weight_kg: weightKg ? Number(weightKg) : null,
        body_fat_percentage: bodyFat ? Number(bodyFat) : null,
        waist_cm: waistCm ? Number(waistCm) : null,
        chest_cm: chestCm ? Number(chestCm) : null,
        arm_cm: armCm ? Number(armCm) : null,
        shoulder_cm: shoulderCm ? Number(shoulderCm) : null,
        leg_cm: legCm ? Number(legCm) : null,
        note,
      });

      setWeightKg("");
      setBodyFat("");
      setWaistCm("");
      setChestCm("");
      setArmCm("");
      setShoulderCm("");
      setLegCm("");
      setNote("");

      await getMeasurements();
    } catch (error) {
      console.error("Ölçüm eklenemedi:", error);
    }
  };

  const deleteMeasurement = async (measurementId) => {
    const ok = window.confirm("Bu ölçüm silinsin mi?");
    if (!ok) return;

    try {
      await api.delete(`/measurements/${measurementId}`);
      await getMeasurements();
    } catch (error) {
      console.error("Ölçüm silinemedi:", error);
    }
  };

  const latest = measurements.length > 0 ? measurements[0] : null;

  return (
    <div className="measurements-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span>Son Kilo</span>
          <strong>{latest?.weight_kg ? `${latest.weight_kg} kg` : "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Son Yağ Oranı</span>
          <strong>{latest?.body_fat_percentage ? `%${latest.body_fat_percentage}` : "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Son Bel</span>
          <strong>{latest?.waist_cm ? `${latest.waist_cm} cm` : "-"}</strong>
        </div>

        <div className="stat-card">
          <span>Toplam Ölçüm</span>
          <strong>{measurements.length}</strong>
        </div>
      </div>

      <div className="card">
        <h2>Yeni Ölçüm Ekle</h2>

        <form className="panel-form" onSubmit={addMeasurement}>
          <div className="form-grid">
            <div>
              <label>Tarih</label>
              <input
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
              />
            </div>

            <div>
              <label>Kilo kg</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>

            <div>
              <label>Yağ Oranı %</label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </div>

            <div>
              <label>Bel cm</label>
              <input
                type="number"
                step="0.1"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
              />
            </div>

            <div>
              <label>Göğüs cm</label>
              <input
                type="number"
                step="0.1"
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
              />
            </div>

            <div>
              <label>Kol cm</label>
              <input
                type="number"
                step="0.1"
                value={armCm}
                onChange={(e) => setArmCm(e.target.value)}
              />
            </div>

            <div>
              <label>Omuz cm</label>
              <input
                type="number"
                step="0.1"
                value={shoulderCm}
                onChange={(e) => setShoulderCm(e.target.value)}
              />
            </div>

            <div>
              <label>Bacak cm</label>
              <input
                type="number"
                step="0.1"
                value={legCm}
                onChange={(e) => setLegCm(e.target.value)}
              />
            </div>
          </div>

          <label>Not</label>
          <textarea
            placeholder="Örn: Sabah aç karna ölçüldü."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button type="submit">Ölçüm Ekle</button>
        </form>
      </div>

      <div className="card">
        <h2>Ölçüm Geçmişi</h2>

        {measurements.length === 0 ? (
          <p className="muted">Henüz ölçüm yok.</p>
        ) : (
          <div className="measurement-list">
            {measurements.map((item) => (
              <div className="measurement-card" key={item.id}>
                <div className="measurement-header">
                  <div>
                    <span>{formatDate(item.measurement_date)}</span>
                    <h3>{item.weight_kg || "-"} kg</h3>
                    <p>{item.note || "Not yok"}</p>
                  </div>

                  <button
                    className="danger-btn"
                    type="button"
                    onClick={() => deleteMeasurement(item.id)}
                  >
                    Sil
                  </button>
                </div>

                <div className="measurement-grid">
                  <Info label="Yağ" value={item.body_fat_percentage} suffix="%" />
                  <Info label="Bel" value={item.waist_cm} suffix="cm" />
                  <Info label="Göğüs" value={item.chest_cm} suffix="cm" />
                  <Info label="Kol" value={item.arm_cm} suffix="cm" />
                  <Info label="Omuz" value={item.shoulder_cm} suffix="cm" />
                  <Info label="Bacak" value={item.leg_cm} suffix="cm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, suffix }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value ? `${value} ${suffix}` : "-"}</strong>
    </div>
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default Measurements;