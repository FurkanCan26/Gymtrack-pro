import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "react-toastify";
import api from "../api/api";

function Analytics() {
  const [trackings, setTrackings] = useState([]);
  const [dailyWeights, setDailyWeights] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [weeklyVolume, setWeeklyVolume] = useState([]);

  useEffect(() => {
    getTrackings();
    getMeasurements();
    getWeeklyVolume();
  }, []);

  const getTrackings = async () => {
    try {
      const response = await api.get("/daily-tracking/1");

      const formatted = response.data
        .map((item) => ({
          date: formatShortDate(item.tracking_date),
          rawDate: String(item.tracking_date).split("T")[0],
          calories: Number(item.calories || 0),
          water_liter: Number((Number(item.water_ml || 0) / 1000).toFixed(2)),
          weight: item.body_weight_kg ? Number(item.body_weight_kg) : null,
        }))
        .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

      setTrackings(formatted);
      setDailyWeights(formatted.filter((item) => item.weight !== null));
    } catch (error) {
      console.error("Günlük takip grafikleri alınamadı:", error);
      toast.error("Günlük takip grafikleri alınamadı.");
    }
  };

  const getMeasurements = async () => {
    try {
      const response = await api.get("/measurements/1");

      const formatted = response.data
        .map((item) => ({
          date: formatShortDate(item.measurement_date),
          rawDate: String(item.measurement_date).split("T")[0],
          measurement_weight: item.weight_kg ? Number(item.weight_kg) : null,
          body_fat: item.body_fat_percentage
            ? Number(item.body_fat_percentage)
            : null,
          waist: item.waist_cm ? Number(item.waist_cm) : null,
        }))
        .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

      setMeasurements(formatted);
    } catch (error) {
      console.error("Ölçüm grafikleri alınamadı:", error);
      toast.error("Ölçüm grafikleri alınamadı.");
    }
  };

  const getWeeklyVolume = async () => {
    try {
      const response = await api.get("/workout-logs/1/weekly-volume");

      const formatted = response.data.map((item) => ({
        date: formatShortDate(item.workout_date),
        volume: Number(item.total_volume_kg || 0),
        sets: Number(item.total_sets || 0),
      }));

      setWeeklyVolume(formatted);
    } catch (error) {
      console.error("Haftalık hacim grafiği alınamadı:", error);
      toast.error("Haftalık hacim grafiği alınamadı.");
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Takip Günü"
          value={trackings.length}
          description="Günlük kayıt"
          tone="blue"
        />

        <SummaryStat
          label="Kilo Kaydı"
          value={dailyWeights.length}
          description="Kilo girilen gün"
          tone="violet"
        />

        <SummaryStat
          label="Haftalık Hacim"
          value={`${getTotalWeeklyVolume(weeklyVolume)} kg`}
          description="Son 7 gün"
          tone="emerald"
        />

        <SummaryStat
          label="Haftalık Set"
          value={getTotalWeeklySets(weeklyVolume)}
          description="Son 7 gün"
          tone="cyan"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          eyebrow="Beslenme"
          title="Kalori Takibi"
          description="Günlük kalori girişlerinin zamana göre değişimi."
        >
          {trackings.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trackings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis tick={axisTick} axisLine={axisLine} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#38bdf8", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Kalori"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Hidrasyon"
          title="Su Tüketimi"
          description="Günlük su tüketiminin litre bazlı görünümü."
        >
          {trackings.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trackings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis tick={axisTick} axisLine={axisLine} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="water_liter"
                  name="Su Litre"
                  fill="#22d3ee"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          eyebrow="Günlük Kilo"
          title="Günlük Takip Kilo Değişimi"
          description="Günlük takip sayfasına girilen kilo kayıtları."
        >
          {dailyWeights.length === 0 ? (
            <EmptyChart text="Günlük takip sayfasında kilo girersen bu grafik dolar." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyWeights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={axisTick}
                  axisLine={axisLine}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#a78bfa", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Günlük Kilo"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Ölçüm"
          title="Ölçüm Kilosu Değişimi"
          description="Ölçümler sayfasındaki kilo kayıtları."
        >
          {measurements.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={axisTick}
                  axisLine={axisLine}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="measurement_weight"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Ölçüm Kilosu"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          eyebrow="Kompozisyon"
          title="Yağ Oranı Değişimi"
          description="Vücut yağ oranı ölçümlerinin zamana göre takibi."
        >
          {measurements.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={axisTick}
                  axisLine={axisLine}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="body_fat"
                  stroke="#fb7185"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#fb7185", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Yağ Oranı"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Ölçüm"
          title="Bel Ölçüsü Değişimi"
          description="Bel ölçüsü değişimini grafik üzerinden takip et."
        >
          {measurements.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={axisTick}
                  axisLine={axisLine}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="waist"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#fbbf24", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  name="Bel"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          eyebrow="Antrenman"
          title="Son 7 Gün Antrenman Hacmi"
          description="Son 7 gündeki toplam antrenman hacmi."
        >
          {weeklyVolume.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis tick={axisTick} axisLine={axisLine} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="volume"
                  name="Toplam Hacim kg"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Antrenman"
          title="Son 7 Gün Set Sayısı"
          description="Son 7 gündeki toplam set sayısı."
        >
          {weeklyVolume.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={axisTick} axisLine={axisLine} />
                <YAxis tick={axisTick} axisLine={axisLine} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="sets"
                  name="Toplam Set"
                  fill="#14b8a6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
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

function EmptyChart({ text }) {
  return (
    <div className="grid h-full place-items-center rounded-[22px] border border-dashed border-slate-700 bg-slate-950/35 p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-xl">
          ⌁
        </div>

        <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
          {text || "Bu grafik için henüz yeterli veri yok."}
        </p>
      </div>
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

      <small className="relative mt-1 block text-xs font-semibold text-slate-500">
        {description}
      </small>
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

function getTotalWeeklyVolume(data) {
  return data.reduce((total, item) => total + Number(item.volume || 0), 0);
}

function getTotalWeeklySets(data) {
  return data.reduce((total, item) => total + Number(item.sets || 0), 0);
}

function formatShortDate(dateValue) {
  if (!dateValue) return "-";

  const cleanDate = String(dateValue).split("T")[0];
  const [year, month, day] = cleanDate.split("-");

  if (!year || !month || !day) return cleanDate;

  return `${day}.${month}`;
}

export default Analytics;