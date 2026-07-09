import React, { useEffect, useState } from "react";
import api from "../api/api";

function ProgressPhotos() {
    const today = getTodayDate();

    const [photos, setPhotos] = useState([]);
    const [photoDate, setPhotoDate] = useState(today);
    const [note, setNote] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        getPhotos();
    }, []);

    const getPhotos = async () => {
        try {
            const response = await api.get("/photos/1");
            setPhotos(response.data);
        } catch (error) {
            console.error("Fotoğraflar alınamadı:", error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl("");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const uploadPhoto = async (e) => {
        e.preventDefault();

        if (!photoDate) {
            alert("Tarih seçmelisin.");
            return;
        }

        if (!selectedFile) {
            alert("Fotoğraf seçmelisin.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("user_id", "1");
            formData.append("photo_date", photoDate);
            formData.append("note", note);
            formData.append("photo", selectedFile);

            await api.post("/photos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSelectedFile(null);
            setPreviewUrl("");
            setNote("");
            setPhotoDate(today);

            await getPhotos();

            alert("Fotoğraf yüklendi.");
        } catch (error) {
            console.error("Fotoğraf yüklenemedi:", error);

            if (error.response) {
                alert(error.response.data.message || "Fotoğraf yüklenemedi.");
            } else {
                alert("Backend bağlantısı kurulamadı.");
            }
        }
    };

    const deletePhoto = async (photoId) => {
        const ok = window.confirm("Bu fotoğraf silinsin mi?");
        if (!ok) return;

        try {
            await api.delete(`/photos/${photoId}`);
            await getPhotos();
        } catch (error) {
            console.error("Fotoğraf silinemedi:", error);
        }
    };

    return (
        <div className="photos-page">
            <div className="two-column">
                <div className="card">
                    <h2>Gelişim Fotoğrafı Yükle</h2>

                    <form className="panel-form" onSubmit={uploadPhoto}>
                        <label>Tarih</label>
                        <input
                            type="date"
                            value={photoDate}
                            onChange={(e) => setPhotoDate(e.target.value)}
                        />

                        <label>Fotoğraf</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />

                        <label>Not</label>
                        <textarea
                            placeholder="Örn: Sabah aç karna, pump yok, ışık iyi..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />

                        {previewUrl && (
                            <div className="photo-preview">
                                <img src={previewUrl} alt="Ön izleme" />
                            </div>
                        )}

                        <button type="submit">Fotoğraf Yükle</button>
                    </form>
                </div>

                <div className="card">
                    <h2>Fotoğraf Özeti</h2>

                    <div className="summary-list">
                        <div>
                            <span>Toplam Fotoğraf</span>
                            <strong>{photos.length}</strong>
                        </div>

                        <div>
                            <span>Son Tarih</span>
                            <strong>
                                {photos.length > 0 ? formatDate(photos[0].photo_date) : "-"}
                            </strong>
                        </div>
                    </div>

                    <p className="muted">
                        Aynı açı, aynı ışık ve benzer saatlerde fotoğraf eklemek gelişimi
                        daha doğru görmeni sağlar.
                    </p>
                </div>
            </div>

            <div className="card">
                <h2>Fotoğraf Geçmişi</h2>

                {photos.length === 0 ? (
                    <p className="muted">Henüz fotoğraf yüklenmedi.</p>
                ) : (
                    <div className="photo-grid">
                        {photos.map((photo) => (
                            <div className="photo-card" key={photo.id}>
                                <img
                                    src={getPhotoUrl(photo.image_path)}
                                    alt="Gelişim"
                                />
                                <div className="photo-content">
                                    <span>{formatDate(photo.photo_date)}</span>
                                    <p>{photo.note || "Not yok"}</p>

                                    <button
                                        type="button"
                                        className="danger-btn"
                                        onClick={() => deletePhoto(photo.id)}
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const cleanDate = String(dateValue).split("T")[0];
    const [year, month, day] = cleanDate.split("-");

    if (!year || !month || !day) {
        return cleanDate;
    }

    return `${day}.${month}.${year}`;
}
function getPhotoUrl(imagePath) {
  if (!imagePath) return "";

  const cleanPath = String(imagePath).replace(/^\/+/, "");

  return `http://localhost:5000/${cleanPath}`;
}

export default ProgressPhotos;
