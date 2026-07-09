const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Sadece görsel dosyası yükleyebilirsin."), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Fotoğrafları getir
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      id,
      user_id,
      photo_date,
      image_path,
      note,
      created_at
    FROM progress_photos
    WHERE user_id = ?
    ORDER BY photo_date DESC, id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fotoğraf getirme hatası:", err);
      return res.status(500).json({
        message: "Fotoğraflar getirilirken hata oluştu.",
      });
    }

    res.json(results);
  });
});

// Fotoğraf yükle
router.post("/", upload.single("photo"), (req, res) => {
  const { user_id, photo_date, note } = req.body;

  if (!user_id || !photo_date || !req.file) {
    return res.status(400).json({
      message: "user_id, photo_date ve photo zorunludur.",
    });
  }

  const imagePath = `uploads/${req.file.filename}`;

  const sql = `
    INSERT INTO progress_photos (
      user_id,
      photo_date,
      image_path,
      note
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, photo_date, imagePath, note || null], (err, result) => {
    if (err) {
      console.error("Fotoğraf ekleme hatası:", err);
      return res.status(500).json({
        message: "Fotoğraf kaydedilirken hata oluştu.",
      });
    }

    res.status(201).json({
      message: "Fotoğraf başarıyla yüklendi.",
      photoId: result.insertId,
      imagePath,
    });
  });
});

// Fotoğraf kaydını ve dosyayı sil
router.delete("/:photoId", (req, res) => {
  const photoId = req.params.photoId;

  const selectSql = "SELECT image_path FROM progress_photos WHERE id = ?";

  db.query(selectSql, [photoId], (selectErr, results) => {
    if (selectErr) {
      console.error("Fotoğraf bulma hatası:", selectErr);
      return res.status(500).json({
        message: "Fotoğraf bulunurken hata oluştu.",
      });
    }

    const imagePath = results[0]?.image_path;

    const deleteSql = "DELETE FROM progress_photos WHERE id = ?";

    db.query(deleteSql, [photoId], (deleteErr) => {
      if (deleteErr) {
        console.error("Fotoğraf silme hatası:", deleteErr);
        return res.status(500).json({
          message: "Fotoğraf silinirken hata oluştu.",
        });
      }

      if (imagePath) {
        const filePath = path.join(__dirname, "..", imagePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        message: "Fotoğraf silindi.",
      });
    });
  });
});

module.exports = router;