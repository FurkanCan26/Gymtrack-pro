import React from "react";

const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: "⌁" },
    { key: "workoutPlans", label: "Programlar", icon: "▦" },
    { key: "workoutLogger", label: "Antrenman Kaydı", icon: "◎" },
    { key: "dailyTracking", label: "Günlük Takip", icon: "◌" },
    { key: "analytics", label: "Analizler", icon: "⌁" },
    { key: "performance", label: "Performans", icon: "◆" },
    { key: "measurements", label: "Ölçümler", icon: "◇" },
    { key: "progressPhotos", label: "Fotoğraflar", icon: "▧" },
    { key: "exercises", label: "Egzersizler", icon: "☰" },
    { key: "profile", label: "Profil", icon: "◉" },
];

function Sidebar({
    activePage,
    setActivePage,
    currentUser,
    onLogout,
    isCollapsed,
    onToggleSidebar,
}) {
    return (
        <aside
            className={`sticky top-0 h-screen overflow-y-auto overflow-x-hidden border-r border-slate-700/50 bg-slate-950/95 shadow-lg shadow-black/25 ${isCollapsed ? "w-[78px] px-2 py-4" : "w-[260px] px-3 py-4"
                }`}
        >
            <div
                className={`mb-5 rounded-[22px] border border-slate-700/60 bg-slate-900/75 shadow-lg shadow-black/20 ${isCollapsed ? "px-2 py-3" : "px-3 py-3"
                    }`}
            >
                {isCollapsed ? (
                    <div className="space-y-3">
                        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-base font-black text-white shadow-lg shadow-blue-700/25">
                            GT
                        </div>

                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="mx-auto grid h-8 w-8 place-items-center rounded-lg border border-slate-700/60 bg-slate-800/90 text-sm font-black text-slate-200 hover:bg-blue-600 hover:text-white"
                            title="Menüyü aç"
                        >
                            ☰
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-[40px_minmax(0,1fr)_32px] items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-blue-700/25">
                            GT
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-black leading-tight tracking-tight text-slate-50">
                                GymTrack
                            </h2>

                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />

                                <p className="truncate text-[11px] font-bold leading-none text-slate-400">
                                    Pro Panel
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700/60 bg-slate-800/90 text-sm font-black text-slate-200 hover:bg-blue-600 hover:text-white"
                            title="Menüyü kapat"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = activePage === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setActivePage(item.key)}
                            title={item.label}
                            className={`group relative flex min-h-12 w-full items-center rounded-xl font-black ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                                } ${isActive
                                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-700/20"
                                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                }`}
                        >
                            {isActive && !isCollapsed && (
                                <span className="absolute -left-1.5 h-7 w-1 rounded-full bg-sky-300" />
                            )}

                            <span
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs ${isActive
                                        ? "bg-white/10 text-white"
                                        : "bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white"
                                    }`}
                            >
                                {item.icon}
                            </span>

                            {!isCollapsed && (
                                <span className="truncate text-sm">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div
                className={`mt-5 rounded-[20px] border border-slate-700/60 bg-slate-900/70 shadow-lg shadow-black/20 ${isCollapsed ? "p-2 text-center" : "p-3"
                    }`}
            >
                {!isCollapsed && (
                    <div className="mb-3">
                        <p className="truncate text-xs font-black text-slate-100">
                            {currentUser?.name || "Kullanıcı"}
                        </p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                            {currentUser?.email || "gymtrack-user"}
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onLogout}
                    title="Çıkış Yap"
                    className="w-full rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-xs font-black text-red-200 hover:bg-red-500 hover:text-white"
                >
                    {isCollapsed ? "↩" : "Çıkış Yap"}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;