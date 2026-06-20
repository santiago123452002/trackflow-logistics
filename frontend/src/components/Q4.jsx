import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Q4() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscar();
  }, []);

  const buscar = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/q4");
      const json = await res.json();
      setDatos(json.datos || []);
    } catch {
      setDatos([]);
    }
    setLoading(false);
  };

  const chartData = {
    labels: datos.map((d) => d.ciudad),
    datasets: [
      {
        label: "Total pedidos",
        data: datos.map((d) => d.total_pedidos),
        backgroundColor: "#00ff41",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#2d8a2d",
          font: { family: "'Fira Code', monospace", size: 10 },
        },
        grid: { color: "#1a3a1a" },
      },
      x: {
        ticks: {
          color: "#2d8a2d",
          font: { family: "'Fira Code', monospace", size: 10 },
        },
        grid: { color: "#1a3a1a" },
      },
    },
  };

  return (
    <div className="card">
      <h2>Q4 — Agregación por ciudad</h2>
      <p>
        Total de pedidos, valor acumulado y promedios por ciudad usando{" "}
        <code>$group</code> + <code>$sum</code> + <code>$avg</code>.
      </p>

      {loading ? (
        <div className="loading">Consultando MongoDB...</div>
      ) : datos.length === 0 ? (
        <div className="empty">Sin datos.</div>
      ) : (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <Bar data={chartData} options={options} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Ciudad</th>
                <th>Pedidos</th>
                <th>Valor total</th>
                <th>Valor promedio</th>
                <th>Peso promedio (kg)</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, i) => (
                <tr key={i}>
                  <td>{d.ciudad}</td>
                  <td>
                    <span className="badge badge-blue">
                      {d.total_pedidos.toLocaleString()}
                    </span>
                  </td>
                  <td>${d.valor_total?.toLocaleString()}</td>
                  <td>${d.valor_promedio?.toLocaleString()}</td>
                  <td>{d.peso_promedio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
