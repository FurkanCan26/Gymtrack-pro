import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  const isLoginMode = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.warning("Email ve şifre zorunlu.");
      return;
    }

    if (!isLoginMode && !name.trim()) {
      toast.warning("Kayıt için ad soyad zorunlu.");
      return;
    }

    try {
      setIsProcessing(true);

      const endpoint = isLoginMode ? "/auth/login" : "/auth/register";

      const payload = isLoginMode
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          };

      const response = await api.post(endpoint, payload);

      const user = response.data.user || response.data;

      if (!user?.id) {
        toast.error("Kullanıcı bilgisi alınamadı.");
        return;
      }

      toast.success(isLoginMode ? "Giriş başarılı." : "Kayıt başarılı.");

      onLogin(user);
    } catch (error) {
      console.error("Auth hatası:", error);

      if (error.response) {
        toast.error(error.response.data.message || "İşlem başarısız.");
      } else {
        toast.error("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const switchMode = () => {
    setMode(isLoginMode ? "register" : "login");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative grid min-h-screen place-items-center px-5 py-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl" />

        <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-700/60 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1fr_420px]">
          <div className="relative hidden overflow-hidden border-r border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/60 p-8 lg:block">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-2xl font-black text-white shadow-xl shadow-blue-700/30">
                  GT
                </div>

                <h1 className="mt-6 max-w-md text-4xl font-black tracking-tight text-slate-50">
                  GymTrack Pro ile gelişimini tek panelden yönet.
                </h1>

                <p className="mt-4 max-w-md text-sm font-semibold leading-6 text-slate-400">
                  Kalori, su, ölçüm, fotoğraf, antrenman hacmi ve performans
                  kayıtlarını modern bir takip sisteminde birleştir.
                </p>
              </div>

              <div className="grid gap-3">
                <FeatureItem title="Antrenman Takibi" text="Set, tekrar ve ağırlık kayıtları." />
                <FeatureItem title="Kalori Kontrolü" text="BMR, TDEE ve hedef kalori takibi." />
                <FeatureItem title="Gelişim Arşivi" text="Ölçüm ve fotoğraf geçmişi." />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mx-auto max-w-sm">
              <div className="mb-7 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-xl font-black text-white shadow-xl shadow-blue-700/30 lg:hidden">
                  GT
                </div>

                <span className="mt-4 inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-sky-300">
                  GymTrack Pro
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-50">
                  {isLoginMode ? "Tekrar hoş geldin" : "Hesap oluştur"}
                </h2>

                <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
                  {isLoginMode
                    ? "Paneline giriş yap ve bugünkü gelişimini takip et."
                    : "Yeni hesabını oluşturup sistemi kullanmaya başla."}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLoginMode && (
                  <FormField label="Ad Soyad">
                    <input
                      type="text"
                      placeholder="Örn: Furkan Can"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                )}

                <FormField label="Email">
                  <input
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Şifre">
                  <input
                    type="password"
                    placeholder="Şifren"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing
                    ? "İşleniyor..."
                    : isLoginMode
                    ? "Giriş Yap"
                    : "Kayıt Ol"}
                </button>
              </form>

              <div className="mt-5 rounded-[20px] border border-slate-700/60 bg-slate-950/45 p-4 text-center">
                <p className="text-xs font-semibold text-slate-400">
                  {isLoginMode
                    ? "Hesabın yok mu?"
                    : "Zaten hesabın var mı?"}
                </p>

                <button
                  type="button"
                  onClick={switchMode}
                  className="mt-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-2.5 text-xs font-black text-sky-200 hover:bg-sky-500 hover:text-white"
                >
                  {isLoginMode ? "Yeni hesap oluştur" : "Giriş ekranına dön"}
                </button>
              </div>

              <p className="mt-5 text-center text-[11px] font-semibold leading-5 text-slate-600">
                Demo / lokal geliştirme ortamı için hazırlanmış GymTrack Pro
                kullanıcı girişi.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-3 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10";

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

function FeatureItem({ title, text }) {
  return (
    <div className="rounded-[20px] border border-slate-700/60 bg-slate-950/45 p-4">
      <h3 className="text-sm font-black text-slate-50">{title}</h3>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
        {text}
      </p>
    </div>
  );
}

export default Login;