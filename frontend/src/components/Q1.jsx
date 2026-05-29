import { useState } from "react";

const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"];
const ESTADOS = ["entregado", "tardío", "en_camino", "asignado", "recibido"];

const badgeEstado = (e) => {
  const map = {
    entregado: "badge-green",
    tardío: "badge-red",
    en_camino: "badge-orange",
    asignado: "badge-blue",
    recibido: "badge-gray",
  };
  return map[e] || "badge-gray";
};

export default function Q1() {
  const [ciudad, setCiudad] = useState("Bogotá");
  const [estado, setEstado] = useState("entregado");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const buscar = async () => {
    setLoading(true);
    setBuscado(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/q1?ciudad=${ciudad}&estado=${estado}`,
      );
      const json = await res.json();
      setDatos(json.datos || []);
    } catch {
      setDatos([]);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Q1 — Consulta básica</h2>
      <p>
        Pedidos filtrados por ciudad y estado usando <code>find()</code> con
        índices.
      </p>

      <div className="filters">
        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
          {CIUDADES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <button className="btn" onClick={buscar}>
          Consultar
        </button>
      </div>

      {loading && <div className="loading">Consultando MongoDB...</div>}

      {!loading && buscado && (
        <>
          <div className="stat-row">
            <div className="stat">
              <div className="stat-label">Resultados</div>
              <div className="stat-value">{datos.length}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Ciudad</div>
              <div
                className="stat-value"
                style={{ fontSize: 16, paddingTop: 4 }}
              >
                {ciudad}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Estado</div>
              <div
                className="stat-value"
                style={{ fontSize: 16, paddingTop: 4 }}
              >
                {estado}
              </div>
            </div>
          </div>

          {datos.length === 0 ? (
            <div className="empty">No se encontraron pedidos.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Ciudad</th>
                  <th>Zona</th>
                  <th>Estado</th>
                  <th>Peso (kg)</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((d) => (
                  <tr key={d._id}>
                    <td>{d.numero_pedido}</td>
                    <td>{d.ciudad}</td>
                    <td>{d.zona}</td>
                    <td>
                      <span className={`badge ${badgeEstado(d.estado)}`}>
                        {d.estado}
                      </span>
                    </td>
                    <td>{d.peso_kg}</td>
                    <td>${d.valor_declarado?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
