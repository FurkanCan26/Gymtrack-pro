import React from "react";

function Sidebar({ activePage, setActivePage, currentUser, onLogout }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: "⌁" },
    { key: "workoutPlans", label: "Programlar", icon: "▦" },
    { key: "workoutLogger", label: "Antrenman Kaydı", icon: "◉" },
    { key: "dailyTracking", label: "Günlük Takip", icon: "◌" },
    { key: "analytics", label: "Analizler", icon: "⌁" },
    { key: "performance", label: "Performans", icon: "◆" },
    { key: "measurements", label: "Ölçümler", icon: "◇" },
    { key: "progressPhotos", label: "Fotoğraflar", icon: "▧" },
    { key: "exercises", label: "Egzersizler", icon: "☰" },
    { key: "profile", label: "Profil", icon: "◎" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">GT</div>

        <div>
          <h2>GymTrack</h2>
          <p>Performance System</p>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activePage === item.key ? "active" : ""}
            onClick={() => setActivePage(item.key)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-card user-sidebar-card">
        <span>Aktif kullanıcı</span>
        <strong>{currentUser?.name || "Kullanıcı"}</strong>
        <p>{currentUser?.email || "Email bilgisi yok"}</p>

        <button type="button" className="logout-btn" onClick={onLogout}>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;