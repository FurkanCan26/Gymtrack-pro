const express = require("express");
const router = express.Router();
const db = require("../db");

// Özet bilgiler
router.get("/:userId/summary", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      COUNT(*) AS total_tracking_days,
      SUM(calories) AS total_calories,
      AVG(calories) AS average_calories,
      SUM(water_ml) AS total_water_ml,
      AVG(water_ml) AS average_water_ml,
      MAX(tracking_date) AS last_tracking_date
    FROM daily_trackings
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Günlük takip özet hatası:", err);
      return res.status(500).json({ message: "Özet bilgiler getirilirken hata oluştu." });
    }

    const summary = results[0];

    res.json({
      total_tracking_days: Number(summary.total_tracking_days || 0),
      total_calories: Number(summary.total_calories || 0),
      average_calories: Math.round(Number(summary.average_calories || 0)),
      total_water_ml: Number(summary.total_water_ml || 0),
      total_water_liter: Number((Number(summary.total_water_ml || 0) / 1000).toFixed(2)),
      average_water_ml: Math.round(Number(summary.average_water_ml || 0)),
      average_water_liter: Number((Number(summary.average_water_ml || 0) / 1000).toFixed(2)),
      last_tracking_date: summary.last_tracking_date,
    });
  });
});

// Kullanıcının tüm günlük takiplerini getir
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      id,
      user_id,
      DATE_FORMAT(tracking_date, '%Y-%m-%d') AS tracking_date,
      calories,
      water_ml,
      body_weight_kg,
      note,
      created_at
    FROM daily_trackings
    WHERE user_id = ?
    ORDER BY tracking_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Günlük takip getirme hatası:", err);
      return res.status(500).json({ message: "Günlük takipler getirilirken hata oluştu." });
    }

    res.json(results);
  });
});

// Günlük takip ekle
// Aynı güne tekrar girilirse kalori ve su üstüne eklenir
router.post("/", (req, res) => {
  const {
    user_id,
    tracking_date,
    calories,
    water_ml,
    body_weight_kg,
    note,
  } = req.body;

  if (!user_id || !tracking_date) {
    return res.status(400).json({
      message: "user_id ve tracking_date zorunludur.",
    });
  }

  const newCalories = Math.round(Number(calories || 0));
  const newWaterMl = Math.round(Number(water_ml || 0));

  const newWeight =
    body_weight_kg === "" || body_weight_kg === undefined || body_weight_kg === null
      ? null
      : Number(body_weight_kg);

  const newNote = note && note.trim() !== "" ? note.trim() : null;

  const checkSql = `
    SELECT *
    FROM daily_trackings
    WHERE user_id = ?
      AND tracking_date = ?
    LIMIT 1
  `;

  db.query(checkSql, [user_id, tracking_date], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Günlük takip kontrol hatası:", checkErr);
      return res.status(500).json({ message: "Günlük takip kontrol edilirken hata oluştu." });
    }

    // Aynı güne kayıt varsa güncelle
    if (checkResults.length > 0) {
      const oldRecord = checkResults[0];

      const updatedCalories = Number(oldRecord.calories || 0) + newCalories;
      const updatedWaterMl = Number(oldRecord.water_ml || 0) + newWaterMl;

      const updatedWeight = newWeight !== null ? newWeight : oldRecord.body_weight_kg;

      let updatedNote = oldRecord.note;

      if (newNote) {
        if (updatedNote && updatedNote.trim() !== "") {
          updatedNote = `${updatedNote} | ${newNote}`;
        } else {
          updatedNote = newNote;
        }
      }

      const updateSql = `
        UPDATE daily_trackings
        SET
          calories = ?,
          water_ml = ?,
          body_weight_kg = ?,
          note = ?
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [
          updatedCalories,
          updatedWaterMl,
          updatedWeight,
          updatedNote,
          oldRecord.id,
        ],
        (updateErr) => {
          if (updateErr) {
            console.error("Günlük takip güncelleme hatası:", updateErr);
            return res.status(500).json({ message: "Günlük takip güncellenirken hata oluştu." });
          }

          return res.json({
            message: "Günlük takip güncellendi.",
            mode: "updated",
          });
        }
      );

      return;
    }

    // Aynı güne kayıt yoksa yeni kayıt ekle
    const insertSql = `
      INSERT INTO daily_trackings (
        user_id,
        tracking_date,
        calories,
        water_ml,
        body_weight_kg,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        user_id,
        tracking_date,
        newCalories,
        newWaterMl,
        newWeight,
        newNote,
      ],
      (insertErr, result) => {
        if (insertErr) {
          console.error("Günlük takip ekleme hatası:", insertErr);
          return res.status(500).json({ message: "Günlük takip eklenirken hata oluştu." });
        }

        return res.status(201).json({
          message: "Günlük takip eklendi.",
          mode: "inserted",
          trackingId: result.insertId,
        });
      }
    );
  });
});

module.exports = router;