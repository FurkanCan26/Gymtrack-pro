const express = require("express");
const router = express.Router();
const db = require("../db");

// Kullanıcının tüm antrenman kayıtlarını getir
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      wl.id AS workout_log_id,
      wl.user_id,
      wl.workout_plan_id,
      wl.workout_date,
      wl.workout_name,
      wl.note AS workout_note,
      wl.created_at,
      wls.id AS set_id,
      wls.set_number,
      wls.weight_kg,
      wls.reps,
      wls.volume_kg,
      wls.note AS set_note,
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.muscle_group
    FROM workout_logs wl
    LEFT JOIN workout_log_sets wls
      ON wl.id = wls.workout_log_id
    LEFT JOIN exercises e
      ON wls.exercise_id = e.id
    WHERE wl.user_id = ?
    ORDER BY wl.workout_date DESC, wl.id DESC, e.name, wls.set_number
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Antrenman kayıtları getirme hatası:", err);
      return res.status(500).json({
        message: "Antrenman kayıtları getirilirken hata oluştu.",
      });
    }

    const logsMap = {};

    rows.forEach((row) => {
      if (!logsMap[row.workout_log_id]) {
        logsMap[row.workout_log_id] = {
          id: row.workout_log_id,
          user_id: row.user_id,
          workout_plan_id: row.workout_plan_id,
          workout_date: row.workout_date,
          workout_name: row.workout_name,
          note: row.workout_note,
          created_at: row.created_at,
          total_volume_kg: 0,
          sets: [],
        };
      }

      if (row.set_id) {
        const volume = Number(row.volume_kg || 0);

        logsMap[row.workout_log_id].total_volume_kg += volume;

        logsMap[row.workout_log_id].sets.push({
          set_id: row.set_id,
          exercise_id: row.exercise_id,
          exercise_name: row.exercise_name,
          muscle_group: row.muscle_group,
          set_number: row.set_number,
          weight_kg: row.weight_kg,
          reps: row.reps,
          volume_kg: row.volume_kg,
          note: row.set_note,
        });
      }
    });

    const result = Object.values(logsMap).map((log) => ({
      ...log,
      total_volume_kg: Number(log.total_volume_kg.toFixed(2)),
    }));

    res.json(result);
  });
});

// Belirli tarihin antrenman kayıtlarını getir
router.get("/:userId/date/:date", (req, res) => {
  const { userId, date } = req.params;

  const sql = `
    SELECT
      wl.id AS workout_log_id,
      wl.user_id,
      wl.workout_plan_id,
      wl.workout_date,
      wl.workout_name,
      wl.note AS workout_note,
      wls.id AS set_id,
      wls.set_number,
      wls.weight_kg,
      wls.reps,
      wls.volume_kg,
      wls.note AS set_note,
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.muscle_group
    FROM workout_logs wl
    LEFT JOIN workout_log_sets wls
      ON wl.id = wls.workout_log_id
    LEFT JOIN exercises e
      ON wls.exercise_id = e.id
    WHERE wl.user_id = ?
      AND wl.workout_date = ?
    ORDER BY wl.id DESC, e.name, wls.set_number
  `;

  db.query(sql, [userId, date], (err, rows) => {
    if (err) {
      console.error("Tarihe göre antrenman getirme hatası:", err);
      return res.status(500).json({
        message: "Antrenman kaydı getirilirken hata oluştu.",
      });
    }

    const logsMap = {};

    rows.forEach((row) => {
      if (!logsMap[row.workout_log_id]) {
        logsMap[row.workout_log_id] = {
          id: row.workout_log_id,
          user_id: row.user_id,
          workout_plan_id: row.workout_plan_id,
          workout_date: row.workout_date,
          workout_name: row.workout_name,
          note: row.workout_note,
          total_volume_kg: 0,
          sets: [],
        };
      }

      if (row.set_id) {
        const volume = Number(row.volume_kg || 0);

        logsMap[row.workout_log_id].total_volume_kg += volume;

        logsMap[row.workout_log_id].sets.push({
          set_id: row.set_id,
          exercise_id: row.exercise_id,
          exercise_name: row.exercise_name,
          muscle_group: row.muscle_group,
          set_number: row.set_number,
          weight_kg: row.weight_kg,
          reps: row.reps,
          volume_kg: row.volume_kg,
          note: row.set_note,
        });
      }
    });

    const result = Object.values(logsMap).map((log) => ({
      ...log,
      total_volume_kg: Number(log.total_volume_kg.toFixed(2)),
    }));

    res.json(result);
  });
});

// Yeni antrenman kaydı oluştur
router.post("/", (req, res) => {
  const {
    user_id,
    workout_plan_id,
    workout_date,
    workout_name,
    note,
  } = req.body;

  if (!user_id || !workout_date) {
    return res.status(400).json({
      message: "user_id ve workout_date zorunludur.",
    });
  }

  const sql = `
    INSERT INTO workout_logs (
      user_id,
      workout_plan_id,
      workout_date,
      workout_name,
      note
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      workout_plan_id || null,
      workout_date,
      workout_name || null,
      note || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Antrenman kaydı oluşturma hatası:", err);
        return res.status(500).json({
          message: "Antrenman kaydı oluşturulurken hata oluştu.",
        });
      }

      res.status(201).json({
        message: "Antrenman kaydı oluşturuldu.",
        workoutLogId: result.insertId,
      });
    }
  );
});

// Antrenman kaydına set ekle
router.post("/:workoutLogId/sets", (req, res) => {
  const workoutLogId = req.params.workoutLogId;

  const {
    exercise_id,
    set_number,
    weight_kg,
    reps,
    note,
  } = req.body;

  if (!exercise_id || !set_number || weight_kg === undefined || !reps) {
    return res.status(400).json({
      message: "exercise_id, set_number, weight_kg ve reps zorunludur.",
    });
  }

  const sql = `
    INSERT INTO workout_log_sets (
      workout_log_id,
      exercise_id,
      set_number,
      weight_kg,
      reps,
      note
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      workoutLogId,
      exercise_id,
      set_number,
      weight_kg,
      reps,
      note || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Set ekleme hatası:", err);
        return res.status(500).json({
          message: "Set eklenirken hata oluştu.",
        });
      }

      res.status(201).json({
        message: "Set başarıyla eklendi.",
        setId: result.insertId,
      });
    }
  );
});

// Günlük toplam kaldırılan ağırlık
router.get("/:userId/daily-volume/:date", (req, res) => {
  const { userId, date } = req.params;

  const sql = `
    SELECT 
      wl.workout_date,
      COALESCE(SUM(wls.volume_kg), 0) AS total_volume_kg,
      COUNT(wls.id) AS total_sets
    FROM workout_logs wl
    LEFT JOIN workout_log_sets wls
      ON wl.id = wls.workout_log_id
    WHERE wl.user_id = ?
      AND wl.workout_date = ?
    GROUP BY wl.workout_date
  `;

  db.query(sql, [userId, date], (err, results) => {
    if (err) {
      console.error("Günlük hacim hesaplama hatası:", err);
      return res.status(500).json({
        message: "Günlük hacim hesaplanırken hata oluştu.",
      });
    }

    if (results.length === 0) {
      return res.json({
        workout_date: date,
        total_volume_kg: 0,
        total_sets: 0,
      });
    }

    res.json({
      workout_date: results[0].workout_date,
      total_volume_kg: Number(results[0].total_volume_kg),
      total_sets: results[0].total_sets,
    });
  });
});

// Haftalık toplam hacim
router.get("/:userId/weekly-volume", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      wl.workout_date,
      COALESCE(SUM(wls.volume_kg), 0) AS total_volume_kg,
      COUNT(wls.id) AS total_sets
    FROM workout_logs wl
    LEFT JOIN workout_log_sets wls
      ON wl.id = wls.workout_log_id
    WHERE wl.user_id = ?
      AND wl.workout_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY wl.workout_date
    ORDER BY wl.workout_date ASC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Haftalık hacim hesaplama hatası:", err);
      return res.status(500).json({
        message: "Haftalık hacim hesaplanırken hata oluştu.",
      });
    }

    res.json(results);
  });
});

// Set sil
router.delete("/sets/:setId", (req, res) => {
  const setId = req.params.setId;

  const sql = "DELETE FROM workout_log_sets WHERE id = ?";

  db.query(sql, [setId], (err) => {
    if (err) {
      console.error("Set silme hatası:", err);
      return res.status(500).json({
        message: "Set silinirken hata oluştu.",
      });
    }

    res.json({ message: "Set silindi." });
  });
});

// Antrenman kaydını komple sil
router.delete("/:workoutLogId", (req, res) => {
  const workoutLogId = req.params.workoutLogId;

  const sql = "DELETE FROM workout_logs WHERE id = ?";

  db.query(sql, [workoutLogId], (err) => {
    if (err) {
      console.error("Antrenman silme hatası:", err);
      return res.status(500).json({
        message: "Antrenman silinirken hata oluştu.",
      });
    }

    res.json({ message: "Antrenman kaydı silindi." });
  });
});

module.exports = router;