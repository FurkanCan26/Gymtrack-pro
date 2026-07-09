const express = require("express");
const router = express.Router();
const db = require("../db");

// Genel performans özeti
router.get("/:userId/summary", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      COUNT(DISTINCT wl.id) AS total_workouts,
      COUNT(wls.id) AS total_sets,
      COALESCE(SUM(wls.volume_kg), 0) AS total_volume_kg,
      COALESCE(MAX(wls.weight_kg), 0) AS max_weight_kg,
      COALESCE(MAX(wls.reps), 0) AS max_reps
    FROM workout_logs wl
    LEFT JOIN workout_log_sets wls
      ON wl.id = wls.workout_log_id
    WHERE wl.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Performans özeti hatası:", err);
      return res.status(500).json({
        message: "Performans özeti getirilirken hata oluştu.",
      });
    }

    const summary = results[0];

    res.json({
      total_workouts: Number(summary.total_workouts || 0),
      total_sets: Number(summary.total_sets || 0),
      total_volume_kg: Number(summary.total_volume_kg || 0),
      max_weight_kg: Number(summary.max_weight_kg || 0),
      max_reps: Number(summary.max_reps || 0),
    });
  });
});

// Hareket bazlı performans
router.get("/:userId/exercises", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.muscle_group,
      COUNT(wls.id) AS total_sets,
      COALESCE(SUM(wls.volume_kg), 0) AS total_volume_kg,
      COALESCE(MAX(wls.weight_kg), 0) AS max_weight_kg,
      COALESCE(MAX(wls.reps), 0) AS max_reps,
      COALESCE(MAX(wls.volume_kg), 0) AS best_set_volume_kg,
      MAX(wl.workout_date) AS last_performed_date
    FROM workout_log_sets wls
    INNER JOIN workout_logs wl
      ON wls.workout_log_id = wl.id
    INNER JOIN exercises e
      ON wls.exercise_id = e.id
    WHERE wl.user_id = ?
    GROUP BY e.id, e.name, e.muscle_group
    ORDER BY total_volume_kg DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Hareket performansı hatası:", err);
      return res.status(500).json({
        message: "Hareket performansları getirilirken hata oluştu.",
      });
    }

    const formatted = results.map((item) => ({
      exercise_id: item.exercise_id,
      exercise_name: item.exercise_name,
      muscle_group: item.muscle_group,
      total_sets: Number(item.total_sets || 0),
      total_volume_kg: Number(item.total_volume_kg || 0),
      max_weight_kg: Number(item.max_weight_kg || 0),
      max_reps: Number(item.max_reps || 0),
      best_set_volume_kg: Number(item.best_set_volume_kg || 0),
      last_performed_date: item.last_performed_date,
    }));

    res.json(formatted);
  });
});

// En yüksek ağırlık PR listesi
router.get("/:userId/max-weight", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.muscle_group,
      wls.weight_kg,
      wls.reps,
      wls.volume_kg,
      wl.workout_date
    FROM workout_log_sets wls
    INNER JOIN workout_logs wl
      ON wls.workout_log_id = wl.id
    INNER JOIN exercises e
      ON wls.exercise_id = e.id
    INNER JOIN (
      SELECT
        wls2.exercise_id,
        MAX(wls2.weight_kg) AS max_weight
      FROM workout_log_sets wls2
      INNER JOIN workout_logs wl2
        ON wls2.workout_log_id = wl2.id
      WHERE wl2.user_id = ?
      GROUP BY wls2.exercise_id
    ) pr
      ON pr.exercise_id = wls.exercise_id
      AND pr.max_weight = wls.weight_kg
    WHERE wl.user_id = ?
    ORDER BY wls.weight_kg DESC, e.name ASC
  `;

  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("Max ağırlık PR hatası:", err);
      return res.status(500).json({
        message: "PR listesi getirilirken hata oluştu.",
      });
    }

    res.json(results);
  });
});

// Kas grubu bazlı toplam hacim
router.get("/:userId/muscle-groups", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      COALESCE(e.muscle_group, 'Genel') AS muscle_group,
      COUNT(wls.id) AS total_sets,
      COALESCE(SUM(wls.volume_kg), 0) AS total_volume_kg
    FROM workout_log_sets wls
    INNER JOIN workout_logs wl
      ON wls.workout_log_id = wl.id
    INNER JOIN exercises e
      ON wls.exercise_id = e.id
    WHERE wl.user_id = ?
    GROUP BY e.muscle_group
    ORDER BY total_volume_kg DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Kas grubu performansı hatası:", err);
      return res.status(500).json({
        message: "Kas grubu performansı getirilirken hata oluştu.",
      });
    }

    const formatted = results.map((item) => ({
      muscle_group: item.muscle_group,
      total_sets: Number(item.total_sets || 0),
      total_volume_kg: Number(item.total_volume_kg || 0),
    }));

    res.json(formatted);
  });
});

module.exports = router;