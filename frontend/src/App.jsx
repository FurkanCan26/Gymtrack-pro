import React, { useState } from "react";
import "./App.css";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import WorkoutPlans from "./components/WorkoutPlans";
import WorkoutLogger from "./components/WorkoutLogger";
import DailyTracking from "./components/DailyTracking";
import Analytics from "./components/Analytics";
import Performance from "./components/Performance";
import Measurements from "./components/Measurements";
import ProgressPhotos from "./components/ProgressPhotos";
import ExerciseList from "./components/ExerciseList";
import ProfilePage from "./components/ProfilePage";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  const pageInfo = getPageInfo(activePage);

  const handleLogin = (user) => {
    localStorage.setItem("gymtrack_user", JSON.stringify(user));
    setCurrentUser(user);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("gymtrack_user");
    setCurrentUser(null);
    setActivePage("dashboard");
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="content">
        <header className="page-header premium-header">
          <div>
            <span className="eyebrow">GymTrack Pro</span>
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.description}</p>
          </div>

          <div className="header-right">
            <div className="status-pill">
              <span className="status-dot"></span>
              Aktif takip
            </div>

            <div className="user-pill">
              <span>{getInitial(currentUser.name)}</span>
              {currentUser.name}
            </div>
          </div>
        </header>

        <section className="page-content">
          {activePage === "dashboard" && <Dashboard currentUser={currentUser} />}
          {activePage === "workoutPlans" && <WorkoutPlans currentUser={currentUser} />}
          {activePage === "workoutLogger" && <WorkoutLogger currentUser={currentUser} />}
          {activePage === "dailyTracking" && <DailyTracking currentUser={currentUser} />}
          {activePage === "analytics" && <Analytics currentUser={currentUser} />}
          {activePage === "performance" && <Performance currentUser={currentUser} />}
          {activePage === "measurements" && <Measurements currentUser={currentUser} />}
          {activePage === "progressPhotos" && <ProgressPhotos currentUser={currentUser} />}
          {activePage === "exercises" && <ExerciseList currentUser={currentUser} />}
          {activePage === "profile" && <ProfilePage currentUser={currentUser} />}
        </section>
      </main>
    </div>
  );
}

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("gymtrack_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("gymtrack_user");
    return null;
  }
}

function getInitial(name) {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
}

function getPageInfo(activePage) {
  const pages = {
    dashboard: {
      title: "Kontrol Paneli",
      description:
        "Bugünkü kalori, su, hacim ve gelişim durumunu tek ekrandan takip et.",
    },
    workoutPlans: {
      title: "Antrenman Programları",
      description:
        "Program şablonlarını oluştur, hareketleri düzenle ve planını yönet.",
    },
    workoutLogger: {
      title: "Antrenman Kaydı",
      description: "Program seç, antrenmanı başlat ve gerçek setlerini kaydet.",
    },
    dailyTracking: {
      title: "Günlük Takip",
      description: "Kalori, su, kilo ve günlük notlarını düzenli şekilde kaydet.",
    },
    analytics: {
      title: "Analiz / Grafikler",
      description: "Kilo, kalori, su ve hacim değişimini grafiklerle incele.",
    },
    performance: {
      title: "Rekorlar / Performans",
      description:
        "PR değerlerini, toplam hacmini ve hareket bazlı performansını gör.",
    },
    measurements: {
      title: "Ölçümlerim",
      description: "Kilo, bel, kol, omuz ve yağ oranı ölçümlerini takip et.",
    },
    progressPhotos: {
      title: "Gelişim Fotoğrafları",
      description: "Fiziksel gelişimini fotoğraflarla arşivle.",
    },
    exercises: {
      title: "Egzersiz Havuzu",
      description: "Uygulamada kullanacağın hareket listesini yönet.",
    },
    profile: {
      title: "Profil / Kalori",
      description:
        "BMR, TDEE ve hedef kalori hesabını profil bilgilerine göre güncelle.",
    },
  };

  return pages[activePage] || pages.dashboard;
}

export default App;