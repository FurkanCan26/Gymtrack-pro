import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { toast } from "react-toastify";
import api from "../api/api";

function Performance() {
    const [summary, setSummary] = useState(null);
    const [exerciseStats, setExerciseStats] = useState([]);
    const [maxWeightPrs, setMaxWeightPrs] = useState([]);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getPerformanceData(false);
    }, []);

    const getPerformanceData = async (showSuccessToast = true) => {
        try {
            setIsLoading(true);

            const [summaryRes, exerciseRes, prRes, muscleRes] = await Promise.all([
                api.get("/performance/1/summary"),
                api.get("/performance/1/exercises"),
                api.get("/performance/1/max-weight"),
                api.get("/performance/1/muscle-groups"),
            ]);

            setSummary(summaryRes.data);
            setExerciseStats(exerciseRes.data);
            setMaxWeightPrs(prRes.data);
            setMuscleGroups(muscleRes.data);

            if (showSuccessToast) {
                toast.success("Performans verileri güncellendi.", {
                    toastId: "performance-updated",
                });
            }
        } catch (error) {
            console.error("Performans verileri alınamadı:", error);

            toast.error("Performans verileri alınamadı.", {
                toastId: "performance-error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            <section className="flex flex-col gap-4 rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20 md:flex-row md:items-center md:justify-between">
                <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                        Performans Merkezi
                    </span>

                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
                        Rekorlar ve Antrenman Gücü
                    </h2>

                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                        Toplam hacim, set sayısı, kas grubu dağılımı ve PR kayıtlarını tek
                        ekrandan takip et.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={getPerformanceData}
                    disabled={isLoading}
                    className="w-fit rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? "Yenileniyor..." : "Performansı Yenile"}
                </button>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryStat
                    label="Toplam Antrenman"
                    value={summary ? summary.total_workouts : 0}
                    description="Kayıtlı antrenman"
                    tone="blue"
                />

                <SummaryStat
                    label="Toplam Set"
                    value={summary ? summary.total_sets : 0}
                    description="Tüm set kayıtları"
                    tone="violet"
                />

                <SummaryStat
                    label="Toplam Hacim"
                    value={summary ? `${summary.total_volume_kg} kg` : "0 kg"}
                    description="Kg x tekrar toplamı"
                    tone="emerald"
                />

                <SummaryStat
                    label="Max Ağırlık"
                    value={summary ? `${summary.max_weight_kg} kg` : "0 kg"}
                    description="Tek sette görülen max"
                    tone="cyan"
                />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <ChartCard
                    eyebrow="Kas Grupları"
                    title="Kas Grubu Hacmi"
                    description="Kas gruplarına göre toplam antrenman hacmi."
                >
                    {muscleGroups.length === 0 ? (
                        <EmptyState text="Henüz kas grubu verisi yok." />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={muscleGroups}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="muscle_group"
                                    tick={axisTick}
                                    axisLine={axisLine}
                                />
                                <YAxis tick={axisTick} axisLine={axisLine} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="total_volume_kg"
                                    name="Toplam Hacim kg"
                                    fill="#6366f1"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard
                    eyebrow="Hareketler"
                    title="En Çok Çalışılan Hareketler"
                    description="Set sayısına göre en çok çalışılan hareketler."
                >
                    {exerciseStats.length === 0 ? (
                        <EmptyState text="Henüz hareket verisi yok." />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={exerciseStats.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="exercise_name"
                                    tick={axisTick}
                                    axisLine={axisLine}
                                />
                                <YAxis tick={axisTick} axisLine={axisLine} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="total_sets"
                                    name="Toplam Set"
                                    fill="#22d3ee"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </section>

            <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
                <div className="mb-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                        Detaylı Tablo
                    </span>

                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
                        Hareket Bazlı Performans
                    </h2>

                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                        Her hareketin toplam set, hacim, max kilo ve son tarih bilgisi.
                    </p>
                </div>

                {exerciseStats.length === 0 ? (
                    <EmptyState text="Henüz performans kaydı yok." />
                ) : (
                    <div className="overflow-x-auto rounded-[22px] border border-slate-700/60 bg-slate-950/45">
                        <div className="min-w-[1000px]">
                            <div className="grid grid-cols-[1.6fr_1fr_0.75fr_1fr_0.75fr_0.75fr_1fr_0.9fr] border-b border-slate-700/60 bg-slate-900/90 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                <span>Hareket</span>
                                <span>Kas Grubu</span>
                                <span>Set</span>
                                <span>Hacim</span>
                                <span>Max Kg</span>
                                <span>Max Rep</span>
                                <span>En İyi Set</span>
                                <span>Son Tarih</span>
                            </div>

                            {exerciseStats.map((item) => (
                                <div
                                    key={item.exercise_id}
                                    className="grid grid-cols-[1.6fr_1fr_0.75fr_1fr_0.75fr_0.75fr_1fr_0.9fr] items-center border-b border-slate-800 px-4 py-3 text-xs font-semibold text-slate-300 last:border-b-0"
                                >
                                    <span>
                                        <strong className="block text-slate-100">
                                            {item.exercise_name}
                                        </strong>
                                    </span>

                                    <span>{item.muscle_group || "Genel"}</span>
                                    <span>{item.total_sets}</span>
                                    <span className="font-black text-sky-300">
                                        {item.total_volume_kg} kg
                                    </span>
                                    <span>{item.max_weight_kg} kg</span>
                                    <span>{item.max_reps}</span>
                                    <span>{item.best_set_volume_kg} kg</span>
                                    <span>{formatDate(item.last_performed_date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
                <div className="mb-5">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-300">
                        PR Listesi
                    </span>

                    <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
                        En Yüksek Ağırlık PR Listesi
                    </h2>

                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                        Hareket bazlı en yüksek ağırlık kayıtların.
                    </p>
                </div>

                {maxWeightPrs.length === 0 ? (
                    <EmptyState text="Henüz PR kaydı yok." />
                ) : (
                    <div className="grid gap-4 xl:grid-cols-2">
                        {maxWeightPrs.map((item, index) => (
                            <article
                                key={`${item.exercise_id}-${item.weight_kg}-${index}`}
                                className="grid gap-4 rounded-[22px] border border-slate-700/60 bg-slate-950/45 p-4 shadow-lg shadow-black/15 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                            >
                                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 to-orange-500 text-sm font-black text-slate-950 shadow-lg shadow-yellow-500/20">
                                    #{index + 1}
                                </div>

                                <div className="min-w-0">
                                    <span className="rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-black text-slate-300">
                                        {item.muscle_group || "Genel"}
                                    </span>

                                    <h3 className="mt-3 break-words text-lg font-black text-slate-50">
                                        {item.exercise_name}
                                    </h3>

                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        {formatDate(item.workout_date)}
                                    </p>
                                </div>

                                <div className="rounded-[18px] border border-yellow-300/20 bg-yellow-300/10 p-4 text-right">
                                    <strong className="block text-2xl font-black text-yellow-200">
                                        {item.weight_kg} kg
                                    </strong>

                                    <span className="mt-1 block text-xs font-bold text-slate-300">
                                        {item.reps} tekrar
                                    </span>

                                    <span className="mt-1 block text-xs font-bold text-slate-400">
                                        {item.volume_kg} kg hacim
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

const axisTick = {
    fill: "#94a3b8",
    fontSize: 11,
    fontWeight: 700,
};

const axisLine = {
    stroke: "#475569",
};

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

            <small className="relative mt-1 block text-xs font-semibold text-slate-500">
                {description}
            </small>
        </div>
    );
}

function ChartCard({ eyebrow, title, description, children }) {
    return (
        <div className="rounded-[24px] border border-slate-700/60 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <div className="mb-4">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                    {eyebrow}
                </span>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-50">
                    {title}
                </h2>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
                    {description}
                </p>
            </div>

            <div className="h-[240px] w-full min-w-0">{children}</div>
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div className="grid min-h-[170px] place-items-center rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
            <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
                    ◆
                </div>

                <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
                    {text}
                </p>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 shadow-xl shadow-black/40">
            <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                {label}
            </p>

            {payload.map((item) => (
                <p key={item.dataKey} className="text-xs font-black text-slate-100">
                    {item.name}: <span className="text-sky-300">{item.value}</span>
                </p>
            ))}
        </div>
    );
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

export default Performance;