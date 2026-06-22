const mongoose = require("mongoose");

const MONGO_URI = "mongodb://127.0.0.1:27017/trackflow";
const BATCH = 10000;

async function main() {
  console.log("Conectando a MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Conectado ✓");

  const db = mongoose.connection.db;
  const pedidos = db.collection("pedidos");
  const clientes = db.collection("clientes");
  const rutas = db.collection("rutas");

  console.log("\n→ Migrando datos_cliente embebido en pedidos...");
  const totalPedidos = await pedidos.countDocuments({ datos_cliente: { $exists: false } });
  console.log(`  Pedidos a migrar: ${totalPedidos.toLocaleString()}`);

  let migrados = 0;
  while (migrados < totalPedidos) {
    const batch = await pedidos
      .find({ datos_cliente: { $exists: false } })
      .limit(BATCH)
      .toArray();

    if (batch.length === 0) break;

    const clienteIds = [...new Set(batch.map((p) => p.cliente_id))];
    const clientesMap = {};
    const clientesDoc = await clientes
      .find({ _id: { $in: clienteIds } })
      .project({ _id: 1, nombre: 1, telefono: 1, direccion: 1, ciudad: 1, barrio: 1 })
      .toArray();
    clientesDoc.forEach((c) => {
      clientesMap[c._id.toString()] = c;
    });

    const ops = batch.map((p) => {
      const cliente = clientesMap[p.cliente_id?.toString()];
      return {
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              datos_cliente: cliente
                ? {
                    nombre: cliente.nombre,
                    telefono: cliente.telefono,
                    direccion: cliente.direccion,
                    ciudad: cliente.ciudad,
                    barrio: cliente.barrio,
                  }
                : null,
            },
          },
        },
      };
    });

    await pedidos.bulkWrite(ops);
    migrados += batch.length;
    process.stdout.write(`  ${migrados.toLocaleString()} / ${totalPedidos.toLocaleString()}\r`);
  }
  console.log(`  ✓ datos_cliente migrado`);

  console.log("\n→ Generando paradas embebidas en rutas...");
  const estadosParada = ["pendiente", "en_proceso", "completada", "fallida"];
  const totalRutas = await rutas.countDocuments({ paradas: { $exists: false } });
  console.log(`  Rutas a migrar: ${totalRutas.toLocaleString()}`);

  let rutasMigradas = 0;
  while (rutasMigradas < totalRutas) {
    const batch = await rutas
      .find({ paradas: { $exists: false } })
      .limit(BATCH)
      .toArray();

    if (batch.length === 0) break;

    const ops = batch.map((r) => {
      const numParadas = Math.floor(Math.random() * 5) + 1;
      const paradas = Array.from({ length: numParadas }, (_, i) => {
        const horaBase = r.hora_inicio ? new Date(r.hora_inicio) : new Date();
        return {
          numero_pedido: "TF-" + String(Math.floor(Math.random() * 99999999)).padStart(8, "0"),
          direccion_destino: "Calle " + Math.floor(Math.random() * 100) + " # " + Math.floor(Math.random() * 50) + "-" + Math.floor(Math.random() * 99),
          estado_parada: estadosParada[Math.floor(Math.random() * estadosParada.length)],
          hora_llegada: new Date(horaBase.getTime() + (i + 1) * 1800000),
        };
      });

      return {
        updateOne: {
          filter: { _id: r._id },
          update: { $set: { paradas } },
        },
      };
    });

    await rutas.bulkWrite(ops);
    rutasMigradas += batch.length;
    process.stdout.write(`  ${rutasMigradas.toLocaleString()} / ${totalRutas.toLocaleString()}\r`);
  }
  console.log(`  ✓ paradas migradas`);

  console.log("\n✅ Migración completada");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
