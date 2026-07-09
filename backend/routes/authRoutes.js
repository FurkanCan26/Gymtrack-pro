const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

function cleanUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    height_cm: user.height_cm,
    weight_kg: user.weight_kg,
    body_fat_percentage: user.body_fat_percentage,
    activity_level: user.activity_level,
    goal: user.goal,
  };
}

// Kayıt ol
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "İsim, email ve şifre zorunludur.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Şifre en az 6 karakter olmalı.",
      });
    }

    const checkSql = "SELECT id FROM users WHERE email = ?";

    db.query(checkSql, [email], async (checkErr, existingUsers) => {
      if (checkErr) {
        console.error("Email kontrol hatası:", checkErr);
        return res.status(500).json({
          message: "Kayıt sırasında hata oluştu.",
        });
      }

      if (existingUsers.length > 0) {
        return res.status(409).json({
          message: "Bu email ile kayıtlı kullanıcı zaten var.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users (
          name,
          email,
          password_hash,
          age,
          gender,
          height_cm,
          weight_kg,
          body_fat_percentage,
          activity_level,
          goal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          name,
          email,
          passwordHash,
          null,
          "male",
          null,
          null,
          null,
          "moderate",
          "maintain",
        ],
        (insertErr, result) => {
          if (insertErr) {
            console.error("Kullanıcı kayıt hatası:", insertErr);
            return res.status(500).json({
              message: "Kullanıcı oluşturulurken hata oluştu.",
            });
          }

          const userSql = `
            SELECT
              id,
              name,
              email,
              age,
              gender,
              height_cm,
              weight_kg,
              body_fat_percentage,
              activity_level,
              goal
            FROM users
            WHERE id = ?
          `;

          db.query(userSql, [result.insertId], (userErr, users) => {
            if (userErr) {
              console.error("Kayıt sonrası kullanıcı getirme hatası:", userErr);
              return res.status(500).json({
                message: "Kullanıcı oluşturuldu ama bilgiler alınamadı.",
              });
            }

            res.status(201).json({
              message: "Kayıt başarılı.",
              user: cleanUser(users[0]),
            });
          });
        }
      );
    });
  } catch (error) {
    console.error("Register genel hata:", error);
    res.status(500).json({
      message: "Sunucu hatası.",
    });
  }
});

// Giriş yap
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email ve şifre zorunludur.",
    });
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      password_hash,
      age,
      gender,
      height_cm,
      weight_kg,
      body_fat_percentage,
      activity_level,
      goal
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (err, users) => {
    if (err) {
      console.error("Login sorgu hatası:", err);
      return res.status(500).json({
        message: "Giriş sırasında hata oluştu.",
      });
    }

    if (users.length === 0) {
      return res.status(401).json({
        message: "Email veya şifre hatalı.",
      });
    }

    const user = users[0];

    if (!user.password_hash) {
      return res.status(401).json({
        message: "Bu kullanıcı için şifre tanımlı değil. Yeni kayıt oluştur.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Email veya şifre hatalı.",
      });
    }

    res.json({
      message: "Giriş başarılı.",
      user: cleanUser(user),
    });
  });
});

module.exports = router;