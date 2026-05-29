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

export default function Q3() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscar();
  }, []);

  const buscar = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/q3");
      const json = await res.json();
      setDatos(json.datos || []);
    } catch {
      setDatos([]);
    }
    setLoading(false);
  };

  const chartData = {
    labels: datos.map((d) => d.nombre?.split(" ").slice(0, 2).join(" ")),
    datasets: [
      {
        label: "Promedio minutos",
        data: datos.map((d) => d.promedio_minutos),
        backgroundColor: "#1d9e75",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="card">
      <h2>Q3 — Consulta avanzada</h2>
      <p>
        Tiempo promedio de entrega por conductor y zona usando{" "}
        <code>$addFields</code> + <code>$group</code> + <code>$lookup</code> +{" "}
        <code>$sort</code>.
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
                <th>#</th>
                <th>Conductor</th>
                <th>Zona</th>
                <th>Ciudad</th>
                <th>Prom. minutos</th>
                <th>Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{d.nombre}</td>
                  <td>{d.zona}</td>
                  <td>{d.ciudad_base}</td>
                  <td>
                    <span className="badge badge-green">
                      {d.promedio_minutos}
                    </span>
                  </td>
                  <td>{d.total_pedidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
