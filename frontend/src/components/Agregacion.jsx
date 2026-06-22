import { useState } from "react";

const API = "http://localhost:3001/api/agregacion";

const COLECCIONES = {
  pedidos: {
    label: "Pedidos",
    campos: {
      numero_pedido: "String",
      cliente_id: "ObjectId → clientes (REFERENCIADO)",
      "datos_cliente.nombre": "String (EMBEDIDO)",
      "datos_cliente.telefono": "String (EMBEDIDO)",
      "datos_cliente.direccion": "String (EMBEDIDO)",
      "datos_cliente.ciudad": "String (EMBEDIDO)",
      "datos_cliente.barrio": "String (EMBEDIDO)",
      conductor_id: "ObjectId → conductores (REFERENCIADO)",
      ruta_id: "ObjectId → rutas (REFERENCIADO)",
      estado: "String (recibido, asignado, en_camino, entregado, tardío)",
      ciudad: "String (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga)",
      zona: "String (Norte, Sur, Centro, Oriente, Occidente)",
      fecha_asignacion: "Date",
      fecha_entrega: "Date",
      direccion_destino: "String",
      valor_declarado: "Number",
      peso_kg: "Number",
      observaciones: "String",
    },
  },
  conductores: {
    label: "Conductores",
    campos: {
      cedula: "String",
      nombre: "String",
      apellido: "String",
      telefono: "String",
      ciudad_base: "String",
      zona_asignada: "String",
      vehiculo_tipo: "String",
      vehiculo_placa: "String",
      activo: "Boolean",
      fecha_ingreso: "Date",
    },
  },
  clientes: {
    label: "Clientes",
    campos: {
      nit_cedula: "String",
      nombre: "String",
      tipo: "String",
      ciudad: "String",
      barrio: "String",
      direccion: "String",
      telefono: "String",
      email: "String",
      total_pedidos: "Number",
      fecha_registro: "Date",
    },
  },
  eventos: {
    label: "Eventos",
    campos: {
      pedido_id: "ObjectId → pedidos (REFERENCIADO)",
      conductor_id: "ObjectId → conductores (REFERENCIADO)",
      estado: "String",
      timestamp: "Date",
      descripcion: "String",
      ubicacion_lat: "Number",
      ubicacion_lng: "Number",
    },
  },
  rutas: {
    label: "Rutas",
    campos: {
      conductor_id: "ObjectId → conductores (REFERENCIADO)",
      zona: "String",
      ciudad: "String",
      fecha: "Date",
      hora_inicio: "Date",
      hora_fin: "Date",
      distancia_km: "Number",
      pedidos_asignados: "[ObjectId] (REFERENCIADO)",
      "paradas.numero_pedido": "String (EMBEDIDO)",
      "paradas.direccion_destino": "String (EMBEDIDO)",
      "paradas.estado_parada": "String (EMBEDIDO)",
      "paradas.hora_llegada": "Date (EMBEDIDO)",
      estado_ruta: "String",
    },
  },
};

const OPERADORES = [
  {
    nombre: "$match",
    desc: "Filtra documentos (como WHERE en SQL). Reduce los documentos que pasan a la siguiente etapa.",
    ejemplo: '{ $match: { estado: "entregado", ciudad: "Bogotá" } }',
  },
  {
    nombre: "$group",
    desc: "Agrupa documentos por un campo (_id) y aplica acumuladores ($sum, $avg, $min, $max, $first, $last, $push, $addToSet).",
    ejemplo:
      '{ $group: { _id: "$ciudad", total: { $sum: 1 }, promedio: { $avg: "$valor_declarado" } } }',
  },
  {
    nombre: "$project",
    desc: "Selecciona, renombra o transforma campos. Controla qué campos se incluyen (1) o excluyen (0) en el resultado.",
    ejemplo:
      '{ $project: { _id: 0, ciudad: "$_id", total: 1, promedio: { $round: ["$promedio", 2] } } }',
  },
  {
    nombre: "$sort",
    desc: "Ordena los documentos. 1 = ascendente, -1 = descendente.",
    ejemplo: "{ $sort: { total: -1 } }",
  },
  {
    nombre: "$limit",
    desc: "Limita la cantidad de documentos que pasan a la siguiente etapa.",
    ejemplo: "{ $limit: 10 }",
  },
  {
    nombre: "$skip",
    desc: "Salta N documentos. Útil para paginación junto con $sort y $limit.",
    ejemplo: "{ $skip: 5 }",
  },
  {
    nombre: "$unwind",
    desc: "Descompone un array en un documento por cada elemento. Prefija con $ el nombre del campo.",
    ejemplo: '{ $unwind: "$pedidos_asignados" }',
  },
  {
    nombre: "$lookup",
    desc: "Join con otra colección. Equivalente a LEFT JOIN en SQL.",
    ejemplo:
      '{ $lookup: { from: "conductores", localField: "conductor_id", foreignField: "_id", as: "conductor" } }',
  },
  {
    nombre: "$addFields",
    desc: "Agrega campos calculados sin eliminar los existentes. Como $project pero no requiere listar todos los campos.",
    ejemplo:
      '{ $addFields: { tiempo_min: { $divide: [{ $subtract: ["$fecha_entrega", "$fecha_asignacion"] }, 60000] } } }',
  },
  {
    nombre: "$count",
    desc: "Cuenta los documentos que llegan a esta etapa y los guarda en un campo.",
    ejemplo: '{ $count: "total_documentos" }',
  },
  {
    nombre: "$replaceRoot",
    desc: "Reemplaza el documento completo con un subdocumento.",
    ejemplo: '{ $replaceRoot: { newRoot: "$conductor" } }',
  },
];

const ACUMULADORES = [
  { nombre: "$sum", desc: "Suma valores numéricos. { $sum: 1 } cuenta documentos." },
  { nombre: "$avg", desc: "Promedio de valores numéricos." },
  { nombre: "$min", desc: "Valor mínimo." },
  { nombre: "$max", desc: "Valor máximo." },
  { nombre: "$first", desc: "Primer valor del grupo (según orden)." },
  { nombre: "$last", desc: "Último valor del grupo (según orden)." },
  { nombre: "$push", desc: "Crea un array con todos los valores del grupo." },
  { nombre: "$addToSet", desc: "Como $push pero sin duplicados." },
];

const EJEMPLOS = [
  {
    titulo: "Total de pedidos por ciudad",
    coleccion: "pedidos",
    pipeline: [
      {
        $group: {
          _id: "$ciudad",
          total_pedidos: { $sum: 1 },
          valor_total: { $sum: "$valor_declarado" },
        },
      },
      {
        $project: {
          _id: 0,
          ciudad: "$_id",
          total_pedidos: 1,
          valor_total: 1,
        },
      },
      { $sort: { total_pedidos: -1 } },
    ],
  },
  {
    titulo: "Conductores activos por ciudad",
    coleccion: "conductores",
    pipeline: [
      { $match: { activo: true } },
      {
        $group: {
          _id: "$ciudad_base",
          cantidad: { $sum: 1 },
          nombres: { $push: { $concat: ["$nombre", " ", "$apellido"] } },
        },
      },
      {
        $project: {
          _id: 0,
          ciudad: "$_id",
          cantidad: 1,
          nombres: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ],
  },
  {
    titulo: "Eventos por estado con porcentaje",
    coleccion: "eventos",
    pipeline: [
      { $group: { _id: "$estado", cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
    ],
  },
  {
    titulo: "Pedidos tardíos con datos del conductor ($lookup)",
    coleccion: "pedidos",
    pipeline: [
      { $match: { estado: "tardío" } },
      {
        $lookup: {
          from: "conductores",
          localField: "conductor_id",
          foreignField: "_id",
          as: "conductor",
        },
      },
      { $unwind: "$conductor" },
      {
        $project: {
          _id: 0,
          pedido: "$numero_pedido",
          ciudad: 1,
          zona: 1,
          conductor: { $concat: ["$conductor.nombre", " ", "$conductor.apellido"] },
          valor: "$valor_declarado",
        },
      },
      { $limit: 20 },
    ],
  },
  {
    titulo: "Valor promedio por zona y ciudad",
    coleccion: "pedidos",
    pipeline: [
      {
        $group: {
          _id: { ciudad: "$ciudad", zona: "$zona" },
          promedio_valor: { $avg: "$valor_declarado" },
          total_pedidos: { $sum: 1 },
          peso_promedio: { $avg: "$peso_kg" },
        },
      },
      {
        $project: {
          _id: 0,
          ciudad: "$_id.ciudad",
          zona: "$_id.zona",
          promedio_valor: { $round: ["$promedio_valor", 0] },
          total_pedidos: 1,
          peso_promedio: { $round: ["$peso_promedio", 2] },
        },
      },
      { $sort: { promedio_valor: -1 } },
      { $limit: 15 },
    ],
  },
  {
    titulo: "Pedidos con datos_cliente embebido (sin $lookup)",
    coleccion: "pedidos",
    pipeline: [
      { $match: { "datos_cliente.ciudad": "Bogotá" } },
      {
        $project: {
          _id: 0,
          pedido: "$numero_pedido",
          cliente: "$datos_cliente.nombre",
          telefono_cliente: "$datos_cliente.telefono",
          barrio_cliente: "$datos_cliente.barrio",
          estado: 1,
          valor: "$valor_declarado",
        },
      },
      { $limit: 20 },
    ],
  },
  {
    titulo: "Paradas embebidas de rutas ($unwind)",
    coleccion: "rutas",
    pipeline: [
      { $match: { estado_ruta: "completada" } },
      { $unwind: "$paradas" },
      {
        $project: {
          _id: 0,
          ruta_ciudad: "$ciudad",
          ruta_zona: "$zona",
          pedido: "$paradas.numero_pedido",
          direccion: "$paradas.direccion_destino",
          estado_parada: "$paradas.estado_parada",
          hora_llegada: "$paradas.hora_llegada",
        },
      },
      { $limit: 30 },
    ],
  },
  {
    titulo: "Paradas completadas por ciudad de ruta",
    coleccion: "rutas",
    pipeline: [
      { $unwind: "$paradas" },
      { $match: { "paradas.estado_parada": "completada" } },
      {
        $group: {
          _id: "$ciudad",
          total_paradas: { $sum: 1 },
          rutas_involucradas: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          ciudad: "$_id",
          total_paradas: 1,
          num_rutas: { $size: "$rutas_involucradas" },
        },
      },
      { $sort: { total_paradas: -1 } },
    ],
  },
];

export default function Agregacion() {
  const [coleccion, setColeccion] = useState("pedidos");
  const [pipelineText, setPipelineText] = useState(
    JSON.stringify([{ $group: { _id: "$ciudad", total: { $sum: 1 } } }, { $sort: { total: -1 } }], null, 2),
  );
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buscado, setBuscado] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [tipTab, setTipTab] = useState("estructura");

  const ejecutar = async () => {
    setLoading(true);
    setError(null);
    setBuscado(true);
    try {
      const pipeline = JSON.parse(pipelineText);
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coleccion, pipeline }),
      });
      const json = await res.json();
      if (res.ok) {
        setDatos(json.datos || []);
        setError(null);
      } else {
        setDatos([]);
        setError(json.error);
      }
    } catch (e) {
      setDatos([]);
      if (e instanceof SyntaxError) {
        setError("JSON inválido: " + e.message);
      } else {
        setError(e.message);
      }
    }
    setLoading(false);
  };

  const cargarEjemplo = (ej) => {
    setColeccion(ej.coleccion);
    setPipelineText(JSON.stringify(ej.pipeline, null, 2));
    setDatos([]);
    setError(null);
    setBuscado(false);
  };

  const columnas =
    datos.length > 0 ? Object.keys(datos[0]).filter((k) => k !== "_id") : [];

  return (
    <div className="card">
      <h2>Agregación — Consulta dinámica</h2>
      <p>
        Escribe un pipeline de agregación de MongoDB en JSON. Selecciona la
        colección y ejecuta.
      </p>

      <div className="agregacion-layout">
        <div className="agregacion-editor">
          <div className="agregacion-toolbar">
            <select
              value={coleccion}
              onChange={(e) => setColeccion(e.target.value)}
            >
              {Object.entries(COLECCIONES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
            <button className="btn" onClick={ejecutar} disabled={loading}>
              {loading ? "Ejecutando..." : "Ejecutar"}
            </button>
            <button
              className="btn"
              onClick={() => setShowTips(!showTips)}
              style={{
                borderColor: showTips ? "#00ff41" : "#1a3a1a",
              }}
            >
              {showTips ? "Ocultar tips" : "Ver tips"}
            </button>
          </div>

          <textarea
            className="agregacion-textarea"
            value={pipelineText}
            onChange={(e) => setPipelineText(e.target.value)}
            spellCheck={false}
            placeholder='[{"$match": {"estado": "entregado"}}, {"$group": {"_id": "$ciudad", "total": {"$sum": 1}}}]'
          />

          {error && <div className="alert alert-error">{error}</div>}

          {buscado && !error && (
            <>
              <div className="stat-row">
                <div className="stat">
                  <div className="stat-label">Resultados</div>
                  <div className="stat-value">{datos.length}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Colección</div>
                  <div className="stat-value" style={{ fontSize: 16, paddingTop: 4 }}>
                    {COLECCIONES[coleccion]?.label}
                  </div>
                </div>
              </div>

              {datos.length === 0 ? (
                <div className="empty">No se encontraron resultados.</div>
              ) : (
                <div className="tabla-scroll">
                  <table>
                    <thead>
                      <tr>
                        {columnas.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((d, i) => (
                        <tr key={i}>
                          {columnas.map((col) => (
                            <td key={col}>
                              {typeof d[col] === "object" && d[col] !== null
                                ? JSON.stringify(d[col])
                                : String(d[col] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {showTips && (
          <div className="agregacion-tips">
            <div className="tabs" style={{ marginBottom: "1rem" }}>
              {[
                { key: "estructura", label: "Estructura" },
                { key: "operadores", label: "Operadores" },
                { key: "campos", label: "Campos" },
                { key: "ejemplos", label: "Ejemplos" },
              ].map((t) => (
                <button
                  key={t.key}
                  className={`tab ${tipTab === t.key ? "active" : ""}`}
                  onClick={() => setTipTab(t.key)}
                  style={{ fontSize: 11, padding: "5px 12px" }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tipTab === "estructura" && (
              <div className="tip-content">
                <h3>¿Qué es una agregación?</h3>
                <p>
                  Es un pipeline (tubería) de etapas que transforman los
                  documentos paso a paso. Cada etapa recibe los documentos de la
                  etapa anterior y los modifica.
                </p>
                <h3>Estructura general</h3>
                <pre className="tip-code">{`db.coleccion.aggregate([
  { $match: { ... } },      // 1. Filtrar
  { $group: { _id: ..., } },// 2. Agrupar
  { $project: { ... } },    // 3. Proyectar
  { $sort: { ... } },       // 4. Ordenar
  { $limit: N }             // 5. Limitar
])`}</pre>
                <h3>Orden recomendado de etapas</h3>
                <ol className="tip-list">
                  <li>
                    <code>$match</code> — Filtrar primero (aprovecha índices)
                  </li>
                  <li>
                    <code>$lookup</code> — Unir colecciones
                  </li>
                  <li>
                    <code>$unwind</code> — Descomponer arrays
                  </li>
                  <li>
                    <code>$group</code> — Agrupar y acumular
                  </li>
                  <li>
                    <code>$addFields</code> — Campos calculados
                  </li>
                  <li>
                    <code>$project</code> — Seleccionar campos finales
                  </li>
                  <li>
                    <code>$sort</code> — Ordenar
                  </li>
                  <li>
                    <code>$limit</code> / <code>$skip</code> — Paginar
                  </li>
                </ol>
                <h3>Reglas importantes</h3>
                <ul className="tip-list">
                  <li>
                    El pipeline es un <strong>array JSON</strong> de objetos
                  </li>
                  <li>
                    Los nombres de campos llevan <code>$</code> cuando son
                    referencias: <code>"$ciudad"</code>
                  </li>
                  <li>
                    En <code>$group</code>, el <code>_id</code> es el campo de
                    agrupación
                  </li>
                  <li>
                    <code>$lookup</code> usa el nombre de la colección en
                    MongoDB (en minúsculas y plural): <code>"conductores"</code>
                  </li>
                </ul>
              </div>
            )}

            {tipTab === "operadores" && (
              <div className="tip-content">
                <h3>Etapas del pipeline</h3>
                {OPERADORES.map((op) => (
                  <div key={op.nombre} className="tip-item">
                    <code>{op.nombre}</code>
                    <p>{op.desc}</p>
                    <pre className="tip-code">{op.ejemplo}</pre>
                  </div>
                ))}
                <h3 style={{ marginTop: "1.5rem" }}>Acumuladores (dentro de $group)</h3>
                {ACUMULADORES.map((ac) => (
                  <div key={ac.nombre} className="tip-item">
                    <code>{ac.nombre}</code>
                    <p>{ac.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {tipTab === "campos" && (
              <div className="tip-content">
                <p>
                  Selecciona una colección arriba para ver sus campos, o
                  explóralos todos aquí:
                </p>
                {Object.entries(COLECCIONES).map(([key, col]) => (
                  <div key={key} className="tip-collection">
                    <h3>{col.label}</h3>
                    <table className="tip-table">
                      <tbody>
                        {Object.entries(col.campos).map(([campo, tipo]) => (
                          <tr key={campo}>
                            <td>
                              <code>{campo}</code>
                            </td>
                            <td>{tipo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {tipTab === "ejemplos" && (
              <div className="tip-content">
                <p>Haz clic en un ejemplo para cargarlo en el editor:</p>
                {EJEMPLOS.map((ej, i) => (
                  <div key={i} className="tip-item tip-ejemplo">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong>{ej.titulo}</strong>
                      <button
                        className="btn"
                        style={{ fontSize: 11, padding: "3px 10px" }}
                        onClick={() => cargarEjemplo(ej)}
                      >
                        Cargar
                      </button>
                    </div>
                    <span className="badge badge-blue">
                      {COLECCIONES[ej.coleccion]?.label}
                    </span>
                    <pre className="tip-code" style={{ marginTop: 6 }}>
                      {JSON.stringify(ej.pipeline, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
