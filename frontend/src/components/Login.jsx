import React, { useState } from "react";
import api from "../api/api";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("furkan@test.com");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const submitAuth = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Email ve şifre zorunlu.");
      return;
    }

    if (!isLogin && !name.trim()) {
      alert("Kayıt için isim zorunlu.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const payload = isLogin
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

      localStorage.setItem("gymtrack_user", JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      console.error("Auth hatası:", error);

      if (error.response) {
        alert(error.response.data.message || "İşlem başarısız.");
      } else {
        alert("Backend bağlantısı kurulamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb orb-one"></div>
      <div className="auth-bg-orb orb-two"></div>

      <div className="auth-shell">
        <div className="auth-showcase">
          <div className="auth-brand">
            <div className="brand-icon auth-logo">GT</div>
            <div>
              <h1>GymTrack Pro</h1>
              <p>Training, nutrition and performance system.</p>
            </div>
          </div>

          <div className="auth-hero-copy">
            <span className="eyebrow">Premium Fitness Dashboard</span>
            <h2>Vücudunu veriyle yönet.</h2>
            <p>
              Antrenman programlarını, setlerini, günlük kalori-su takibini,
              ölçümlerini ve performans rekorlarını tek panelde kontrol et.
            </p>
          </div>

          <div className="auth-feature-grid">
            <div>
              <strong>PR</strong>
              <span>Performans rekorları</span>
            </div>

            <div>
              <strong>TDEE</strong>
              <span>Hedef kalori takibi</span>
            </div>

            <div>
              <strong>LOG</strong>
              <span>Set ve hacim kaydı</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Giriş Yap
            </button>

            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Kayıt Ol
            </button>
          </div>

          <form className="auth-form" onSubmit={submitAuth}>
            <div>
              <span className="eyebrow">{isLogin ? "Welcome back" : "New account"}</span>
              <h2>{isLogin ? "Hesabına giriş yap" : "Yeni hesap oluştur"}</h2>
              <p>
                {isLogin
                  ? "Antrenman paneline devam etmek için giriş yap."
                  : "Kendi profilinle GymTrack sistemini kullanmaya başla."}
              </p>
            </div>

            {!isLogin && (
              <>
                <label>İsim</label>
                <input
                  type="text"
                  placeholder="Örn: Furkan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </>
            )}

            <label>Email</label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Şifre</label>
            <input
              type="password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading
                ? "İşleniyor..."
                : isLogin
                ? "Giriş Yap"
                : "Kayıt Ol"}
            </button>

            <p className="auth-switch">
              {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
              <button
                type="button"
                onClick={() => setMode(isLogin ? "register" : "login")}
              >
                {isLogin ? "Kayıt ol" : "Giriş yap"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;