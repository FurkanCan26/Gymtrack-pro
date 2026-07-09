import React, { useState } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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
    return (
      <>
        <Login onLogin={handleLogin} />

        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen w-full bg-slate-950 text-slate-100 grid ${
          isSidebarCollapsed
            ? "grid-cols-[78px_minmax(0,1fr)]"
            : "grid-cols-[260px_minmax(0,1fr)]"
        }`}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          currentUser={currentUser}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="min-w-0 min-h-screen overflow-x-hidden px-5 py-5 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.12),transparent_30%)]">
          <header className="mb-5 flex items-center justify-between gap-5 rounded-[24px] border border-slate-700/60 bg-slate-900/70 px-5 py-4 shadow-xl shadow-black/25">
            <div className="min-w-0">
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-sky-400">
                GymTrack Pro
              </span>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-50">
                {pageInfo.title}
              </h1>

              <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-400">
                {pageInfo.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-extrabold text-emerald-300 lg:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
                Aktif takip
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-xs font-extrabold text-slate-100">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-white shadow-lg shadow-blue-700/30">
                  {getInitial(currentUser.name)}
                </span>

                <span className="hidden max-w-[120px] truncate md:block">
                  {currentUser.name}
                </span>
              </div>
            </div>
          </header>

          <section className="min-w-0">
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

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
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