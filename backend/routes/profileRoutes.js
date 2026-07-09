const express = require("express");
const router = express.Router();
const db = require("../db");

// Profil getir
router.get("/:id", (req, res) => {
  const userId = req.params.id;

  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Profil getirme hatası:", err);
      return res.status(500).json({ message: "Profil getirilirken hata oluştu." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const user = results[0];

    const bmr = calculateBMR(user);
    const tdee = calculateTDEE(bmr, user.activity_level);
    const targetCalories = calculateTargetCalories(tdee, user.goal);

    res.json({
      ...user,
      bmr,
      tdee,
      target_calories: targetCalories,
    });
  });
});

// Profil güncelle
router.put("/:id", (req, res) => {
  const userId = req.params.id;

  const {
    name,
    age,
    gender,
    height_cm,
    weight_kg,
    body_fat_percentage,
    activity_level,
    goal,
  } = req.body;

  const sql = `
    UPDATE users
    SET 
      name = ?,
      age = ?,
      gender = ?,
      height_cm = ?,
      weight_kg = ?,
      body_fat_percentage = ?,
      activity_level = ?,
      goal = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      age,
      gender,
      height_cm,
      weight_kg,
      body_fat_percentage,
      activity_level,
      goal,
      userId,
    ],
    (err, result) => {
      if (err) {
        console.error("Profil güncelleme hatası:", err);
        return res.status(500).json({ message: "Profil güncellenirken hata oluştu." });
      }

      res.json({ message: "Profil başarıyla güncellendi." });
    }
  );
});

// BMR hesaplama
function calculateBMR(user) {
  const weight = Number(user.weight_kg);
  const height = Number(user.height_cm);
  const age = Number(user.age);

  if (user.gender === "female") {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }

  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

// Aktiviteye göre TDEE
function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = multipliers[activityLevel] || 1.55;

  return Math.round(bmr * multiplier);
}

// Hedefe göre kalori
function calculateTargetCalories(tdee, goal) {
  if (goal === "lose") {
    return tdee - 500;
  }

  if (goal === "gain") {
    return tdee + 300;
  }

  return tdee;
}

module.exports = router;