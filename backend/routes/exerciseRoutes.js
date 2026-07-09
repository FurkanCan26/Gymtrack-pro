const express = require("express");
const router = express.Router();
const db = require("../db");

// Tüm hareketleri getir
router.get("/", (req, res) => {
  const sql = "SELECT * FROM exercises ORDER BY muscle_group, name";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Egzersiz getirme hatası:", err);
      return res.status(500).json({ message: "Egzersizler getirilirken hata oluştu." });
    }

    res.json(results);
  });
});

// Yeni hareket ekle
router.post("/", (req, res) => {
  const { name, muscle_group } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Hareket adı zorunludur." });
  }

  const sql = "INSERT INTO exercises (name, muscle_group) VALUES (?, ?)";

  db.query(sql, [name, muscle_group], (err, result) => {
    if (err) {
      console.error("Egzersiz ekleme hatası:", err);
      return res.status(500).json({ message: "Egzersiz eklenirken hata oluştu." });
    }

    res.status(201).json({
      message: "Egzersiz başarıyla eklendi.",
      exerciseId: result.insertId,
    });
  });
});

module.exports = router;