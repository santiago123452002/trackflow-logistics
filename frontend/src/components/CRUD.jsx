import { useState } from "react";

const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"];
const ZONAS = ["Norte", "Sur", "Centro", "Oriente", "Occidente"];
const ESTADOS = ["recibido", "asignado", "en_camino", "entregado", "tardío"];

const API = "http://localhost:3001/api/pedidos";

export default function CRUD() {
  const [modo, setModo] = useState("crear");
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formCrear, setFormCrear] = useState({
    numero_pedido: "",
    ciudad: "Bogotá",
    zona: "Norte",
    estado: "recibido",
    direccion_destino: "",
    valor_declarado: "",
    peso_kg: "",
    observaciones: "",
  });

  const [idBuscar, setIdBuscar] = useState("");
  const [pedidoEncontrado, setPedidoEncontrado] = useState(null);

  const [formActualizar, setFormActualizar] = useState({
    id: "",
    estado: "entregado",
    ciudad: "Bogotá",
    zona: "Norte",
    observaciones: "",
  });

  const [idEliminar, setIdEliminar] = useState("");

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const crearPedido = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formCrear,
          valor_declarado: Number(formCrear.valor_declarado),
          peso_kg: Number(formCrear.peso_kg),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        mostrarMensaje("ok", `Pedido creado: ${json.datos.numero_pedido}`);
        setFormCrear({
          numero_pedido: "",
          ciudad: "Bogotá",
          zona: "Norte",
          estado: "recibido",
          direccion_destino: "",
          valor_declarado: "",
          peso_kg: "",
          observaciones: "",
        });
      } else {
        mostrarMensaje("error", json.error);
      }
    } catch {
      mostrarMensaje("error", "Error de conexión");
    }
    setLoading(false);
  };

  const buscarPedido = async () => {
    if (!idBuscar) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/${idBuscar}`);
      const json = await res.json();
      if (res.ok) {
        setPedidoEncontrado(json.datos);
      } else {
        setPedidoEncontrado(null);
        mostrarMensaje("error", json.error);
      }
    } catch {
      mostrarMensaje("error", "Error de conexión");
    }
    setLoading(false);
  };

  const actualizarPedido = async () => {
    if (!formActualizar.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/${formActualizar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: formActualizar.estado,
          ciudad: formActualizar.ciudad,
          zona: formActualizar.zona,
          observaciones: formActualizar.observaciones,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        mostrarMensaje("ok", `Pedido ${json.datos.numero_pedido} actualizado`);
        setFormActualizar({
          id: "",
          estado: "entregado",
          ciudad: "Bogotá",
          zona: "Norte",
          observaciones: "",
        });
      } else {
        mostrarMensaje("error", json.error);
      }
    } catch {
      mostrarMensaje("error", "Error de conexión");
    }
    setLoading(false);
  };

  const eliminarPedido = async () => {
    if (!idEliminar) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/${idEliminar}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        mostrarMensaje("ok", `Pedido ${json.datos.numero_pedido} eliminado`);
        setIdEliminar("");
      } else {
        mostrarMensaje("error", json.error);
      }
    } catch {
      mostrarMensaje("error", "Error de conexión");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>CRUD — Operaciones completas</h2>
      <p>
        Operaciones <code>Create</code>, <code>Read</code>, <code>Update</code>{" "}
        y <code>Delete</code> sobre la colección de pedidos.
      </p>

      {mensaje && (
        <div
          className={`alert ${mensaje.tipo === "ok" ? "alert-ok" : "alert-error"}`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="tabs" style={{ marginBottom: "1rem" }}>
        {["crear", "leer", "actualizar", "eliminar"].map((m) => (
          <button
            key={m}
            className={`tab ${modo === m ? "active" : ""}`}
            onClick={() => setModo(m)}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Procesando...</div>}

      {modo === "crear" && (
        <div className="form-grid">
          <input
            placeholder="Número de pedido (ej: TF-00000001)"
            value={formCrear.numero_pedido}
            onChange={(e) =>
              setFormCrear({ ...formCrear, numero_pedido: e.target.value })
            }
          />
          <select
            value={formCrear.ciudad}
            onChange={(e) =>
              setFormCrear({ ...formCrear, ciudad: e.target.value })
            }
          >
            {CIUDADES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={formCrear.zona}
            onChange={(e) =>
              setFormCrear({ ...formCrear, zona: e.target.value })
            }
          >
            {ZONAS.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
          <select
            value={formCrear.estado}
            onChange={(e) =>
              setFormCrear({ ...formCrear, estado: e.target.value })
            }
          >
            {ESTADOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
          <input
            placeholder="Dirección destino"
            value={formCrear.direccion_destino}
            onChange={(e) =>
              setFormCrear({ ...formCrear, direccion_destino: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Valor declarado ($)"
            value={formCrear.valor_declarado}
            onChange={(e) =>
              setFormCrear({ ...formCrear, valor_declarado: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Peso (kg)"
            step="0.1"
            value={formCrear.peso_kg}
            onChange={(e) =>
              setFormCrear({ ...formCrear, peso_kg: e.target.value })
            }
          />
          <input
            placeholder="Observaciones"
            value={formCrear.observaciones}
            onChange={(e) =>
              setFormCrear({ ...formCrear, observaciones: e.target.value })
            }
          />
          <button className="btn" onClick={crearPedido}>
            Crear Pedido
          </button>
        </div>
      )}

      {modo === "leer" && (
        <div>
          <div className="form-grid">
            <input
              placeholder="ID del pedido (ObjectId de MongoDB)"
              value={idBuscar}
              onChange={(e) => setIdBuscar(e.target.value)}
            />
            <button className="btn" onClick={buscarPedido}>
              Buscar
            </button>
          </div>
          {pedidoEncontrado && (
            <div className="detail-box" style={{ marginTop: "1rem" }}>
              <h3>{pedidoEncontrado.numero_pedido}</h3>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <strong>ID</strong>
                    </td>
                    <td>{pedidoEncontrado._id}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Ciudad</strong>
                    </td>
                    <td>{pedidoEncontrado.ciudad}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Zona</strong>
                    </td>
                    <td>{pedidoEncontrado.zona}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Estado</strong>
                    </td>
                    <td>{pedidoEncontrado.estado}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Dirección</strong>
                    </td>
                    <td>{pedidoEncontrado.direccion_destino}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Valor</strong>
                    </td>
                    <td>
                      ${pedidoEncontrado.valor_declarado?.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Peso</strong>
                    </td>
                    <td>{pedidoEncontrado.peso_kg} kg</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Observaciones</strong>
                    </td>
                    <td>{pedidoEncontrado.observaciones}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Asignación</strong>
                    </td>
                    <td>
                      {new Date(
                        pedidoEncontrado.fecha_asignacion,
                      ).toLocaleString()}
                    </td>
                  </tr>
                  {pedidoEncontrado.fecha_entrega && (
                    <tr>
                      <td>
                        <strong>Entrega</strong>
                      </td>
                      <td>
                        {new Date(
                          pedidoEncontrado.fecha_entrega,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modo === "actualizar" && (
        <div className="form-grid">
          <input
            placeholder="ID del pedido a actualizar"
            value={formActualizar.id}
            onChange={(e) =>
              setFormActualizar({ ...formActualizar, id: e.target.value })
            }
          />
          <select
            value={formActualizar.estado}
            onChange={(e) =>
              setFormActualizar({ ...formActualizar, estado: e.target.value })
            }
          >
            {ESTADOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
          <select
            value={formActualizar.ciudad}
            onChange={(e) =>
              setFormActualizar({ ...formActualizar, ciudad: e.target.value })
            }
          >
            {CIUDADES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={formActualizar.zona}
            onChange={(e) =>
              setFormActualizar({ ...formActualizar, zona: e.target.value })
            }
          >
            {ZONAS.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
          <input
            placeholder="Nuevas observaciones"
            value={formActualizar.observaciones}
            onChange={(e) =>
              setFormActualizar({
                ...formActualizar,
                observaciones: e.target.value,
              })
            }
          />
          <button className="btn" onClick={actualizarPedido}>
            Actualizar
          </button>
        </div>
      )}

      {modo === "eliminar" && (
        <div className="form-grid">
          <input
            placeholder="ID del pedido a eliminar"
            value={idEliminar}
            onChange={(e) => setIdEliminar(e.target.value)}
          />
          <button className="btn btn-danger" onClick={eliminarPedido}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
