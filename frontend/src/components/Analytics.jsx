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
    }
  };

  return (
    <div className="analytics-page">
      <div className="stats-grid">
        <div className="stat-card">
          <span>Takip Günü</span>
          <strong>{trackings.length}</strong>
        </div>

        <div className="stat-card">
          <span>Günlük Kilo Kaydı</span>
          <strong>{dailyWeights.length}</strong>
        </div>

        <div className="stat-card">
          <span>Haftalık Hacim</span>
          <strong>{getTotalWeeklyVolume(weeklyVolume)} kg</strong>
        </div>

        <div className="stat-card">
          <span>Haftalık Set</span>
          <strong>{getTotalWeeklySets(weeklyVolume)}</strong>
        </div>
      </div>

      <div className="two-column">
        <ChartCard title="Kalori Takibi">
          {trackings.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trackings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calories"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Kalori"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Su Tüketimi">
          {trackings.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trackings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="water_liter" name="Su Litre" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="two-column">
        <ChartCard title="Günlük Takip Kilo Değişimi">
          {dailyWeights.length === 0 ? (
            <EmptyChart text="Günlük takip sayfasında kilo girersen bu grafik dolar." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyWeights}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Günlük Kilo"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Ölçüm Kilosu Değişimi">
          {measurements.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="measurement_weight"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Ölçüm Kilosu"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="two-column">
        <ChartCard title="Yağ Oranı Değişimi">
          {measurements.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="body_fat"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Yağ Oranı"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Bel Ölçüsü Değişimi">
          {measurements.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="waist"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Bel"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="two-column">
        <ChartCard title="Son 7 Gün Antrenman Hacmi">
          {weeklyVolume.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" name="Toplam Hacim kg" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Son 7 Gün Set Sayısı">
          {weeklyVolume.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sets" name="Toplam Set" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card chart-card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="empty-chart">
      <p>{text || "Bu grafik için henüz yeterli veri yok."}</p>
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