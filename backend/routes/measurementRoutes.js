const express = require("express");
const router = express.Router();
const db = require("../db");

// Kullanıcının ölçümlerini getir
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT *
    FROM body_measurements
    WHERE user_id = ?
    ORDER BY measurement_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Ölçüm getirme hatası:", err);
      return res.status(500).json({ message: "Ölçümler getirilirken hata oluştu." });
    }

    res.json(results);
  });
});

// Ölçüm ekle
router.post("/", (req, res) => {
  const {
    user_id,
    measurement_date,
    weight_kg,
    body_fat_percentage,
    waist_cm,
    chest_cm,
    arm_cm,
    shoulder_cm,
    leg_cm,
    note,
  } = req.body;

  if (!user_id || !measurement_date) {
    return res.status(400).json({ message: "user_id ve measurement_date zorunludur." });
  }

  const sql = `
    INSERT INTO body_measurements (
      user_id,
      measurement_date,
      weight_kg,
      body_fat_percentage,
      waist_cm,
      chest_cm,
      arm_cm,
      shoulder_cm,
      leg_cm,
      note
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      measurement_date,
      weight_kg || null,
      body_fat_percentage || null,
      waist_cm || null,
      chest_cm || null,
      arm_cm || null,
      shoulder_cm || null,
      leg_cm || null,
      note || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Ölçüm ekleme hatası:", err);
        return res.status(500).json({ message: "Ölçüm eklenirken hata oluştu." });
      }

      res.status(201).json({
        message: "Ölçüm başarıyla eklendi.",
        measurementId: result.insertId,
      });
    }
  );
});

// Ölçüm sil
router.delete("/:measurementId", (req, res) => {
  const measurementId = req.params.measurementId;

  const sql = "DELETE FROM body_measurements WHERE id = ?";

  db.query(sql, [measurementId], (err) => {
    if (err) {
      console.error("Ölçüm silme hatası:", err);
      return res.status(500).json({ message: "Ölçüm silinirken hata oluştu." });
    }

    res.json({ message: "Ölçüm silindi." });
  });
});

module.exports = router;