const express = require("express");
const router = express.Router();
const db = require("../db");

// Kullanıcının tüm antrenman programlarını getir
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      wp.id AS plan_id,
      wp.user_id,
      wp.day_name,
      wp.plan_name,
      wp.created_at,
      wpe.id AS plan_exercise_id,
      wpe.exercise_order,
      wpe.target_sets,
      wpe.target_reps,
      wpe.target_weight,
      wpe.note,
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.muscle_group
    FROM workout_plans wp
    LEFT JOIN workout_plan_exercises wpe 
      ON wp.id = wpe.workout_plan_id
    LEFT JOIN exercises e 
      ON wpe.exercise_id = e.id
    WHERE wp.user_id = ?
    ORDER BY wp.id, wpe.exercise_order
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Program getirme hatası:", err);
      return res.status(500).json({ message: "Programlar getirilirken hata oluştu." });
    }

    const plansMap = {};

    rows.forEach((row) => {
      if (!plansMap[row.plan_id]) {
        plansMap[row.plan_id] = {
          id: row.plan_id,
          user_id: row.user_id,
          day_name: row.day_name,
          plan_name: row.plan_name,
          created_at: row.created_at,
          exercises: [],
        };
      }

      if (row.exercise_id) {
        plansMap[row.plan_id].exercises.push({
          plan_exercise_id: row.plan_exercise_id,
          exercise_id: row.exercise_id,
          name: row.exercise_name,
          muscle_group: row.muscle_group,
          exercise_order: row.exercise_order,
          target_sets: row.target_sets,
          target_reps: row.target_reps,
          target_weight: row.target_weight,
          note: row.note,
        });
      }
    });

    res.json(Object.values(plansMap));
  });
});

// Yeni program günü oluştur
router.post("/", (req, res) => {
  const { user_id, day_name, plan_name } = req.body;

  if (!user_id || !day_name || !plan_name) {
    return res.status(400).json({
      message: "user_id, day_name ve plan_name zorunludur.",
    });
  }

  const sql = `
    INSERT INTO workout_plans (user_id, day_name, plan_name)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [user_id, day_name, plan_name], (err, result) => {
    if (err) {
      console.error("Program oluşturma hatası:", err);
      return res.status(500).json({ message: "Program oluşturulurken hata oluştu." });
    }

    res.status(201).json({
      message: "Antrenman programı oluşturuldu.",
      planId: result.insertId,
    });
  });
});

// Programa hareket ekle
router.post("/:planId/exercises", (req, res) => {
  const planId = req.params.planId;

  const {
    exercise_id,
    exercise_order,
    target_sets,
    target_reps,
    target_weight,
    note,
  } = req.body;

  if (!exercise_id) {
    return res.status(400).json({ message: "exercise_id zorunludur." });
  }

  const sql = `
    INSERT INTO workout_plan_exercises (
      workout_plan_id,
      exercise_id,
      exercise_order,
      target_sets,
      target_reps,
      target_weight,
      note
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      planId,
      exercise_id,
      exercise_order || 1,
      target_sets || null,
      target_reps || null,
      target_weight || null,
      note || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Programa hareket ekleme hatası:", err);
        return res.status(500).json({ message: "Programa hareket eklenirken hata oluştu." });
      }

      res.status(201).json({
        message: "Hareket programa eklendi.",
        planExerciseId: result.insertId,
      });
    }
  );
});

// Program hareketi sil
router.delete("/exercise/:planExerciseId", (req, res) => {
  const planExerciseId = req.params.planExerciseId;

  const sql = "DELETE FROM workout_plan_exercises WHERE id = ?";

  db.query(sql, [planExerciseId], (err) => {
    if (err) {
      console.error("Program hareketi silme hatası:", err);
      return res.status(500).json({ message: "Program hareketi silinirken hata oluştu." });
    }

    res.json({ message: "Program hareketi silindi." });
  });
});

// Programı komple sil
router.delete("/:planId", (req, res) => {
  const planId = req.params.planId;

  const sql = "DELETE FROM workout_plans WHERE id = ?";

  db.query(sql, [planId], (err) => {
    if (err) {
      console.error("Program silme hatası:", err);
      return res.status(500).json({ message: "Program silinirken hata oluştu." });
    }

    res.json({ message: "Program silindi." });
  });
});

module.exports = router;