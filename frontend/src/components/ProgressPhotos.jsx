import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import api from "../api/api";

function ProgressPhotos() {
  const [photos, setPhotos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoDate, setPhotoDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getPhotos();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const getPhotos = async () => {
    try {
      const response = await api.get("/photos/1");
      setPhotos(response.data);
    } catch (error) {
      console.error("Fotoğraflar alınamadı:", error);
      toast.error("Fotoğraflar alınamadı.");
    }
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.warning("Yüklemek için fotoğraf seçmelisin.");
      return;
    }

    if (!photoDate) {
      toast.warning("Tarih seçmelisin.");
      return;
    }

    try {
      setIsProcessing(true);

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
      setPhotoDate(getTodayDate());
      setNote("");

      const fileInput = document.getElementById("progress-photo-file");
      if (fileInput) {
        fileInput.value = "";
      }

      await getPhotos();

      toast.success("Fotoğraf yüklendi.");
    } catch (error) {
      console.error("Fotoğraf yüklenemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Fotoğraf yüklenemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const requestDeletePhoto = (photo) => {
    setDeleteTarget(photo);
  };

  const deletePhoto = async () => {
    if (!deleteTarget) return;

    try {
      setIsProcessing(true);

      await api.delete(`/photos/${deleteTarget.id}`);
      await getPhotos();

      toast.success("Fotoğraf silindi.");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Fotoğraf silinemedi:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Fotoğraf silinemedi.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const latestPhoto = photos.length > 0 ? photos[0] : null;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Toplam Fotoğraf"
          value={photos.length}
          description="Arşiv kaydı"
          tone="blue"
        />

        <SummaryStat
          label="Son Fotoğraf"
          value={latestPhoto ? formatDate(latestPhoto.photo_date) : "Yok"}
          description="En güncel kayıt"
          tone="violet"
        />

        <SummaryStat
          label="Seçili Dosya"
          value={selectedFile ? "Hazır" : "Yok"}
          description={selectedFile ? selectedFile.name : "Dosya seçilmedi"}
          tone="emerald"
        />

        <SummaryStat
          label="Gelişim"
          value="Arşiv"
          description="Fotoğraf takibi"
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mb-5">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
              Yeni Fotoğraf
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Gelişim Fotoğrafı Yükle
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              Aynı ışık, aynı açı ve benzer saatlerde çekim yapmak gelişimi daha
              net gösterir.
            </p>
          </div>

          <form className="relative space-y-4" onSubmit={uploadPhoto}>
            <FormField label="Fotoğraf">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-600 bg-slate-950/45 p-5 text-center hover:border-sky-400/60 hover:bg-sky-500/5">
                <input
                  id="progress-photo-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="hidden"
                />

                <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
                  ▧
                </span>

                <strong className="mt-3 block text-sm font-black text-slate-100">
                  {selectedFile ? selectedFile.name : "Fotoğraf seç"}
                </strong>

                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  JPG, PNG veya WEBP yükleyebilirsin.
                </span>
              </label>
            </FormField>

            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Tarih">
                <input
                  type="date"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Durum">
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-black text-slate-300">
                  {selectedFile ? "Yüklemeye hazır" : "Dosya bekleniyor"}
                </div>
              </FormField>
            </div>

            <FormField label="Not">
              <textarea
                placeholder="Örn: Sabah aç karna, 98 kg, pump yok..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={textareaClass}
              />
            </FormField>

            <button
              type="submit"
              disabled={isProcessing}
              className={primaryButtonClass}
            >
              {isProcessing ? "Yükleniyor..." : "Fotoğrafı Yükle"}
            </button>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">
              Önizleme
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Seçili Fotoğraf
            </h2>

            <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-700/60 bg-slate-950/45">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Önizleme"
                  className="h-[320px] w-full object-cover"
                />
              ) : latestPhoto ? (
                <img
                  src={getPhotoUrl(latestPhoto.image_path)}
                  alt="Son gelişim fotoğrafı"
                  className="h-[320px] w-full object-cover"
                />
              ) : (
                <div className="grid h-[320px] place-items-center p-6 text-center">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
                      ▧
                    </div>

                    <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
                      Henüz önizlenecek fotoğraf yok.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 rounded-xl border border-slate-700/60 bg-slate-950/45 p-4 text-xs font-semibold leading-5 text-slate-400">
              Fotoğraf seçtiğinde burada önizleme görünür. Dosya seçmezsen son
              yüklediğin fotoğraf gösterilir.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Arşiv
            </span>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
              Gelişim Fotoğrafları
            </h2>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
              Zaman içindeki fiziksel değişimini fotoğraflarla takip et.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-700/70 bg-slate-950/50 px-3 py-1.5 text-xs font-black text-slate-300">
            {photos.length} fotoğraf
          </span>
        </div>

        {photos.length === 0 ? (
          <EmptyState text="Henüz gelişim fotoğrafı yüklemedin." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="overflow-hidden rounded-[22px] border border-slate-700/60 bg-slate-950/45 shadow-lg shadow-black/15"
              >
                <div className="relative">
                  <img
                    src={getPhotoUrl(photo.image_path)}
                    alt="Gelişim fotoğrafı"
                    className="h-64 w-full object-cover"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-[11px] font-black text-slate-100 backdrop-blur">
                    {formatDate(photo.photo_date)}
                  </span>
                </div>

                <div className="p-4">
                  <p className="min-h-10 text-xs font-semibold leading-5 text-slate-400">
                    {photo.note || "Not yok"}
                  </p>

                  <button
                    type="button"
                    onClick={() => requestDeletePhoto(photo)}
                    className={`${dangerButtonClass} mt-4 w-full`}
                  >
                    Fotoğrafı Sil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteTarget &&
        createPortal(
          <ConfirmModal
            title="Fotoğraf silinsin mi?"
            description={`${formatDate(
              deleteTarget.photo_date
            )} tarihli gelişim fotoğrafı silinecek.`}
            confirmText="Evet, Sil"
            isProcessing={isProcessing}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={deletePhoto}
          />,
          document.body
        )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const textareaClass =
  "min-h-24 w-full resize-y rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-semibold leading-5 text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

const primaryButtonClass =
  "w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500 hover:text-white";

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryStat({ label, value, description, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600/16 to-slate-900 border-blue-400/20",
    violet: "from-violet-600/16 to-slate-900 border-violet-400/20",
    emerald: "from-emerald-600/16 to-slate-900 border-emerald-400/20",
    cyan: "from-cyan-600/16 to-slate-900 border-cyan-400/20",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border bg-gradient-to-br p-4 shadow-lg shadow-black/20 ${tones[tone]}`}
    >
      <div className="absolute -right-9 -top-9 h-24 w-24 rounded-full bg-white/5" />

      <span className="relative text-xs font-bold text-slate-400">
        {label}
      </span>

      <strong className="relative mt-2 block break-words text-xl font-black text-slate-50">
        {value}
      </strong>

      <small className="relative mt-1 block truncate text-xs font-semibold text-slate-500">
        {description}
      </small>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
        ▧
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">{text}</p>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmText,
  isProcessing,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[99999] grid place-items-center bg-slate-950/75 p-6 backdrop-blur-xl"
      onClick={() => {
        if (!isProcessing) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-[26px] border border-slate-700/60 bg-slate-900 p-6 text-center shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-red-400/30 bg-red-500/10 text-2xl font-black text-red-200">
          !
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-50">{title}</h3>

        <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
          {description}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={isProcessing}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-black text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
          >
            Vazgeç
          </button>

          <button
            type="button"
            disabled={isProcessing}
            className="rounded-xl bg-red-500 px-4 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onConfirm}
          >
            {isProcessing ? "İşleniyor..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function getPhotoUrl(imagePath) {
  if (!imagePath) return "";

  if (String(imagePath).startsWith("http")) {
    return imagePath;
  }

  const cleanPath = String(imagePath).replace(/^\/+/, "");
  return `http://localhost:5000/${cleanPath}`;
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

  if (!year || !month || !day) return cleanDate;

  return `${day}.${month}.${year}`;
}

export default ProgressPhotos;