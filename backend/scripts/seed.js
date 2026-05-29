const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker/locale/es");

const MONGO_URI = "mongodb://127.0.0.1:27017/trackflow";

// ── Configuración de volumen ──
const TOTAL = {
  conductores: 50000,
  clientes: 50000,
  rutas: 150000,
  pedidos: 850000,
  eventos: 400000,
};
const BATCH = 5000; // documentos por inserción

// ── Datos colombianos ──
const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"];
const ZONAS = ["Norte", "Sur", "Centro", "Oriente", "Occidente"];
const ESTADOS = ["recibido", "asignado", "en_camino", "entregado", "tardío"];
const VEHICULOS = ["moto", "bicicleta", "camioneta", "furgón"];

// ── Esquemas mínimos para seed ──
const conductorSchema = new mongoose.Schema({
  cedula: String,
  nombre: String,
  apellido: String,
  telefono: String,
  ciudad_base: String,
  zona_asignada: String,
  vehiculo_tipo: String,
  vehiculo_placa: String,
  activo: Boolean,
  fecha_ingreso: Date,
});
const clienteSchema = new mongoose.Schema({
  nit_cedula: String,
  nombre: String,
  tipo: String,
  ciudad: String,
  barrio: String,
  direccion: String,
  telefono: String,
  email: String,
  total_pedidos: Number,
  fecha_registro: Date,
});
const rutaSchema = new mongoose.Schema({
  conductor_id: mongoose.Schema.Types.ObjectId,
  zona: String,
  ciudad: String,
  fecha: Date,
  hora_inicio: Date,
  hora_fin: Date,
  distancia_km: Number,
  pedidos_asignados: [mongoose.Schema.Types.ObjectId],
  estado_ruta: String,
});
const pedidoSchema = new mongoose.Schema({
  numero_pedido: String,
  cliente_id: mongoose.Schema.Types.ObjectId,
  conductor_id: mongoose.Schema.Types.ObjectId,
  ruta_id: mongoose.Schema.Types.ObjectId,
  estado: String,
  ciudad: String,
  zona: String,
  fecha_asignacion: Date,
  fecha_entrega: Date,
  direccion_destino: String,
  valor_declarado: Number,
  peso_kg: Number,
  observaciones: String,
});
const eventoSchema = new mongoose.Schema({
  pedido_id: mongoose.Schema.Types.ObjectId,
  conductor_id: mongoose.Schema.Types.ObjectId,
  estado: String,
  timestamp: Date,
  descripcion: String,
  ubicacion_lat: Number,
  ubicacion_lng: Number,
});

const Conductor = mongoose.model("Conductor", conductorSchema);
const Cliente = mongoose.model("Cliente", clienteSchema);
const Ruta = mongoose.model("Ruta", rutaSchema);
const Pedido = mongoose.model("Pedido", pedidoSchema);
const Evento = mongoose.model("Evento", eventoSchema);

// ── Helpers ──
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function insertBatches(Model, total, genFn, label) {
  console.log(`\n→ Insertando ${total.toLocaleString()} ${label}...`);
  let inserted = 0;
  while (inserted < total) {
    const size = Math.min(BATCH, total - inserted);
    const docs = Array.from({ length: size }, genFn);
    await Model.insertMany(docs, { ordered: false });
    inserted += size;
    process.stdout.write(
      `  ${inserted.toLocaleString()} / ${total.toLocaleString()}\r`,
    );
  }
  console.log(`  ✓ ${label} listo`);
}

async function main() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Conectado ✓");

  // Limpiar colecciones anteriores
  await Promise.all([
    Conductor.deleteMany({}),
    Cliente.deleteMany({}),
    Ruta.deleteMany({}),
    Pedido.deleteMany({}),
    Evento.deleteMany({}),
  ]);
  console.log("Colecciones limpiadas ✓");

  // 1. Conductores
  const conductorIds = [];
  await insertBatches(
    Conductor,
    TOTAL.conductores,
    () => {
      const id = new mongoose.Types.ObjectId();
      conductorIds.push(id);
      return {
        _id: id,
        cedula: faker.string.numeric(10),
        nombre: faker.person.firstName(),
        apellido: faker.person.lastName(),
        telefono: faker.phone.number("3##-###-####"),
        ciudad_base: pick(CIUDADES),
        zona_asignada: pick(ZONAS),
        vehiculo_tipo: pick(VEHICULOS),
        vehiculo_placa: faker.string.alphanumeric(6).toUpperCase(),
        activo: Math.random() > 0.1,
        fecha_ingreso: randDate(new Date("2019-01-01"), new Date("2024-12-31")),
      };
    },
    "conductores",
  );

  // 2. Clientes
  const clienteIds = [];
  await insertBatches(
    Cliente,
    TOTAL.clientes,
    () => {
      const id = new mongoose.Types.ObjectId();
      clienteIds.push(id);
      return {
        _id: id,
        nit_cedula: faker.string.numeric(10),
        nombre: faker.company.name(),
        tipo: pick(["natural", "juridico"]),
        ciudad: pick(CIUDADES),
        barrio: faker.location.county(),
        direccion: faker.location.streetAddress(),
        telefono: faker.phone.number("3##-###-####"),
        email: faker.internet.email(),
        total_pedidos: randInt(1, 200),
        fecha_registro: randDate(
          new Date("2020-01-01"),
          new Date("2024-12-31"),
        ),
      };
    },
    "clientes",
  );

  // 3. Rutas
  const rutaIds = [];
  await insertBatches(
    Ruta,
    TOTAL.rutas,
    () => {
      const id = new mongoose.Types.ObjectId();
      rutaIds.push(id);
      const inicio = randDate(new Date("2023-01-01"), new Date("2025-12-31"));
      const fin = new Date(inicio.getTime() + randInt(2, 10) * 3600000);
      return {
        _id: id,
        conductor_id: pick(conductorIds),
        zona: pick(ZONAS),
        ciudad: pick(CIUDADES),
        fecha: inicio,
        hora_inicio: inicio,
        hora_fin: fin,
        distancia_km: parseFloat((Math.random() * 80 + 5).toFixed(2)),
        pedidos_asignados: [],
        estado_ruta: pick(["activa", "completada", "cancelada"]),
      };
    },
    "rutas",
  );

  // 4. Pedidos
  const pedidoIds = [];
  await insertBatches(
    Pedido,
    TOTAL.pedidos,
    () => {
      const id = new mongoose.Types.ObjectId();
      pedidoIds.push(id);
      const asignacion = randDate(
        new Date("2023-01-01"),
        new Date("2025-12-31"),
      );
      const entrega = new Date(asignacion.getTime() + randInt(15, 300) * 60000);
      return {
        _id: id,
        numero_pedido: "TF-" + faker.string.numeric(8),
        cliente_id: pick(clienteIds),
        conductor_id: pick(conductorIds),
        ruta_id: pick(rutaIds),
        estado: pick(ESTADOS),
        ciudad: pick(CIUDADES),
        zona: pick(ZONAS),
        fecha_asignacion: asignacion,
        fecha_entrega: entrega,
        direccion_destino: faker.location.streetAddress(),
        valor_declarado: randInt(10000, 5000000),
        peso_kg: parseFloat((Math.random() * 30 + 0.5).toFixed(2)),
        observaciones: faker.lorem.sentence(),
      };
    },
    "pedidos",
  );

  // 5. Eventos de estado
  await insertBatches(
    Evento,
    TOTAL.eventos,
    () => ({
      pedido_id: pick(pedidoIds),
      conductor_id: pick(conductorIds),
      estado: pick(ESTADOS),
      timestamp: randDate(new Date("2023-01-01"), new Date("2025-12-31")),
      descripcion: faker.lorem.sentence(),
      ubicacion_lat: parseFloat((4.0 + Math.random() * 7.0).toFixed(6)),
      ubicacion_lng: parseFloat((-77.0 - Math.random() * 5.0).toFixed(6)),
    }),
    "eventos_estado",
  );

  // Crear índices
  console.log("\n→ Creando índices...");
  await Pedido.collection.createIndex({ estado: 1, ciudad: 1 });
  await Pedido.collection.createIndex({ conductor_id: 1, zona: 1 });
  await Pedido.collection.createIndex({ fecha_asignacion: 1 });
  await Evento.collection.createIndex({ pedido_id: 1, timestamp: 1 });
  await Ruta.collection.createIndex({ conductor_id: 1, fecha: 1 });
  await Conductor.collection.createIndex({ ciudad_base: 1, zona_asignada: 1 });
  console.log("Índices creados ✓");

  console.log("\n✅ Seed completo — 1,500,000 documentos insertados");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
