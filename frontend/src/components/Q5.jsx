import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORES = ["#00ff41", "#0abf3a", "#2d8a2d", "#ffb300", "#888888"];

export default function Q5() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscar();
  }, []);

  const buscar = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/q5");
      const json = await res.json();
      setDatos(json.datos || []);
    } catch {
      setDatos([]);
    }
    setLoading(false);
  };

  const chartData = {
    labels: datos.map((d) => d.estado),
    datasets: [
      {
        data: datos.map((d) => d.cantidad),
        backgroundColor: COLORES,
        borderWidth: 2,
        borderColor: "#000000",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#0abf3a",
          font: { family: "'Fira Code', monospace", size: 11 },
        },
      },
    },
  };

  return (
    <div className="card">
      <h2>Q5 — Distribución de eventos</h2>
      <p>
        Distribución de eventos de estado por tipo usando <code>$group</code> +{" "}
        <code>$sum</code> + <code>$sort</code>.
      </p>

      {loading ? (
        <div className="loading">Consultando MongoDB...</div>
      ) : datos.length === 0 ? (
        <div className="empty">Sin datos.</div>
      ) : (
        <>
          <div style={{ maxWidth: 400, margin: "0 auto 1.5rem" }}>
            <Doughnut data={chartData} options={options} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, i) => (
                <tr key={i}>
                  <td>{d.estado}</td>
                  <td>
                    <span className="badge badge-blue">
                      {d.cantidad.toLocaleString()}
                    </span>
                  </td>
                  <td>{d.porcentaje}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
